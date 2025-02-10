"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"

declare global {
  interface Window {
    createLemonSqueezy: any;
  }
}

export default function SubscribePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleSubscribe = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout')
      }

      const { checkoutUrl } = await response.json()

      if (typeof window.createLemonSqueezy !== 'undefined') {
        window.createLemonSqueezy().Setup({
          eventHandler: (event: any) => {
            if (event.event === 'Checkout.Success') {
              router.push('/?subscription=success')
            }
          }
        }).Checkout.open(checkoutUrl)
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>S'abonner à Split Video</CardTitle>
          <CardDescription>Accédez à toutes les fonctionnalités de Split Video</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Profitez de tous les avantages de Split Video :</p>
          <ul className="list-disc list-inside mt-2">
            <li>Importation illimitée de vidéos</li>
            <li>Découpage automatique</li>
            <li>Stockage sécurisé</li>
            <li>Support premium</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : 'S\'abonner maintenant'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

