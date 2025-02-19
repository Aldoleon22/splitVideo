import { NextApiRequest, NextApiResponse } from 'next'
import Redis from 'ioredis'

const redis = new Redis()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' }) // Empêche d'autres méthodes
  }

  try {
    const videos = await redis.lrange('processed-videos', 0, -1) // Récupère la liste des vidéos traitées
    res.status(200).json({ videos })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}
