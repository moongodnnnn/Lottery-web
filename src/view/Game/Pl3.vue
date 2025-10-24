<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="排列3" left-arrow @click-left="onClickLeft" class="nav-bar">
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
            <span class="ball-group pl3-group">
              <span v-for="(num, index) in item.numbers" :key="index" class="history-ball pl3-ball">{{ num }}</span>
            </span>
          </div>
        </div>
      </div>
    </transition>

    <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px">
      <div style="font-size: 0.85rem">选择号码</div>
      <div style="padding: 8px 12px; background-color: #fff; border-radius: 6px; font-size: 0.8rem" @click="randomSelect">
        机选 <van-icon name="arrow-down" />
      </div>
    </div>

    <!-- 下注区域 -->
    <div class="betting-section">
      <!-- 百位 -->
      <div class="ball-section">
        <div class="section-header">
          <span class="section-title">百位</span>
          <span class="section-count">已选 {{ hundredBalls.length }} 个</span>
        </div>
        <div class="ball-grid-pl3">
          <div
            v-for="num in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="'hundred-' + num"
            :class="['ball', 'pl3-ball', { selected: hundredBalls.includes(num) }]"
            @click="toggleHundredBall(num)"
          >
            {{ num }}
          </div>
        </div>
      </div>

      <!-- 十位 -->
      <div class="ball-section">
        <div class="section-header">
          <span class="section-title">十位</span>
          <span class="section-count">已选 {{ tenBalls.length }} 个</span>
        </div>
        <div class="ball-grid-pl3">
          <div
            v-for="num in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="'ten-' + num"
            :class="['ball', 'pl3-ball', { selected: tenBalls.includes(num) }]"
            @click="toggleTenBall(num)"
          >
            {{ num }}
          </div>
        </div>
      </div>

      <!-- 个位 -->
      <div class="ball-section">
        <div class="section-header">
          <span class="section-title">个位</span>
          <span class="section-count">已选 {{ unitBalls.length }} 个</span>
        </div>
        <div class="ball-grid-pl3">
          <div
            v-for="num in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"
            :key="'unit-' + num"
            :class="['ball', 'pl3-ball', { selected: unitBalls.includes(num) }]"
            @click="toggleUnitBall(num)"
          >
            {{ num }}
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
            <span v-if="!canConfirm">百位、十位、个位至少各选1个</span>
            <span v-else>百{{ hundredBalls.length }} 十{{ tenBalls.length }} 个{{ unitBalls.length }}</span>
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
          <div class="random-btn" @click="confirmRandomSelect(6)">随机6注</div>
          <div class="random-btn" @click="confirmRandomSelect(10)">随机10注</div>
        </div>
      </div>
    </van-popup>

    <!-- 玩法说明弹窗 -->
    <van-popup v-model:show="showRule" position="bottom" :style="{ height: '60%' }">
      <div class="rule-popup">
        <div class="rule-header">
          <span class="rule-title">排列3玩法说明</span>
          <van-icon name="cross" @click="showRule = false" />
        </div>
        <div class="rule-content">
          <div class="rule-item">
            <h3>玩法介绍</h3>
            <p>排列3是从百位、十位、个位三个位置分别选择0-9的数字进行投注的玩法。</p>
          </div>
          <div class="rule-item">
            <h3>投注规则</h3>
            <p>• 百位：从0-9中至少选择1个号码</p>
            <p>• 十位：从0-9中至少选择1个号码</p>
            <p>• 个位：从0-9中至少选择1个号码</p>
            <p>• 单注金额：2元</p>
            <p>• 注数计算：百位数量 × 十位数量 × 个位数量</p>
          </div>
          <div class="rule-item">
            <h3>开奖时间</h3>
            <p>每天晚上20:30开奖</p>
          </div>
          <div class="rule-item">
            <h3>示例</h3>
            <p>选择百位：1、2，十位：3，个位：4、5</p>
            <p>共2×1×2=4注，金额8元</p>
            <p>组合：134、135、234、235</p>
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
const hundredBalls = ref([]); // 百位
const tenBalls = ref([]); // 十位
const unitBalls = ref([]); // 个位
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
  return hundredBalls.value.length >= 1 && tenBalls.value.length >= 1 && unitBalls.value.length >= 1;
});

// 计算注数
const betCount = computed(() => {
  const hundredCount = hundredBalls.value.length;
  const tenCount = tenBalls.value.length;
  const unitCount = unitBalls.value.length;

  if (hundredCount < 1 || tenCount < 1 || unitCount < 1) {
    return 0;
  }

  // 排列3注数 = 百位数量 × 十位数量 × 个位数量
  return hundredCount * tenCount * unitCount;
});

// 计算金额
const betAmount = computed(() => {
  return betCount.value * 2;
});

// 百位选择逻辑
function toggleHundredBall(num) {
  const index = hundredBalls.value.indexOf(num);
  if (index > -1) {
    hundredBalls.value.splice(index, 1);
  } else {
    hundredBalls.value.push(num);
    hundredBalls.value.sort((a, b) => a - b);
  }
}

// 十位选择逻辑
function toggleTenBall(num) {
  const index = tenBalls.value.indexOf(num);
  if (index > -1) {
    tenBalls.value.splice(index, 1);
  } else {
    tenBalls.value.push(num);
    tenBalls.value.sort((a, b) => a - b);
  }
}

