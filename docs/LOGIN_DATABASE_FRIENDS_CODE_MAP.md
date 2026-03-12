# 登录、数据库、加好友系统代码说明

## 这份文档是为了解决什么问题

为什么要先整理这份说明：

当前仓库里同时保留了几套认证写法，包括：

- 基于 Supabase 的当前方案
- 早期本地 session + 自建表的旧方案
- 早期邮箱登录演示方案

如果不先把“当前真正用到的代码”和“仓库里只是保留但没走到的代码”分开，后面你自己排错、给队友解释，或者写报告时，很容易把链路讲混。

这份文档只重点说明：

- 当前默认入口真正会跑到哪些文件
- 登录、注册、游客进入分别走哪条代码链
- 数据库里哪些表真的参与了这一套流程
- 加好友功能前后端分别用了哪些代码
- 哪些文件和这个系统相关，但当前默认入口没有走到

## 当前实际启用的是哪一套

当前前端入口文件是：

- `src/main.js`

它默认加载的是：

- `src/AppUsernameAuth.vue`

这说明当前项目真正启用的是：

- 用户名 + 密码登录/注册
- 底层仍然使用 Supabase Auth 管理登录会话
- 用户业务资料写入 `public.user_profiles`
- 好友功能通过 `friend_code` 和 `user_relationships` 表实现

也就是说，当前这一套不是“纯邮箱登录页”，也不是“旧版本地 token 登录页”，而是“用户名登录外壳 + Supabase Auth + Supabase 数据表”的组合方案。

## 当前真正用到的代码

### 1. 前端入口和总控

#### `src/main.js`

作用：

- 启动 Vue 应用
- 决定当前默认加载哪个 App 组件

当前实际加载：

- `AppUsernameAuth.vue`

#### `src/AppUsernameAuth.vue`

作用：

- 控制整个登录后页面状态
- 在“认证页 / 聊天页 / 好友页”之间切换
- 恢复登录态
- 退出登录
- 管理游客模式

你可以把它理解成这套系统的前端总入口。

### 2. 登录/注册页面

#### `src/components/UsernameSupabaseAuthPanel.vue`

作用：

- 提供注册按钮、登录按钮、游客进入按钮
- 做用户名和密码的基础校验
- 点击注册时调用注册服务
- 点击登录时调用登录服务
- 点击游客进入时创建游客会话

这是当前真正展示给用户看的登录页面组件。

### 3. 前端认证服务

#### `src/services/auth/usernameSupabaseAuth.js`

作用：

- 向后端发起 `/api/auth/register`
- 向后端发起 `/api/auth/login`
- 接收后端返回的 `access_token` 和 `refresh_token`
- 调用 Supabase 客户端的 `setSession`，把登录态写回前端

为什么要有这一层：

因为当前登录方式是“用户名登录”，而 Supabase Auth 原生更偏向邮箱体系，所以这里用后端把“用户名”转换成真正的 Supabase 认证过程，前端只负责拿回会话并应用。

#### `src/services/supabase/clientRuntime.js`

作用：

- 初始化 Supabase 前端客户端
- 从环境变量读取 Supabase URL 和 anon key

这是所有前端 Supabase 请求的基础。

#### `src/services/supabase/authRuntime.js`

作用：

- 获取当前会话
- 获取当前用户
- 监听登录状态变化
- 退出登录
- 创建游客会话

虽然当前“用户名登录”主要通过 `usernameSupabaseAuth.js` 触发，但登录后的会话恢复、退出登录、游客模式，还是依赖这份运行时认证服务。

### 4. 游客模式

#### `src/utils/guestSession.js`

作用：

- 生成游客 ID
- 在前端内存中保存游客会话
- 清空游客会话

当前游客模式的特点：

- 不写数据库
- 只保存在前端内存
- 刷新页面后会清空

这和任务要求是吻合的。

### 5. 好友页面和前端好友服务

#### `src/pages/friends/FriendsPage.vue`

作用：

- 加载当前用户资料
- 加载好友列表
- 提交好友码添加好友
- 展示好友定位弹窗

这是好友系统的页面总入口。

#### `src/components/friends/AddFriendForm.vue`

作用：

- 输入对方的 `friend_code`
- 触发添加好友

#### `src/components/friends/FriendCodeCard.vue`

作用：

- 展示当前登录用户自己的好友码

#### `src/components/friends/FriendListSection.vue`

作用：

- 展示好友列表
- 展示在线状态和位置共享状态

#### `src/components/friends/FriendLocationPopup.vue`

作用：

- 展示选中好友的定位信息或状态信息

#### `src/services/friends/friendServiceRuntime.js`

作用：

