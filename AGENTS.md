# AGENTS.md — DocumentifyIt

Coding agent instructions for the DocumentifyIt monorepo.
Read this file before making any changes.

---

## Repository layout

```
documentifyit/
├── apps/
│   ├── web/          # Next.js 14 (App Router) — port 3000
│   └── api/          # NestJS 10 backend — port 3001
├── packages/
│   ├── shared/       # Shared TypeScript types and interfaces (no runtime deps)
│   ├── ui/           # Shared Shadcn/ui component wrappers
│   └── config/       # Shared ESLint, Tailwind, and TS base configs
├── infra/            # Docker Compose, Nginx
└── package.json      # npm workspaces root (node >=20, npm >=10)
```

All packages are referenced as workspace deps (`"*"`). Path aliases are defined
in each app's `tsconfig.json` and must be kept in sync.

---

## Commands

### Root (run from repo root)

```bash
npm install                        # install all workspaces
npm run dev                        # start all apps concurrently
npm run dev:web                    # Next.js only
npm run dev:api                    # NestJS only (nest start --watch)
npm run build                      # build all workspaces
npm run lint                       # lint all workspaces
npm run test                       # test all workspaces
npm run docker:dev                 # start Postgres + Redis + Elasticsearch
npm run docker:dev:down            # stop dev infrastructure
```

### API — `apps/api`

```bash
npm run test --workspace=apps/api                        # run all tests
npm run test --workspace=apps/api -- --testPathPattern=documents  # single file/pattern
npm run test --workspace=apps/api -- --testNamePattern="should create"  # single test by name
npm run test:cov --workspace=apps/api                    # coverage report
npm run test:watch --workspace=apps/api                  # watch mode
npm run lint --workspace=apps/api                        # eslint (auto-fix)
npm run type-check --workspace=apps/api                  # tsc --noEmit
npm run build --workspace=apps/api                       # nest build → dist/
```

### Web — `apps/web`

```bash
npm run lint --workspace=apps/web      # next lint
npm run type-check --workspace=apps/web  # tsc --noEmit
npm run build --workspace=apps/web     # next build
```

### Running a single API test file

```bash
# from repo root:
npm run test --workspace=apps/api -- --testPathPattern="src/modules/documents/documents.service.spec.ts"

# from apps/api/:
npx jest src/modules/documents/documents.service.spec.ts
```

Test files live next to the code they test and are named `*.spec.ts`.

---

## Environment

Copy `.env.example` to `.env` before running the API:

```bash
cp apps/api/.env.example apps/api/.env
```

Required services (started via Docker Compose):
- **PostgreSQL 16** — `localhost:5432`
- **Redis 7** — `localhost:6379`
- **Elasticsearch 8** — `localhost:9200`

TypeORM `synchronize: true` is enabled in development — schema is auto-synced.
Never enable `synchronize` in production; use explicit migrations.

---

## Code style

### TypeScript (all packages)

- **Strict mode** is on: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- Always use explicit types for function return values on public API methods.
- Prefer `interface` over `type` for object shapes; use `type` for unions/intersections.
- Use `unknown` instead of `any`; `any` is a lint warning in `packages/` and `apps/web/`.
- Prefix unused parameters with `_` (e.g. `_event`) to satisfy the no-unused-vars rule.
- Do not use non-null assertion (`!`) — handle null explicitly or throw.
- Nullables are expressed as `T | null`, never `T | undefined` for intentional absence.
- `enum` values use `PascalCase` keys and `snake_case` string values:
  ```ts
  enum DocumentStatus { Draft = 'draft', InReview = 'in_review' }
  ```

### Imports

- Node built-ins first, then third-party, then internal workspace packages
  (`@documentifyit/*`), then relative imports — separated by blank lines.
- Use `import type` for type-only imports.
- In `apps/web`, use the `@/` alias for imports within the app:
  ```ts
  import { cn } from '@/lib/utils';
  ```
- In `apps/api`, use relative imports within a module; cross-module imports go
  through the module's public exports (service classes only, never entities
  directly across module boundaries).

### Naming conventions

| Construct | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `document-versions.service.ts` |
| Classes | `PascalCase` | `DocumentsService` |
| Interfaces | `PascalCase`, no `I` prefix | `JwtPayload`, `SearchResult` |
| Enums | `PascalCase` | `DocumentStatus` |
| Variables / functions | `camelCase` | `findById`, `orgId` |
| DB columns | `snake_case` via `@Column({ name: 'snake_case' })` | `owner_id` |
| React components | `PascalCase`, named exports | `export function Editor(...)` |
| React component files | `PascalCase.tsx` | `Editor.tsx` |

### NestJS / API conventions

- One module per feature directory:
  `src/modules/<feature>/<feature>.module.ts|service.ts|controller.ts`
- Entities live in `src/modules/<feature>/entities/<entity>.entity.ts`.
- Use `@Injectable()` services; inject via constructor with `private readonly`.
- All repository injections use `@InjectRepository(Entity)`.
- Config values are accessed via `ConfigService.get<T>('namespace.key')` — never
  `process.env` directly inside services (only in config factory files).
- Use NestJS built-in HTTP exceptions (`NotFoundException`, `UnauthorizedException`,
  `ForbiddenException`, `BadRequestException`) — never throw plain `Error`.
- `Logger` from `@nestjs/common` inside services:
  ```ts
  private readonly logger = new Logger(MyService.name);
  ```
- All public controller routes must have `@ApiTags(...)` and `@ApiBearerAuth()`.
- DTOs must use `class-validator` decorators; never accept `Record<string, unknown>`
  in production endpoints (stubs are acceptable during scaffolding).

### Next.js / React conventions

- `'use client'` at the top of any component that uses hooks or browser APIs.
- Server Components are the default — only opt into client components when needed.
- Tailwind utility classes only; no inline `style={{}}` props.
- Use the `cn()` utility from `@/lib/utils` (clsx + tailwind-merge) for conditional
  class names.
- Colocate page-level components in `src/app/`; reusable components in
  `src/components/<domain>/`.
- Use `@tanstack/react-query` for all server state; `zustand` for client-only UI
  state.

### Formatting

- 2-space indentation throughout.
- Single quotes in TypeScript/JavaScript; double quotes in JSX attribute strings.
- Trailing commas in multi-line function args, arrays, and objects.
- Semicolons always.
- Max line length: 100 characters (soft limit — ESLint does not enforce this).
- No blank lines at the start or end of blocks.

---

## Error handling

- API: throw NestJS HTTP exceptions in services; let the global exception filter
  format the response. Never swallow errors silently.
- Async functions must be `await`-ed; do not use floating promises.
- Wrap external calls (Elasticsearch, S3, AI SDK) in try/catch and rethrow as
  appropriate NestJS exceptions with a meaningful message.
- Frontend: use React Query's `error` state for server errors; display user-facing
  messages via toast notifications (to be wired up — do not use `alert()`).

---

## Testing

- Test files: `*.spec.ts` next to the file under test (Jest with `ts-jest`).
- Use `@nestjs/testing` `Test.createTestingModule()` for unit tests.
- Mock repositories with `{ provide: getRepositoryToken(Entity), useValue: mockRepo }`.
- No real DB connections in unit tests — mock all TypeORM repositories.
- Integration/e2e tests go in `apps/api/test/` (not yet scaffolded).
- Aim for 80%+ branch coverage on services; controllers are low priority.

---

## Git / branching

- Branch format: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`.
- Never commit `.env` files (they are in `.gitignore`).
- Run `npm run lint` and `npm run type-check` in the affected workspace before
  committing; fix all errors (warnings are acceptable).
