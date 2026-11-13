# SAKHI (Sakhi) Implementation

This project now includes the missing academic-project features:

- Secure health portal foundation with JWT auth, role-aware middleware, CORS, security headers, request size limits, and rate limiting.
- Anonymous Sakhi chatbot with a stateless backend endpoint.
- Clinical OCR report parser with browser OCR plus backend clinical marker parsing.

## Frontend

- Anonymous chat page: `fend/app/anonymous-chat/page.tsx`
- Clinical report parser page: `fend/app/clinical-reports/page.tsx`
- Navigation links: `fend/components/navigation.tsx`

Run:

```bash
cd fend
npm install
npm run dev
```

## Backend

- Anonymous chat route: `bend/src/routes/anonymous-chat.ts`
- Clinical reports route: `bend/src/routes/clinical-reports.ts`
- Chat agent service: `bend/src/services/sakhiAgent.ts`
- Report parser service: `bend/src/services/reportParser.ts`
- Security middleware: `bend/src/middleware/security.ts`
- Server route mounting: `bend/src/server.ts`

Run:

```bash
cd bend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## API Routes

- `POST /api/anonymous-chat/message`
- `POST /api/clinical-reports/parse`
- `GET /api/clinical-reports/markers`
- Existing auth, period tracking, reminders, community, and health-wellness routes remain available.

## Notes

The anonymous chat does not store message history. The clinical report parser processes report text in memory and returns structured markers, alerts, focus areas, and clinician questions. It is educational and should not be used as a diagnosis.
