# Engineering Learnings

This document records learnings and best practices discovered during the development process.

## Frontend Refactoring: Module Migration

**Date**: 2026-02-25

### 1. The Challenge: Restructuring `pages` to `features`

During a major refactoring to align with new architectural guidelines, we migrated components from a page-based structure (`/src/pages/{module}`) to a feature-based structure (`/src/features/{module}/components`).

### 2. Key Learning: The Criticality of Import Path Updates

Moving files is simple, but the most critical and error-prone part of the process is updating all import paths that reference the moved files.

**Observation**:

-   After moving the `bid` module components, running `npx tsc --noEmit` immediately revealed numerous `TS2307: Cannot find module` errors.
-   These errors were not just in the files that directly imported the moved components, but also in other files that had relative dependencies on them.

**Mistake to Avoid**:

-   **Do not move files without immediately updating their references.** A broken import path will crash the application during development and fail the build process.

### 3. Recommended Workflow for Refactoring File Locations

To avoid this issue and ensure a smooth refactoring process, the following workflow is recommended:

1.  **Identify & Plan**: Clearly identify the files to be moved and their new destination.
2.  **Move Atomically**: Move the files for a single feature/module in one go.
3.  **Find All References**: Immediately use a global search tool (like `Grep` or IDE search) to find all files that import from the old path.
    -   *Example Search Pattern*: `from '../pages/bid`
4.  **Update All References**: Systematically update all found import statements to the new path.
    -   Pay close attention to relative path depths (`../` vs `../../`).
5.  **Verify Immediately**: Run static analysis and build checks *immediately* after updating paths.
    -   `npx tsc --noEmit` (or `npm run typecheck`) is the fastest way to catch import errors.
    -   Follow up with `npm run build` to ensure the entire application can still be compiled.
6.  **Test**: Manually test the affected part of the application to confirm runtime behavior.
7.  **Repeat**: Only after one module is successfully migrated and verified, move to the next.

### 4. Learning from Automated Tooling (AI Agent)

**Date**: 2026-02-25

**Observation**:

- When migrating the `meeting` module, we used an AI-powered `search` agent to automate the path updates. While it successfully handled many cases, it missed several, particularly: 
    - Top-level references in `App.tsx`.
    - Inter-dependencies between different `features` modules (e.g., `features/bid` importing from `features/meeting`).
    - Deeply nested component paths (`.../components/components/LogSection.tsx`).

**Conclusion**:

- Automated refactoring tools are powerful accelerators but are not infallible. They should be treated as a **first pass**, not a final solution.
- The human developer's oversight is crucial to verify the completeness of the automated changes.

**Revised Best Practice**:

1.  **Automate First**: Use tools like AI agents (`search`) to perform the bulk of the repetitive path updates.
2.  **Verify with `tsc`**: Immediately run `npx tsc --noEmit`. This is the quickest way to find any paths the automation missed.
3.  **Manually Correct**: Systematically fix the remaining errors reported by the TypeScript compiler.
4.  **Full Validation**: Proceed with `npm run build` and `npm run lint` only after the type check is clean.

### 5. Future Prompt for AI Assistant

To prevent this issue in the future, a more effective prompt would be:

> "When refactoring by moving files, you **must** immediately follow up by searching the entire codebase for all references to the old file paths and update them. After updating the paths, you must run `npx tsc --noEmit` and `npm run build` to verify that the refactoring was successful and did not introduce any compilation errors. If `tsc` reports errors, you must manually fix them before proceeding. Only then should you proceed to the next task."
