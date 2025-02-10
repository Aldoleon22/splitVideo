'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const response = await fetch('/api/users')
    const data = await response.json()
    setUsers(data.users)
  }

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    if (response.ok) {
      setEmail('')
      setPassword('')
      fetchUsers()
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <form onSubmit={createUser} className="mb-4">
        <div className="mb-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Créer un utilisateur</Button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Liste des utilisateurs</h2>
      <ul>
        {users.map((user: any) => (
          <li key={user.id} className="mb-1">
            {user.email} (Créé le : {new Date(user.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  )
}

