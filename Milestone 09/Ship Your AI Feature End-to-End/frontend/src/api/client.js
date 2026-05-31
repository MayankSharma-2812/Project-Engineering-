// frontend/src/api/client.js
// CONSTRAINT 1: API key must NEVER appear in this file.
// The frontend calls YOUR backend. The backend calls OpenRouter.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function reviewSolution(problemStatement, solution, language, token) {
  const response = await fetch(`${API_BASE}/api/review-solution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ problemStatement, solution, language })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || `Request failed with status ${response.status}`)
  }

  return data
}
