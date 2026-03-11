# 真实数据库认证接入说明

这份文档适用于当前项目的最新认证方案：

- 注册：`用户ID + 密码`
- 登录：`用户ID + 密码`
- 游客进入
- 用户数据保存在 Supabase 数据库
- 注册、登录、会话校验都通过你自己的后端接口完成

## 现在要执行的数据库脚本

不要再执行旧的邮箱登录脚本。

请使用这份新的 SQL：

- [002_database_auth_schema.sql](/d:/github/CPT208-Group-Work/database/002_database_auth_schema.sql)

## 你需要在 `.env.local` 里填写什么

```env
QWEN_API_KEY=你的Qwen密钥
SUPABASE_URL=https://你的项目地址.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
```

说明：

- `SUPABASE_URL`：你的 Supabase 项目地址
- `SUPABASE_SERVICE_ROLE_KEY`：后端访问数据库用的密钥
- 这个 key 只能放后端，不能放前端公开代码里

## 去哪里找 `SUPABASE_SERVICE_ROLE_KEY`

1. 打开 Supabase 后台
2. 进入你的项目
3. 打开 `Project Settings`
4. 打开 `API`
5. 找到 `service_role` 对应的 key

## 在 Supabase 里怎么做

1. 打开 `SQL Editor`
2. 新建一个查询
3. 复制 [002_database_auth_schema.sql](/d:/github/CPT208-Group-Work/database/002_database_auth_schema.sql) 全部内容
4. 点击运行

执行后会创建这些表：

- `app_users`
- `app_user_sessions`
- `guest_sessions`
- `user_relationships`
- `location_share_permissions`

## 当前前端和后端的对应关系

### 前端认证组件

- [DatabaseAuthStepPanel.vue](/d:/github/CPT208-Group-Work/src/components/DatabaseAuthStepPanel.vue)

它负责：

- 点击登录 / 注册 / 游客进入
- 输入用户ID和密码
- 调用后端接口
- 登录成功后进入聊天页

### 前端认证服务

- [databaseAuth.js](/d:/github/CPT208-Group-Work/src/services/auth/databaseAuth.js)

它负责：

- 调 `/api/auth/register`
- 调 `/api/auth/login`
- 调 `/api/auth/session`
- 调 `/api/auth/logout`
- 把 token 保存在浏览器本地

### 后端接口

- [auth-register.js](/d:/github/CPT208-Group-Work/api/auth-register.js)
- [auth-login.js](/d:/github/CPT208-Group-Work/api/auth-login.js)
- [auth-session.js](/d:/github/CPT208-Group-Work/api/auth-session.js)
- [auth-logout.js](/d:/github/CPT208-Group-Work/api/auth-logout.js)
- [auth-db.mjs](/d:/github/CPT208-Group-Work/api/auth-db.mjs)

它们负责：

- 注册时写数据库
- 登录时查数据库
- 校验密码
- 创建 session token
- 刷新页面后恢复登录状态

## 现在这套方案和旧 Supabase Auth 的区别

旧方案是：

- 邮箱登录
- 手机号登录
- 微信 OAuth
- 依赖 Supabase Auth

现在这套方案是：

- 自定义 `用户ID + 密码`
- 依赖你自己的后端接口
- Supabase 只作为数据库

所以你现在不需要去配：

- Email Provider
- Phone Provider
- 微信登录 Provider

你现在真正要做的是：

1. 配 `SUPABASE_URL`
2. 配 `SUPABASE_SERVICE_ROLE_KEY`
3. 执行新的 SQL

## 本地运行

```bash
npm install
npm run dev
```

## 你接下来最应该做的顺序

1. 在 Supabase 创建项目
2. 执行新的 SQL 脚本
3. 在 `.env.local` 里填入数据库配置
4. 启动项目
5. 测试注册
6. 测试登录
7. 测试刷新页面后是否仍能恢复登录状态
