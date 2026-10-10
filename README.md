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

掘金接口需要 Cookie + 5 个签名参数（`aid`、`uuid`、`spider`、`msToken`、`a_bogus`）才能正常调用。

**获取方法：**

1. 打开浏览器，访问 [掘金官网](https://juejin.cn/) 并登录
2. 按 `F12` 打开开发者工具，切换到 **Network（网络）** 标签页
3. 在筛选框里输入 `get_cur_point`，然后刷新页面
4. 点击列表中出现的 `get_cur_point` 请求
5. 在右侧 **Headers** 面板中：
   - 往下找到 **Request Headers** → `cookie:` → 复制整行值（这是 `JUEJIN_COOKIE`）
   - 往上找到 **Query String Parameters**（查询参数），分别复制：
     - `aid` → `JUEJIN_AID`
     - `uuid` → `JUEJIN_UUID`
     - `spider` → `JUEJIN_SPIDER`
     - `msToken` → `JUEJIN_MS_TOKEN`
     - `a_bogus` → `JUEJIN_A_BOGUS`

> ⚠️ **注意**：这些都是你的登录凭证，请勿泄露给他人！
>
> 💡 **提示**：`msToken` 和 `a_bogus` 有效期较长（约 18 天以上），失效后重新获取即可。

### 第三步：配置 Secrets

1. 进入你 Fork 的仓库页面
2. 点击 **Settings** → 左侧菜单找到 **Secrets and variables** → **Actions**
3. 点击 **New repository secret** 按钮，添加以下 Secret：

| Name | 说明 | 必填 |
|------|------|------|
| `JUEJIN_COOKIE` | 掘金登录 Cookie | ✅ 是 |
| `JUEJIN_AID` | 签名参数 aid | ✅ 是 |
| `JUEJIN_UUID` | 签名参数 uuid | ✅ 是 |
| `JUEJIN_SPIDER` | 签名参数 spider | ✅ 是 |
| `JUEJIN_MS_TOKEN` | 签名参数 msToken | ✅ 是 |
| `JUEJIN_A_BOGUS` | 签名参数 a_bogus | ✅ 是 |
| `PUSHPLUS_TOKEN` | PushPlus 微信推送 Token | ❌ 否 |
| `SERVERCHAN_KEY` | Server酱 推送 Key | ❌ 否 |

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

## 🔄 接口报错 / 返回空怎么办？

如果签到失败或返回空数据，可能是 Cookie 或签名参数过期了：

1. 重新登录掘金，按 F12 打开 Network
2. 筛选 `get_cur_point`，刷新页面
3. 点击请求，从 **Request Headers** 复制新的 `cookie`
4. 从 **Query String Parameters** 复制新的 `msToken` 和 `a_bogus`
5. 进入仓库 **Settings** → **Secrets and variables** → **Actions**
6. 更新对应的 Secret 值并保存

> 💡 一般只需要更新 `JUEJIN_COOKIE`、`JUEJIN_MS_TOKEN`、`JUEJIN_A_BOGUS` 这三个就行，`aid`、`uuid`、`spider` 基本不会变。

## 📜 免责声明

本项目仅供学习交流使用，请勿用于商业用途。使用本工具所产生的一切后果由使用者自行承担。请遵守掘金社区的相关规定。

## 📄 License

MIT
