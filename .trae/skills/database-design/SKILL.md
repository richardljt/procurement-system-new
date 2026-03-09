---
name: "database-design"
description: "提供数据库设计和更新策略的规范。在进行任何数据库表结构设计或修改时调用。"
---

# 数据库设计与更新策略

本规范旨在为数据库的设计与变更提供一套统一的标准，确保数据的一致性、可维护性和扩展性。

## 数据库技术栈

- **数据库**: MySQL 8.x
- **ORM**: MyBatis
- **JDBC 连接参数**: 必须包含 `useSSL=false` 和 `allowPublicKeyRetrieval=true`

## 数据库设计规范

### 1. 命名规范

- **表名**:
    - 遵循**英文单词**和**下划线**的组合命名方式。
    - 表名最长不得超过 **30 个字符**。
    - 示例: `procurement_request`, `meeting_vote`

- **主键 (Primary Key)**:
    - 每张表都**必须**有一个主键。
    - 主键命名采用 `表名_id` 的形式。
    - 示例: `procurement_request` 表的主键为 `procurement_request_id`。

- **外键 (Foreign Key)**:
    - 引用其他表主键的字段，其名称应与被引用的主键**完全一致**。
    - 示例: `meeting_vote` 表中引用 `procurement_request` 表的字段，应命名为 `procurement_request_id`。

- **字段命名**:
    - 具有相同业务含义的字段，在所有表中必须使用**统一的名称**。
    - 示例: 产品 ID 在所有表中都应命名为 `product_id`。

### 2. 标准审计字段

- 对于需要记录创建和更新信息的“定义表”（例如主数据、配置表等）或关系表，排除日志表，必须包含以下 6 个字段：
    - `create_time`: 记录创建时间 (DATETIME)
    - `create_user_id`: 创建者用户 ID (VARCHAR(20))
    - `create_user_name`: 创建者用户姓名 (VARCHAR(50))
    - `update_time`: 记录最后更新时间 (DATETIME)
    - `update_user_id`: 最后更新者用户 ID (VARCHAR(20))
    - `update_user_name`: 最后更新者用户姓名 (VARCHAR(50))
- create开头三个字段是记录创建时赋值，update开头三个字段是每次更新表内任一字段即更新

## 3. 数据库变更管理

- **变更脚本**:
    - 所有的数据库变更（包括表结构和数据）都必须通过 SQL 脚本来完成。
    - 脚本文件应存放于 `/backend/db/` 目录下。

- **脚本命名**:
    - 为了清晰地记录变更历史并确保执行顺序，SQL 脚本的文件名必须以**时间戳**作为前缀。
    - 示例: `20260309_add_new_field_to_user.sql`

## 何时调用此技能

- 在进行任何新的**数据库表设计**时。
- 在需要**修改现有表结构**（例如增删改字段）时。
- 在编写任何**数据库迁移或更新脚本**时。
