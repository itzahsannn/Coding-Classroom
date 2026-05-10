import { config } from './config/env.js'
import app from './app.js'

app.listen(config.port, () => {
  console.log(`🚀 Coding Classroom backend running on port ${config.port}`)
  console.log(`   Environment: ${config.nodeEnv}`)
  console.log(`   Health check: http://localhost:${config.port}/api/health`)
})
