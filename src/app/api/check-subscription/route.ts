import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Attempting to fetch subscriptions...');
    const subscriptions = await prisma.subscription.findMany();
    console.log('Fetched subscriptions:', subscriptions);

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'An error occurred while fetching subscriptions' }, { status: 500 });
  }
}

