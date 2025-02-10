import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Task } from '@/types/Task';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: number) => Promise<void>;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onDeleteTask }) => {
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const handleDelete = async (taskId: number) => {
    setDeletingTaskId(taskId);
    try {
      await onDeleteTask(taskId);
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Projet</TableHead>
          <TableHead>Résolution</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Créé le</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell>{task.projectName}</TableCell>
            <TableCell>{task.resolution}</TableCell>
            <TableCell>{task.status}</TableCell>
            <TableCell>{new Date(task.createdAt).toLocaleString()}</TableCell>

          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
/*
<TableCell>
<button
  onClick={() => handleDelete(task.id)}
  disabled={deletingTaskId === task.id}
  className={`p-1 rounded-full text-gray-400 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
    deletingTaskId === task.id ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  {deletingTaskId === task.id ? (
    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  ) : (
    <TrashIcon className="h-5 w-5" aria-hidden="true" />
  )}
</button>
</TableCell>
*/

