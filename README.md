# 掘金自动签到 + 免费抽奖（GitHub Actions 版）

基于 **GitHub Actions** 实现的掘金自动签到和免费抽奖工具，**零服务器、零成本、全自动运行**。

## ✨ 功能特性

- 🔔 **每日自动签到** - 自动获取签到矿石奖励
- 🎰 **自动免费抽奖** - 每日免费抽奖机会自动使用
- 🍀 **自动沾喜气** - 增加幸运值，提高中奖概率
- ⏰ **定时执行** - 每天早上 6:30 自动运行（可自定义）
- 🎲 **随机延迟** - 模拟人工操作，降低被检测风险
- 📱 **消息推送** - 支持 PushPlus / Server酱 微信推送结果
- 🔒 **安全可靠** - Cookie 通过 GitHub Secrets 加密存储

## 🚀 快速开始

### 第一步：Fork 本仓库

点击右上角的 **Fork** 按钮，将本仓库复制到你自己的 GitHub 账号下。

### 第二步：获取掘金 Cookie 和签名参数

掘金接口需要 Cookie + 签名参数才能正常调用。**第一次配置需要获取全部参数，后续只需要更新 4 个会过期的即可。**

**获取方法（从同一个 POST 请求里一次性拿全）：**

1. 打开浏览器，访问 [掘金官网](https://juejin.cn/) 并登录
2. 按 `F12` 打开开发者工具，切换到 **Network（网络）** 标签页
3. 在筛选框里输入 `check_in`
4. **手动点一下页面上的「立即签到」按钮**（如果今天已签就点抽奖）
5. 点击列表中出现的 `check_in`（或 `lottery/draw`）POST 请求
6. 在右侧 **Headers** 面板中，分别复制以下值：
   - **Request Headers** → `cookie:` → `JUEJIN_COOKIE`
   - **Request Headers** → `x-secsdk-csrf-token:` → `JUEJIN_CSRF_TOKEN`
   - **Query String Parameters**（查询参数）：
     - `aid` → `JUEJIN_AID`
     - `uuid` → `JUEJIN_UUID`
     - `spider` → `JUEJIN_SPIDER`
     - `msToken` → `JUEJIN_MS_TOKEN`
     - `a_bogus` → `JUEJIN_A_BOGUS`

> ⚠️ **注意**：这些都是你的登录凭证，请勿泄露给他人！
>
> 💡 **提示**：`aid`、`uuid`、`spider` 基本是固定的，配置一次就行。需要定期更新的只有 `Cookie`、`msToken`、`a_bogus`、`x-secsdk-csrf-token` 这 4 个。

### 第三步：配置 Secrets

1. 进入你 Fork 的仓库页面
2. 点击 **Settings** → 左侧菜单找到 **Secrets and variables** → **Actions**
3. 点击 **New repository secret** 按钮，添加以下 Secret：

| Name | 说明 | 必填 | 有效期 |
|------|------|------|--------|
| `JUEJIN_COOKIE` | 掘金登录 Cookie | ✅ 是 | 约 1 个月 |
| `JUEJIN_AID` | 应用 ID（固定值 2608） | ✅ 是 | 永久不变 |
| `JUEJIN_UUID` | 设备/用户唯一标识 | ✅ 是 | 基本不变 |
| `JUEJIN_SPIDER` | 爬虫标识（固定值 0） | ✅ 是 | 永久不变 |
| `JUEJIN_MS_TOKEN` | 安全签名 token | ✅ 是 | 约 15-30 天 |
| `JUEJIN_A_BOGUS` | 接口签名参数 | ✅ 是 | 约 15-30 天 |
| `JUEJIN_CSRF_TOKEN` | CSRF 防御令牌（POST 请求需要） | ✅ 是 | 约 15-30 天 |
| `PUSHPLUS_TOKEN` | PushPlus 微信推送 Token | ❌ 否 | - |
| `SERVERCHAN_KEY` | Server酱 推送 Key | ❌ 否 | - |

### 第四步：启用 Actions

1. 点击仓库顶部的 **Actions** 标签
2. 如果看到提示，点击 **I understand my workflows, go ahead and enable them**
3. 找到左侧的 **掘金自动签到抽奖** 工作流
4. 点击 **Run workflow** → **Run workflow** 手动触发一次，测试是否正常

### 第五步：完成 🎉

之后每天早上 8:30 左右会自动执行签到和抽奖，你可以在 Actions 页面查看执行记录。

## 📱 消息推送配置（可选）

### PushPlus 微信推送

1. 微信搜索并关注 **PushPlus** 公众号
2. 点击菜单栏的 **一对一推送** 获取 token
3. 将 token 配置到 GitHub Secrets 的 `PUSHPLUS_TOKEN` 中

### Server酱 推送

1. 访问 [Server酱官网](https://sct.ftqq.com/)
2. 使用 GitHub 账号登录
3. 获取 SendKey
4. 将 SendKey 配置到 GitHub Secrets 的 `SERVERCHAN_KEY` 中

## ⚙️ 自定义配置

### 修改执行时间

编辑 `.github/workflows/checkin.yml` 文件中的 `cron` 表达式：

```yaml
schedule:
  - cron: '30 22 * * *'  # UTC 时间，北京时间 = UTC + 8
```

常用时间对照表（北京时间）：

| 北京时间 | UTC 时间 | cron 表达式 |
|---------|---------|------------|
| 06:00 | 22:00（前一天） | `0 22 * * *` |
| 06:30 | 22:30（前一天） | `30 22 * * *` |
| 07:00 | 23:00（前一天） | `0 23 * * *` |
| 08:00 | 00:00 | `0 0 * * *` |
| 08:30 | 00:30 | `30 0 * * *` |
| 09:00 | 01:00 | `0 1 * * *` |

> 💡 GitHub Actions 的定时任务可能有 0-15 分钟的延迟，属于正常现象。

## 🔧 本地测试

如果你想在本地运行测试：

```bash
# 安装依赖
npm install

# 设置环境变量（Windows PowerShell）
$env:JUEJIN_COOKIE = "你的cookie"

# 运行
npm start
```

## 📁 项目结构

```
.
├── .github/
│   └── workflows/
│       └── checkin.yml    # GitHub Actions 工作流配置
├── src/
│   └── index.js           # 主脚本（签到 + 抽奖 + 沾喜气）
├── .gitignore
├── package.json
└── README.md
```

## ⚠️ 注意事项

1. **Cookie 有效期**：掘金 Cookie 一般有效期约 1 个月左右，失效后需要重新获取并更新 Secrets
2. **签名参数有效期**：`msToken` 和 `a_bogus` 有效期约 18 天以上，失效后同样重新获取即可
3. **签到规则**：请遵守掘金社区规则，合理使用本工具
4. **Actions 配额**：GitHub 免费账户每月有 2000 分钟的 Actions 运行时间，本项目每天仅运行约 30 秒，完全够用
5. **仓库权限**：确保 Fork 的仓库是 Public 的，Private 仓库的 Actions 配额较少

## 🔄 接口报错 / 参数过期怎么办？

当 Actions 运行失败、日志里出现 `must login`、返回空数据或签到失败时，说明有参数过期了。

### 需要定期更新的参数（4 个）

| Secret | 更新频率 | 从哪里获取 |
|--------|---------|-----------|
| `JUEJIN_COOKIE` | 约 1 个月 | Request Headers → `cookie` |
| `JUEJIN_MS_TOKEN` | 约 15-30 天 | Query String Parameters → `msToken` |
| `JUEJIN_A_BOGUS` | 约 15-30 天 | Query String Parameters → `a_bogus` |
| `JUEJIN_CSRF_TOKEN` | 约 15-30 天 | Request Headers → `x-secsdk-csrf-token` |

> 💡 **`aid`、`uuid`、`spider` 基本不会变**，配置一次就行，不用管。

### 更新步骤

1. 打开掘金官网，确保已登录
2. 按 `F12` → Network → 筛选 `check_in`
3. **手动点一下签到按钮**（如果今天已签就点抽奖）
4. 点击抓到的 `check_in`（或 `lottery/draw`）POST 请求
5. 分别复制以下 4 个值：
   - **Request Headers** 里的 `cookie` → `JUEJIN_COOKIE`
   - **Request Headers** 里的 `x-secsdk-csrf-token` → `JUEJIN_CSRF_TOKEN`
   - **Query String Parameters** 里的 `msToken` → `JUEJIN_MS_TOKEN`
   - **Query String Parameters** 里的 `a_bogus` → `JUEJIN_A_BOGUS`
6. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
7. 找到对应的 Secret，点击右侧的 **Update**，粘贴新值保存

> 💡 **技巧**：这 4 个值从**同一个 POST 请求**里一次性就能拿全，建议从 `check_in` 请求里取。

## 📜 免责声明

本项目仅供学习交流使用，请勿用于商业用途。使用本工具所产生的一切后果由使用者自行承担。请遵守掘金社区的相关规定。

## 📄 License

MIT
