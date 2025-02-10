import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma'

function generateRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function addFakeSubscriptions(count: number) {
  console.log(`Ajout de ${count} faux abonnements`);

  const fakeSubscriptions = Array.from({ length: count }, (_, i) => ({
    userId: Math.floor(Math.random() * 1000) + 1,
    planId: ['basic', 'pro', 'enterprise'][Math.floor(Math.random() * 3)],
    status: ['active', 'cancelled', 'paused'][Math.floor(Math.random() * 3)],
    lemonSqueezyId: `fake-${Date.now()}-${i}`,
    createdAt: generateRandomDate(new Date(2022, 0, 1), new Date()),
    updatedAt: new Date()
  }))

  console.log('Insertion des faux abonnements dans la base de données');
  const createdSubscriptions = await prisma.subscription.createMany({
    data: fakeSubscriptions,
  })

  console.log(`${createdSubscriptions.count} faux abonnements ajoutés avec succès`);
  return createdSubscriptions.count;
}

export async function GET(request: NextRequest) {
  console.log('Requête GET reçue pour ajouter des faux abonnements');
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  console.log('Requête POST reçue pour ajouter des faux abonnements');
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  console.log('Début de l\'ajout de faux abonnements');
  
  try {
    console.log('Vérification de l\'authentification');
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log('Utilisateur non authentifié');
      return new NextResponse(JSON.stringify({ error: 'Non autorisé' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let count = 5; // Valeur par défaut

    if (request.method === 'POST') {
      const body = await request.json().catch(() => {
        console.log('Erreur lors de la lecture du corps de la requête POST');
        return {};
      });
      count = body.count || 5;
    } else if (request.method === 'GET') {
      const params = new URL(request.url).searchParams;
      count = parseInt(params.get('count') || '5', 10);
    }

    console.log(`Nombre d'abonnements à ajouter : ${count}`);

    const addedCount = await addFakeSubscriptions(count);

    console.log('Préparation de la réponse');
    const responseBody = { 
      message: `${addedCount} faux abonnements ajoutés avec succès`,
      count: addedCount
    };
    console.log('Corps de la réponse :', responseBody);

    return new NextResponse(JSON.stringify(responseBody), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de faux abonnements:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Une erreur est survenue lors de l\'ajout de faux abonnements',
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

