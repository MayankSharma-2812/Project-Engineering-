// backend/src/middleware/validateInput.js
// CONSTRAINT 5: Input validation — length check + at least one content check.

const MAX_INPUT_LENGTH = 5000
const SUPPORTED_LANGUAGES = ['javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go', 'rust', 'ruby', 'kotlin', 'swift']

// Tokens that indicate the input contains actual code
const CODE_INDICATORS = [
  'function', 'def ', 'class ', 'return', 'if ', 'else', 'for ', 'while ',
  'const ', 'let ', 'var ', 'import ', 'from ', 'print', 'console.',
  '=>', '->',  '{}', '()', '[];', 'int ', 'void ', 'public ', 'private ',
  'static ', 'fn ', 'func ', 'struct ', 'enum '
]

export function validateAIInput(req, res, next) {
  const { problemStatement, solution, language } = req.body

  // Check 1: problemStatement existence and type
  if (!problemStatement || typeof problemStatement !== 'string' || problemStatement.trim().length === 0) {
    return res.status(400).json({
      error: 'input_required',
      message: 'Problem statement is required.'
    })
  }

  // Check 2: solution existence and type
  if (!solution || typeof solution !== 'string' || solution.trim().length === 0) {
    return res.status(400).json({
      error: 'input_required',
      message: 'Code solution is required.'
    })
  }

  // Check 3: language existence and validity
  if (!language || typeof language !== 'string') {
    return res.status(400).json({
      error: 'input_required',
      message: 'Programming language is required.'
    })
  }

  const normalizedLang = language.trim().toLowerCase()
  if (!SUPPORTED_LANGUAGES.includes(normalizedLang)) {
    return res.status(400).json({
      error: 'invalid_language',
      message: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(', ')}`,
      received: language
    })
  }

  // Check 4: Length guards (cost protection)
  if (problemStatement.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({
      error: 'input_too_long',
      field: 'problemStatement',
      limit: MAX_INPUT_LENGTH,
      received: problemStatement.length
    })
  }

  if (solution.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({
      error: 'input_too_long',
      field: 'solution',
      limit: MAX_INPUT_LENGTH,
      received: solution.length
    })
  }

  // Check 5: Domain-specific — solution must contain code-like content
  const solutionLower = solution.toLowerCase()
  const hasCodeIndicator = CODE_INDICATORS.some(token => solutionLower.includes(token.toLowerCase()))

  if (!hasCodeIndicator) {
    return res.status(400).json({
      error: 'not_code',
      message: 'The solution field must contain actual code. Plain text descriptions are not accepted.'
    })
  }

  // Normalize language in body for downstream use
  req.body.language = normalizedLang

  next()
}
