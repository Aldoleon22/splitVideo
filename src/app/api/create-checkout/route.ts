import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY
const LEMON_SQUEEZY_STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID
const LEMON_SQUEEZY_VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID

export async function POST(request: NextRequest) {
  console.log(LEMON_SQUEEZY_API_KEY)
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { userId } = await request.json()

    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            store_id: LEMON_SQUEEZY_STORE_ID,
            variant_id: LEMON_SQUEEZY_VARIANT_ID,
            custom_price: null,
            product_options: {
              enabled_variants: [LEMON_SQUEEZY_VARIANT_ID],
            },
            checkout_data: {
              custom: {
                user_id: userId,
              },
              success_url: `${process.env.NEXT_PUBLIC_APP_URL}/?subscription=success`,
              cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
            },
       
          },
        },
      }),
    })
    console.log(response)
    if (!response.ok) {
      throw new Error('Failed to create Lemon Squeezy checkout')
    }

    const checkoutData = await response.json()
    const checkoutUrl = checkoutData.data.attributes.url

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error('Error creating Lemon Squeezy checkout:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la création du paiement' }, { status: 500 })
  }
}

