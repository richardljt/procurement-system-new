---
name: "backend"
description: "提供后端开发规范和指南。在进行任何后端开发、代码审查或数据库设计时，必须调用此技能以确保符合项目标准。"
---

# 后端开发技能 (Backend Development Skill)

本技能旨在统一后端开发流程、技术选型和代码风格，确保系统的健壮性和一致性。**在开始任何后端任务之前，请务必遵循以下规范。**

## 核心技术栈

- **语言**: Java 8 (不可升级)
- **框架**: Spring Boot (推荐 2.7.x)
- **ORM**: MyBatis (禁止使用 JPA/Hibernate)
- **数据库**: MySQL 8.x
- **定时任务**: Quartz
- **日志**: SLF4J + Logback

## 强制验证流程

每次修改任何后端代码后，**必须** 立即执行以下命令，并确保完全通过（无任何 ERROR 或 WARNING）：

- **构建与编译**: `./mvnw clean compile -q`

只有构建 100% 通过后，才认为任务完成。

## 代码规范与最佳实践

### 1. 代码分层

严格遵循 `controller` -> `service` -> `dao` 的分层架构。

```
src/
├── controller/   # 控制层：仅做参数校验，调用服务层
├── service/      # 服务层：处理核心业务逻辑
├── dao/          # 数据访问层：与数据库交互
├── utils/        # 全局工具、配置、常量、拦截器等
└── ...
```

### 2. 数据传输 (DTO)

- **强制使用 DTO**: 所有层之间的数据传输**必须**使用 DTO (Data Transfer Object)。
- **严禁使用 Map**: **绝对禁止**使用 `Map`, `HashMap` 或任何字典结构来传输数据。

### 3. 数据库 (Database)

- **连接参数**: JDBC 连接字符串**必须**包含 `useSSL=false&allowPublicKeyRetrieval=true`。
- **命名规范**:
    - 表名: `english_words_with_underscore`。
    - 主键: `table_name_id`。外键字段名应与引用的主键名保持一致。
- **审计字段**: 定义表时，必须包含 `create_time`, `create_user_id`, `create_user_name`, `update_time`, `update_user_id`, `update_user_name`。
- **脚本管理**: 数据库变更脚本（DDL, DML）必须放在 `/backend/db/` 目录下，并以时间戳作为文件名前缀。

### 4. 数据与操作规范

- **API 路径**: `@RequestMapping` 中的路径**必须**使用 **kebab-case** (例如: `/api/v1/budget-applications`)。
- **货币/数量/费率**: **必须** 使用 `java.math.BigDecimal`。
- **日期/时间戳**: **必须** 使用 `LocalDate` 或 `LocalDateTime`。
- **枚举 (Enums)**: **必须** 使用 Java 的 `enum` 类。
- **更新/删除操作**: **必须** 使用记录的**唯一标识符**（如主键 `id`）进行操作。**严禁**使用 `name` 等非唯一字段作为条件。

### 5. 对象存储 (File Storage)

- **统一接口**: 封装 `FileStorageService` 接口来处理所有文件操作。
- **Key 格式**: `/{module}/{snowflake_id}.{ext}` (e.g., `/presale/12345678.pdf`)。
- **上传流程**: 先保存到本地缓存 (`/opt/deployments/`)，然后异步上传到 S3 (失败重试3次)。
- **下载流程**: 优先从本地缓存读取，失败则从 S3 下载并写入缓存。

### 6. 外部系统对接

- **用户管理**: 对接第三方用户系统，系统内使用内部 `userId`，同时关联外部 `YST_ID`。
- **通知管理**: 先提供 `interface`，由其他开发人员实现。Mock 一个可用的实现供开发时使用。

### 7. Mapper层
- 使用xml文件来定义sql，禁止使用select * 语句，需要指定所有字段