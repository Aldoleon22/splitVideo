"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [loading, setLoading] = useState(true); // Indicateur de chargement

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/test");
        const data = await response.json();
        
        // Vérifier si data est un tableau, sinon assigner un tableau vide
        if (Array.isArray(data)) {
          setVideos(data);
        } else {
          setVideos([]); // Forcer un tableau vide en cas de réponse invalide
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des vidéos traitées:", error);
        setVideos([]); // Assurer un tableau vide en cas d'erreur
      } finally {
        setLoading(false);
      }
    };
  
    fetchVideos();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-6">
          {loading ? (
            <p className="text-center text-gray-400">Chargement...</p>
          ) : videos.length === 0 ? (
            <p className="text-center text-gray-400">Aucune vidéo traitée pour le moment.</p>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadsPage;