- 获取当前登录用户资料
- 请求 `/api/friends/list` 拉取好友列表
- 请求 `/api/friends/add` 添加好友
- 在接口失败时做本地缓存兜底

为什么好友功能要单独放服务层：

因为页面组件只应该关心“用户点了什么按钮”，不应该关心鉴权 token、接口地址、失败重试、缓存兜底这些实现细节。这样页面会更清晰，后续你改接口时也只需要改服务层。

### 6. 后端本地 API 入口

#### `api/local-server.mjs`

作用：

- 本地启动 Node API 服务
- 手动读取 `.env.local`
- 注册各个接口路由

当前和这套系统直接相关的路由有：

- `/api/auth/register`
- `/api/auth/login`
- `/api/friends/add`
- `/api/friends/list`

### 7. 登录/注册后端接口

#### `api/auth-register.js`

作用：

- 接收前端提交的用户名和密码
- 调用 `registerUsernameUser`
- 返回注册后的会话信息

#### `api/auth-login.js`

作用：

- 接收前端提交的用户名和密码
- 调用 `loginUsernameUser`
- 返回登录后的会话信息

#### `api/supabase-username-auth.mjs`

作用：

- 真正处理用户名注册和用户名登录
- 用管理员权限访问 Supabase
- 创建 Auth 用户
- 写入 `user_profiles`
- 生成唯一 `friend_code`
- 用内部邮箱完成 Supabase 登录

这份文件是当前登录系统最核心的后端实现。

为什么这样设计：

- 用户前端看到的是“用户名登录”
- Supabase 底层更适合维护认证账户和 session
- 所以后端做了一层转换：用户名只是业务层身份，真正的认证仍然交给 Supabase Auth

### 8. 好友后端接口

#### `api/friends-add.js`

作用：

- 接收前端提交的好友码
- 调用 `addFriendByCode`

#### `api/friends-list.js`

作用：

- 返回当前登录用户的好友列表

#### `api/supabase-friends.mjs`

作用：

- 校验当前请求里的 Supabase access token
- 读取当前用户在 `user_profiles` 里的资料
- 按 `friend_code` 查找目标用户
- 在 `user_relationships` 里创建或更新关系
- 查询好友列表
- 读取位置共享状态
- 估算好友是否在线

这份文件是当前加好友系统的后端核心。

## 数据库里真正参与当前流程的代码

### `database/001_user_auth_schema.sql`

这份 SQL 是当前数据库结构的核心来源。

当前这套登录和好友系统真正会用到的表主要有：

#### 1. `auth.users`

作用：

- Supabase Auth 自动维护认证账户

当前用法：

- 用户注册时由 `api/supabase-username-auth.mjs` 创建
- 用户登录后由 Supabase 返回 session

#### 2. `public.user_profiles`

作用：

- 保存业务层用户资料

当前实际用到的字段重点有：

- `id`
- `username`
- `friend_code`
- `auth_email`
- `display_name`
- `role`
- `status`

当前实际用途：

- 注册成功后写入用户资料
- 好友系统读取当前用户和目标用户资料
- 页面展示用户昵称和好友码

#### 3. `public.user_relationships`

作用：

- 保存用户和用户之间的好友关系

当前实际用途：

- 添加好友时插入或更新关系
- 好友列表页面读取已接受的关系

#### 4. `public.location_share_permissions`

说明：

- 当前 SQL 文件里没有正式建这张表
- 但 `api/supabase-friends.mjs` 已经预留了读取逻辑

当前状态：

- 如果表不存在，代码会降级处理，不会直接崩
- 目前主要用于“预留位置共享扩展”

#### 5. `public.guest_sessions`

说明：

- SQL 里有这张表
- 但当前游客模式并没有真正写入它

当前状态：

- 只是预留
- 当前游客会话还是只保存在前端内存

## 当前这套系统的调用链

### 1. 注册链路

1. 用户在 `src/components/UsernameSupabaseAuthPanel.vue` 输入用户名和密码
2. 页面调用 `src/services/auth/usernameSupabaseAuth.js` 的 `registerWithUsername`
3. 前端请求 `/api/auth/register`
4. `api/auth-register.js` 调用 `api/supabase-username-auth.mjs`
5. 后端用 Supabase Admin 创建认证用户
6. 后端写入 `public.user_profiles`
7. 后端再用内部邮箱执行登录，拿到 Supabase session
8. 前端收到 session 后调用 `supabase.auth.setSession`
9. `src/AppUsernameAuth.vue` 切换到已登录状态

### 2. 登录链路

