# Code Style

## Languages and conventions
- Language/version: JavaScript (ES modules) using the versions installed by the repository's package manager. Use React JSX for UI components.
- Naming:
  - React components and component files: PascalCase (for example, `ProductCard.jsx`).
  - Hooks: camelCase with the `use` prefix (for example, `useProducts.js`).
  - Functions and variables: camelCase.
  - Constants: UPPER_SNAKE_CASE only for true module-level constants; otherwise use camelCase.
  - CSS/Tailwind utility classes: follow the existing component conventions; avoid adding custom CSS when Tailwind utilities or an existing component are sufficient.
  - Database tables and columns: use consistent snake_case names.
  - Supabase client module: `src/lib/supabaseClient.js`.
- Formatting/linting: follow the configuration already present in the repository. If no formatter or linter is configured, keep formatting consistent and do not claim automated checks ran. Ask before adding Prettier, ESLint, or other tooling if doing so materially changes the setup.
- Type safety: this project uses JavaScript, not TypeScript. Use clear function names, sensible object shapes, defaults where appropriate, and runtime validation at trust boundaries. Do not introduce TypeScript files unless explicitly approved.

## Organization
- Directory responsibilities must match `ARCHITECTURE.md`:
  - `src/components/ui/`: reusable low-level UI elements.
  - `src/components/layout/`: shared page shells, navigation, and layout elements.
  - `src/features/auth/`: authentication UI and related feature logic.
  - `src/features/products/`: product/menu management.
  - `src/features/pos/`: cart and point-of-sale workflow.
  - `src/features/transactions/`: transaction history and details.
  - `src/features/analytics/`: sales summaries and charts.
  - `src/hooks/`: shared React hooks.
  - `src/lib/`: initialized clients and library setup.
  - `src/pages/`: route-level page composition.
  - `src/utils/`: small pure helpers shared across features.
- Shared components/utilities: reuse existing components first. Add a shared component only when it has a clear purpose or is used in multiple places.
- Business logic placement: keep presentation in components and move reusable calculations/formatting into feature helpers or `src/utils/`. Keep authoritative pricing, permissions, and transaction integrity in database policies/constraints and trusted database operations, not only in the browser.
- Import/dependency boundaries: pages may compose feature components; features may use shared components, hooks, and libraries. Shared UI components must not depend on specific pages. Avoid circular imports and do not create unnecessary abstraction layers.

## Coding rules
- Keep functions and components focused; follow established repository patterns.
- Prefer functional React components and hooks.
- Use semantic HTML and accessible labels, keyboard interactions, visible focus states, and sufficient contrast.
- Use Tailwind CSS for styling and responsive behavior. Avoid inline styles unless values are genuinely dynamic or Tailwind is unsuitable.
- Keep UI responsive for desktop/laptop and tablet cashier use; ensure key cashier actions remain clear and easy to reach.
- Handle loading, empty, error, and success states explicitly.
- Validate user input in the UI for usability, but always enforce security and data integrity at the database/trusted-operation boundary.
- Do not trust prices, totals, business IDs, roles, or payment status supplied by the browser without server/database-side authorization and validation.
- For completed sales, preserve product name and unit-price snapshots on transaction items so later menu edits do not change historical records.
- Avoid silent failures, unexplained magic values, duplicated logic, and premature abstractions.
- Reuse existing components before introducing new dependencies or design systems.
- Do not implement features outside the approved MVP or change the approved stack without asking.

## Errors and logging
- Error handling: show a concise, user-friendly message in the UI; preserve useful form/cart state where practical. Handle Supabase errors explicitly and do not report success if the database operation failed.
- Logging: use console logging only when it helps local development or diagnosing an error. Do not log passwords, access tokens, service-role keys, payment secrets, or unnecessary personal data. Remove temporary debug logs before completing a task.
- Security details should remain consistent with `SECURITY.md` when that file is added. Until then, follow the security constraints in `ARCHITECTURE.md` and never expose privileged credentials in client code.

## Dependencies
- New packages: prefer existing dependencies and browser/platform APIs. Add a package only when it provides clear value for an approved requirement. Explain the reason and ask for approval before adding substantial dependencies or changing the stack.
- Versioning/lockfile practice: use the repository's existing package manager and commit its lockfile. Do not switch package managers or delete/regenerate the lockfile without a clear reason and approval.
- Do not invent package scripts or commands. Inspect `package.json` before running formatting, linting, building, or tests.

## Review checklist
- Implementation matches the approved feature acceptance criteria and stays within the MVP scope.
- Naming, component structure, responsive behavior, and accessibility follow this document.
- Loading, empty, success, and error states are handled.
- Database access and RLS assumptions are checked; no authorization is enforced only in the frontend.
- No credentials, generated build output, unrelated files, or accidental data changes appear in the diff.
- Tests cover meaningful changed behavior where a test setup exists.
- Verify the available scripts in `package.json`; report accurately which checks were run and their results.

## Verified commands
- Format: Not configured yet; inspect repository configuration before suggesting a command.
- Lint: Not configured yet; inspect `package.json` and repository files before suggesting a command.
- Type check: Not applicable by default because the project uses JavaScript. Do not add TypeScript solely to provide type checking.
- Build/test commands: inspect `package.json` and use only scripts that actually exist.
- Never invent commands or claim checks passed without running them.
