# LearnLens — Prompt Quality Comparison

---

## Task A — Notes Reviewer

### Missing Components in Original
- **System Instruction**: Absent. The model has no defined persona or expertise level (e.g., NoteReview analyst), leading to generic or inconsistent feedback.
- **Context**: Absent. The input `{content}` is injected without delimiters, making it harder for the model to distinguish between instructions and data.
- **Format**: Absent. No JSON schema is provided, resulting in unstructured prose that the frontend cannot reliably parse.
- **Constraints**: Absent. No rules against markdown fencing or editorializing, which causes parsing failures and professional tone issues.
- **Task (Partial)**: Vague. "give feedback" doesn't specify the required dimensions (clarity, completeness, accuracy).

### Original Prompt
`give feedback on this note: ${content}`

### Rewritten Prompt
```javascript
export const TASK_A_PROMPT = (content) => ({
  // 1. SYSTEM INSTRUCTION: define NoteReview's expertise and quality standard
  systemMsg: `You are NoteReview, an expert academic study quality analyst. You evaluate student notes objectively and constructively. You focus on whether the note would help a student pass an exam — not on writing style or personal taste.`,
  
  // 2. CONTEXT, 3. TASK, 4. FORMAT, 5. CONSTRAINTS
  userMsg: `
--- NOTE START ---
${content}
--- NOTE END ---

Evaluate the note above across three dimensions:
1. Clarity: Is the content expressed in a way that is easy to understand and revise from?
2. Completeness: Does it cover the key concepts expected for this topic?
3. Accuracy: Are the facts and definitions correct or potentially misleading?

Return only a valid JSON object with this exact shape:
{
  "clarity": { "score": 1-10, "feedback": "string — 1-2 sentences" },
  "completeness": { "score": 1-10, "feedback": "string — 1-2 sentences" },
  "accuracy": { "score": 1-10, "feedback": "string — 1-2 sentences" },
  "overallScore": 1-10,
  "topPriority": "string — the single most impactful improvement the student can make"
}

Do not add markdown fencing or code blocks.
Do not include any text before or after the JSON.
Do not invent facts that are not in the note.
Do not use subjective language about the student or their intelligence.
Do not give a score higher than 8 without explicitly-stated justification in the feedback.
`
})
```

### Test Input Used
Mitosis is when cells divide. There are 4 phases. Prophase is when chromosomes condense. Metaphase the chromosomes line up. Anaphase they split. Telophase new cells form. DNA replicates before division starts. This is important for growth and repair.

### Bad Prompt Output
Okay, here's some feedback on the note:

**Strengths:**

*   **Basic Accuracy:** The note gets the core concepts of mitosis across. It correctly identifies the process 
as cell division, mentions the four phases, and gives a basic description of each.
*   **Concise:** It's brief and to the point.
*   **Highlights Importance:** It mentions the importance of mitosis for growth and repair.

**Areas for Improvement:**

*   **Oversimplification:** The descriptions of each phase are *very* basic and lack detail. This could be misl
eading or confusing for someone learning the process.
*   **Lack of Specificity:** The note lacks key details that provide better understanding.
*   **Clarity of Telophase:** "New cells form" is a bit vague.
*   **Missing Key Components:** It doesn't mention the role of the spindle fibers, centrioles, or nuclear envel
ope breakdown.
*   **Flow and Grammar:** While understandable, the flow could be improved with slightly better sentence struct
ure.

**Suggested Revisions and Additions (More Detailed):**

Here's a revised version incorporating these suggestions:

"Mitosis is a type of cell division that results in two identical daughter cells. Before mitosis begins, DNA re
plication occurs, ensuring each new cell receives a complete set of chromosomes. Mitosis has four main phases: 

*   **Prophase:** Chromosomes condense and become visible. The nuclear envelope breaks down, and spindle fibers
 begin to form.
*   **Metaphase:** Chromosomes line up along the middle of the cell (the metaphase plate), attached to spindle 
fibers from opposite poles.
*   **Anaphase:** Sister chromatids (the duplicated chromosomes) are pulled apart by the spindle fibers and mov
e to opposite poles of the cell.
*   **Telophase:** Chromosomes arrive at the poles and begin to decondense. The nuclear envelope reforms around
 each set of chromosomes, and the cell starts to divide.

