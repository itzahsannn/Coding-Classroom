import { validationResult } from 'express-validator'

export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request parameters.',
        details: errors.array(),
      },
    })
  }
  next()
}
