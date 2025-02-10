import Queue from 'bull';

// Utilisez l'URL Redis de l'environnement ou l'URL par défaut
const REDIS_URL = process.env.REDIS_URL || (process.env.NODE_ENV === 'production' ? 'redis://127.0.0.1:6379' : 'redis://localhost:6379');

// Créez une nouvelle file d'attente
const videoQueue = new Queue('video processing', REDIS_URL);

export default videoQueue;