Mitosis is crucial for growth, repair, and replacement of cells in multicellular organisms."

**Explanation of Changes:**

*   **More Precise Definition:** I provided a more complete definition of mitosis.
*   **Added Detail to Phases:** I expanded the descriptions of each phase to include more key events like spind
le fiber formation and nuclear envelope changes.
*   **Clarity in Telophase:** I clarified that the nuclear envelope reforms.
*   **Improved Flow:** I made slight adjustments to sentence structure for better readability.
*   **Added Overall Importance:** I made it clear that mitosis is essential for multicellular organisms.       

**When to Use Which Version:**

*   **Original:** Suitable for a very quick reminder or a first introduction to the *very basic* concept.      
*   **Revised:** Better for understanding the process in more detail and for accurate learning.

Remember to tailor the level of detail to the intended audience and the purpose of the note.

### Good Prompt Output
```json
{
  "clarity": {
    "score": 7,
    "feedback": "The phases are listed and easy to identify, but adding transition words could improve flow."  
  },
  "completeness": {
    "score": 6,
    "feedback": "It covers the main phases but lacks detail about what happens in each. It omits interphase."  
  },
  "accuracy": {
    "score": 9,
    "feedback": "The presented facts are correct. However, stating 'new cells form' is a simplification of cyto
kinesis."
  },
  "overallScore": 7,
  "topPriority": "Add more detail to each phase of mitosis and include interphase to provide a complete picture
 of the cell cycle."
}
```

### Improvement
The original prompt lacked Format, which caused the output to be unstructured prose that the frontend could not parse; the rewritten prompt's Format produced a JSON object with exactly 5 keys on every run.


---

## Task B — Placement Summariser

### Missing Components in Original
- **System Instruction**: Absent. No role defined for the summarizer, leading to unpredictable tone and depth.
- **Context**: Absent. The experience text is not bounded by delimiters.
- **Task**: Vague. "summarize this interview experience" doesn't specify the 5 required fields (company, role, etc.).
- **Format**: Absent. No JSON structure defined; difficulty could be a word or number, and arrays aren't enforced.
- **Constraints**: Absent. No GDPR protections (removing names) or limits on speculative content.

### Original Prompt
`summarize this interview experience: ${text}`

### Rewritten Prompt
```javascript
export const TASK_B_PROMPT = (text) => ({
  // 1. SYSTEM INSTRUCTION: define the summariser's role and privacy obligations
  systemMsg: `You are PlacementSummarizer, a professional career platform assistant. Your role is to transform raw interview experiences into concise, structured summaries for peer review. You must maintain strict privacy by removing all personal identifiers.`,

  // 2. CONTEXT, 3. TASK, 4. FORMAT, 5. CONSTRAINTS
  userMsg: `
--- INTERVIEW EXPERIENCE START ---
${text}
--- INTERVIEW EXPERIENCE END ---

Summarize the interview experience above by extracting the following fields:
1. Company Name
2. Role applied for
3. Difficulty Rating (on a scale of 1-5)
4. Key Topics covered during the rounds
5. Outcome of the interview

Return only a valid JSON object with this exact shape:
{
  "company": "string",
  "role": "string",
  "difficulty": 1-5,
  "keyTopics": ["string"],
  "outcome": "string"
}

Do not include the interviewee's name or any other personally identifiable information.
The difficulty field must be a raw number (1, 2, 3, 4, or 5), not a word.
Do not speculate about details not explicitly mentioned in the text.
Do not wrap the JSON in markdown code blocks.
`
})
```

### Test Input Used
I interviewed at Google for a SWE intern role in March. The interview had 3 rounds. First was a screening call, then two technical rounds. They asked me about arrays and dynamic programming. I solved the first problem easily but struggled with the DP one. I was given an offer but turned it down due to relocation. The interviewers were nice and gave good feedback about my problem-solving approach.

### Bad Prompt Output
This Google SWE intern interview experience consisted of a screening call followed by two technical rounds focu
sing on arrays and dynamic programming. The candidate performed well on the array question but found the DP que
stion challenging. Despite this, they received an offer, indicating a generally positive impression. Ultimately
, the offer was declined due to relocation issues. The interviewers were supportive and provided constructive f
eedback on the candidate's problem-solving methodology.

