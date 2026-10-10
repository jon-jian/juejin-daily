const axios = require('axios');

// ============== 配置 ==============
const COOKIE = process.env.JUEJIN_COOKIE || '';
const AID = process.env.JUEJIN_AID || '';
const UUID = process.env.JUEJIN_UUID || '';
const SPIDER = process.env.JUEJIN_SPIDER || '';
const MS_TOKEN = process.env.JUEJIN_MS_TOKEN || '';
const A_BOGUS = process.env.JUEJIN_A_BOGUS || '';
const CSRF_TOKEN = process.env.JUEJIN_CSRF_TOKEN || '';

const PUSHPLUS_TOKEN = process.env.PUSHPLUS_TOKEN || '';
const SERVERCHAN_KEY = process.env.SERVERCHAN_KEY || '';

const BASE_URL = 'https://api.juejin.cn/growth_api/v1';

// 公共请求参数（签名相关）
const commonParams = {};
if (AID) commonParams.aid = AID;
if (UUID) commonParams.uuid = UUID;
if (SPIDER) commonParams.spider = SPIDER;
if (MS_TOKEN) commonParams.msToken = MS_TOKEN;
if (A_BOGUS) commonParams.a_bogus = A_BOGUS;

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
  'content-type': 'application/json',
  Referer: 'https://juejin.cn/',
  Origin: 'https://juejin.cn',
  Cookie: COOKIE,
};

// POST 请求需要额外加 CSRF token
function getPostHeaders() {
  const h = { ...headers };
  if (CSRF_TOKEN) {
    h['x-secsdk-csrf-token'] = CSRF_TOKEN;
  }
  return h;
}

// ============== 工具函数 ==============
function log(msg, type = 'info') {
  const time = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const prefix = {
    info: 'ℹ️ ',
    success: '✅ ',
    error: '❌ ',
    warn: '⚠️  ',
    reward: '🎁 ',
  }[type] || '';
  console.log(`[${time}] ${prefix}${msg}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 合并公共参数和额外参数
function buildParams(extra = {}) {
  return { ...commonParams, ...extra };
}

// 安全解析响应
function safeParse(res) {
  if (!res || !res.data) return null;
  if (typeof res.data === 'string') {
    try {
      return JSON.parse(res.data);
    } catch {
      return { err_no: -1, err_msg: '返回数据不是JSON: ' + res.data.slice(0, 100) };
    }
  }
  return res.data;
}

// ============== 推送通知 ==============
async function pushNotification(title, content) {
  const msg = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  // PushPlus 微信推送
  if (PUSHPLUS_TOKEN) {
    try {
      await axios.post('https://www.pushplus.plus/send', {
        token: PUSHPLUS_TOKEN,
        title,
        content: msg,
        template: 'txt',
      });
      log('PushPlus 推送成功', 'success');
    } catch (e) {
      log(`PushPlus 推送失败: ${e.message}`, 'error');
    }
  }

  // Server酱 推送
  if (SERVERCHAN_KEY) {
    try {
      await axios.post(`https://sctapi.ftqq.com/${SERVERCHAN_KEY}.send`, null, {
        params: { title, desp: msg },
      });
      log('Server酱 推送成功', 'success');
    } catch (e) {
      log(`Server酱 推送失败: ${e.message}`, 'error');
    }
  }
}

// ============== 掘金 API ==============

/** 获取今日签到状态 */
async function getTodayStatus() {
  try {
    const res = await axios.get(`${BASE_URL}/get_today_status`, {
      headers,
      params: buildParams(),
    });
    return safeParse(res);
  } catch (e) {
    log(`获取签到状态失败: ${e.message}`, 'error');
    return null;
  }
}

/** 签到 */
async function checkIn() {
  try {
    const res = await axios.post(`${BASE_URL}/check_in`, {}, {
      headers: getPostHeaders(),
      params: buildParams(),
    });
    return safeParse(res);
  } catch (e) {
    const detail = e.response
      ? `HTTP ${e.response.status}: ${JSON.stringify(e.response.data).slice(0, 200)}`
      : e.message;
    log(`签到请求失败: ${detail}`, 'error');
    return null;
  }
}

/** 获取当前矿石数 */
async function getCurPoint() {
  try {
    const res = await axios.get(`${BASE_URL}/get_cur_point`, {
      headers,
      params: buildParams(),
    });
    return safeParse(res);
  } catch (e) {
    log(`获取矿石数失败: ${e.message}`, 'error');
    return null;
  }
}

/** 获取免费抽奖次数配置 */
async function getLotteryConfig() {
  try {
    const res = await axios.get(`${BASE_URL}/lottery_config/get`, {
      headers,
      params: buildParams(),
    });
    return safeParse(res);
  } catch (e) {
    log(`获取抽奖配置失败: ${e.message}`, 'error');
    return null;
  }
}

/** 抽奖 */
async function lotteryDraw() {
  try {
    const res = await axios.post(`${BASE_URL}/lottery/draw`, {}, {
      headers: getPostHeaders(),
      params: buildParams(),
    });
    return safeParse(res);
  } catch (e) {
    log(`抽奖请求失败: ${e.message}`, 'error');
    return null;
  }
}

/** 沾喜气（获取幸运值） */
async function getLuckyList() {
  try {
    const res = await axios.get(`${BASE_URL}/lottery_history/global_big`, {
      headers,
      params: buildParams({ page_no: 1, page_size: 5 }),
    });
    return safeParse(res);
  } catch (e) {
    return null;
  }
}

