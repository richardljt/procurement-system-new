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

### 1. 后端开发规范
- API兼容性检查 : 在使用任何 Java API（特别是集合、IO、并发相关的类）之前，必须首先确认其与项目配置的 JDK 8 版本兼容。优先使用项目中已有的、经过验证的工具类和库（如 Arrays.asList , Collections.singletonList 等），而不是引入更高版本JDK的API。
### 2. 前端开发规范 (React + Ant Design)
- 统一表单状态管理 : 当使用 Ant Design 的 <Form> 组件时，必须将表单内所有控件的状态管理完全交由 <Form> 统一处理。
- 严禁混合状态管理 : 严禁对同一个表单数据同时使用 Ant Design 的 <Form.Item> 和独立的 React useState 进行双重状态管理。
- UI动态响应实现方式 : 对于需要根据一个表单项的值来动态显示/隐藏另一部分UI的场景，必须遵循以下标准实践：
  1. 所有相关的表单输入控件都必须用 <Form.Item> 包裹，并通过 name 属性与 Form 状态关联。
  2. 使用 <Form> 的 onValuesChange 属性来监听整个表单值的变化。
  3. 在 onValuesChange 的回调函数中，检查特定字段（如 supplierType ）是否发生变化。如果变化，则调用 setSupplierType 方法更新一个专门用于 条件渲染 的 useState 变量。
  4. 必须移除子组件上手动绑定的 value 和 onChange 属性，让 <Form.Item> 自动完成状态注入和事件处理。
### 3. 自动化工具使用规范
- 精确化、原子化修改 : 在使用 SearchReplace 或 Write 等文件修改工具时，必须遵循最小化和精确化原则。
  - SearchReplace : old_str 参数必须包含足够的上下文（如多行代码）以确保在文件中的唯一性，避免模糊匹配。 new_str 必须是完整的、语法正确的代码块。
  - Write : 除非是创建新文件，否则严禁直接使用 Write 覆盖整个文件。必须优先使用 SearchReplace 进行精确修改。
- 强制验证 : 每次执行完代码修改操作后（无论手动还是工具），都必须 立即 执行相关的验证流程（后端 ./mvnw clean compile -q ，前端 npm run lint ），确认修改没有引入任何新的编译错误或 lint 错误后，才能继续下一步。