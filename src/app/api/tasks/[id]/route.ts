import { NextResponse,NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest
) {
  const id = parseInt(request.nextUrl.pathname.split("/").pop());

  try {
    // Récupérer les informations de la tâche
    const task = await prisma.videoProcessingQueue.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!task) {
      return NextResponse.json({ error: 'Tâche non trouvée' }, { status: 404 });
    }

    // Supprimer les fichiers associés
    const userProjectPath = path.join(process.cwd(), 'projets', task.user.id.toString(), task.projectName);
    
    try {
      await fs.rm(path.join(userProjectPath, 'processed_videos'), { recursive: true, force: true });
      await fs.rm(path.join(userProjectPath, 'uploaded_videos'), { recursive: true, force: true });
    } catch (error) {
      console.error('Erreur lors de la suppression des fichiers:', error);
      // Continuer même si la suppression des fichiers échoue
    }

    // Supprimer la tâche de la base de données
    await prisma.videoProcessingQueue.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tâche et fichiers associés supprimés avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la tâche' }, { status: 500 });
  }
}

