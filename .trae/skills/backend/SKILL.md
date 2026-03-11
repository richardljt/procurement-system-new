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

## Code style and best practices

### 1. Code layering
Strictly follow the layered architecture of `controller` -> `service` -> `Infrastructure`.

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

### Data transmission (DTO)

- **Forced use of DTO**: The controller layer must encapsulate more than four parameters using a DTO (Data Transfer Object). All data transfers between layers **must** use a DTO.
- **Use of Map is strictly prohibited:** It is absolutely forbidden to use `Map`, `HashMap`, or any dictionary structure to transfer data.


### Data and Operating Procedures

- **API path**: The path in `@RequestMapping` must use **kebab-case** (e.g., `/api/v1/budget-applications`)
- **Currency/Quantity/Fee Rate**: **Must** use `java.math.BigDecimal`.
- **Date/Timestamp**: **Must** use `LocalDate` or `LocalDateTime`.
- **Enums**: **Must** use Java's `enum` class.
- **Update/Delete Operations**: **Must** use a **unique identifier** for the record (e.g., primary key `id`). **Using non-unique fields such as `name` as conditions is strictly prohibited.

### Interface Specifications

- The interface specifications adopt a RESTful style.

- All interfaces use only POST and GET methods. POST request parameters must be in JSON format, and GET request parameters must be Query parameters.

- All interfaces must return JSON formatted parameters, with the format {"returnCode": "SUC0000", "errorMsg": "", "body": "json"}. Here, returnCode is the status code, errorMsg is the error message, and body is the JSON data. For a success status code SUC0000, errorMsg is an empty string; for a failure status code, you can define your own, and errorMsg is the error message, which should be displayed as a pop-up notification for user to understand.

### 认证处理
- 认证方式严格遵循 OAuth 2.0 规范（RFC 6749 + RFC 6750），请求头必须是：Authorization: Bearer <token>，其中<token>使用JWT生成，是从特定接口获取的。
- token生成使用JWT算法，密钥使用环境变量配置，过期时间为1小时。Payload包含用户ID、角色、过期时间等信息，可以通过解析payload获得登录用户信息
- 使用Interceptor拦截所有请求，检查请求头是否包含有效的Bearer token，有效的话解析出用户信息放在ThreadLocal中供后续使用。
- 针对登录接口，不检查token，直接返回token。
- 认证失败时，返回401 Unauthorized状态码，包含错误信息。

### 外部系统对接

- **用户管理**: 对接第三方用户系统，系统内使用内部 `userId`，同时关联外部 `YST_ID`。
- **通知管理**: 先设计提供 `notifyService`，针对不同的通知渠道有不同的函数实现，后续可以根据需要实现该接口。
- **任务管理**：先设计提供 `taskCenterService`，后续可以根据需要实现该接口，用来对接企业内部任务中心

### Mapper层

- 使用xml文件来定义sql，禁止使用select * 语句，必须指定读取字段

## Verification process after backend code modification (mandatory)

每次对后端代码进行任何修改（新增、修改、删除文件）后，必须立即执行以下步骤：
1. 在终端运行构建命令：`./mvn clean package`
2. 如果构建失败，完整读取终端错误日志（包括行号、类名、依赖问题）
3. 分析错误原因（常见：import 缺失、类型不匹配、注解错误、Lombok 未处理等）
4. 自动修复所有编译错误，直到 `./mvn clean package` 完全通过（无任何 ERROR/WARNING）
5. 只有构建 100% 通过后，才认为任务完成，并向我展示最终的构建输出摘要
6. 永远不要遗留未解决的编译问题