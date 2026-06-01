// src/controllers/analyzeController.js
import { analyzeJobDescription } from '../services/aiService.js'

export async function analyzeController(req, res) {
  const { text } = req.body

  // Guardrail 1 — Empty input check
  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      error: 'input_required',
      message: 'Job description text is required.'
    })
  }

  // Guardrail 1 — Input length validation
  if (text.length > 3000) {
    return res.status(400).json({
      error: 'input_too_long',
      limit: 3000,
      received: text.length
    })
  }

  // Call the AI service
  const result = await analyzeJobDescription(text, req.user.id)

  // Guardrail 3 — Fallback detection for timeout or LLM failure
  if (result?.fallback === true) {
    return res.status(503).json(result)
  }

  res.status(200).json({
    success: true,
    analysis: result
  })
}
