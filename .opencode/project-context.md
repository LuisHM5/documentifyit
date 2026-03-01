# DocumentifyIt — Project Context

> AI-powered document management platform with real-time editing, approval workflows, smart templates, and automated validation.

---

## Overview

DocumentifyIt is a full-stack SaaS platform for enterprise document lifecycle management. It covers document creation, editing, versioning, approval, sharing, and automated validation — with AI embedded throughout the workflow.

The platform exposes a public REST/GraphQL API so third-party clients can consume core functionality (create, read, approve, share documents) programmatically.

---

## Core Features

### Document Management

- Hierarchical document tree (fully customizable: folders, categories, tags, drag-and-drop)
- Real-time collaborative editing (WebSockets / CRDT)
- Document versioning and revision history with diff viewer
- Soft-delete, archiving, and restore

### AI Integration

- AI-assisted document generation from prompts or templates
- Inline AI assistant inside the editor (slash commands, context-aware suggestions)
- AI-powered automatic validation of common document types (contracts, invoices, reports)
- Smart template population from structured data

### Templates & Formats

- Company-defined templates with variable substitution
- AI-generated templates from description or sample documents
- Export formats: PDF, DOCX, HTML, Markdown

### Approval Workflows

- Configurable multi-step approval flows per document type
- Role-based step assignment (reviewer, approver, observer)
- Notifications (email + in-app) at each stage
- Audit trail of all approval actions

### Search

- Full-text indexed search via Elasticsearch (or pgvector fallback)
- Filters by type, status, owner, date range, tags
- Semantic/AI search (embeddings) for natural language queries

### Permissions & Sharing

- Fine-grained RBAC: Owner, Admin, Editor, Reviewer, Viewer
- Document-level and folder-level permissions
- Share via link (with optional expiry and password)
- Cross-document references and citations

### Automation & Integrations

- Scheduled automatic document sending (email / webhook)
- Cron-based backup exports to S3
- Webhooks for external integrations on document events
- Public REST API + API keys for third-party clients

### Infrastructure & Reliability

- Automated backups (S3 snapshots, DB dumps)
- Rate limiting per API key and per user session
- Full audit logging with Pino structured logs

---

## Tech Stack

### Monorepo Structure

```
documentifyit/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # Shared types, DTOs, utilities
│   ├── ui/           # Shared UI components (Shadcn base)
│   └── config/       # Shared ESLint, TS, Tailwind configs
├── infra/            # Docker, K8s, Terraform
└── package.json      # NPM workspaces root
```

### Frontend — `apps/web`

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: Shadcn/ui + Tailwind CSS
- **State**: Zustand or React Query (TanStack)
- **Real-time**: WebSocket client (Socket.IO or native WS)
- **Editor**: TipTap or BlockNote (ProseMirror-based, extensible)

### Backend — `apps/api`

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: TypeORM
  - Database: PostgreSQL (primary)
  - Auto-migrations enabled
  - Seeds for dev/staging
- **Cache**: Redis (session, rate limiting, pub/sub)
- **Search**: Elasticsearch (document indexing and full-text search)
- **Storage**: AWS S3 (document files, exports, backups)
- **AI**: Vercel AI SDK (`ai` package) — OpenAI / Anthropic providers
- **Validation**: class-validator + class-transformer
- **Logging**: Pino (structured JSON logs)
- **Jobs**: NestJS Schedule (cron jobs for backups, scheduled sends)
- **Rate limiting**: `@nestjs/throttler` + Redis store
- **Auth**: JWT + Refresh tokens, optional OAuth2

### Proxy / Networking

- **Dev**: Nginx or Traefik local
- **Prod**: Traefik (reverse proxy, TLS termination, routing)

### Infrastructure

- **Containers**: Docker (dev + prod Compose configs)
- **Orchestration**: Kubernetes (EKS on AWS)
- **Cloud**: AWS (S3, RDS PostgreSQL, EKS, ECR, SES for email)
- **CI/CD**: GitHub Actions (lint → test → build → deploy)

---

## Data Models (High-Level)

| Entity            | Key Fields                                                     |
| ----------------- | -------------------------------------------------------------- |
| `User`            | id, email, name, role, passwordHash, orgId                     |
| `Organization`    | id, name, plan, settings                                       |
| `Document`        | id, title, content (JSONB), status, ownerId, folderId, version |
| `DocumentVersion` | id, documentId, content, createdAt, authorId                   |
| `Folder`          | id, name, parentId, orgId, permissions                         |
| `Template`        | id, name, content, variables, isAI, orgId                      |
| `ApprovalFlow`    | id, name, steps[], documentTypeId, orgId                       |
| `ApprovalStep`    | id, flowId, assigneeRole, order, status                        |
| `Permission`      | id, resourceId, resourceType, userId/roleId, level             |
| `ShareLink`       | id, documentId, token, expiresAt, password                     |
| `AuditLog`        | id, action, actorId, resourceId, metadata, createdAt           |
| `ApiKey`          | id, orgId, keyHash, scopes, lastUsedAt                         |

