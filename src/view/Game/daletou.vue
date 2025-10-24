<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="大乐透" left-arrow @click-left="onClickLeft" class="nav-bar">
        <template #right>
          <div class="rule-btn" @click="showRule = true"><van-icon name="question-o" size="22" /></div>
        </template>
      </van-nav-bar>
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #fff; padding: 10px 12px">
      <div style="font-size: 0.75rem">
        {{ currentPeriod }}期 &nbsp; 距离截至还有 <span style="color: #ff1744">{{ countdownDisplay }} </span>
      </div>

      <div style="font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px" @click="toggleHistory">
        开奖历史
        <span
          style="display: inline-block; transition: transform 0.3s"
          :style="{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }"
        >
          <van-icon name="arrow-down" />
        </span>
      </div>
    </div>

    <!-- 开奖历史展开区域 -->
    <transition name="slide-fade">
      <div v-if="showHistory" class="history-section">
        <div v-for="item in historyData" :key="item.period" class="history-item">
          <span class="history-period">{{ item.period }}期</span>
          <div class="history-balls">
            <span class="ball-group red-group">
              <span v-for="red in item.redBalls" :key="red" class="history-ball red-ball">{{ red }}</span>
            </span>
            <span class="ball-group blue-group">
              <span v-for="blue in item.blueBalls" :key="blue" class="history-ball blue-ball">{{ blue }}</span>
            </span>
          </div>
        </div>
      </div>
    </transition>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px">
      <div style="font-size: 0.85rem">双击设胆</div>
      <div style="padding: 8px 12px; background-color: #fff; border-radius: 6px; font-size: 0.8rem; cursor: pointer" @click="randomSelect">
        机选 <van-icon name="arrow-down" />
      </div>
    </div>

    <!-- 下注区域 -->
    <div class="betting-section">
      <!-- 红球区域 -->
      <div class="ball-section">
        <div class="ball-grid">
          <div
            v-for="num in 35"
            :key="'red-' + num"
            :class="['ball', 'red-ball', { selected: redBalls.includes(num) }]"
            @click="toggleRedBall(num)"
          >
            {{ String(num).padStart(2, "0") }}
          </div>
        </div>
      </div>

      <!-- 蓝球区域 -->
      <div class="ball-section">
        <div class="ball-grid">
          <div
            v-for="num in 12"
            :key="'blue-' + num"
            :class="['ball', 'blue-ball', { selected: blueBalls.includes(num) }]"
            @click="toggleBlueBall(num)"
          >
            {{ String(num).padStart(2, "0") }}
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-section">
      <div class="action-buttons">
        <div @click="clearAll" style="padding: 22px">
          <van-icon name="delete-o" size="24" />
        </div>

        <div style="text-align: center">
          <div>
            共 <span style="color: #ff1744">{{ betCount }}</span> 注 <span style="color: #ff1744">{{ betAmount }}</span> 元
          </div>

          <div style="font-size: 0.7rem; color: #999">
            <span v-if="!canConfirm">至少选择5个红球 2个蓝球</span>
            <span v-else>已选{{ redBalls.length }}红球 {{ blueBalls.length }}蓝球</span>
          </div>
        </div>

        <van-button type="primary" class="confirm-btn" :disabled="!canConfirm" @click="confirmSelection"> 确认 </van-button>
      </div>
    </div>

    <!-- 机选弹窗 -->
    <van-popup v-model:show="showRandomPopup" position="bottom" round :style="{ padding: '20px' }">
      <div class="random-popup">
        <div class="random-header">
          <span class="random-title">机选注数</span>
          <van-icon name="cross" @click="showRandomPopup = false" />
        </div>
        <div class="random-options">
          <div class="random-btn" @click="confirmRandomSelect(1)">随机1注</div>
          <div class="random-btn" @click="confirmRandomSelect(5)">随机5注</div>
          <div class="random-btn" @click="confirmRandomSelect(10)">随机10注</div>
        </div>
      </div>
    </van-popup>

    <!-- 玩法说明弹窗 -->
    <van-popup v-model:show="showRule" position="bottom" :style="{ height: '60%' }">
      <div class="rule-popup">
        <div class="rule-header">
          <span class="rule-title">大乐透玩法说明</span>
          <van-icon name="cross" @click="showRule = false" />
        </div>
        <div class="rule-content">
          <div class="rule-item">
            <h3>玩法介绍</h3>
            <p>大乐透是从前区35个号码中选择5个号码，从后区12个号码中选择2个号码的玩法。</p>
          </div>
          <div class="rule-item">
            <h3>投注规则</h3>
            <p>• 红球区：从01-35中选择5个号码</p>
            <p>• 蓝球区：从01-12中选择2个号码</p>
            <p>• 单注金额：2元</p>
          </div>
          <div class="rule-item">
            <h3>开奖时间</h3>
            <p>每周一、三、六晚上21:10开奖</p>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import API from "../../request/api";

