# Changes - Secure AI API Key Refactoring

## The Problem
**File**: `src/App.jsx`
**Line Numbers**:
- Line 9: `const apiKey = import.meta.env.VITE_OPENAI_API_KEY;`
- Line 23: `'Authorization': Bearer ${apiKey},`

The OpenAI API key was exposed directly in the frontend application code. When a user requests a note summary, the browser initiates a direct request to the OpenAI completions endpoint, transmitting the API key in the `Authorization` request header in plain text.

### Screenshot (Before)
![before](screenshots/before-devtools.png)

### Why VITE_ Environment Variables Do Not Protect Secrets
Vite environment variables prefixed with `VITE_` are statically injected into the client-side JavaScript bundle during the build process. When the application is compiled and served, anyone opening the site in a web browser receives the compiled JavaScript code. A user (or a malicious crawler) can easily inspect the global bundle, environment files, or open the browser's Developer Tools Network tab to read the plain-text key from outgoing request headers. The frontend is entirely public and cannot safely store or hold credentials.
