import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json(); // Extract ID from request body instead of query params

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.delete({
      where: { id: Number(id) }, // Ensure the ID is a number
    });

    return NextResponse.json({ message: 'User deleted successfully', user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
