import { createServer } from 'vite'

async function startServer() {
  try {
    const server = await createServer({
      configFile: './vite.config.js',
      root: process.cwd(),
      server: {
        port: 5173
      }
    })
    
    await server.listen()
    console.log('Vite dev server started successfully!')
    console.log('Local: http://localhost:5173/')
  } catch (error) {
    console.error('Failed to start server:', error)
  }
}

startServer()