### Good Prompt Output
```json
{
  "company": "Google",
  "role": "SWE intern",
  "difficulty": 3,
  "keyTopics": ["arrays", "dynamic programming"],
  "outcome": "Offer declined"
}
```

### Improvement
The original prompt lacked Task, which caused the summary to omit specific data points like difficulty rating; the rewritten prompt's Task produced a structured JSON object containing all 5 required fields.


---

## Task C — Error Analyst

### Missing Components in Original
- **System Instruction**: Absent. No expertise (e.g., Senior Backend Engineer) defined.
- **Context**: Absent. Error messages are injected without bounding.
- **Task**: Vague. "why is there a bug" doesn't specify the 4 required fields for the dashboard.
- **Format**: Absent. No JSON shape or enums for severity defined, making dashboard integration impossible.
- **Constraints**: Absent. No restrictions on markdown usage or speculation about unevidenced causes.

### Original Prompt
`why is there a bug: ${error_message}`

### Rewritten Prompt
```javascript
export const TASK_C_PROMPT = (error_message) => ({
  // 1. SYSTEM INSTRUCTION: define the error analyst's expertise
  systemMsg: `You are ErrorAnalyst, a senior backend debugging engineer. You excel at interpreting stack traces and identifying the precise line and cause of failures in modern web applications.`,

  // 2. CONTEXT, 3. TASK, 4. FORMAT, 5. CONSTRAINTS
  userMsg: `
--- ERROR LOG START ---
${error_message}
--- ERROR LOG END ---

Analyze the error log and identify:
1. Root Cause: A concise explanation of why the error occurred.
2. Affected Component: The specific file or function where the failure originated.
3. Severity Level: One of 'low', 'medium', 'high', or 'critical'.
4. Recommended Fix: A step-by-step resolution to prevent the error.

Return only a valid JSON object with this exact shape:
{
  "rootCause": "string",
  "affectedComponent": "string",
  "severity": "low/medium/high/critical",
  "recommendedFix": "string",
  "codeSnippet": "string"
}

Do not add markdown fencing or code blocks.
The severity field must be exactly one of: 'low', 'medium', 'high', or 'critical'.
Do not speculate about causes that are not evidenced by the stack trace provided.
Return ONLY the JSON object.
`
})
```

### Test Input Used
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList.render (/app/components/UserList.jsx:34:22)
    at processChild (/app/node_modules/react-dom/cjs/react-dom-server.node.development.js:3990:14)
    at resolve (/app/node_modules/react-dom/cjs/react-dom-server.node.development.js:4054:5)
    at ReactDOMServerRenderer.read (/app/node_modules/react-dom/cjs/react-dom-server.node.development.js:4402:29)

### Bad Prompt Output
The error "TypeError: Cannot read properties of undefined (reading 'map')" means you're trying to use the `map` method on something that is `undefined`.  In this specific traceback, the error is happening within the `UserList.render` function, specifically at line 34 of `/app/components/UserList.jsx`.  This strongly suggests that you're trying to call `map` on a variable that is supposed to be an array, but is currently `undefined`.        

Here's a breakdown of the likely causes and how to debug and fix them:

**Common Causes:**

1. **Missing or Incorrect Data Fetching:** The most probable cause is that the data you're expecting to be an array (likely a list of users) hasn't been fetched or hasn't been fetched correctly.
   * **Asynchronous Operations:** If you're fetching data from an API, the component might be rendering *before* the data has arrived. This will lead to `undefined` being used where the array should be.
   * **API Errors:** The API call might be failing, returning `undefined` or an error that isn't being handled properly.
   * **Data Transformation Issues:** The data might be arriving, but it's not in the expected format (e.g., it's an object when you expect an array).
   * **Initial State:** If the initial state of your component doesn't include an array, the `map` function will fail on the first render.

2. **Incorrect Prop Passing:** If the list of users is passed as a prop to the `UserList` component, the prop might be `undefined` or not passed at all.

3. **Conditional Rendering Issues:**  If you're conditionally rendering the `UserList` based on some condition, the condition might be incorrect, causing the component to render without the necessary data.

4. **Typographical Errors:** A simple typo in the variable name that holds the array can lead to this error.   

**Debugging Steps:**

