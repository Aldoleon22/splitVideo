const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { createClient } = require('redis')
const { Server } = require('socket.io')
const http = require('http')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())

// Connexion à Redis
const redisClient = createClient()
redisClient.connect()

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { userId, projectName } = req.body
    if (!userId || !projectName) {
      return cb(new Error('User ID and Project Name are required'))
    }

    const uploadDir = path.join(__dirname, 'uploads', userId, 'uploaded_videos', projectName)
    fs.mkdirSync(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

// Middleware Multer
const upload = multer({ storage })

// Route d'upload avec progression
app.post('/upload', upload.single('file'), async (req, res) => {
  const { userId } = req.body
  const fileName = req.file.filename
  const filePath = req.file.path

  // Simuler une mise en file d'attente et progression
  let progress = 0
  const interval = setInterval(async () => {
    progress += 10
    await redisClient.set(`upload_progress_${userId}`, progress)

    io.emit(`progress_${userId}`, progress)

    if (progress >= 100) {
      clearInterval(interval)
      await redisClient.del(`upload_progress_${userId}`)
    }
  }, 500)

  res.json({ success: true, message: 'File uploaded successfully', filePath })
})

// Démarrer le serveur
const PORT = 5000
server.listen(PORT, () => console.log(`Upload server running on port ${PORT}`))
