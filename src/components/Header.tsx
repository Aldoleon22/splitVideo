"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from 'next/link'
import { List, User, Settings, LogOut } from 'lucide-react'
import { IoIosNotifications, IoMdCloudUpload } from 'react-icons/io';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function Header() {
  const { data: session } = useSession()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setCurrentPassword("")
        setNewPassword("")
        setTimeout(() => setIsSettingsOpen(false), 2000) // Close dialog after 2 seconds
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Une erreur est survenue lors du changement de mot de passe" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    // Implement unsubscribe logic here
    console.log("Unsubscribe requested")
  }
  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_APP_URL)
  }, [isLoading])


  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center text-gray-300 hover:text-white">
            <div className="bg-yellow-500 text-black font-bold px-2 py-1 rounded">
              Split Video
            </div>
          </Link>
          
        </div>

        {/* Conteneur des icônes côte à côte à droite */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-light">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <IoMdCloudUpload className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                <Link href="/uploads" className="flex items-center text-gray-300 hover:text-white">
                  <IoMdCloudUpload className="mr-2 h-4 w-4" />
                  <span>Uploads</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/tasks" className="flex items-center text-gray-300 hover:text-white">
                    <IoIosNotifications className="mr-2 h-4 w-4" />
                    <span>File d'attente</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsSettingsOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => signOut({ redirect: false, callbackUrl: process.env.NEXT_PUBLIC_APP_URL })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>


      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Paramètres du compte</DialogTitle>
            <DialogDescription>
              Modifiez votre mot de passe ou désabonnez-vous ici.
            </DialogDescription>
          </DialogHeader>
          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
              <AlertTitle>{message.type === 'success' ? 'Succès' : 'Erreur'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={session?.user?.email || ""}
                  className="col-span-3"
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-password" className="text-right">
                  Mot de passe actuel
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-password" className="text-right">
                  Nouveau mot de passe
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Chargement..." : "Changer le mot de passe"}
              </Button>
            </DialogFooter>
          </form>
          <div className="mt-4">
            <Button variant="destructive" onClick={handleUnsubscribe}>
              Désabonner
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

