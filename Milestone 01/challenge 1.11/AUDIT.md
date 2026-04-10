# Code Audit - Milestone 1.11

This document outlines the issues found in the initial `app.js` file of the Node.js Express application.

## 1. Bad Variable Names
- `x` (Line 5): Global variable used as an ID counter. Should be `idCounter`.
- `t` (Line 6): Parameter in `handleAll` indicating action type. Should be `actionType`.
- `d` (Line 7): Short for `req.body`. Should be `requestBody` or just use `req.body`.
- `r` (Line 8): Short for `req.params`. Should be `requestParams`.
- `tmp` (Line 18): Temporary object for a new confession. Should be `newConfession`.
- `arr` (Line 41): Array of sorted confessions. Should be `sortedConfessions`.
- `i` (Lines 49, 80): Single letter variable for ID. Should be `confessionId`.
- `info` (Line 50): Generic name for a confession object. Should be `confession`.
- `fn` (Line 50): Callback parameter in `find`. Should be `confession`.
- `cat` (Line 62): Short for category. Should be `category`.
- `stuff` (Line 65): Generic name for filtered results. Should be `filteredConfessions`.
- `handler` (Line 81): Used for an index in an array. Should be `confessionIndex`.
- `res2` (Line 83): Result of `splice` operation. Should be `deletedConfessions`.

## 2. Long Functions
- `handleAll` (Lines 6-96): A 90-line monolithic function that handles multiple HTTP methods and actions (create, getAll, getOne, getCat, del). It violates the Single Responsibility Principle.

## 3. Mixed Responsibilities
- **Routing Logic**: `handleAll` uses a string `t` to switch between different logic paths which should be handled by Express router.
- **Validation**: Input validation (lines 10-17) is mixed with business logic.
- **Data Persistence**: Directly manipulating the `confessions` array (lines 24, 83) within the handler.
- **Response Formatting**: Mixed within the same monolithic function.

## 4. Hardcoded Values
- **Categories**: The list `["bug", "deadline", "imposter", "vibe-code"]` is hardcoded twice (Lines 16, 63).
- **Security Token**: `supersecret123` (Line 76) is hardcoded in the codebase.
- **Port**: `3000` (Line 110) is hardcoded.
- **Limits**: Magic numbers like `500` (Lines 14, 34, 114) for character limits and log triggers.

## 5. Missing Comments
- The code lacks comments explaining the rationale behind the logic or describing what specific blocks do, making it harder to maintain.

## 6. Code Structure Issues
- **Deep Nesting**: The "create" logic (Lines 9-39) has up to 6 levels of nested `if` statements (Pyramid of Doom), making it hard to read.
- **Inconsistent Error Responses**: Sometimes returns JSON (Line 11), sometimes plain text (Line 28), and sometimes just strings (Line 31).
- **Inconsistent Variable Declarations**: Mix of `var`, `let`, and `const` (Lines 1, 2, 4, 5, 41, 50).
