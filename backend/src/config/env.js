import dotenv from 'dotenv'
dotenv.config()

const required = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
]

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`)
    process.exit(1)
  }
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,

  llmApiUrl: process.env.LLM_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
  llmApiKey: process.env.LLM_API_KEY || '',
  llmModel: process.env.LLM_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',

  dockerImage: process.env.DOCKER_IMAGE || 'python:3.11-alpine',
  execTimeoutMs: parseInt(process.env.EXEC_TIMEOUT_MS || '10000', 10),
  execMemoryLimit: process.env.EXEC_MEMORY_LIMIT || '128m',
  execCpuLimit: process.env.EXEC_CPU_LIMIT || '0.5',
}
