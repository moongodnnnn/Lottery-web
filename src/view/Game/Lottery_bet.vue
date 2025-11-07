<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft" class="nav-bar">
        <template #right>
          <div class="rule-btn" @click="showRule = true"><van-icon name="question-o" size="22" /></div>
        </template>
      </van-nav-bar>
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div style="padding: 10px 10px 0px 10px" v-if="!isDigitalLottery">
      <img src="/img/gamebanner.png" alt="" style="width: 100%; cursor: pointer" @click="showBannerDetails" />
    </div>

    <!-- 数字彩票投注内容 -->
    <div v-if="isDigitalLottery" class="digital-lottery-content">
      <div class="lottery-info-card">
        <div class="lottery-header">
          <div class="lottery-name">
            <span class="game-name-badge">{{ gameNameOnly }}</span>
            <span class="play-type">{{ playTypeOnly }}</span>
          </div>
          <span class="lottery-period">第{{ digitalLotteryData.period }}期</span>
        </div>

        <!-- 选号展示 -->
        <div class="selection-display">
          <!-- 排列3 -->
          <div v-if="digitalLotteryData.type === 'pl3'" class="pl3-selection">
            <!-- 注数显示在右上角 -->
            <div class="bet-count-badge">共{{ digitalLotteryData.combinations.length }}注</div>

            <div class="position-group">
              <span class="position-label">百位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.hundred" :key="'h-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">十位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.ten" :key="'t-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">个位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.unit" :key="'u-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
          </div>

          <!-- 排列5 -->
          <div v-if="digitalLotteryData.type === 'pl5'" class="pl3-selection">
            <!-- 注数显示在右上角 -->
            <div class="bet-count-badge">共{{ digitalLotteryData.combinations.length }}注</div>

            <div class="position-group">
              <span class="position-label">万位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.tenThousand" :key="'tt-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">千位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.thousand" :key="'th-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">百位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.hundred" :key="'h-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">十位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.ten" :key="'t-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">个位</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.unit" :key="'u-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
          </div>

          <!-- 大乐透 -->
          <div v-if="digitalLotteryData.type === 'daletou'" class="daletou-selection">
            <!-- 注数显示在右上角 -->
            <div class="bet-count-badge">共{{ digitalLotteryData.totalBets }}注</div>

            <div class="ball-zone">
              <span class="zone-label">前区</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.red" :key="'red-' + num" class="number-ball red-ball">
                  {{ String(num).padStart(2, '0') }}
                </span>
              </div>
            </div>
            <div class="ball-zone">
              <span class="zone-label">后区</span>
              <div class="number-list">
                <span v-for="num in digitalLotteryData.selections.blue" :key="'blue-' + num" class="number-ball blue-ball">
                  {{ String(num).padStart(2, '0') }}
                </span>
              </div>
            </div>
          </div>

          <!-- 其他数字彩票类型可以在这里添加 -->
        </div>

        <!-- 组合展示 - 排列3、排列5和大乐透不显示 -->
        <div v-if="digitalLotteryData.type !== 'daletou' && digitalLotteryData.type !== 'pl3' && digitalLotteryData.type !== 'pl5'" class="combinations-section">
          <div class="combinations-list">
            <span v-for="(combo, index) in digitalLotteryData.combinations" :key="index" class="combo-item">{{ combo }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 足球彩票投注内容列表 - 按比赛分组 -->
    <div v-if="!isDigitalLottery" class="bet-list">
      <div v-for="(game, gameId) in groupedBets" :key="gameId" class="bet-item">
        <!-- 比赛信息头部 - 单行显示 -->
        <div class="bet-header">
          <span class="bet-number">{{ game.gameInfo?.xuhao || "未知" }}</span>
          <span class="bet-teams">{{ game.gameInfo?.home_team_name }} VS {{ game.gameInfo?.guest_team_name }}</span>
          <span class="bet-league">{{ formatMatchTime(game.gameInfo?.start_time) }}</span>
          <span class="bet-time">{{ game.gameInfo?.league_name }} </span>
        </div>

        <!-- 投注选项列表 - 每排4个 -->
        <div class="bet-options-grid">
          <div v-for="bet in game.bets" :key="bet.betId" class="bet-option-item">
            <div class="option-name">{{ getDisplayOptionName(bet) }}</div>
            <div class="option-value">({{ bet.optionValue }})</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作区域 - 紧凑版 -->
    <div class="bottom-action-bar">
      <!-- 投注设置行 -->
      <div class="settings-row">
        <!-- 足球彩票显示投注方式 -->
        <div v-if="!isDigitalLottery" class="setting-group">
          <span class="setting-label">投注方式</span>
          <select v-model="selectedBetType" class="bet-type-select" @change="onBetTypeChange">
            <option v-for="type in betTypeOptions" :key="type.value" :value="type.value" :disabled="type.disabled">
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- 数字彩票显示单注金额 -->
        <div v-if="isDigitalLottery" class="setting-group">
          <span class="setting-label">选择倍数</span>
    
        </div>

        <div class="setting-group">
          <span class="setting-label">倍数</span>
          <div class="multiple-controls">
            <van-button class="control-btn" icon="minus" @click="decreaseMultiple" :disabled="betMultiple <= 1" />
            <span class="multiple-value">{{ betMultiple }}</span>
            <van-button class="control-btn" icon="plus" @click="increaseMultiple" :disabled="betMultiple >= 99" />
          </div>
        </div>
      </div>

      <!-- 投注信息和按钮行 -->
      <div class="action-row">
        <div class="bet-info">
          <div class="info-line">
            <span class="info-text"
              >共 <span class="num">{{ totalBets }}</span> 注 <span class="num"> {{ betMultiple }} </span>倍
              <span class="amount">{{ totalAmount }}</span
              >元</span
            >
          </div>
          <div v-if="!isDigitalLottery" class="prize-line">
            <span style="color: #999; font-size: 0.8rem"> 預計獎金</span>
            <span class="prize-text">{{ estimatedPrize }}</span>
          </div>
        </div>

        <!-- 排列三显示两个按钮 -->
        <template v-if="isPl3Game">
          <button class="custom-btn publish-btn" :disabled="!canConfirm" @click="showPublishDialog">发单</button>
          <button class="custom-btn order-btn" :disabled="!canConfirm" @click="confirmSelection">自购</button>
        </template>

        <!-- 其他游戏显示一个按钮 -->
        <button v-else class="custom-btn single-btn" :disabled="!canConfirm" @click="confirmSelection">下单</button>
      </div>
    </div>

    <!-- Banner详情弹窗 -->
    <van-popup
      v-model:show="showBannerPopup"
      position="bottom"
      :style="{ height: '80%', maxWidth: '430px', left: '50%', transform: 'translateX(-50%)' }"
      round
      closeable
    >
      <div class="banner-details-content">
        <img src="/img/bannerDetails.png" alt="活动详情" style="width: 100%; display: block" />
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { showToast, showDialog } from "vant";
import { useRouter, useRoute } from "vue-router";
import API from "../../request/api.js";

const router = useRouter();
const route = useRoute();

// 接收传递的投注数据
const betDetails = ref([]);
const digitalLotteryData = ref(null); // 数字彩票数据
const isDigitalLottery = ref(false); // 是否为数字彩票
const betAmount = ref(2); // 每注金额，默认2元
const betMultiple = ref(1); // 投注倍数，默认1倍
const selectedBetType = ref("single"); // 选中的投注方式，默认单关
const showRule = ref(false);
const showBannerPopup = ref(false); // Banner详情弹窗

// 判断是否为排列三游戏
const isPl3Game = computed(() => {
  return isDigitalLottery.value && digitalLotteryData.value && digitalLotteryData.value.type === 'pl3';
});

// 投注方式选项
const betTypeOptions = computed(() => {
  const betCount = betDetails.value.length;
  return [
    { label: "单关", value: "single", disabled: betCount < 1 },
    { label: "2串1", value: "2x1", disabled: betCount < 2 },
    { label: "3串1", value: "3x1", disabled: betCount < 3 },
    { label: "4串1", value: "4x1", disabled: betCount < 4 },
    { label: "5串1", value: "5x1", disabled: betCount < 5 },
    { label: "6串1", value: "6x1", disabled: betCount < 6 },
  ];
});

// 按比赛分组投注
const groupedBets = computed(() => {
  const groups = {};
  betDetails.value.forEach((bet) => {
    const gameId = bet.gameId;
    if (!groups[gameId]) {
      groups[gameId] = {
        gameInfo: bet.gameInfo,
        bets: [],
      };
    }
    groups[gameId].bets.push(bet);
  });
  return groups;
});

// 游戏名称（仅游戏名称）
const gameNameOnly = computed(() => {
  if (!isDigitalLottery.value || !digitalLotteryData.value) {
    return '';
  }

  const gameNameMap = {
    'pl3': '排列三',
    'pl5': '排列五',
    'seven_stars': '七星彩',
    'daletou': '大乐透'
  };

  return gameNameMap[digitalLotteryData.value.type] || '';
});

// 玩法类型（仅玩法）
const playTypeOnly = computed(() => {
  if (!isDigitalLottery.value || !digitalLotteryData.value) {
    return '';
  }

  return digitalLotteryData.value.gameName || '';
});

// 计算总注数（根据投注方式）
const totalBets = computed(() => {
  // 数字彩票直接返回组合数
  if (isDigitalLottery.value && digitalLotteryData.value) {
    return digitalLotteryData.value.totalBets;
  }

  // 足球彩票
  const betCount = betDetails.value.length;
  if (selectedBetType.value === "single") {
    return betCount;
  }
  // 串关计算组合数
  const n = parseInt(selectedBetType.value.charAt(0));
  if (betCount < n) return 0;
  return combination(betCount, n);
});

// 计算总金额
const totalAmount = computed(() => {
  return (totalBets.value * betAmount.value * betMultiple.value).toFixed(2);
});

// 计算预计中奖金额范围（最低~最高）
const estimatedPrize = computed(() => {
  if (betDetails.value.length === 0) return "0.00~0.00元";

  const odds = betDetails.value.map((bet) => parseFloat(bet.optionValue));

  if (selectedBetType.value === "single") {
    // 单关：最低和最高单注奖金
    const minOdds = Math.min(...odds);
    const maxOdds = Math.max(...odds);
    const minPrize = (minOdds * betAmount.value * betMultiple.value).toFixed(2);
    const maxPrize = (maxOdds * betAmount.value * betMultiple.value).toFixed(2);
    return `${minPrize}~${maxPrize}元`;
  } else {
    // 串关：最低赔率组合和最高赔率组合
    const n = parseInt(selectedBetType.value.charAt(0));
    if (odds.length < n) return "0.00~0.00元";

    // 排序赔率
    const sortedOdds = [...odds].sort((a, b) => a - b);

    // 最低：取最小的n个赔率相乘
    const minOdds = sortedOdds.slice(0, n).reduce((acc, odd) => acc * odd, 1);
    const minPrize = (minOdds * betAmount.value * betMultiple.value).toFixed(2);

    // 最高：取最大的n个赔率相乘
    const maxOdds = sortedOdds.slice(-n).reduce((acc, odd) => acc * odd, 1);
    const maxPrize = (maxOdds * betAmount.value * betMultiple.value).toFixed(2);

    return `${minPrize}~${maxPrize}`;
  }
});

// 是否可以确认
const canConfirm = computed(() => {
  if (isDigitalLottery.value) {
    // 数字彩票：检查是否有数据且注数大于0
    return digitalLotteryData.value && totalBets.value > 0;
  } else {
    // 足球彩票：检查是否有投注详情且注数大于0
    return betDetails.value.length > 0 && totalBets.value > 0;
  }
});

// 组合数计算 C(n, r)
function combination(n, r) {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= n - i;
    result /= i + 1;
  }
  return Math.round(result);
}

