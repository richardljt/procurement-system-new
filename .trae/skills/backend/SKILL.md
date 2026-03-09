---
name: backend
description: Provide backend development standards and guidelines. This skill must be invoked when conducting any backend development, code review, or database design to ensure compliance with project standards.
---

# Backend Development Skill

This skill aims to standardize backend development processes, technology choices, and coding style to ensure system robustness and consistency. **Before starting any backend task, please be sure to follow these guidelines.**

## Core technology stack

- **Language**: Java 8 (non-upgradeable)
- **Framework**: Spring Boot (2.7.x recommended)
- **ORM**: MyBatis (JPA/Hibernate prohibited)
- **Database**: MySQL 8.x
- **Scheduled Tasks**: Quartz
- **JSON Processing**: Gson
- **Logs**: SLF4J

## 代码规范与最佳实践

### 1. 代码分层
严格遵循 `controller` -> `service` -> `Infrastructure` 的分层架构。

```
src/main/java
└── com.wlb.[product name]
    ├── controller        # 对外暴露层
    │   ├── [moduleA]                # 按业务模块分包（强烈推荐）
    │   │   ├── controller           # 该模块的 REST 接口
    │   │   │   ├── OrderController.java
    │   │   │   └── RefundController.java
    │   │   ├── job                  # 该模块的定时任务
    │   │   │   └── OrderTimeoutJob.java
    │   │   └── vo                   # 该模块专属视图对象（可选，按需）
    │   │       ├── OrderDetailVO.java
    │   │       └── OrderPageVO.java
    │   └── [moduleB] ...
    │
    ├── service                # 业务逻辑层
    │   ├── [moduleA]          # 按业务模块分包（强烈推荐）
    │   │   ├── service        # 接口 + impl（或只写接口 + 默认impl）
    │   │   ├── assembler      # PO ↔ DTO 转换器
    │   │   └── dto            # 入参/出参/内部传输对象
    │   │       ├── req        # *Request（入参）
    │   │       └── resp       # *Response（出参）
    │   └── [moduleB] ...
    │
    ├── Infrastructure         # ← 基础设施层（数据、外部调用等）
    │   ├── persistence   # 持久化相关
    │   │   ├── [moduleA]
    │   │   │   ├── mapper     # MyBatis Mapper 接口
    │   │   │   └── po         # Persistent Object（数据库表映射）
    │   │   └── [moduleB]...
    │   └── client             # 外部调用（RPC、HTTP、MQ、FTP等）
    │       ├── dto            # MyBatis Mapper 接口
    │       │   └── xxxDTO     # Persistent Object（数据库表映射）
    │       └── xxxClient.java
    │
    └── common            # 全局通用
        ├── config        # 配置类、Bean 定义
        ├── constant      # 常量
        ├── enum          # 枚举
        ├── exception     # 业务异常
        ├── util          # 工具类
        ├── annotation    # 自定义注解
        ├── interceptor   # 拦截器
        └── advice        # 全局异常处理、响应包装等
```

### 2. 数据传输 (DTO)

- **强制使用 DTO**: controller层接受参数超过4个必须使用DTO封装，所有层之间的数据传输**必须**使用 DTO (Data Transfer Object)
- **严禁使用 Map**: **绝对禁止**使用 `Map`, `HashMap` 或任何字典结构来传输数据。


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

## 强制验证流程

每次修改任何后端代码后，**必须** 立即执行以下命令，并确保完全通过（无任何 ERROR 或 WARNING）：

- **构建与编译**: `./mvn clean package`

只有构建 100% 通过后，才认为任务完成。