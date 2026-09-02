# AI Agent Development Rules & Guidelines (`rules.md`)

Welcome Agent. You are tasked with building the **Insect Database System (ระบบฐานข้อมูลแมลง)** based on the approved PRD. You must follow the instructions below strictly to ensure a clean, high-performance, and anti-gravity codebase.

---

## 1. Core Paradigm: Anti-Gravity Engineering
*   **Zero-Bloat Architecture:** Keep components atomic, lightweight, and single-purposed. Resist the "gravitational pull" of massive helper files or premature general-purpose abstractions.
*   **Next.js Native Capabilities Only:** Do NOT spin up external Express servers, isolated standalone proxies, or massive microservices. Utilize **Next.js App Router API Route Handlers** exclusively for server-side logic.
*   **No Redux / Global State Bloat:** Lean on Next.js Server Components, standard URL `searchParams` for filters/search, and local React state (`useState`/`useActionState`). Avoid loading heavy global state managers unless explicitly commanded.

---

## 2. Technical Stack Boundaries
*   **Frontend & Framework:** Next.js 14+ (App Router, Tailwind CSS).
*   **Backend Runtime:** Node.js (via Next.js Serverless/Edge Runtime).
*   **Database Client:** Native `mysql2/promise` with clean pooling.
*   **Database Server:** MySQL 8.0 running via Docker Compose.

---

## 3. Strict Coding Conventions

### A. Backend & API Guidelines (`src/app/api/...`)
1.  **Response Format Consistency:** Every API Response must follow this strict structure:
    ```json
    {
      "success": true, 
      "data": [], 
      "message": "Optional localized text string"
    }
    ```
2.  **Connection Management:** Always reference the global connection pool (`src/lib/db.js`). Never spin up individual manual connections inside routes that might lead to resource leaks.
3.  **Security Baseline:** 
    *   Passwords must be hashed using `bcrypt` or `argon2` before writing to `users`. Never store raw strings.
    *   Validate query parameters rigorously to mitigate any risk of SQL injection (always use positional array params `[param1, param2]`).

### B. Frontend Guidelines (`src/app/...`)
1.  **Tailwind Utility-First:** Write inline utility classes. Do not generate custom CSS stylesheets unless handling complex 3D or specific animation constraints.
2.  **Interactive Elements:** Ensure any component reading input fields, processing search events, or dealing with form lifecycles includes the `'use client';` directive cleanly at the top line.
3.  **Search & Filtering Integration:** The search function must reflect smoothly into the native URL query string using Next.js `useRouter` and `useSearchParams`, allowing users to bookmark exact search criteria.

---

## 4. Role-Based Access Controls (RBAC)
You must enforce strict permission checking:
*   **`/api/insects` [GET]:** Open to all verified and unverified (General User) traffic.
*   **`/api/insects` [POST, PUT, DELETE]:** Must explicitly evaluate incoming authentication tokens (session headers/cookies) to confirm the user has an `'admin'` role flag set. Return a `403 Forbidden` response otherwise.

---

## 5. Development Workflow Rules for the Agent
*   **Step-by-step Execution:** Write the database adapters first, then the backend endpoint routers, followed by frontend presentation layers.
*   **Test-driven Validation:** Before declaring a feature complete, dry-run edge cases (e.g., searching for special characters, submitting blank forms, attempting non-admin write mutations).

*Adhere strictly to these lightweight guidelines to build an elite, anti-gravity application.*
