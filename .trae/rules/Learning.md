When refactoring by moving files, you follow these steps:
1.  **Automate First**: Use tools like AI agents (`search`) to perform the bulk of the repetitive path updates.
2.  **Verify with `tsc`**: Immediately run `npx tsc --noEmit`. This is the quickest way to find any paths the automation missed.
3.  **Manually Correct**: Systematically fix the remaining errors reported by the TypeScript compiler.
4.  **Full Validation**: Proceed with `npm run build` and `npm run lint` only after the type check is clean.