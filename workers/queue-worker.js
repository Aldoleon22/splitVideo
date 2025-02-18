import videoQueue from '../src/lib/queue.js';
import prisma from '../src/lib/prisma.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { decryptId } from '../src/utils/cryptoUtils.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Worker de file d\'attente démarré');

// Gérez les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});

async function updateQueueItemStatus(queueItemId, status) {
  console.log(`Mise à jour du statut pour la tâche ${queueItemId} à "${status}"`);
  try {
    const updatedItem = await prisma.videoProcessingQueue.update({
      where: { id: parseInt(queueItemId) },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
    console.log(`Statut mis à jour pour la tâche ${queueItemId}: ${status}`);
    return updatedItem;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut pour la tâche ${queueItemId}:`, error);
    throw error;
  }
}

videoQueue.process(async (job) => {
  const { userId: encryptedUserId, projectName, resolution, queueItemId } = job.data;
  
  if (!queueItemId) {
    throw new Error('queueItemId is missing from job data');
  }

  try {
    const userId = parseInt(decryptId(encryptedUserId));
    console.log(`Traitement de la tâche pour l'utilisateur ${userId}, queueItemId ${queueItemId}, projet ${projectName},`);

    await updateQueueItemStatus(queueItemId, 'en cours');

    const scriptPath = path.join(process.cwd(), 'scripts', 'cropVideo.php');
    const command = `php ${scriptPath} '${encryptedUserId}' '${projectName}' '${resolution}'`;
    
    console.log(`Exécution de la commande: ${command}`);
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      console.error(`Erreur lors de l'exécution du script: ${stderr}`);
      await updateQueueItemStatus(queueItemId, 'échoué');
      throw new Error(stderr);
    }

    await updateQueueItemStatus(queueItemId, 'terminé');

    console.log(`Tâche terminée avec succès pour le projet ${projectName}`);
    return { success: true, message: 'Traitement terminé' };
  } catch (error) {
    console.error(`Erreur lors du traitement de la tâche pour le projet ${projectName}:`, error);
    if (queueItemId) {
      await updateQueueItemStatus(queueItemId, 'échoué').catch(console.error);
    }
    throw error;
  }
});

videoQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

videoQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

// Assurez-vous que le worker reste actif
async function run() {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

run().catch(console.error);