const router = useRouter();

// 响应式数据
const showRule = ref(false);
const showRandomPopup = ref(false); // 机选弹窗
const redBalls = ref([]);
const blueBalls = ref([]);
const currentPeriod = ref("XXXXX");
const countdownDisplay = ref("06:38:31");

// 开奖历史相关
const showHistory = ref(false);
const historyData = ref([]);

// 倒计时相关
let countdownTimer = null;
const targetTime = ref(new Date().getTime() + 6 * 3600 * 1000 + 38 * 60 * 1000 + 31 * 1000);

// 组合数计算函数
function combination(n, r) {
  if (r > n || r < 0) return 0;
  if (r === 0 || r === n) return 1;

  let result = 1;
  for (let i = 0; i < r; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

// 计算属性
const canConfirm = computed(() => {
  return redBalls.value.length >= 5 && blueBalls.value.length >= 2;
});

// 计算注数
const betCount = computed(() => {
  const redCount = redBalls.value.length;
  const blueCount = blueBalls.value.length;

  if (redCount < 5 || blueCount < 2) {
    return 0;
  }

  const redCombinations = combination(redCount, 5);
  const blueCombinations = combination(blueCount, 2);

  return redCombinations * blueCombinations;
});

// 计算金额
const betAmount = computed(() => {
  return betCount.value * 2;
});

// 红球选择逻辑
function toggleRedBall(num) {
  const index = redBalls.value.indexOf(num);
  if (index > -1) {
    // 已选中，取消选择
    redBalls.value.splice(index, 1);
  } else {
    // 未选中，检查是否超过限制

    redBalls.value.push(num);
  }
}

// 蓝球选择逻辑
function toggleBlueBall(num) {
  const index = blueBalls.value.indexOf(num);
  if (index > -1) {
    // 已选中，取消选择
    blueBalls.value.splice(index, 1);
  } else {
    blueBalls.value.push(num);
  }
}

// 清空选择
function clearAll() {
  redBalls.value = [];
  blueBalls.value = [];
}

// 确认选择
function confirmSelection() {
  if (!canConfirm.value) {
    showToast("请至少选择5个红球和2个蓝球");
    return;
  }

  const redSorted = [...redBalls.value].sort((a, b) => a - b);
  const blueSorted = [...blueBalls.value].sort((a, b) => a - b);

  // 判断是单式还是复式
  // 单式：前区正好5个 + 后区正好2个
  // 复式：前区超过5个 或 后区超过2个
  const isSingle = redSorted.length === 5 && blueSorted.length === 2;
  const playType = isSingle ? "大乐透-单式" : "大乐透-复式";

  // 生成所有组合（用于显示）
  const combinations = [];

  // 生成前区所有5个号码的组合
  const redCombinations = generateCombinations(redSorted, 5);
  // 生成后区所有2个号码的组合
  const blueCombinations = generateCombinations(blueSorted, 2);

  // 组合前区和后区
  for (const redCombo of redCombinations) {
    for (const blueCombo of blueCombinations) {
      const comboStr = redCombo.map(n => String(n).padStart(2, '0')).join(' ') +
                       ' + ' +
                       blueCombo.map(n => String(n).padStart(2, '0')).join(' ');
      combinations.push(comboStr);
    }
  }

  // 准备大乐透数据
  const lotteryData = {
    type: 'daletou',
    gameName: playType,
    period: currentPeriod.value,
    // API格式：[{front: [前区数组], back: [后区数组]}]
    betData: [{
      front: redSorted,
      back: blueSorted
    }],
    // 用于显示
    selections: {
      red: redSorted,
      blue: blueSorted
    },
    combinations: combinations,
    totalBets: betCount.value,
    singleAmount: 2 // 单注金额2元
  };

  // 跳转到确认页面
  router.push({
    path: '/lottery_bet',
    query: {
      data: JSON.stringify(lotteryData)
    }
  });
}

// 生成组合的辅助函数（C(n, r)）
function generateCombinations(arr, r) {
  if (r === 0) return [[]];
  if (arr.length === 0) return [];

  const result = [];

  function combine(start, combo) {
    if (combo.length === r) {
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

// 打开机选弹窗
function randomSelect() {
  showRandomPopup.value = true;
}

// 确认机选
function confirmRandomSelect(betCount) {
  if (!betCount) return;

  // 清空当前选择
  redBalls.value = [];
  blueBalls.value = [];

  // 根据注数生成随机组合
  if (betCount === 1) {
    // 随机1注：前区5个，后区2个 = 1注
    redBalls.value = generateRandomNumbers(1, 35, 5);
    blueBalls.value = generateRandomNumbers(1, 12, 2);
  } else if (betCount === 5) {
    // 随机5注：前区6个，后区2个 = C(6,5) × C(2,2) = 6 × 1 = 6注（接近5注）
    redBalls.value = generateRandomNumbers(1, 35, 6);
    blueBalls.value = generateRandomNumbers(1, 12, 2);
  } else if (betCount === 10) {
    // 随机10注：前区5个，后区3个 = C(5,5) × C(3,2) = 1 × 3 = 3注
    // 或者：前区6个，后区3个 = C(6,5) × C(3,2) = 6 × 3 = 18注
    // 或者：前区7个，后区2个 = C(7,5) × C(2,2) = 21 × 1 = 21注
    // 使用：前区6个，后区2个 = 6注，再加前区5个，后区3个 = 3注，共9注（接近10注）
    // 简化方案：前区8个，后区2个 = C(8,5) × C(2,2) = 56注（太多）
    // 最佳方案：前区6个，后区3个 = C(6,5) × C(3,2) = 6 × 3 = 18注（接近10注）
    redBalls.value = generateRandomNumbers(1, 35, 6);
    blueBalls.value = generateRandomNumbers(1, 12, 3);
  }

  // 排序
  redBalls.value.sort((a, b) => a - b);
  blueBalls.value.sort((a, b) => a - b);

  // 关闭弹窗
  showRandomPopup.value = false;
}

// 生成不重复的随机数数组
function generateRandomNumbers(min, max, count) {
  const numbers = [];
  while (numbers.length < count) {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(random)) {
      numbers.push(random);
    }
  }
  return numbers;
}

// 倒计时更新
function updateCountdown() {
  const now = new Date().getTime();
  const distance = targetTime.value - now;

  if (distance > 0) {
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownDisplay.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  } else {
    countdownDisplay.value = "00:00:00";
    clearInterval(countdownTimer);
  }
}

onMounted(() => {
  // 获取大乐透数据
  API.lottoHistory()
    .then((res) => {
      if (res.code === 1) {
        console.log("大乐透数据:", res.data);

        // 设置当前期号 
        if (res.data.phase) {
          currentPeriod.value = res.data.phase.phase;

          // 设置倒计时目标时间（endtime是秒级时间戳）
          targetTime.value = res.data.phase.endtime * 1000;

          // 启动倒计时
          countdownTimer = setInterval(updateCountdown, 1000);

          
          updateCountdown();
        }

        // 设置历史开奖记录
        if (res.data.done_phase && res.data.done_phase.length > 0) {
          historyData.value = res.data.done_phase.map(item => ({
            period: item.phase,
            redBalls: [
              item.front_n1,
              item.front_n2,
              item.front_n3,
              item.front_n4,
              item.front_n5
            ],
            blueBalls: [
              item.back_n1,
              item.back_n2
            ]
          }));
        }
      } else {
        showToast(res.msg || "获取历史数据失败");
      }
    })
    .catch((err) => {
      console.error("获取历史数据失败:", err);
      showToast(err.msg || "获取历史数据失败");
    });


});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});

// 切换开奖历史显示状态
function toggleHistory() {
  showHistory.value = !showHistory.value;
}

function onClickLeft() {
  router.back();
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f4f5f9;
  color: #0f172a;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 60px;
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

/* 倒计时区域 */
.countdown-section {
  background: linear-gradient(135deg, #fc3c3c, #ff6b6b);
  color: white;
  padding: 16px;
  margin: 8px 12px;
  border-radius: 12px;
  text-align: center;
}

.period-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.period-number {
  font-size: 1.1rem;
  font-weight: 600;
}

.countdown-label {
  font-size: 0.9rem;
}

.countdown-time {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: "Courier New", monospace;
}

/* 下注区域 */
.betting-section {
  padding: 0px 12px;
}

.ball-section {
  background: white;
  border-radius: 12px;
  padding: 16px 12px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.section-desc {
  font-size: 0.8rem;
  color: #666;
}

.selected-count {
  font-size: 0.8rem;
  color: #fc3c3c;
  font-weight: 500;
}

.ball-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.ball {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.red-ball {
  background: #fff;
  color: #ff1744;
  border: 1px solid #ff6f76;
}

.red-ball.selected {
  background: #ff1744;
  border-color: #ff3742;
  color: white;
}

.blue-ball {
  background: #ffffff;
  border: 1px solid #10aeff;
  color: #10aeff;
}

.blue-ball.selected {
  background: #10aeff;
  border-color: #10aeff;
  color: white;
  transform: scale(1.1);
}

/* 操作按钮区域 */
.action-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: white;
  padding: 0px;
  height: 4rem;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.clear-btn {
  flex: 1;
  background: white;
  font-size: 1rem;
  max-width: 80px;
  height: 4rem;
}

.confirm-btn {
  flex: 2;
  background: #fc3c3c;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  max-width: 80px;
  height: 4rem;
}

.confirm-btn:disabled {
  background: #ccc;
  opacity: 0.6;
}

/* 玩法说明弹窗 */
.rule-popup {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.rule-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.rule-content {
  flex: 1;
  overflow-y: auto;
}

.rule-item {
  margin-bottom: 24px;
}

.rule-item h3 {
  color: #fc3c3c;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.rule-item p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

/* 开奖历史样式 */
.history-section {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.7rem;
}

.history-item:last-child {
  border-bottom: none;
}

.history-period {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.history-balls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ball-group {
  display: flex;
  gap: 3px;
}

.history-ball {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  font-size: 0.6rem;
  font-weight: 500;
}

.history-ball.red-ball {
  color: #ff1744;
  border: 1px solid #ff6f76;
}

.history-ball.blue-ball {
  color: #10aeff;
  border: 1px solid #10aeff;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

/* 机选弹窗样式 */
.random-popup {
  padding: 10px 0;
}

.random-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.random-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.random-options {
  display: flex;
  gap: 12px;
}

.random-btn {
  flex: 1;
  padding: 14px 0;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  color: white;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(252, 60, 60, 0.3);
}

.random-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(252, 60, 60, 0.3);
}
</style>