---

## API Design

- **Base URL**: `/api/v1`
- **Auth**: Bearer JWT for user sessions, `X-API-Key` header for programmatic access
- **Format**: JSON, pagination via `?page=&limit=`
- **Versioning**: URL-based (`/v1`, `/v2`)

Key endpoint groups:

- `POST /auth/*` — login, register, refresh, OAuth
- `GET/POST/PUT/DELETE /documents` — CRUD + search
- `GET /documents/:id/versions` — revision history
- `POST /documents/:id/approve` — submit for approval
- `POST /documents/generate` — AI generation
- `GET/POST /templates` — template CRUD
- `POST /templates/generate` — AI template creation
- `GET/POST /folders` — tree management
- `POST /share` — create share links
- `GET /search` — full-text + semantic search
- `GET /audit-logs` — audit trail

---

## AI Integration Points

1. **Document generation** — `POST /documents/generate` with a prompt → streamed AI response fills the document
2. **Inline editor assistant** — slash command `/ai` inside the editor triggers a sidebar AI chat with document context
3. **Auto-validation** — on document submit, background job analyzes content against document-type schema and returns structured feedback
4. **Template generation** — describe a template, AI returns a structured template with variables
5. **Semantic search** — embeddings stored in pgvector or Elasticsearch `dense_vector` for natural language queries
6. **Smart suggestions** — real-time suggestions while typing (throttled, optional)

---

## Approval Workflow State Machine

```
Draft → Submitted → In Review → Approved / Rejected
                              ↘ Revision Requested → Draft
```

- Each state transition triggers notifications
- Rejected and Revision Requested states include a mandatory comment
- Approved documents are locked (read-only unless re-submitted)

---

## Real-Time Architecture

- **WebSockets** via NestJS Gateway (Socket.IO adapter)
- Rooms per document: `doc:{documentId}`
- Events: `doc:patch`, `doc:cursor`, `doc:status`, `approval:updated`
- Redis pub/sub for multi-instance sync

---

## Search Architecture

- Documents indexed in Elasticsearch on create/update (async via queue)
- Fields indexed: `title`, `content` (plain text extracted), `tags`, `author`, `status`, `createdAt`
- Semantic index: embeddings on `content` chunks stored in `dense_vector` field
- Fallback: PostgreSQL `tsvector` full-text search if ES unavailable

---

## Background Jobs (Cron)

| Job                   | Schedule        | Description                              |
| --------------------- | --------------- | ---------------------------------------- |
| `BackupJob`           | Daily 02:00 UTC | Dump DB + export docs to S3              |
| `ScheduledSendJob`    | Every 5 min     | Process pending scheduled document sends |
| `ExpireShareLinksJob` | Every 1 hr      | Mark expired share links as inactive     |
| `ReIndexJob`          | Weekly          | Re-sync Elasticsearch index from DB      |
| `CleanupDraftsJob`    | Weekly          | Archive stale drafts older than 90 days  |

---

## Security Considerations

- All passwords hashed with bcrypt (cost 12)
- JWT access tokens expire in 15 min; refresh tokens in 7 days
- API keys are stored as SHA-256 hashes
- File uploads scanned for MIME type mismatch; stored in private S3 buckets
- Row-level security enforced at service layer (not DB-level initially)
- CSRF protection on web app session endpoints
- Rate limiting: 100 req/min for authenticated users, 20 req/min for public endpoints

---

## Development Environment

- OS: Ubuntu (Linux)
- Editor: VS Code / Neovim
- AI coding: OpenCode + Claude Code
- Package manager: npm (workspaces)
- Local containers: Docker Compose
- DB GUI: TablePlus or pgAdmin
- API testing: Bruno or Insomnia

---

## Environment Variables (Key)

```env
# App
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/documentifyit

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=documentifyit-files

# Auth
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Email (SES)
SES_FROM_EMAIL=noreply@documentifyit.com
```

---

## Current Status

> **Phase**: Planning / Architecture
> **Priority**: Set up monorepo scaffold → Auth module → Document CRUD → Real-time editing → AI generation → Approval flows → Search

---

## Key Decisions & Constraints

- Monorepo with npm workspaces (no Turborepo initially, add if needed)
- TypeORM with auto-migrations in dev; manual migration review before prod
- Elasticsearch preferred for search; pgvector as fallback
- AI SDK (`ai` package) abstracts provider — start with OpenAI, Anthropic as fallback
- No GraphQL initially; REST only, add if needed for public API consumers
- Multi-tenancy via `orgId` on all resources; no separate schemas per tenant initially
- Documents stored as JSONB (TipTap/BlockNote JSON format) in PostgreSQL; raw text extracted for search
