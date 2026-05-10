import { Router } from 'express'
import { param, body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { executeCode, executeCodeDirect } from '../adapters/dockerRunner.js'
import { evaluateSubmission } from '../adapters/llmClient.js'

const router = Router()

const uuidParam = param('id').isUUID().withMessage('Submission ID must be a valid UUID.')

// POST /api/run — execute code directly without saving (for Run button)
router.post(
  '/run',
  body('code').isString().notEmpty().withMessage('Code is required.'),
  body('language').isIn(['python', 'javascript']).withMessage('Language must be python or javascript.'),
  validate,
  async (req, res, next) => {
    try {
      const { code, language } = req.body
      const filename = language === 'python' ? 'script.py' : 'main.js'
      const result = await executeCodeDirect(code, filename)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/submissions/:id/execute — execute saved submission
router.post(
  '/submissions/:id/execute',
  uuidParam,
  validate,
  async (req, res, next) => {
    try {
      const result = await executeCode(req.params.id)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/submissions/:id/evaluate — AI feedback on saved submission
router.post(
  '/submissions/:id/evaluate',
  uuidParam,
  validate,
  async (req, res, next) => {
    try {
      const result = await evaluateSubmission(req.params.id)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }
)

export default router
