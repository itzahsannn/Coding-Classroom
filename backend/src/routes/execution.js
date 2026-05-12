import { Router } from 'express'
import { param, body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { executeCode, executeCodeDirect } from '../adapters/dockerRunner.js'
import {
  evaluateSubmission,
  analyzeCodeDirect,
  explainError,
  chatWithTutor,
  getHint,
  gradeSubmission,
} from '../adapters/llmClient.js'

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

// POST /api/analyze — AI code analysis (no submission needed)
router.post(
  '/analyze',
  body('code').isString().notEmpty().withMessage('Code is required.'),
  body('language').isIn(['python', 'javascript']).withMessage('Language must be python or javascript.'),
  validate,
  async (req, res, next) => {
    try {
      const { code, language } = req.body
      const analysis = await analyzeCodeDirect(code, language)
      res.json({ success: true, ...analysis })
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

// POST /api/submissions/:id/grade — AI auto-grade
router.post(
  '/submissions/:id/grade',
  uuidParam,
  validate,
  async (req, res, next) => {
    try {
      const result = await gradeSubmission(req.params.id)
      res.json({ success: true, ...result })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/explain-error — explain a runtime error
router.post(
  '/explain-error',
  body('code').isString().notEmpty(),
  body('language').isIn(['python', 'javascript']),
  body('error').isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const { code, language, error: errorText } = req.body
      const explanation = await explainError(code, language, errorText)
      res.json({ success: true, explanation })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/chat — AI tutor chat
router.post(
  '/chat',
  body('messages').isArray({ min: 1 }),
  body('code').isString(),
  body('language').isIn(['python', 'javascript']),
  validate,
  async (req, res, next) => {
    try {
      const { messages, code, language } = req.body
      const reply = await chatWithTutor(messages, code, language)
      res.json({ success: true, reply })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/hint — progressive hints
router.post(
  '/hint',
  body('code').isString().notEmpty(),
  body('language').isIn(['python', 'javascript']),
  body('hintLevel').isInt({ min: 0, max: 2 }),
  body('assignmentDescription').isString(),
  validate,
  async (req, res, next) => {
    try {
      const { code, language, hintLevel, assignmentDescription } = req.body
      const hint = await getHint(code, language, hintLevel, assignmentDescription)
      res.json({ success: true, hint })
    } catch (err) {
      next(err)
    }
  }
)

export default router
