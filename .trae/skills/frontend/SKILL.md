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
├── api/                  # API 请求层 (axios 实例、endpoints)
├── assets/               # 静态资源 (图片、图标等)
├── components/           # UI 组件
│   ├── ui/               # 原子/基础组件
│   └── layout/           # 布局组件
├── features/             # 业务/功能模块
├── hooks/                # 自定义 hooks
├── lib/ 或 utils/        # 工具函数
├── router/               # 路由配置
├── stores/               # Zustand 状态管理
├── types/                # 全局 TypeScript 类型
├── App.tsx
├── main.tsx
└── ...
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

- 在 `header` 中添加 `Authorization` 字段 (`Bearer` + `token`)。
- 对 `axios` 进行封装，统一处理请求和响应。

### 6. 文件修改

- **精确修改**: 优先使用 `SearchReplace` 工具进行原子化修改。`old_str` 必须包含足够上下文以确保唯一性。
- **避免覆盖**: **严禁**直接使用 `Write` 工具覆盖整个现有文件，除非是创建新文件。