// 格式化比赛时间 - 只显示时分
function formatMatchTime(timestamp) {
  if (!timestamp) return "未知";
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 获取显示的选项名称
function getDisplayOptionName(bet) {
  // 如果是让球胜平负 (rate_type = 2)，在选项名称前加"让"
  if (bet.rateType === "2") {
    return `让${bet.optionName}`;
  }
  // 其他类型直接返回选项名称（比分、半全场等已经包含完整信息）
  return bet.optionName;
}

// 投注方式改变时的处理
function onBetTypeChange() {
  // 可以在这里添加额外的逻辑
  console.log("投注方式已改变为:", selectedBetType.value);
}

// 增加倍数
function increaseMultiple() {
  if (betMultiple.value < 99) {
    betMultiple.value++;
  }
}

// 减少倍数
function decreaseMultiple() {
  if (betMultiple.value > 1) {
    betMultiple.value--;
  }
}

// 显示Banner详情
function showBannerDetails() {
  showBannerPopup.value = true;
}

// 显示发单确认弹窗
function showPublishDialog() {
  if (!canConfirm.value) {
    showToast("请先选择投注选项");
    return;
  }

  // 检查方案金额是否满足发单要求
  if (totalAmount.value < 20) {
    showToast("方案金额必须大于等于20元才能发单");
    return;
  }

  showDialog({
    title: '发单确认',
    message: `<div style="text-align: center;">
      <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 12px;">方案金额：${totalAmount.value}元</div>
      <div style="font-size: 14px; color: #666;">您确认进入发单设置吗？</div>
    </div>`,
    allowHtml: true,
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(() => {
      // 用户点击确认，跳转到发单设置页面
      console.log("用户确认发单，跳转到发单设置页面");

      // 准备订单数据
      const orderData = {
        type: digitalLotteryData.value.type,
        selections: digitalLotteryData.value.selections,
        totalBets: totalBets.value,
        multiple: betMultiple.value,
        totalAmount: totalAmount.value,
        betData: digitalLotteryData.value.betData,
        period: digitalLotteryData.value.period,
        gameName: digitalLotteryData.value.gameName
      };

      // 跳转到发单页面
      router.push({
        path: '/publish_order',
        query: {
          orderData: JSON.stringify(orderData)
        }
      });
    })
    .catch(() => {
      // 用户点击取消
      console.log("用户取消发单");
    });
}

// 确认下单
async function confirmSelection() {
  if (!canConfirm.value) {
    showToast("请先选择投注选项");
    return;
  }

  // 弹出确认对话框
  showDialog({
    messageAlign: "center",
    showCancelButton: true,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    message: `订单金额：¥${totalAmount.value}`,
  })
    .then(async () => {
      // 用户点击确认，准备接口参数
      const orderParams = prepareOrderParams();

      try {
        // 调用下单接口
        const response = await API.add_order(orderParams);

        console.log("接口响应:", response);

        if (response.code === 1) {
          // 跳转到下单成功页面
          router.replace({
            path: '/bet_success',
            query: {
              orderId: response.data?.id || response.data?.order_id || ''
            }
          });
        } else {
          showToast(response.msg || "订单提交失败");
        }
      } catch (error) {
        console.error("提交订单失败:", error);
        showToast(error.message || "订单提交失败，请重试");
      }
    })
    .catch(() => {
      // 用户点击取消，不做任何操作
      console.log("用户取消下单");
    });
}

// 准备订单参数
function prepareOrderParams() {
  // 数字彩票
  if (isDigitalLottery.value) {
    const lotteryTypeMap = {
      'pl3': 6,       // 排列3
      'pl5': 7,       // 排列5
      'seven_stars': 8, // 七星彩
      'daletou': 5    // 大乐透
    };

    // 处理 odds 参数格式
    let oddsData = digitalLotteryData.value.betData;

    // 排列五需要特殊处理 odds 格式：直接使用 betData.zx 数组
    if (digitalLotteryData.value.type === 'pl5') {
      oddsData = digitalLotteryData.value.betData.zx || [];
    }

    const params = {
      amount: parseFloat(totalAmount.value),
      bill_nums: betMultiple.value,
      phase: digitalLotteryData.value.period, // 期号
      cate_id: lotteryTypeMap[digitalLotteryData.value.type] || 4,
      multi: betMultiple.value,
      nums: totalBets.value,
      odds: oddsData,
      upload_bill: 1,
      rules: '',
      rate_type: ''
    };

    // 大乐透需要额外添加 zj 参数
    if (digitalLotteryData.value.type === 'daletou') {
      params.zj = 0;
    }

    return params;
  }

  // 足球彩票
  // 1. 提取所有比赛ID（去重）
  const games = [...new Set(betDetails.value.map((bet) => bet.gameId))];

  // 2. 提取所有投注选项ID
  const odds = betDetails.value.map((bet) => bet.betId);

  // 3. 提取所有玩法类型（去重并拼接）
  const rateTypes = [...new Set(betDetails.value.map((bet) => bet.rateType))];
  const rate_type = rateTypes.join(",");

  // 4. 转换过关方式
  const rules = convertBetTypeToRules(selectedBetType.value);

  // 5. 计算最高奖金
  const maxPrize = calculateMaxPrize();

  // 6. 生成所有组合（bell_all）
  const bell_all = generateBellAll();

  return {
    amount: parseFloat(totalAmount.value),
    bell_all: bell_all,
    bill_nums: betMultiple.value,
    cate_id: 3, 
    games: games,
    max_price: maxPrize,
    multi: betMultiple.value,
    nums: totalBets.value,
    odds: odds,
    rate_type: rate_type,
    rules: rules,
    upload_bill: 1,
  };
}

// 转换投注方式为过关规则格式
function convertBetTypeToRules(betType) {
  if (betType === "single") {
    return "1#1";
  }
  // 2x1 -> 2#1, 3x1 -> 3#1, etc.
  const num = betType.charAt(0);
  return `${num}#1`;
}

// 计算最高奖金
function calculateMaxPrize() {
  if (betDetails.value.length === 0) return 0;

  const odds = betDetails.value.map((bet) => parseFloat(bet.optionValue));

  if (selectedBetType.value === "single") {
    // 单关：最高单注奖金
    const maxOdds = Math.max(...odds);
    return parseFloat((maxOdds * betAmount.value * betMultiple.value).toFixed(2));
  } else {
    // 串关：最高赔率组合
    const n = parseInt(selectedBetType.value.charAt(0));
    const sortedOdds = [...odds].sort((a, b) => b - a);
    const maxOdds = sortedOdds.slice(0, n).reduce((acc, odd) => acc * odd, 1);
    return parseFloat((maxOdds * betAmount.value * betMultiple.value).toFixed(2));
  }
}

// 生成所有组合（bell_all）
function generateBellAll() {
  const odds = betDetails.value.map((bet) => bet.betId);

  if (selectedBetType.value === "single") {
    // 单关：每个选项单独一组
    return odds.map((odd) => [[[odd]]]);
  } else {
    // 串关：生成所有n个选项的组合
    const n = parseInt(selectedBetType.value.charAt(0));
    const combinations = generateCombinations(odds, n);
    return combinations.map((combo) => [[combo]]);
  }
}

// 生成组合的辅助函数
function generateCombinations(arr, n) {
  if (n === 1) return arr.map((item) => [item]);
  if (n === arr.length) return [arr];

  const result = [];

  function combine(start, combo) {
    if (combo.length === n) {
      result.push([...combo]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return result;
}

function onClickLeft() {
  router.back();
}

onMounted(() => {
  // 从路由参数中获取投注数据
  try {
    // 检查是否为数字彩票
    if (route.query.data) {
      // 数字彩票数据
      digitalLotteryData.value = JSON.parse(route.query.data);
      isDigitalLottery.value = true;
      betAmount.value = digitalLotteryData.value.singleAmount || 2;
      console.log("接收到的数字彩票数据:", digitalLotteryData.value);
    } else if (route.query.details) {
      // 足球彩票数据
      betDetails.value = JSON.parse(route.query.details);
      isDigitalLottery.value = false;
      console.log("接收到的足球彩票投注详情:", betDetails.value);
    } else {
      showToast("未找到投注数据");
      router.back();
    }
  } catch (error) {
    console.error("解析投注数据失败:", error);
    showToast("数据解析失败");
    router.back();
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f4f9;
  color: #0f172a;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 110px;
}

.nav-bar-center-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
}

.nav-bar {
  background: #fff;
  color: #333;
  width: 100vw;
  max-width: 430px;
  min-width: 320px;
  box-sizing: border-box;
  margin: 0 auto;
}

.rule-btn {
  color: #fc3c3c;
  font-size: 0.9rem;
  cursor: pointer;
}

/* 数字彩票内容 */
.digital-lottery-content {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
}

.lottery-info-card {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.lottery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.lottery-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.game-name-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  padding: 3px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(252, 60, 60, 0.3);
}

.play-type {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}

.lottery-period {
  font-size: 0.75rem;
  color: #999;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.selection-display {
  margin-bottom: 8px;
}

.pl3-selection {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: linear-gradient(135deg, #fff9f5 0%, #fff 100%);
  border-radius: 6px;
  padding: 8px;
}

.bet-count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.7rem;
  color: #fc3c3c;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(252, 60, 60, 0.15);
  z-index: 1;
}

.position-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.position-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  min-width: 32px;
  text-align: right;
}

.number-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.number-ball {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(252, 60, 60, 0.2);
}

/* 大乐透选号展示 */
.daletou-selection {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #fff9f5 0%, #fff 100%);
  border-radius: 6px;
  padding: 10px;
}

.ball-zone {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.zone-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  min-width: 36px;
  text-align: right;
}

.daletou-selection .number-ball {
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
}

.daletou-selection .red-ball {
  background: linear-gradient(135deg, #ff1744 0%, #ff6b6b 100%);
  box-shadow: 0 1px 3px rgba(255, 23, 68, 0.3);
}

.daletou-selection .blue-ball {
  background: linear-gradient(135deg, #10aeff 0%, #42c5ff 100%);
  box-shadow: 0 1px 3px rgba(16, 174, 255, 0.3);
}

.combinations-section {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 8px;
  border: 1px dashed #e0e0e0;
}

.combinations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.combo-item {
  padding: 2px 8px;
  background: white;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  color: #fc3c3c;
  border: 1px solid #ffe0e0;
  letter-spacing: 0.3px;
  white-space: nowrap;
}

/* 投注列表 */
.bet-list {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
}

.bet-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}

.bet-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.bet-number {
  font-size: 0.7rem;
  color: white;
  background: #fc3c3c;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: 600;
  flex-shrink: 0;
}

.bet-teams {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.bet-league {
  font-size: 0.8em;
  color: #333;
  flex-shrink: 0;
}

.bet-time {
  font-size: 0.75rem;
  color: #fc3c3c;
  font-weight: 600;
  flex-shrink: 0;
}

/* 投注选项网格 - 每排4个 */
.bet-options-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.bet-option-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  min-height: 28px;
  gap: 2px;
}

.option-name {
  font-size: 0.85rem;
  color: #333;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
}

.option-value {
  font-size: 0.8rem;
  color: #333;
  text-align: center;
}

/* 投注方式下拉选择框 */
.bet-type-select {
  height: 32px;
  padding: 0 8px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23fc3c3c' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 26px;
  min-width: 80px;
}

.bet-type-select:focus {
  border-color: #fc3c3c;
  background-color: white;
}

.bet-type-select option:disabled {
  color: #ccc;
}

/* 单注金额显示 */
.single-amount {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fc3c3c;
  padding: 4px 12px;
  background: #fff5f5;
  border-radius: 6px;
}

/* 倍数控制 */
.multiple-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  font-weight: 600;
}

.control-btn:active {
  transform: scale(0.95);
}

.control-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  border-color: #f0f0f0;
}

.multiple-value {
  min-width: 40px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fc3c3c;
}

/* 底部操作区域 - 紧凑版 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: white;
  z-index: 100;
  padding: 12px 10px 0px 10px;
  border-top: 1px solid #f0f0f0;
}

/* 投注设置行 */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;

  padding: 2px 18px 10px 18px;
  border-bottom: 1px solid #f5f5f5;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

/* 投注信息和按钮行 */
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0px;
  padding: 0px 0px 0px 12px;
}

.bet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 10px;
}

.info-line {
  display: flex;
  align-items: center;
}

.info-text {
  font-size: 1rem;
  color: #333;
}

.info-text .num {
  color: #fc3c3c;
  padding: 0 4px;
  font-size: 1rem;
}

.info-text .amount {
  color: #fc3c3c;
  padding: 0 4px;
  font-size: 1rem;
}

.prize-line {
  display: flex;
  align-items: center;
  gap: 4px;
}

.prize-text {
  font-size: 0.8rem;
  color: #c8381d;
}

/* 自定义按钮 */
.custom-btn {
  height: 4.2rem;
  max-width: 80px;
  flex: 1;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.custom-btn:active {
  opacity: 0.8;
}

.custom-btn:disabled {
  background: #ccc !important;
  opacity: 0.6;
  cursor: not-allowed;
}

.publish-btn {
  background: #ff9500;
}

.order-btn {
  background: #fc3c3c;
}

.single-btn {
  background: #fc3c3c;
}

/* Banner详情弹窗 */
.banner-details-content {
  height: 100%;
  overflow-y: auto;
  background: white;
  padding: 12px;
}

.banner-details-content img {
  display: block;
  width: 100%;
  height: auto;
}
</style>