1. 用户在 `src/components/UsernameSupabaseAuthPanel.vue` 输入用户名和密码
2. 页面调用 `src/services/auth/usernameSupabaseAuth.js` 的 `loginWithUsername`
3. 前端请求 `/api/auth/login`
4. `api/auth-login.js` 调用 `api/supabase-username-auth.mjs`
5. 后端按用户名查询 `user_profiles`
6. 后端取出对应的内部邮箱并调用 Supabase 登录
7. 后端返回 session
8. 前端用 `setSession` 恢复登录态

### 3. 游客进入链路

1. 用户点击游客进入
2. `src/components/UsernameSupabaseAuthPanel.vue` 调用 `continueAsGuest`
3. `src/utils/guestSession.js` 生成一个 `guest_xxx`
4. `src/AppUsernameAuth.vue` 用游客身份进入聊天页

这条链路不会写数据库。

### 4. 添加好友链路

1. 用户在 `src/pages/friends/FriendsPage.vue` 输入对方好友码
2. 页面调用 `src/services/friends/friendServiceRuntime.js` 的 `sendFriendRequest`
3. 前端先从 Supabase 会话中取 `access_token`
4. 前端请求 `/api/friends/add`
5. `api/friends-add.js` 调用 `api/supabase-friends.mjs`
6. 后端先校验当前用户身份
7. 后端读取当前用户的 `user_profiles`
8. 后端按 `friend_code` 查目标用户
9. 后端写入或更新 `user_relationships`
10. 前端刷新好友列表

### 5. 加载好友列表链路

1. 好友页挂载时调用 `getFriendList`
2. `src/services/friends/friendServiceRuntime.js` 请求 `/api/friends/list`
3. `api/friends-list.js` 调用 `api/supabase-friends.mjs`
4. 后端读取当前用户有关的好友关系
5. 后端拼装好友资料、在线状态、位置共享状态
6. 返回给前端页面渲染

## 当前默认入口没有走到，但和系统相关的文件

为什么要单独列这一段：

因为这些文件看起来也像“登录代码”或“数据库代码”，但在当前默认入口下并不是主链路的一部分。如果你写说明文档或答辩时把它们一起算进去，会很容易把老师讲晕。

### 1. 旧版本地数据库 token 方案

相关文件：

- `src/App.vue`
- `src/components/DatabaseAuthStepPanel.vue`
- `src/services/auth/databaseAuth.js`
- `api/auth-db.mjs`
- `api/auth-session.js`
- `api/auth-logout.js`

这套方案的特点：

- 自己保存 token
- 自己维护 session 表
- 不是当前 `src/main.js` 默认加载的方案

### 2. 旧版邮箱登录演示方案

相关文件：

- `src/AppSupabase.vue`
- `src/components/SupabaseAuthPanel.vue`
- `src/services/supabase/auth.js`
- `src/services/supabase/client.js`

这套方案的特点：

- 更接近 Supabase 原生邮箱登录
- 也不是当前默认入口

### 3. 仅前端原型好友方案

相关文件：

- `src/services/friends/friendService.js`
- `src/services/friends/friendMockData.js`

这套方案的特点：

- 不依赖后端接口时，可以只在浏览器本地模拟好友列表
- 当前好友页使用的是 `friendServiceRuntime.js`
- `friendMockData.js` 主要是兜底数据，不是核心数据库链路

## 环境变量提醒

如果你已经把环境变量改成了这一组名字：

- `FY_SUPABASE_URL`
- `FY_SUPABASE_SERVICE_ROLE_KEY`
- `VITE_FY_SUPABASE_URL`
- `VITE_FY_SUPABASE_ANON_KEY`

那就要注意：

- 当前很多代码原本还是按旧名字读取
- 运行代码和提示文案都需要同步改名

否则会出现：

- 前端明明写了 `.env.local`，但 `import.meta.env` 读不到
- 后端明明加载了 `.env.local`，但 `process.env` 还在找旧变量名

## 一句话总结

如果只看当前真正运行的这一套，你可以把它理解成：

- 前端入口：`src/AppUsernameAuth.vue`
- 登录页面：`src/components/UsernameSupabaseAuthPanel.vue`
- 前端认证桥接：`src/services/auth/usernameSupabaseAuth.js`
- Supabase 客户端：`src/services/supabase/clientRuntime.js`
- 游客模式：`src/utils/guestSession.js`
- 好友页面：`src/pages/friends/FriendsPage.vue`
- 好友前端服务：`src/services/friends/friendServiceRuntime.js`
- 后端入口：`api/local-server.mjs`
- 登录核心后端：`api/supabase-username-auth.mjs`
- 好友核心后端：`api/supabase-friends.mjs`
- 数据库结构：`database/001_user_auth_schema.sql`

如果你后面要继续扩展这个模块，优先从这几处改，而不是先去改旧版保留文件。