async function dipLucky(lid) {
  try {
    const res = await axios.post(
      `${BASE_URL}/lottery_lucky/dip_lucky`,
      { lottery_history_id: lid },
      { headers: getPostHeaders(), params: buildParams() }
    );
    return safeParse(res);
  } catch (e) {
    return null;
  }
}

// ============== 主流程 ==============
async function main() {
  log('====== 掘金自动签到 + 抽奖开始 ======');

  if (!COOKIE) {
    log('未配置 JUEJIN_COOKIE 环境变量，退出', 'error');
    process.exit(1);
  }

  const hasSignParams = MS_TOKEN && A_BOGUS;
  if (!hasSignParams) {
    log('⚠️  未配置 msToken / a_bogus，部分接口可能返回空', 'warn');
    log('   请参考 README 从浏览器请求中提取这些参数', 'warn');
  }

  const results = [];

  // ---- 1. 检查签到状态 ----
  log('检查今日签到状态...');
  const statusRes = await getTodayStatus();
  if (statusRes && statusRes.data === true) {
    log('今日已签到，跳过签到', 'warn');
    results.push('签到: 今日已签到');
  } else if (statusRes && statusRes.data === false) {
    // 随机延迟 0-5 秒，模拟人工
    const delay = Math.floor(Math.random() * 5000);
    log(`等待 ${delay / 1000} 秒后签到...`);
    await sleep(delay);

    // ---- 2. 执行签到 ----
    log('执行签到...');
    const checkInRes = await checkIn();
    if (checkInRes && checkInRes.err_no === 0) {
      const { incr_point, sum_point } = checkInRes.data;
      log(`签到成功！获得 ${incr_point} 矿石，当前总矿石: ${sum_point}`, 'success');
      results.push(`签到: 成功 +${incr_point}矿石 (总${sum_point})`);
    } else {
      const msg = checkInRes ? (checkInRes.err_msg || '未知错误') : '请求失败';
      log(`签到失败: ${msg}`, 'error');
      results.push(`签到: 失败 - ${msg}`);
    }
  } else {
    const msg = statusRes ? statusRes.err_msg : '请求失败';
    log(`获取签到状态失败: ${msg}`, 'error');
    results.push(`签到: 状态查询失败 - ${msg}`);
  }

  // 随机等待 2-5 秒
  await sleep(2000 + Math.random() * 3000);

  // ---- 3. 免费抽奖 ----
  log('查询免费抽奖次数...');
  const lotteryConfig = await getLotteryConfig();
  if (lotteryConfig && lotteryConfig.err_no === 0) {
    const freeCount = lotteryConfig.data.free_count || 0;
    log(`免费抽奖次数: ${freeCount}`, 'info');

    if (freeCount > 0) {
      log('执行免费抽奖...');
      const drawRes = await lotteryDraw();
      if (drawRes && drawRes.err_no === 0) {
        const { lottery_name, draw_lucky_value, total_lucky_value } = drawRes.data;
        log(`抽奖成功！获得: ${lottery_name}`, 'reward');
        log(`幸运值: +${draw_lucky_value} (总: ${total_lucky_value})`, 'info');
        results.push(`抽奖: ${lottery_name} (+${draw_lucky_value}幸运值)`);
      } else {
        const msg = drawRes ? (drawRes.err_msg || '未知错误') : '请求失败';
        log(`抽奖失败: ${msg}`, 'error');
        results.push(`抽奖: 失败 - ${msg}`);
      }
    } else {
      log('今日无免费抽奖次数', 'warn');
      results.push('抽奖: 今日无免费次数');
    }
  } else {
    const msg = lotteryConfig ? (lotteryConfig.err_msg || '未知错误') : '请求失败';
    log(`获取抽奖配置失败: ${msg}`, 'error');
    results.push(`抽奖: 配置查询失败 - ${msg}`);
  }

  // 随机等待 1-3 秒
  await sleep(1000 + Math.random() * 2000);

  // ---- 4. 沾喜气 ----
  log('尝试沾喜气...');
  const luckyList = await getLuckyList();
  if (luckyList && luckyList.err_no === 0 && luckyList.data && luckyList.data.length > 0) {
    const lid = luckyList.data[0].history_id;
    const dipRes = await dipLucky(lid);
    if (dipRes && dipRes.err_no === 0) {
      const { dip_value, total_value } = dipRes.data;
      log(`沾喜气成功！+${dip_value}幸运值 (总: ${total_value})`, 'success');
      results.push(`沾喜气: +${dip_value}幸运值 (总${total_value})`);
    } else {
      log('沾喜气失败或今日已沾', 'warn');
      results.push('沾喜气: 失败或已完成');
    }
  } else {
    log('获取大奖列表失败，跳过沾喜气', 'warn');
    results.push('沾喜气: 跳过');
  }

  // ---- 5. 查询最终矿石数 ----
  const pointRes = await getCurPoint();
  if (pointRes && pointRes.err_no === 0) {
    log(`当前矿石总数: ${pointRes.data}`, 'info');
    results.push(`矿石总数: ${pointRes.data}`);
  }

  // ---- 6. 推送通知 ----
  const title = '掘金每日签到结果';
  const content = results.join('\n');
  log('\n====== 执行结果汇总 ======');
  console.log(content);
  log('====== 执行结束 ======\n');

  await pushNotification(title, content);
}

main().catch((e) => {
  log(`程序异常: ${e.message}`, 'error');
  console.error(e);
  process.exit(1);
});
