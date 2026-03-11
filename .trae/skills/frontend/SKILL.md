---
name: "frontend"
description: "提供前端开发规范和指南。在进行任何前端开发、代码审查或重构时，必须调用此技能以确保符合项目标准。"
---

# 前端开发技能 (Frontend Development Skill)

本技能旨在统一前端开发流程、技术选型和代码风格，确保项目的高质量和可维护性。**在开始任何前端任务之前，请务必遵循以下规范。**

## 核心技术栈

- **构建工具**: Vite
- **框架**: React.js v18.2.0
- **语言**: TypeScript
- **CSS**: Tailwind CSS
- **UI 组件库**: Ant Design (antd) v5.x (确保与 Node.js v20.3.1 兼容)
- **状态管理**: Zustand
- **路由**: React Router v6
- **HTTP 通信**: Axios

## 强制验证流程

每次修改任何前端代码后，**必须** 依次执行以下命令，并确保全部通过：

1.  **类型检查**: `npm run typecheck` (或 `tsc --noEmit`)
2.  **构建项目**: `npm run build`
3.  **代码风格检查与修复**: `npm run lint -- --fix`

**严禁**使用 `@ts-ignore` 来规避类型错误。必须从根源上解决问题。

## 代码规范与最佳实践

### 1. 项目结构

严格遵循以下目录结构：

```
src/
├── assets/               # 静态资源（图片、图标、fonts 等） → 保留，很好
│   ├── images/
│   └── icons/
├── components/           # 所有 UI 组件（可进一步细分）
│   ├── ui/               # ← 原子/基础组件（shadcn/ui 风格，必推）
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/           # ← 可选，如果 Layout 组件多，独立出来
│   │   ├── RootLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── AppHeader.tsx
│   └── ...               # 其他业务组件（可选放这里或移到 features/）
├── features/             # ← 推荐：按业务/页面/功能模块组织（中大型项目首选）
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   └── dashboard/
│       ├── components/
│       └── ...
├── hooks/                # 自定义 hooks → 保留，非常好
├── lib/ 或 utils/        # 工具函数（cn.ts、formatDate.ts 等） → 两者都常见，选一个即可（shadcn/ui 常用 lib/ 放 cn）
├── api/                  # API 请求层（axios实例、endpoints） → 很好
├── types/                # 全局/共享 TypeScript 类型 → 保留
├── mocks/                # 测试 mock 数据 → 开发/测试时有用，保留
├── pages/                # 页面级组件（Home.tsx、About.tsx 等） → 如果用 react-router，保留
│   └── Home.tsx
├── router/               # 统一管理路由配置
├── stores/               # zustand 状态管理（全局、模块）
├── App.tsx
├── main.tsx
├── globals.css           # ← Tailwind 入口文件（原来 index.css 改名）
├── vite-env.d.ts
└── tailwind.config.ts        ← 主题扩展、插件、自定义颜色等
```

### 2. 路由 (Routing)

- **配置方式**: 在 `/router/routes.tsx` 中使用 **JSON 数组** 格式集中配置。
- **懒加载**: 必须使用 `lazy()` + `Suspense` 实现组件的懒加载。
- **渲染**: 通过递归函数 `renderRoutes()` 渲染路由，**避免**使用 `<Route>` 标签嵌套。
- **路径命名**: 路由路径 (path) **必须** 使用 **kebab-case** (例如: `/procurement-apply`)。

### 3. 表单 (Forms)

- **状态管理**: 必须将表单状态完全交由 Ant Design 的 `<Form>` 组件统一管理。
- **禁止混合状态**: **严禁**对同一个表单数据同时使用 `<Form.Item>` 和独立的 `useState`。
- **动态 UI**:
    1.  所有相关控件必须用 `<Form.Item>` 包裹。
    2.  使用 `<Form onValuesChange>` 监听表单值变化。
    3.  在回调中更新一个独立的 `useState` 变量来控制 UI 的条件渲染。
    4.  **移除**子组件上手动绑定的 `value` 和 `onChange` 属性。

### 4. 数据类型

- **货币/数量/费率**: **必须** 使用 `string` 类型处理，可配合 `decimal.js` 或 `bigint` 进行精确计算，**严禁**使用 `number` / `float`。
- **日期/时间戳**: **必须** 使用 `date-fns` 库进行解析和格式化。
- **枚举 (Enums)**: **必须** 使用**字符串字面量联合类型** (e.g., `'PENDING' | 'APPROVED'`)。

### 5. API 通信
- 认证方式严格遵循 OAuth 2.0 规范（RFC 6749 + RFC 6750），请求头必须是：Authorization: Bearer <token>，其中<token>使用JWT生成，是从特定接口获取的。
- 对 `axios` 进行封装，统一处理请求和响应。

### 6. 文件修改

- **精确修改**: 优先使用 `SearchReplace` 工具进行原子化修改。`old_str` 必须包含足够上下文以确保唯一性。
- **避免覆盖**: **严禁**直接使用 `Write` 工具覆盖整个现有文件，除非是创建新文件。

### 7. Development learning from task
When refactoring by moving files, you follow these steps:
1.  **Automate First**: Use tools like AI agents (`search`) to perform the bulk of the repetitive path updates.
2.  **Verify with `tsc`**: Immediately run `npx tsc --noEmit`. This is the quickest way to find any paths the automation missed.
3.  **Manually Correct**: Systematically fix the remaining errors reported by the TypeScript compiler.
4.  **Full Validation**: Proceed with `npm run build` and `npm run lint` only after the type check is clean.
