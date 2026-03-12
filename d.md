# 当前项目的账号注销方案说明

## 先说结论

这套项目如果要做"真正删除 Supabase Auth 账号"，可以做，而且安全边界也清楚：

- 前端只负责发起"我要注销我自己的账号"这个请求
- 后端负责校验当前登录用户身份
- 后端再使用 `FY_SUPABASE_SERVICE_ROLE_KEY` 调用 Supabase Admin API 删除用户

这样做的原因很简单：

- `auth.users` 属于认证核心数据，普通前端登录态没有权限直接删除
- `service_role` 只能放在服务端环境变量里，绝对不能出现在前端代码和 `VITE_` 变量里
- 前端即使被用户打开 DevTools，也拿不到管理员密钥

## 这份仓库里应该怎么落

当前项目不是 Next.js，而是：

- 前端：Vue 3 + Vite
- 本地后端：Node.js + `api/local-server.mjs`
- Supabase 前端调用：`src/services/supabase/`

所以这套方案要按下面这条链路来理解：

1. 用户在前端点击"注销账号"
2. 前端从 Supabase 会话里取当前用户的 `access_token`
3. 前端调用你自己的后端接口，例如 `/api/auth/delete-account`
4. 后端拿这个 `access_token` 去 Supabase 校验"当前请求是不是本人"
5. 后端确认身份无误后，使用 `FY_SUPABASE_SERVICE_ROLE_KEY` 删除该用户
6. 删除成功后，前端清空本地登录状态并回到未登录页面

## 适配当前仓库的文件分工

建议按现在仓库真实结构来放：

- 前端入口：`src/AppUsernameAuth.vue`
- 前端认证服务：`src/services/supabase/authRuntime.js`
- 后端注销接口：`api/auth/delete-account.js`
- 本地后端路由注册：`api/local-server.mjs`

这样做的好处是：

- 登录、注册、退出登录、注销账号都还集中在同一套认证服务里，心智负担低
- 本地开发和后续部署都比较顺手
- 不需要引入新的框架层

## 前端应该做什么

前端只做两件事：

1. 二次确认
2. 带当前会话 token 调你的后端接口

为什么这样做：

- 二次确认是为了避免误触
- 带 token 是为了证明"现在请求注销的人，就是当前登录的这个人"

前端的核心思路可以写成：

```js
const {
  data: { session },
} = await supabase.auth.getSession();

const accessToken = session?.access_token;

await fetch('/api/auth/delete-account', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

注意：

- 前端这里可以使用用户自己的 `access_token`
- 前端这里绝对不能出现 `FY_SUPABASE_SERVICE_ROLE_KEY`
- 前端这里也不应该直接调用 `supabase.auth.admin.deleteUser()`

## 后端应该做什么

后端要做的不是"相信前端说删谁就删谁"，而是先校验，再删除。

### 第一步：校验当前请求是否本人

为什么要先校验：

- 如果你只让前端传一个 `userId` 上来，那任何人都可以伪造别人的 id
- 只有拿当前登录用户自己的 token 去 Supabase 查用户信息，才能证明这个请求是谁发的

在当前项目里，后端可以这样做：

```js
const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const {
  data: { user },
  error,
} = await authClient.auth.getUser(accessToken);
```

如果 `user` 不存在，直接返回 401。

### 第二步：用 service role 删除 Auth 用户

为什么这一步一定要放后端：

- 只有 `service_role` 才有管理员权限
- 这个 key 一旦泄露，别人就能越权操作你的整个 Supabase 项目

当前项目里，后端删除逻辑可以这样做：

```js
const adminClient = createClient(supabaseUrl, process.env.FY_SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);
```

如果删除失败，返回 500 并把错误信息说明白。

## 环境变量怎么放

这是最容易出问题的地方。

### 可以放前端的

这两个本来就是给前端 Supabase SDK 用的：

```env
VITE_FY_SUPABASE_URL=...
VITE_FY_SUPABASE_ANON_KEY=...
```

### 只能放后端的

这个只能给后端接口使用：

```env
FY_SUPABASE_SERVICE_ROLE_KEY=...
```

为什么：

- `VITE_` 开头的变量会被 Vite 注入前端包
- `FY_SUPABASE_SERVICE_ROLE_KEY` 如果写成 `VITE_FY_SUPABASE_SERVICE_ROLE_KEY`，就等于直接泄露管理员密钥

## 和当前数据库结构的关系

你现在数据库里至少有这些表：

- `auth.users`
- `public.user_profiles`
- `public.user_relationships`
- `public.location_share_permissions`

其中 `user_profiles.id` 是外键指向 `auth.users.id`，并且带了 `on delete cascade`。

这意味着：

- 真正删除 `auth.users` 后，`user_profiles` 会跟着删
- `user_relationships` 和 `location_share_permissions` 又是引用 `user_profiles`

所以这套方案在数据库设计上是能接起来的。

但要注意：

- 你最好实际测试一次注销后，好友关系和位置授权是否都按预期清掉
- 不要只看到 Auth 用户删掉了，就默认业务表一定完全符合你的预期

## 当前项目里需要遵守的边界

### 可以做

- 前端用当前用户 token 请求自己的后端接口
- 后端用 anon key 校验 token
- 后端用 service role 删除当前用户

### 不应该做

- 前端直接出现 `FY_SUPABASE_SERVICE_ROLE_KEY`
- 前端直接调用管理员删除接口
- 前端只传 `userId` 给后端，后端不校验 token 就直接删
- 把 `FY_SUPABASE_SERVICE_ROLE_KEY` 写进任何 `VITE_` 变量

## 如果你现在只关心"有没有冲突"

结论是：

- 只要 `FY_SUPABASE_SERVICE_ROLE_KEY` 不出现在前端代码里，这套方案本身没有原则性冲突
- 真正需要适配的是项目结构，不是安全方向

换句话说：

- `d.md` 原来的 Next.js 例子不能直接照抄
- 但"前端发请求，后端校验 token，再用 service role 删除 Auth 用户"这个思路是可以直接迁移到你当前仓库的

## 最后一句话总结

这套项目里，账号注销的正确边界应该是：

- 前端只知道"我要注销"
- 后端负责确认"是不是你本人"
- 管理员密钥只待在后端

如果后面你决定不做"真删除"，而改成"软注销"，那就应该另写一份方案，不要和这份混在一起。
