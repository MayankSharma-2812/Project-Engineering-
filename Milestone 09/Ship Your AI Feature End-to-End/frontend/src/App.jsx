import React, { useState, useCallback } from 'react'
import { reviewSolution } from './api/client.js'

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
]

const MAX_CHARS = 5000

// Demo JWT for local testing — in production, this comes from your auth flow
const DEMO_TOKEN = localStorage.getItem('codelens_token') || ''

function getCorrectnessConfig(value) {
  switch (value) {
    case 'likely_correct': return { label: '✅ Likely Correct', cls: 'badge--correct' }
    case 'has_issues':     return { label: '⚠️ Has Issues',     cls: 'badge--issues' }
    case 'incorrect':      return { label: '❌ Incorrect',       cls: 'badge--incorrect' }
    default:               return { label: value,                cls: 'badge--issues' }
  }
}

function CharCount({ current, max }) {
  const pct = current / max
  const cls = pct > 0.95 ? 'danger' : pct > 0.8 ? 'warn' : ''
  return <span className={`char-count ${cls}`}>{current} / {max}</span>
}

function App() {
  const [problemStatement, setProblem] = useState('')
  const [solution, setSolution] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [token, setToken] = useState(DEMO_TOKEN)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!token.trim()) {
      setError('Auth token is required. Paste your JWT in the token field.')
      return
    }

    setLoading(true)
    try {
      const data = await reviewSolution(problemStatement, solution, language, token)
      setResult(data.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [problemStatement, solution, language, token])

  const handleTokenChange = (e) => {
    const val = e.target.value
    setToken(val)
    localStorage.setItem('codelens_token', val)
  }

  return (
    <div className="app-container">
      {/* ---- Header ---- */}
      <header className="header">
        <div className="header__logo">
          <span className="header__icon">🔍</span>
          <h1 className="header__title">CodeLens</h1>
        </div>
        <p className="header__subtitle">
          AI-powered DSA solution analyzer — get instant complexity analysis, edge case detection, and optimization suggestions.
        </p>
      </header>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Token field */}
          <div className="field-group">
            <label htmlFor="auth-token">Auth Token (JWT)</label>
            <textarea
              id="auth-token"
              rows={1}
              style={{ minHeight: '44px', resize: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}
              placeholder="Paste your JWT here..."
              value={token}
              onChange={handleTokenChange}
            />
          </div>

          {/* Problem Statement */}
          <div className="field-group">
            <label htmlFor="problem-statement">Problem Statement</label>
            <textarea
              id="problem-statement"
              placeholder="Describe the DSA problem...&#10;&#10;Example: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
              value={problemStatement}
              onChange={e => setProblem(e.target.value)}
              maxLength={MAX_CHARS}
              required
            />
            <CharCount current={problemStatement.length} max={MAX_CHARS} />
          </div>

          {/* Language */}
          <div className="field-group">
            <label htmlFor="language-select">Language</label>
            <select
              id="language-select"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* Solution */}
          <div className="field-group">
            <label htmlFor="code-solution">Your Solution</label>
            <textarea
              id="code-solution"
              className="code-input"
              placeholder="Paste your code solution here..."
              value={solution}
              onChange={e => setSolution(e.target.value)}
              maxLength={MAX_CHARS}
              required
            />
            <CharCount current={solution.length} max={MAX_CHARS} />
          </div>
        </div>

        <button
          type="submit"
          className="submit-btn"
          disabled={loading || !problemStatement.trim() || !solution.trim()}
        >
          {loading ? (
            <>
              <div className="spinner" />
              Analyzing...
            </>
          ) : (
            <>🚀 Analyze Solution</>
          )}
        </button>
      </form>

      {/* ---- Error ---- */}
      {error && (
        <div className="error-banner" style={{ marginTop: '1.25rem' }}>
          <span className="error-banner__icon">⚠️</span>
          <span className="error-banner__text">{error}</span>
        </div>
      )}

      {/* ---- Results ---- */}
      {result && !result.fallback && (
        <div className="results" style={{ marginTop: '2rem' }}>
          <h2 className="results__title">📊 Analysis Results</h2>

          {/* Status badges */}
          <div className="status-row">
            <span className={`badge ${getCorrectnessConfig(result.correctness).cls}`}>
              {getCorrectnessConfig(result.correctness).label}
            </span>
            <span className="badge badge--confidence">
              🎯 Confidence: {result.confidence}
            </span>
          </div>

          {/* Complexity cards */}
          <div className="results-grid">
            <div className="result-card">
              <div className="result-card__header">
                <span className="result-card__icon">⏱️</span>
                <span className="result-card__label">Time Complexity</span>
              </div>
              <div className="result-card__value">{result.timeComplexity}</div>
            </div>

            <div className="result-card">
              <div className="result-card__header">
                <span className="result-card__icon">💾</span>
                <span className="result-card__label">Space Complexity</span>
              </div>
              <div className="result-card__value">{result.spaceComplexity}</div>
            </div>
          </div>

          {/* Issues */}
          {result.issues && result.issues.length > 0 && (
            <div className="list-card" style={{ marginBottom: '1rem' }}>
              <div className="list-card__header">
                <span className="list-card__icon">🐛</span>
                <span className="list-card__label">Issues Found</span>
              </div>
              <ul className="list-card__items">
                {result.issues.map((issue, i) => <li key={i}>{issue}</li>)}
              </ul>
            </div>
          )}

          {/* Edge Cases */}
          {result.edgeCases && result.edgeCases.length > 0 && (
            <div className="list-card" style={{ marginBottom: '1rem' }}>
              <div className="list-card__header">
                <span className="list-card__icon">🧪</span>
                <span className="list-card__label">Edge Cases to Consider</span>
              </div>
              <ul className="list-card__items">
                {result.edgeCases.map((ec, i) => <li key={i}>{ec}</li>)}
              </ul>
            </div>
          )}

          {/* Optimization */}
          {result.optimization && (
            <div className="optimization-card">
              <div className="optimization-card__header">
                <span className="optimization-card__icon">💡</span>
                <span className="optimization-card__label">Optimization Suggestion</span>
              </div>
              <p className="optimization-card__text">{result.optimization}</p>
            </div>
          )}
        </div>
      )}

      {/* Fallback result */}
      {result && result.fallback && (
        <div className="error-banner" style={{ marginTop: '1.25rem' }}>
          <span className="error-banner__icon">🔄</span>
          <span className="error-banner__text">{result.message}</span>
        </div>
      )}

      <footer className="footer">
        CodeLens — Built by Mayank Sharma · Model: openai/gpt-4o-mini via <a href="https://openrouter.ai" target="_blank" rel="noopener">OpenRouter</a>
      </footer>
    </div>
  )
}

export default App