1. **Inspect the `UserList.jsx` File (Line 34):**  Open `/app/components/UserList.jsx` and examine line 34.  Identify the variable you're calling `map` on.  For example:

   ```javascript
   // Example line 34 (hypothetical)
   {users.map(user => (
     <li key={user.id}>{user.name}</li>
   ))}
   ```

   In this example, the variable you'd be investigating is `users`.

2. **Console Logging:**  Add `console.log` statements to your code to inspect the value of the variable *before* you call `map` on it.

   ```javascript
   // In UserList.jsx, before line 34:
   console.log("Users data:", users); // Or whatever the variable name is
   console.log("Type of users:", typeof users);
   ```

   * **Check the logs in your browser's developer console.**  If you see `undefined` or `null`, that's your problem.  If you see an object when you expect an array, you need to adjust how you're accessing the data.        

3. **Inspect Network Requests (if fetching data):**  Open your browser's developer tools (usually F12), go to the "Network" tab, and check if the API request is successful (status code 200) and if the response data is what you expect.  If the request fails (status code 400, 500, etc.), you need to fix the API call.

4. **Check the Parent Component (if props are involved):**  If the `UserList` component receives data as props, go to the parent component that renders `UserList` and make sure you're passing the correct data:

   ```javascript
   // Example in the parent component
   <UserList users={userData} />
   ```

   * Use `console.log` in the parent component to check the value of `userData` before passing it to `UserList`.

5. **Check Initial State:**  If the `users` data is managed in the component's state, make sure the initial state is an empty array:

   ```javascript
   import React, { useState } from 'react';

   function UserList() {
     const [users, setUsers] = useState([]); // Initial state is an empty array
     // ... rest of the component
   }
   ```

**Solutions:**

Once you've identified the cause, here are common solutions:

1. **Handle Asynchronous Data Loading:**

   * **Conditional Rendering:**  Only render the `UserList` component when the data is available:

     ```javascript
     function UserList({ users }) {
       if (!users) {
         return <div>Loading users...</div>; // Or a spinner
       }

       return (
         <ul>
           {users.map(user => (
             <li key={user.id}>{user.name}</li>
           ))}
         </ul>
       );
     }
     ```

   * **Optional Chaining:**  Use optional chaining (`?.`) to safely access the `map` method:

     ```javascript
     <ul>
       {users?.map(user => (  // Note the ?. before map
         <li key={user.id}>{user.name}</li>
       ))}
     </ul>
     ```
     This will prevent the error if `users` is `undefined`, but it won't display anything.  You'll still want to handle the loading state.

2. **Handle API Errors:**

   * **Error Handling in `fetch` or `axios`:**  Add error handling to your API calls:

     ```javascript
     fetch('/api/users')
       .then(response => {
         if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
         }
         return response.json();
       })
       .then(data => {
         setUsers(data);
       })
       .catch(error => {
         console.error("Error fetching users:", error);
         // Display an error message to the user
         setError("Failed to load users.");
       });
     ```

3. **Fix Data Transformation:**

   * If the API returns an object instead of an array, adjust your code to extract the array from the object:  

     ```javascript
     .then(data => {
       // Assuming the API returns { users: [...] }
       setUsers(data.users);
     });
     ```

4. **Ensure Props are Passed Correctly:**

   * Double-check the parent component to make sure you're passing the correct prop name and that the value of the prop is actually the array you expect.

5. **Set Initial State to an Empty Array:** Always initialize the state with an empty array to avoid the error on the first render.

**Example (with data fetching and error handling):**

```javascript
import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState(null); // Initialize to null, not undefined
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []); // Empty dependency array means this runs only once on mount

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ul>
      {users && users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default UserList;
```

### Good Prompt Output
```json
{
  "rootCause": "The error occurred because you are trying to call the 'map' method on an undefined variable, li
kely because the 'users' property is not being passed or is undefined when the UserList component is rendered."
,
  "affectedComponent": "/app/components/UserList.jsx:34",
  "severity": "high",
  "recommendedFix": "Ensure that the 'users' property is passed correctly to the UserList component and that it
 is not undefined. Add a check to verify that 'users' is an array before attempting to map over it.",
  "codeSnippet": "users && Array.isArray(users) ? users.map(...) : []"
}
```

### Improvement
The original prompt lacked Format, which caused the error analysis to return varying-length prose paragraphs; the rewritten prompt's Format produced a structured JSON object with severity enums and code snippets.

