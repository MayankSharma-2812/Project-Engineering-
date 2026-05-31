# BUG REPORT – TrackFlow Bug Report Form

This document records the analysis, root causes, implementation, and verification for the six form handling bugs in the TrackFlow internal bug reporting tool.

---

## The Six Identified Bugs & Root Causes

### Bug 1: Empty Submission
- **Symptom**: Form allows submission of reports even when all required fields (Title, Severity, Component, Description, Steps Count) are empty.
- **Root Cause**: The starter `validate()` function had no validation checks and simply returned `true`. Furthermore, `handleSubmit` ignored the return value of `validate()` entirely and proceeded to invoke the API request.
- **Resolution**: Updated `validate()` to check for required inputs and return a structured key-value error map. Implemented a gate check in `handleSubmit`: if any validation errors are returned, they are stored in the state, and the function returns early, blocking the API call.

### Bug 2: Double Submission (Missing Loading State)
- **Symptom**: The Submit button remains active and clickable after clicking it. An impatient user can double-click or triple-click the button, sending multiple identical requests to the backend.
- **Root Cause**: The `loading` state was declared but never set to `true` on submit or wired to the button's `disabled` prop in JSX.
- **Resolution**: Set `loading = true` at the beginning of `handleSubmit` and reset it in the `finally` block. Configured the Submit button with `disabled={loading}` and styled it to show `opacity: 0.7` and `cursor: not-allowed` during loading.

### Bug 3: Form Not Cleared on Success
- **Symptom**: After a successful submission, the success banner appears, but the form input fields retain their old values.
- **Root Cause**: There was no form state reset call in the successful API resolution promise path.
- **Resolution**: Added `setForm(EMPTY_FORM)` and `setErrors({})` in the `try` block after a successful API response.

### Bug 4: Swallowed Server Errors
- **Symptom**: If the server rejects the submission (e.g. entering a title containing the word "login" triggers a `409 Conflict`), the error disappears silently. The user sees no visual indicator of the failure.
- **Root Cause**: The `catch` block in `handleSubmit` was completely empty, swallowing the rejected promise without storing or rendering the error details.
- **Resolution**: Implemented structured error routing inside the `catch` block. If `err.field` is specified, it populates field-level validation state (`setErrors`). Otherwise, it sets a top-level banner (`setServerError`).

### Bug 5: No Field-Level Validation Messages
- **Symptom**: Input borders do not highlight and no text messages appear below the inputs when validation fails.
- **Root Cause**: The `errors` state object was never referenced in the React JSX tree, and no conditional styling was applied.
- **Resolution**: Wired `errors` to each input's `style` attribute (`style={errors[field] ? { borderColor: 'var(--danger)' } : {}}`) and added a conditional block to render red text messages (`⚑ message`) below each input when the key exists in `errors`.

### Bug 6: Invalid Steps Count
- **Symptom**: The "No. of Steps" input accepts `0` or negative numbers (e.g. `-5`), which is physically invalid for a reproducer checklist.
- **Root Cause**: The input was set to type `number` but had no validation logic inside the client-side `validate()` function.
- **Resolution**: Added a validation check inside `validate()` asserting that `stepsCount` is populated, evaluates to a valid number, is strictly greater than `0`, and is a whole integer.

---

## Engineering Reflection: The Danger of the Silent Catch
An empty `catch` block (silent catch) is a critical anti-pattern in async application state design. It breaks the implicit promise between the client interface and the user. When a database or API request fails, the application fails to update its state, keeping the loading indicator stuck or returning no feedback at all. 

To the user, the app looks unresponsive, leading them to click submit multiple times or assume the system is broken. In production, this silent failure masks database lockups, rate limits, server crashes, and authorization expired tokens, turning easily resolvable issues into silent data-loss incidents. An empty catch is worse than no catch, because it actively conceals exceptions from standard runtime tracking frameworks.

---

## Live Deployment
- **Live URL**: [Replace with your live Vercel/Netlify URL after deploying]