// 个位选择逻辑
function toggleUnitBall(num) {
  const index = unitBalls.value.indexOf(num);
  if (index > -1) {
    unitBalls.value.splice(index, 1);
  } else {
    unitBalls.value.push(num);
    unitBalls.value.sort((a, b) => a - b);
  }
}

// 清空选择
function clearAll() {
  hundredBalls.value = [];
  tenBalls.value = [];
  unitBalls.value = [];
}

// 确认选择
function confirmSelection() {
  if (!canConfirm.value) {
    showToast("百位、十位、个位至少各选1个");
    return;
  }

  // 判断是单式还是复式
  // 单式：百位、十位、个位各选1个
  // 复式：任意位置选择超过1个
  const isSingle = hundredBalls.value.length === 1 && tenBalls.value.length === 1 && unitBalls.value.length === 1;
  const playType = isSingle ? '直选单式' : '直选复式';

  // 生成所有组合
  const combinations = [];
  for (const h of hundredBalls.value) {
    for (const t of tenBalls.value) {
      for (const u of unitBalls.value) {
        combinations.push(`${h}${t}${u}`);
      }
    }
  }

  // 准备数字彩票数据（新格式）
  const lotteryData = {
    type: 'pl3', // 彩票类型
    gameName: playType, // 直选单式 或 直选复式
    period: currentPeriod.value,
    // 新格式：zx直选、z3组3、z6组6
    betData: {
      zx: [{
        1: hundredBalls.value,  // 百位
        2: tenBalls.value,       // 十位
        3: unitBalls.value       // 个位
      }],
      z3: [],  // 组3（暂不支持）
      z6: []   // 组6（暂不支持）
    },
    // 保留原有格式用于显示
    selections: {
      hundred: hundredBalls.value,
      ten: tenBalls.value,
      unit: unitBalls.value
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

// 打开机选弹窗
function randomSelect() {
  showRandomPopup.value = true;
}

// 确认机选
function confirmRandomSelect(betCount) {
  if (!betCount) return;
  // 清空当前选择
  hundredBalls.value = [];
  tenBalls.value = [];
  unitBalls.value = [];

  // 根据注数生成随机组合
  if (betCount === 1) {
    // 随机1注：每个位置选1个号码
    hundredBalls.value = [Math.floor(Math.random() * 10)];
    tenBalls.value = [Math.floor(Math.random() * 10)];
    unitBalls.value = [Math.floor(Math.random() * 10)];
  } else if (betCount === 6) {
    // 随机6注：可以是 1×2×3 或 1×1×6 或 2×3×1 等组合
    // 使用 1×2×3 组合
    hundredBalls.value = [Math.floor(Math.random() * 10)];

    const availableTen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * availableTen.length);
      tenBalls.value.push(availableTen[randomIndex]);
      availableTen.splice(randomIndex, 1);
    }

    const availableUnit = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * availableUnit.length);
      unitBalls.value.push(availableUnit[randomIndex]);
      availableUnit.splice(randomIndex, 1);
    }
  } else if (betCount === 10) {
    // 随机10注：可以是 1×2×5 或 2×5×1 或 1×5×2 等组合
    // 使用 1×2×5 组合
    hundredBalls.value = [Math.floor(Math.random() * 10)];

    const availableTen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * availableTen.length);
      tenBalls.value.push(availableTen[randomIndex]);
      availableTen.splice(randomIndex, 1);
    }

    const availableUnit = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * availableUnit.length);
      unitBalls.value.push(availableUnit[randomIndex]);
      availableUnit.splice(randomIndex, 1);
    }
  }

  // 排序
  hundredBalls.value.sort((a, b) => a - b);
  tenBalls.value.sort((a, b) => a - b);
  unitBalls.value.sort((a, b) => a - b);

  // 关闭弹窗
  showRandomPopup.value = false;
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
  // 获取彩票数据
  API.lottery_pailie(0)
    .then((res) => {
      if (res.code === 1) {
        console.log("排列3数据:", res.data);

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
            numbers: [
              String(item.xuhao1),
              String(item.xuhao2),
              String(item.xuhao3)
            ]
          }));
        }
      } else {
        showToast(res.msg || "获取期号失败");
      }
    })
    .catch((err) => {
      console.error("获取排列3数据失败:", err);
      showToast(err.msg || "获取期号失败");
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
  padding: 14px 12px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.section-desc {
  font-size: 0.8rem;
  color: #666;
}

.section-count {
  font-size: 0.85rem;
  color: #a8a8a8;
  font-weight: 500;
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

.ball-grid-pl3 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  max-width: 100%;
  justify-items: center;
  align-items: center;
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

.ball-grid-pl3 .ball {
  width: 100%;
  max-width: 2.3rem;
  height: 2.3rem;
  aspect-ratio: 1;
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

/* 排列3球样式 */
.pl3-ball {
  background: #fff;
  color: #fc3c3c;
  border: 1px solid #ffcccc;
  font-size: 1rem;
}

.pl3-ball.selected {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  border-color: #fc3c3c;
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

/* 机选弹窗 */
.random-popup {
  padding: 10px 0;
}

.random-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.random-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.random-options {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.random-btn {
  flex: 1;
  padding: 10px 8px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
  color: rgb(75, 75, 75);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.random-btn:active {
  transform: scale(0.95);
  opacity: 0.8;
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

.history-ball.pl3-ball {
  color: #fc3c3c;
  border: 1px solid #ffcccc;
  background: #fff5f5;
  font-weight: 600;
}

.pl3-group {
  display: flex;
  gap: 6px;
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
</style>
