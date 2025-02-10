import videoQueue from './src/lib/queue';

console.log('Worker de file d\'attente démarré');

// Gérez les erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
});

// Assurez-vous que le worker reste actif
async function run() {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

run().catch(console.error);

