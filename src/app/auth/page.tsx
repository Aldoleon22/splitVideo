"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Loader } from "@/components/ui/loader"

function AuthPageContent() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [successNotification, setSuccessNotification] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    const successParam = searchParams.get("success")
    const errorParam = searchParams.get("error")
    const infoParam = searchParams.get("info")

    if (successParam) setSuccess(successParam)
    if (errorParam) setError(errorParam)
    if (infoParam) setInfo(infoParam)
  }, [searchParams])

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setInfo(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess("Connexion réussie!")
        router.push("/")
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error)
      setError("Une erreur est survenue lors de la connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessNotification(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const emailInput = document.getElementById("email") as HTMLInputElement
        const passwordInput = document.getElementById("password") as HTMLInputElement
        const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement
        if (emailInput) emailInput.value = ""
        if (passwordInput) passwordInput.value = ""
        if (confirmPasswordInput) confirmPasswordInput.value = ""

        setSuccessNotification("Inscription réussie. Un e-mail d'activation a été envoyé pour valider votre compte.")
        setSuccess("Inscription réussie. Un e-mail d'activation a été envoyé pour valider votre compte.")
        setTimeout(() => {
          setSuccessNotification(null)
          const loginTab = document.querySelector('[data-state="inactive"][data-value="login"]') as HTMLButtonElement
          if (loginTab) {
            loginTab.click()
          }
        }, 3000)
      } else {
        setError(data.error || "Une erreur est survenue lors de l'inscription.")
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      setError("Une erreur est survenue lors de l'inscription.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center">Connectez-vous ou créez un compte</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700">
              <AlertTitle className="text-green-800">Succès</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {info && (
            <Alert variant="default" className="mb-4 bg-blue-100 border-blue-400 text-blue-700">
              <AlertTitle className="text-blue-800">Information</AlertTitle>
              <AlertDescription>{info}</AlertDescription>
            </Alert>
          )}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={onLogin}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="splitvideo@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      placeholder="********"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="current-password"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
                    Se connecter
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={onRegister}>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      placeholder="splitvideo@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      name="password"
                      placeholder="********"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      placeholder="********"
                      type="password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
                    S'inscrire
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  )
}

