import { createClient } from '@supabase/supabase-js'
import { config } from '../config/env.js'

// Use service role client to validate user tokens server-side
const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey)

export async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'No token provided.' },
    })
  }

  try {
    // Validate the token by calling Supabase auth.getUser()
    // This works with both HS256 and ES256 tokens
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: { code: 'AUTH_ERROR', message: error?.message || 'Invalid token.' },
      })
    }

    req.user = {
      sub: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'student',
      user_metadata: user.user_metadata,
    }
    next()
  } catch (err) {
    console.error('Auth verification failed:', err.message)
    res.status(401).json({
      success: false,
      error: { code: 'AUTH_ERROR', message: 'Token verification failed.' },
    })
  }
}
