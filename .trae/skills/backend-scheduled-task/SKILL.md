---
name: "backend-scheduled-task"
description: "提供后端定时任务（基于 Quartz）的开发规范。在创建或修改任何后端定时任务时，必须调用此技能以确保代码质量和一致性。"
---

# 后端定时任务开发规范

本文档旨在为基于 Spring Boot 和 Quartz 的后端定时任务提供一套标准的开发规范，确保所有定时任务的健壮性、可追溯性和可维护性。

## **何时使用**

- **强制调用**：在项目中需要**创建新的定时任务**或**修改现有定时任务**时，必须调用此 Skill。
- **目的**：统一技术选型、代码结构、异常处理和日志记录，降低维护成本。

## **核心技术栈**

- **调度框架**: **Quartz**。项目中已集成，禁止使用其他调度框架（如 Spring 自带的 `@Scheduled`），以保证统一的集群管理和动态控制能力。
- **执行环境**: **Spring Boot**。任务逻辑应作为 Spring Bean 来实现。

## **开发步骤与规范**

### **1. 定义任务 (Job)**

- **实现 `org.quartz.Job` 接口**：所有定时任务的执行逻辑必须放在实现了 `Job` 接口的类中。
- **`@Component` 注解**：将 Job 类声明为 Spring Bean，以便注入其他服务（Service）或数据访问对象（DAO）。
- **禁止有状态任务**：
    - 严禁使用 `@DisallowConcurrentExecution` 注解，除非有非常明确且经过评审的业务场景要求任务串行执行。并发执行是默认且推荐的方式。
    - 严禁在 Job 类中持有成员变量来保存任务状态。所有状态都应持久化到数据库。
- **完善逻辑**：如果涉及循环处理，注意每次循环内都要捕获Exception处理，避免因为一个任务失败而导致所有任务都失败。
- **异常处理**：出现异常必须捕获并调用通知service通知系统管理员，通知内容包括异常信息、任务参数、触发时间等。
- **调度策略**：在代码中通过注解编码 CRON 表达式、Job/Trigger 名称等配置

- **示例：**
```java
@Component
public class SampleTask implements Job {

    private static final Logger log = LoggerFactory.getLogger(SampleTask.class);

    @Autowired
    private YourService yourService;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("SampleTask 开始执行...");
        try {
            // 从 JobDataMap 获取参数
            JobDataMap dataMap = context.getJobDetail().getJobDataMap();
            String someParameter = dataMap.getString("someKey");

            // 1. 执行核心业务逻辑
            yourService.doSomething(someParameter);

            // 2. 更新执行结果或状态
            log.info("SampleTask 执行成功。");

        } catch (Exception e) {
            log.error("SampleTask 执行失败，将立即重试。", e);
            // 抛出 JobExecutionException 并设置 true 来触发重试
            JobExecutionException ex = new JobExecutionException(e);
            ex.setRefireImmediately(true);
            throw ex;
        }
    }
}
```

### **2. 配置任务 (JobDetail & Trigger)**

- **动态创建**: 定时任务的创建和调度应通过代码动态完成，通常在服务层（Service）中实现。这便于与业务配置页面集成。
- **`JobDetail` 配置**:
    - 使用 `JobBuilder.newJob(YourJobClass.class)` 创建。
    - **`withIdentity()`**: 必须为 Job 设置唯一的名称和分组 (`jobName`, `jobGroup`)，命名规则：`业务模块名:任务名`。
    - **`usingJobData()`**: 需要传递给任务的参数，应通过 `JobDataMap` 传递。
    - **`storeDurably()`**: 如果创建的 Job 没有立即关联 Trigger，请调用此方法，使其持久化。
- **`Trigger` 配置**:
    - 使用 `TriggerBuilder.newTrigger()` 创建。
    - **`withIdentity()`**: 必须为 Trigger 设置唯一的名称和分组 (`triggerName`, `triggerGroup`)。
    - **`withSchedule()`**: 使用 `CronScheduleBuilder.cronSchedule("...")` 定义 CRON 表达式。CRON 表达式应存储在数据库或配置文件中，而不是硬编码在代码里。

### **3. 异常处理与重试**

- **必须 `try-catch`**: `execute` 方法的整个逻辑体必须被 `try-catch(Exception e)` 包裹。
- **明确的日志**:
    - 任务开始时，打印一条 INFO 级别的日志。
    - 任务成功结束时，打印一条 INFO 级别的日志。
    - 发生任何异常时，**必须**打印一条 ERROR 级别的日志，并**包含完整的异常堆栈信息**。
- **任务重试**:
    - 对于可恢复的错误（如网络抖动、数据库瞬时连接失败），应进行重试。
    - 通过 `throw new JobExecutionException(e, true);` 来触发 Quartz 的立即重试机制。
    - **必须**设置重试次数上限，避免无限重试。重试逻辑应在业务代码中实现，而不是完全依赖 Quartz。
- **异常通知**：
    - 出现异常必须捕获并调用通知service通知系统管理员，通知内容包括异常信息、任务参数、触发时间等。

### **4. 日志规范**

- **唯一标识**: 每一次任务执行都应有一个唯一的请求 ID 或追踪 ID，并在所有相关日志中输出，便于链路追踪。
- **关键信息**: 日志必须包含任务名称、执行参数、开始时间、结束时间、耗时和执行结果（成功/失败）。

### **5. 安全与幂等性**

- **幂等性设计**: 定时任务必须设计为可重复执行而不会产生副作用。例如，在处理订单时，应先检查订单状态，避免重复处理已完成的订单。
- **分布式锁**: 对于可能在集群环境中被多个节点同时触发的写操作任务，必须使用分布式锁（如基于 Redis 或 Zookeeper）来确保只有一个实例在执行。

### **6. 异常监控及通知**

- 系统需要监控作业执行状况，通过作业日志表监控
- 对于执行超过5分钟的任务，如果了解到当前执行时间超过上5次执行平均时长的2倍，也需要提醒系统管理员

## **禁止事项（Hard Rules）**

<!-- - **禁止硬编码**: 严禁在代码中硬编码 CRON 表达式、Job/Trigger 名称等配置。所有配置都应是可管理的。 -->
- **禁止使用 `@Scheduled`**: 必须使用 Quartz。
- **禁止在任务中执行长事务**: 任务应保持简短和高效。如果需要长时间处理，应拆分为多个小步骤或使用异步处理。
- **禁止忽略异常**: `execute` 方法中的 `catch` 块不能为空，必须记录日志。
