# Plan: Connect Frontend with Backend Services

## Overview
Connect the Next.js frontend with the NestJS backend using axios, interceptors, and proper HTTP error handling to avoid generic responses.

---

## Phase 1: Backend - Global Exception Filter

**File:** `apps/api/src/filters/http-exception.filter.ts`

Create a global exception filter that returns consistent error responses:
```typescript
interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
}
```

**Changes:**
- Register filter in `apps/api/src/main.ts`

---

## Phase 2: Shared Types

**File:** `packages/shared/src/types/api-response.ts`

Add shared types:
```typescript
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
```

---

## Phase 3: Frontend - Axios Setup

### 3.1 Install axios
Add `axios` to `apps/web/package.json` dependencies.

### 3.2 Create axios client
**File:** `apps/web/src/lib/api/client.ts`

- Base URL from env (`NEXT_PUBLIC_API_URL`)
- Request timeout
- Default headers

### 3.3 Request interceptor
**File:** `apps/web/src/lib/api/interceptors/request.ts`

- Add `Authorization: Bearer <token>` from localStorage
- Add `Content-Type: application/json`

### 3.4 Response interceptor
**File:** `apps/web/src/lib/api/interceptors/response.ts`

- Handle 401: attempt token refresh, redirect to login if failed
- Transform error responses to structured format
- Throw typed API errors (not generic Error)

---

## Phase 4: Frontend - Typed API Services

### 4.1 Error types
**File:** `apps/web/src/lib/api/errors.ts`

```typescript
export class ApiException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error: string,
  );
}
```

### 4.2 Service modules
Create services for each API domain:
- `apps/web/src/lib/api/services/auth.service.ts` - login, register, refresh
- `apps/web/src/lib/api/services/documents.service.ts` - CRUD
- `apps/web/src/lib/api/services/templates.service.ts`
- `apps/web/src/lib/api/services/folders.service.ts`
- `apps/web/src/lib/api/services/search.service.ts`

### 4.3 Index export
**File:** `apps/web/src/lib/api/index.ts` - exports all services

---

## Phase 5: Integration

### 5.1 Update login page
**File:** `apps/web/src/app/(auth)/login/page.tsx`

- Add 'use client'
- Use auth service for login
- Handle errors with toast notifications
- Store tokens in localStorage

### 5.2 Token storage utilities
**File:** `apps/web/src/lib/api/token.ts`

- `getAccessToken()` / `setAccessToken()`
- `getRefreshToken()` / `setRefreshToken()`
- `clearTokens()`

---

## Implementation Order

1. Backend exception filter
2. Shared types
3. Install axios
4. Token utilities
5. Axios client + interceptors
6. API error classes
7. Auth service
8. Login page integration
9. Run lint and type-check

---

## Notes

- Token refresh flow: 401 → POST /auth/refresh → retry original request
- Toast notifications via shadcn/ui (to be wired up later - console for now)
- All API services return typed responses
