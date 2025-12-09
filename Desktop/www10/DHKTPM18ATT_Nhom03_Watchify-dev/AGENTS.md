# Repository Guidelines

## Project Structure & Module Organization
The monorepo separates concerns cleanly: `frontend/` hosts the Vite + React 19 client (assets in `public/`, views and hooks in `src/`), `backend/` contains the Spring Boot 3 service (`src/main/java/fit/iuh/backend` split into modular domains such as `modules/catalog`, `modules/order`, etc.), and `docs/` captures the full architectural report referenced from the root `README.md`. Database migrations, app config, and the shared kernel sit under `backend/src/main/resources`, while automated tests live in `backend/src/test/java`.

## Build, Test, and Development Commands
- Backend: `./gradlew bootRun` starts the API with local profiles, `./gradlew build` produces the fat jar, and `./gradlew test` runs the JUnit suite against the in-memory H2 test database.
- Frontend: `npm install` (once) followed by `npm run dev` serves the UI with Vite HMR, `npm run build` emits production assets into `frontend/dist`, `npm run preview` verifies the bundle, and `npm run lint` enforces ESLint rules.
- Full stack: `docker-compose up --build` brings up MariaDB plus both services using the provided Dockerfiles; keep `.env` variables in sync before composing.

## Coding Style & Naming Conventions
Java code sticks to 4-space indentation, package names under `fit.iuh.backend.*`, and Lombok annotations for boilerplate. Expose REST controllers under `api` packages, keep DTOs immutable, and favor `record` where practical. React components live in PascalCase files, hooks/utilities use camelCase, and Tailwind utility classes stay in JSX (global styles in `src/assets`). ESLint config (`frontend/eslint.config.js`) extends the recommended React and hooks presets with a hard `no-unused-vars` rule—run `npm run lint` pre-commit.

## Testing Guidelines
Backend tests rely on Spring Boot Test + JUnit Platform (`@SpringBootTest`, `@DataJpaTest`) and should cover both the domain service and controller layers; mock MoMo payment interactions via ports instead of live calls. Keep fixtures next to the module under test and mirror production packages. Prioritize catalog, order, and identity coverage before merging. Frontend testing is not preconfigured, so run `npm run lint` and include manual browser or Postman smoke results in the PR.

## Commit & Pull Request Guidelines
Follow the existing conventional style (`docs: add main README...`, `feat: implement promo module`). Keep subject lines under 72 characters and reference the domain or module in the scope when helpful (`feat(catalog): add brand filter`). Pull requests must include a concise summary, linked issue, backend/frontend command outputs (`./gradlew test`, `npm run lint`), and UI screenshots or recordings when modifying React views. Surface configuration changes (ports, env vars, SQL migrations) so reviewers can reproduce quickly.
