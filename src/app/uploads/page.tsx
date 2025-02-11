import React, { useState } from 'react';
import { IoMdCloudUpload } from 'react-icons/io'; // Icône pour l'upload
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assure-toi que ce chemin est correct

// Exemple de type pour la tâche
interface Task {
  id: number;
  projectName: string;
  resolution: string;
  progress: number; // Progression entre 0 et 100
  createdAt: string;
}

const UploadsPage = () => {
  // Données fictives pour les tâches
  const tasks: Task[] = [
    { id: 1, projectName: 'Projet A', resolution: 'Résolution A', progress: 30, createdAt: '2025-02-11T10:00:00' },
    { id: 2, projectName: 'Projet B', resolution: 'Résolution B', progress: 50, createdAt: '2025-02-11T12:00:00' },
    { id: 3, projectName: 'Projet C', resolution: 'Résolution C', progress: 99, createdAt: '2025-02-11T14:00:00' }
  ];

  return (
 <div className="min-h-screen bg-gray-900 text-gray-100">
       <Header />
       <div className="flex">
         <Sidebar />
    
         <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Projet</TableHead>
        <TableHead>Résolution</TableHead>
        <TableHead>Progression</TableHead>
        <TableHead>Créé le</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tasks.map((task) => (
        <TableRow key={task.id}>
          <TableCell>{task.projectName}</TableCell>
          <TableCell>{task.resolution}</TableCell>
          <TableCell>
            <div className="w-full">
              <progress
                className="w-full h-2 rounded-lg"
                value={task.progress}
                max={100}
              />
            
            </div>
          </TableCell>
          <TableCell>{new Date(task.createdAt).toLocaleString()}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>

       </div>
       </div>

     
   )
}

export default UploadsPage;
