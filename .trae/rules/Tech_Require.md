## 前端原型样式约束
主要色调，参考已有样式，确保风格统一

## 前端技术约束
- 部署在nginx上运行
- 识别代码中的外部域名的图片/css/js文件引入，如果有的话要引入到工程内，我需要在内网部署，不能访问到外网的样式文件。
- nodejs：v20.3.1
- 构建：vite+reactjs+typescripts+tailwindcss+vite+react-router v6
- reactjs使用18.2.0版本
- 状态管理：zustand
- 路由：用代码配置数组方式编写路由，动态加载子组件
- css：使用 tailwindcss 开发
- http通信组件：axios，header中需用到authorization，缓存token
- UI组件：antd 版本要与nodejs版本兼容，使用5.x
- 提取 props（data, onOk, loading 等）
- 表单用 Form + rules（支持中文校验提示）
- 支持权限控制（v-if 写法用 &&）
- 项目结构使用：
- 开发时新功能尽量封装为组件，对于新的需求尽量复用，常见包含：文件上传、列表、搜索框、确认框
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

- 对于菜单权限处理，首先在登陆的时候就从后端获取用户的菜单权限，并保存在本地，登出的时候删除，重新登陆刷新。每个菜单都要有唯一的资源ID，根据用户菜单权限做显示，没有权限的菜单不显示。

## 前端代码构建验证强制流程
每次修改任何前端代码后，必须：
1. 执行 `npm run typecheck` （或 `tsc --noEmit`）
2. 执行 `npm run build`
3. 执行 `npm run lint -- --fix`
如果失败：
- 读取完整错误输出
- 分析并修复（优先改类型定义、补充泛型、修正 hook deps、移除未用 import）
- 循环直到三个命令全部绿色
- 禁止用 @ts-ignore 绕过

## 后端技术约束
- 开发技术栈方面，使用springboot+mybatis+mysql，Java语言使用jdk8版本
- 数据库方面要求，使用mysql（我已经在本地部署了mysql，同时可以连接 jdbc:mysql://127.0.0.1:6446 执行脚本，用户名是fmrober，密码是Lhx123!@#）
- jdbc连接要增加 useSSL=false&allowPublicKeyRetrieval=true 这两个参数
- 数据库设计要求，
    - 每张表遵循英文单词和下划线组合命名方式，最长不得超过30个字符
    - 表主键要求：每张表都要有个主键，一般命名为：表名_ID 的形式，并且其他表引用到该表主键时，其他表的字段名称应一致，即使用`关联表名_ID`的形式
    - 如果是定义表，需要增加create_time create_user_id create_user_name update_time update_user_id update_user_name这6个字段
    - 每张表的字段相同意义需要统一，不要出现两张表不一致的情况，比如产品ID，一般命名为product_id，所有表要统一
- 对象存储使用要求，使用amazon+S3连接对象存储，统一封装interface用来处理对象存储实现，你可以先做一个实现类，我后续也可以增加实现类
    - 如果涉及文件上传，使用对象存储上传到服务器，并且使用本地文件系统做缓存。用户上传时优先保存到本地，然后异步上传至对象存储，用来改善用户体验，如果对象存储有错需要重试3次，再出错需要通知给管理员；如果读取对象，则优先在本地读取，如果读取不到则访问对象存储，并同时缓存一份到本地路径。本地应用可以有权修改的路径是/opt/deployments/，这个是云上docker的约束注意。对于用户上传的文件名要保留在对应实体的表内，同时保留对象存储的key值，key值要按不同模块设置不同子目录，同时使用雪花算法生成id，并保留文件扩展名。比如：用户在售前模块上传文件，文件名为“产品信息.pdf"，首先售前这个名字要有全局名称presale，然后保留在数据库里两个字段名称为 产品信息.pdf，雪花算法生成一个唯一ID为123456789012345678，则文件key则为“/presale/123456789012345678.pdf"，同时按这个key保留文件到对象存储。
- 定时任务要求，使用quartz
- 外部系统-用户管理模块对接要求：
    - 用户体系由第三方系统维护，我们通过查询接口可以查询到用户的对象，用户ID不超过20位，用户名称不超过50位，适用于系统所有表
