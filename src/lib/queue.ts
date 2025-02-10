import Queue from 'bull';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '@/lib/prisma';
import { decryptId } from '@/utils/cryptoUtils';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REDIS_URL = process.env.REDIS_URL || (process.env.NODE_ENV === 'production' ? 'redis://127.0.0.1:6379' : 'redis://localhost:6379');

const videoQueue = new Queue('video processing', REDIS_URL);

async function findOrCreateQueueItem(userId: number, projectName: string, resolution: string) {
  console.log(`Recherche ou création d'un élément de file d'attente pour l'utilisateur ${userId}, projet ${projectName}`);
  
  // Try to find an existing queue item
  let queueItem = await prisma.videoProcessingQueue.findFirst({
    where: {
      userId,
      projectName,
      status: {
        in: ['en attente', 'en cours']
      }
    }
  });

  if (!queueItem) {
    console.log(`Création d'une nouvelle tâche pour le projet ${projectName}`);
    queueItem = await prisma.videoProcessingQueue.create({
      data: {
        userId,
        projectName,
        resolution,
        status: 'en attente'
      }
    });
  }

  return queueItem;
}

async function updateQueueItemStatus(queueItem: { id: number }, status: string) {
  console.log(`Mise à jour du statut pour la tâche ${queueItem.id} à "${status}"`);
  try {
    const updatedItem = await prisma.videoProcessingQueue.update({
      where: { id: queueItem.id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
    console.log(`Statut mis à jour pour la tâche ${queueItem.id}: ${status}`);
    return updatedItem;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut pour la tâche ${queueItem.id}:`, error);
    throw error;
  }
}

videoQueue.process(async (job) => {
  const { userId: encryptedUserId, projectName, resolution } = job.data;
  
  try {
    // Decrypt the user ID
    const userId = decryptId(encryptedUserId);
    console.log(`Traitement de la tâche pour l'utilisateur ${userId}, projet ${projectName}`);

    // Find or create the queue item first
    const queueItem = await findOrCreateQueueItem(userId, projectName, resolution);
    console.log(`Tâche trouvée/créée avec l'ID: ${queueItem.id}`);

    // Update status to processing
    await updateQueueItemStatus(queueItem, 'en cours');

    // Execute the video processing script
    const scriptPath = path.join(process.cwd(), 'scripts', 'cropVideo.php');
    const command = `php ${scriptPath} '${encryptedUserId}' '${projectName}' '${resolution}'`;
    
    console.log(`Exécution de la commande: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error(`Erreur lors de l'exécution du script: ${stderr}`);
      await updateQueueItemStatus(queueItem, 'échoué');
      throw new Error(stderr);
    }

    // Update status to completed
    await updateQueueItemStatus(queueItem, 'terminé');

    console.log(`Tâche terminée avec succès pour le projet ${projectName}`);
    return { success: true, message: stdout };
  } catch (error) {
    console.error(`Erreur lors du traitement de la tâche pour le projet ${projectName}:`, error);
    throw error;
  }
});

// Add error handler
videoQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

// Add failed job handler
videoQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

export default videoQueue;

