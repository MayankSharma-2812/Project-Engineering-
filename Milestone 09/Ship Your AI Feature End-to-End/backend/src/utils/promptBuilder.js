// backend/src/utils/promptBuilder.js
// =====================================================================
// CONSTRAINT 2: ALL prompt logic must live in this file.
// Your routes and controllers must NOT contain system instructions,
// message arrays, or prompt templates. Only this file builds prompts.
// =====================================================================

const SYSTEM_PROMPT = `You are a senior software engineer and DSA expert who reviews coding solutions.

Given a problem statement, the candidate's code solution, and the programming language, perform a thorough code review focused on algorithmic correctness, efficiency, and edge case handling.

Analyse the solution and return ONLY a JSON object with exactly these fields:
{
  "timeComplexity": "Big-O time complexity of the solution (e.g. O(n), O(n log n), O(n^2))",
  "spaceComplexity": "Big-O space complexity (e.g. O(1), O(n))",
  "correctness": "likely_correct OR has_issues OR incorrect",
  "issues": ["array of strings describing any bugs, logic errors, or incorrect assumptions — empty array if none found"],
  "edgeCases": ["array of edge cases the solution may not handle — e.g. empty input, single element, duplicates, negative numbers, overflow"],
  "optimization": "one specific, actionable suggestion to improve the solution — or 'Solution is already optimal for this problem' if no improvement exists",
  "confidence": "high OR medium OR low"
}
Return ONLY valid JSON. No markdown. No explanation. No code fences. No other text.`

/**
 * Build the messages array for the OpenRouter API call.
 * Called by aiController — receives the validated user input.
 *
 * @param {string} problemStatement - The DSA problem description
 * @param {string} solution - The candidate's code solution
 * @param {string} language - The programming language used
 * @returns {Array} messages array for the OpenRouter API
 */
export function buildPrompt(problemStatement, solution, language) {
  return [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: `Problem Statement:\n${problemStatement}\n\nLanguage: ${language}\n\nCandidate Solution:\n${solution}`
    }
  ]
}

// Export SYSTEM_PROMPT for testing and documentation
export { SYSTEM_PROMPT }
