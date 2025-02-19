import { NextApiRequest, NextApiResponse } from 'next'
import Redis from 'ioredis'

const redis = new Redis()
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('Requête reçue avec méthode:', req.method)
  
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method Not Allowed' })
    }
  
    try {
      const videos = await redis.lrange('processed-videos', 0, -1)
      res.status(200).json({ videos })
    } catch (error) {
      console.error('Erreur Redis:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }
  