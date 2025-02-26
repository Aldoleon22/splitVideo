"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import { Description } from "@radix-ui/react-dialog";
import { toast } from "react-toastify";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User"); // Ajouté un state pour le statut
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur lors du chargement des utilisateurs: ${errorMessage}`);
      }
      const data = await response.json();
      setUsers(data.users);
      setError("");
    } catch (error: any) {
      console.error(error);
      setError(error.message);
      toast.error(`Erreur : ${error.message}`);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      toast.success("Inscription avec succès !");
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Erreur lors de la création de l'utilisateur: ${errorMessage}`);
      }

      setEmail("");
      setPassword("");
      fetchUsers();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
      toast.error(`Erreur : ${error.message}`);
    }
  };

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      try {
        const updateData: { email: string; role: string; password?: string } = { 
          email, 
          role: role === 'Admin' ? 'Admin' : 'User' // Remplacer `status` par `role`
        };
  
        // N'ajouter le mot de passe que s'il a été modifié
        if (password) {
          updateData.password = password;
        }
  
        const response = await fetch(`/api/user/${currentUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),  // Ne pas inclure `id` explicitement car il est déjà dans l'URL
        });
        toast.success("Modification avec succès !");
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Error updating user: ${errorMessage}`);
        }
  
        fetchUsers();  // Recharger les utilisateurs après modification
        setEditModalOpen(false);
      } catch (error: any) {
        console.error(error);
        setError(error.message);
        toast.error(`Erreur : ${error.message}`);
      }
    }
  };
  

  
  
  const deleteUser = async () => {
    if (userToDelete) {
      try {
        const response = await fetch(`/api/user/${userToDelete.id}`, {
          method: "DELETE",
        });
        toast.success("Suppression avec succès !");
        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Erreur lors de la suppression de l'utilisateur: ${errorMessage}`);
        }

        fetchUsers();
        setDeleteConfirmationOpen(false);
      } catch (error: any) {
        console.error(error);
        setError(error.message);
        toast.error(`Erreur : ${error.message}`);
      }
    }
  };

  return (
    <div className=" bg-gray-700">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Créer un utilisateur</Button>
        </DialogTrigger>
        <DialogContent
          className="w-[500px] p-6"
          aria-describedby="create-user-description" // Add this
        >
          <DialogHeader>
            <DialogTitle>Créer un utilisateur</DialogTitle>
          </DialogHeader>
          <Description> {/* Add this */}
            { /*  Formulaire pour créer un nouvel utilisateur avec un email et un mot de passe.*/}
          </Description>
          <form onSubmit={createUser}>
            <div className="mb-4">
              <Label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400">
                Créer
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-300"
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>

        </DialogContent>
      </Dialog>



      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen} >
        <DialogContent className="w-[500px] p-6">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <Description> {/* Add this */}
            { /*  Formulaire pour créer un nouvel utilisateur avec un email et un mot de passe.*/}
          </Description>
          <form onSubmit={updateUser}>
            <div className="mb-4">
              <Label htmlFor="editEmail" className="block text-sm font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="editEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="editStatus" className="block text-sm font-semibold text-gray-700">
                Status
              </Label>
              <select
                id="editRole"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black text-white"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>

            </div>

            <div className="mb-4">
              <Label htmlFor="editPassword" className="block text-sm font-semibold text-gray-700">
                Mot de passe
              </Label>
              <Input
                id="editPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
               
                className="w-full p-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400">
                Modifier
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditModalOpen(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-300"
              >
                Annuler
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <DialogContent className="w-[400px] p-6">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <Description> {/* Add this */}
            Êtes-vous sûr de vouloir supprimer cet utilisateur ?
          </Description>

          <DialogFooter>
            <Button
              onClick={deleteUser}
              className="bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-400"
            >
              Supprimer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeleteConfirmationOpen(false)}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-2 focus:ring-gray-300"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <h2 className="text-xl font-semibold mb-2">Liste des utilisateurs</h2>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Email</th>
            <th className="border p-2">Rôle</th>
            <th className="border p-2">Date de création</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user: any) => (
              <tr key={user.id}>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2">{new Date(user.createdAt).toLocaleString()}</td>
                <td className="border p-2 flex justify-center items-center">
                  <Button
                    onClick={() => {
                      setCurrentUser(user);
                      setEmail(user.email);
                      setPassword("");
                      setRole(user.role); // Correctement réinitialisé le statut lors de la modification
                      setEditModalOpen(true);
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => {
                      setUserToDelete(user);
                      setDeleteConfirmationOpen(true);
                    }}
                    className="ml-2 bg-red-500 text-white hover:bg-red-600"
                  >
                    Supprimer
                  </Button>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="border p-2 text-center">
                Aucun utilisateur trouvé.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
