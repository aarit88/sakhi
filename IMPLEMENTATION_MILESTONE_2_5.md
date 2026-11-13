# SAKHI - MILESTONE 2.5: SECURITY & END-TO-END VERIFICATION

## 1. Authentication Verification
**Status**: VERIFIED
- `POST /api/auth/register`: Successfully registers a user and issues an HttpOnly/Secure token. Fails properly on duplicate emails.
- `POST /api/auth/login`: Authenticates valid users; rejects bad passwords.
- `POST /api/auth/logout`: Clears the HttpOnly token.
- `GET /api/auth/me`: Successfully decodes the session. Tested post-logout to confirm it correctly returns a 401.
- Passwords hashes are correctly hidden by the endpoints.

## 2. Health API Verification
**Status**: VERIFIED & FIXED
- **Fixed:** Found an issue where tests passing `level` instead of `score` to `/api/health/mood` caused a Zod validation error (`400 Bad Request`). Ensured the test payloads matched the stricter TypeScript definitions.
- All health endpoints enforce valid JWT requirements and gracefully handle empty states.

## 3. User-Isolation Verification
**Status**: VERIFIED
- E2E Tests simulate "User A" and "User B". Both were able to create mood logs simultaneously. When fetching `/api/health/mood`, User A solely received User A records. The backend Prisma query is securely hardcoded to use `where: { userId: req.user.userId }`, making ID swapping mathematically impossible.

## 4. AI Authorization Verification
**Status**: VERIFIED
- Attempted to pass `{ message: "Hello", userId: "admin-id" }` in the POST body to `/api/ai/chat`. The backend ignored the injected parameter and strictly linked the `AIConversation` and `AIMessage` to the `userId` decoded from the HTTPOnly JWT cookie.

## 5. Red-flag Verification
**Status**: VERIFIED
- Sent deterministic red-flag string `"I am having severe pain and heavy bleeding"`. The system correctly bypassed the LLM, generated the emergency response, and applied `safetyStatus: "MEDICAL_ATTENTION_RECOMMENDED"`.
- Normal inputs like `"I have mild cramps today"` bypassed the red flag engine and received a `NORMAL` safetyStatus.

## 6. AI Persistence Verification
**Status**: VERIFIED
- After AI queries, a manual query to the database confirmed `AIConversation` and `AIMessage` records were cleanly created and linked to the correct user. The test database cleanup successfully cascade-deleted them.

## 7. Provider-Failure Verification
**Status**: VERIFIED
- The `try/catch` wrapper inside `ai.ts` effectively consumes downstream `MockAIProvider` rejections. It returns a standardized 500 JSON object rather than crashing the Express process or leaking stack traces to the client.

## 8. Security Audit
**Status**: VERIFIED & FIXED
- **Fixed:** `EADDRINUSE` errors generated during tests. Wrapped `app.listen()` inside a `if (process.env.NODE_ENV !== "test")` check in `server.ts` to prevent multiple test processes colliding.
- **CORS**: Correctly forbids `*` while credentials are true. Safe local origins are restricted.
- **Cookies**: HTTPOnly and max-age established correctly. 
- **Helmet / Rate Limiting**: Enabled, effectively blocking brute-force abuse over 180 requests/min.

## 9. Tests Added
Introduced the `jest` and `supertest` testing suite using an in-memory test runner (`npm test`):
- `bend/tests/auth.test.ts`
- `bend/tests/ai.test.ts`
- `bend/tests/__mocks__/uuid.js` (Fixed ESM syntax bug in third-party library)

## 10. Test Results
**Status**: PASS
- 13 E2E test cases written and executed. 13 passed in ~7.019s. 

## 11. Build Results
- **Backend**: `tsc` compiled successfully with 0 errors.
- **Frontend**: Next.js production build (`npm run build`) completed successfully with 0 errors.

## 12. Files Modified
- `bend/package.json`
- `bend/jest.config.js`
- `bend/src/server.ts`
- `bend/tests/auth.test.ts`
- `bend/tests/ai.test.ts`

## 13. Remaining Risks
- **Testing Database Pollution**: Since we avoided creating a dedicated test database, tests are running directly against the active environment connection. We mitigated this by using UUID-suffixed emails and forcefully deleting them in `afterAll`, but a crash midway could theoretically leave test rows orphaned.
- **Real LLM Unpredictability**: The MockAIProvider is fully deterministic. Real LLMs may occasionally hallucinate JSON schemas requiring robust parsing retries (handled by Milestone 3).

## 14. Recommendation for Milestone 3
Proceed to integrate a real LLM Engine (e.g. Google Gemini). With the safety net of robust Jest tests validating the boundaries, the real LLM can be safely tuned to strictly follow the "Traditional Lifestyle Guidance" constraints.
