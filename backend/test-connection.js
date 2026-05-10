import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function test() {
  // Sign in as the test user to get a real session token
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'teacher@test.com',
    password: 'test123456',
  })

  if (error) {
    console.log('Login error:', error.message)
    return
  }

  const token = data.session.access_token
  console.log('Token (first 50 chars):', token.substring(0, 50))
  
  const decoded = jwt.decode(token, { complete: true })
  console.log('Algorithm:', decoded?.header?.alg)
  console.log('Header:', JSON.stringify(decoded?.header))
  console.log('Payload sub:', decoded?.payload?.sub)
  console.log('Payload role:', decoded?.payload?.role)

  // Try verifying with raw string and HS256
  const secret = process.env.SUPABASE_JWT_SECRET
  try {
    const verified = jwt.verify(token, secret, { algorithms: ['HS256'] })
    console.log('\n✅ HS256 with raw string works for session token!')
  } catch (e) {
    console.log('\n❌ HS256 raw failed:', e.message)
  }
}

test().catch(console.error)