- 外部系统-通知管理模块对接要求：
    - 你可以先提供interface接口，由我来基于公司内的api开发，你来mock一个能够使用的先运行
    - 提供邮件发送的接口，邮件发送内容需要使用模板
    - 提供IM发送的接口
    - 提供任务中心发送的接口
- 前后端交互要求
    - 前端通过http接口与后端交互，接口规范采用restful风格
    - 前端请求后端接口时，需要在header中添加Authorization字段，值为Bearer+空格+token，token由后端返回
    - 后端返回给前端的数据，需要符合json格式规范。格式为 {"returnCode": "SUC0000", "errorMsg": "", "body": "json"}，其中returnCode为状态码，errorMsg为错误信息，body为json格式的数据。如果是成功状态码SUC0000，errorMsg为空字符串；如果是失败状态码可以自行定义，errorMsg为错误提示，前端应该表现为屏幕右侧弹框提醒。
- Java: JDK 8（不可升级）
- 框架: Spring Boot（版本与 JDK8 兼容，推荐 2.7.x）
- ORM: MyBatis（禁止 JPA/Hibernate）
- 数据库: MySQL 8.x，连接串必须包含：useSSL=false&allowPublicKeyRetrieval=true
- 对象存储: Amazon S3 接口（统一封装 FileStorageService 接口）
  - 本地缓存路径：/opt/deployments/
  - key 格式：/{module}/{snowflake_id}.{ext}
  - 上传：先本地 → 异步 S3（重试 3 次）
  - 下载：先本地 → S3 并缓存
- 定时任务：Quartz
- 日志：SLF4J + Logback
- 代码分层要求：
    src/
    ├── controller/                  # 控制层，仅包含参数校验，不应该包含业务处理逻辑，应该调用服务层
    │   ├── [module1]         # 模块分包
    │   ├── [module2]
    │   └── [...]
    ├── service/              # 服务层
    │   ├── [module1]         # 模块分包
    │   ├── [module2]
    ├── dao/              # 数据操作层
    │   ├── [module1]         # 模块分包
    │   ├── [module2]
    ├── utils/                # 全局层
    │   ├── configuration/    # 配置类，注入类似缓存管理的bean、线程池管理bean
    │   ├── constant/         # 全局常量类
    │   ├── advice/           # advice定义，比如全局异常处理
    │   ├── annotation/       # annotation定义，比如controller的鉴权要求注解
    │   ├── interceptor/       # interceptor定义，比如系统鉴权处理
    │   ├── util/             # 工具类
    │   └── advice/           # advice定义，比如全局异常处理
- 代码分层数据传输都应该定义dto，不能使用map结构

## 后端代码修改后验证流程（强制）
每次对后端代码进行任何修改（新增、修改、删除文件）后，必须立即执行以下步骤：
1. 在终端运行构建命令：`./mvnw clean compile -q`（Maven 项目）或 `gradle build --quiet`（Gradle 项目）
2. 如果构建失败，完整读取终端错误日志（包括行号、类名、依赖问题）
3. 分析错误原因（常见：import 缺失、类型不匹配、注解错误、Lombok 未处理等）
4. 自动修复所有编译错误，直到 `./mvnw clean compile` 完全通过（无任何 ERROR/WARNING）
5. 只有构建 100% 通过后，才认为任务完成，并向我展示最终的构建输出摘要
6. 永远不要遗留未解决的编译问题

## 对于问题修复的记录
对于发现技术问题，每次对于问题的修复，必须记录问题的原因和规避方式到 /docs/learning_[事件编号].md文件中，并生成未来规避同类问题的prompt

## 对于权限的设计
使用

## 对于开发流程要求
1. 首先要按需求规划后端接口并定义好接口文档，实现后端功能，包含新增或修改属性的定义和实现，同时完成文件相关实现。
2. 测试后端接口，确保正常，保留必要测试用例。
3. 其次要完成前端页面的实现，包括页面布局、交互逻辑、数据展示等。前端修改遵循最小化修改的原则，不超过需求范围删除已有代码。
4. 然后要进行前后端联调测试，保证前后端功能正常交互，数据传输正确。
5. 然后启动前后端服务，前端在根目录下执行npm run dev命令，后端在/backend目录下执行编译重启命令，如遇到编译错误请解决
6. 最后提醒我验收
7. 另外对于大量删除代码或删除文件的操作，需要提醒我确认