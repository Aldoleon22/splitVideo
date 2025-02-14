"use client"

import React, { useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Définition du type pour une vidéo traitée
interface ProcessedVideo {
  id: number;
  projectName: string;
  resolution: string;
  progress: number; // De 0 à 100
  createdAt: string;
  processedFileUrl: string; // URL du fichier traité
}

const UploadsPage = () => {
  const [videos, setVideos] = useState<ProcessedVideo[]>([]);

  // Fonction pour récupérer les vidéos depuis le backend
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/test'); // 🔹 Assure-toi que cette API existe
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des vidéos traitées:', error);
      }
    };

    fetchVideos();
  }, []);

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
              <TableHead>Vidéo Traitée</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell>{video.projectName}</TableCell>
                <TableCell>{video.resolution}</TableCell>
                <TableCell>
                  <progress className="w-full h-2 rounded-lg" value={video.progress} max={100} />
                </TableCell>
                <TableCell>{new Date(video.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  {video.progress === 100 ? (
                    <a href={video.processedFileUrl} download className="text-blue-400 hover:underline">
                      Télécharger
                    </a>
                  ) : (
                    "En cours..."
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UploadsPage;
