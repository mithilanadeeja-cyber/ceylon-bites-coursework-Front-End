# Verification record

Date: 15 November 2026. This records executed checks, not a predicted grade.

| Check | Result |
|---|---|
| React TypeScript compilation and Vite production build | Passed |
| Frontend automated tests | 8 passed, 0 failed |
| Spring Boot Maven verify | Passed; executable JAR generated |
| Spring Boot integration suite (H2 MySQL mode, Flyway, MVC, actual JWTs/JPA) | 9 passed, 0 failures/errors/skips |
| MySQL 8.4.7 fresh schema migration and Hibernate validation | Passed |
| Live HTTP registration/login and administrator/customer authorization | Passed |
| Live HTTP food/category operations and cart quantity validation | Passed |
| MySQL cart persistence across fresh login | Passed |
| Live HTTP transactional checkout and idempotent retry | Passed |
| Order state transitions and administrator cash-payment completion | Passed |
| Historical order prices after catalog price update | Passed |
| Soft-deleted food hidden from catalog | Passed |
| Profile update | Passed |
| Persistence across MySQL and Spring Boot restarts | Passed: stored order, historical price and completed payment retained |

Backend test scenarios: JWT signature acceptance and invalid-token rejection; customer/admin permissions; registration role injection/duplicate rejection; cart CRUD and isolation; checkout totals/idempotency; order/payment ownership; unavailable food rollback; order and cash payment transitions; cancellation/historical price snapshots; rejection of client-injected checkout totals.

## Boundaries

The Docker Compose stack and Windows setup scripts were prepared and reviewed, but Docker Desktop/Windows were not available in this execution environment. Their runtime behavior was not directly tested here. A local MySQL 8.4.7 server and the built Java JAR were run directly for database/API verification.

The previous frontend demo flow was browser-tested. This delivery's real-backend integration was checked through TypeScript mapping tests and real HTTP requests; a complete real-mode browser/mobile end-to-end run was not repeated. The manual checklist remains available in TEST_CHECKLIST.md for the student's computer.

No live card transaction, public Java hosting or GitHub account publication was performed. The source ZIP excludes passwords, JWTs, database files, node_modules and compiled artifacts. The hosted site remains an optional visual demo; run the included Spring Boot/MySQL stack for assessment.

## Separate submission packaging
The frontend and backend sources are unchanged. Each archive has a standalone project root and rewritten setup paths. Docker Compose has been split into a backend/MySQL stack; run the frontend with npm separately. The split Docker/Windows setup has not been executed in this environment.
