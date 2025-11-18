<template>
  <div class="page">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="订单详情" left-arrow @click-left="goBack" class="nav-bar" />
    </div>

    <div v-if="loading" class="loading-container">
      <van-loading size="24px">加载中...</van-loading>
    </div>

    <div v-else-if="orderDetail" class="content">
      <!-- 步骤条 -->
      <div class="steps-card">
        <div class="custom-steps">
          <div :class="['step-item', { 'active': getStepActive(orderDetail.status) >= 0 }]">
            <div class="step-circle"></div>
            <div class="step-line"></div>
            <div class="step-text">确认下单</div>
          </div>
          <div :class="['step-item', { 'active': getStepActive(orderDetail.status) >= 1 }]">
            <div class="step-circle"></div>
            <div class="step-line"></div>
            <div class="step-text">店铺接单</div>
          </div>
          <div :class="['step-item', { 'active': getStepActive(orderDetail.status) >= 2 }]">
            <div class="step-circle"></div>
            <div class="step-line"></div>
            <div class="step-text">出票成功</div>
          </div>
          <div :class="['step-item', { 'active': getStepActive(orderDetail.status) >= 3 }]">
            <div class="step-circle"></div>
            <div class="step-line"></div>
            <div class="step-text">订单开奖</div>
          </div>
          <div :class="['step-item', { 'active': getStepActive(orderDetail.status) >= 4 }]">
            <div class="step-circle"></div>
            <div class="step-text">订单派奖</div>
          </div>
        </div>
      </div>

      <!-- 金额信息卡片 -->
      <div class="amount-card">
        <div class="amount-row">
          <div class="amount-item">
            <div class="amount-label">支付金额</div>
            <div class="amount-value">¥{{ orderDetail.amount }}</div>
          </div>
          <div class="amount-item">
            <div class="amount-label">出票状态</div>
            <div class="amount-value">{{ getBillStatusText(orderDetail.bill_status) }}</div>
          </div>
          <div class="amount-item">
            <div class="amount-label">中奖奖金</div>
            <div class="amount-value">¥{{ orderDetail.reward_price }}</div>
          </div>
        </div>
      </div>

      <!-- 数字彩票投注内容 -->
      <div class="info-card" v-if="isDigitalLottery">
        <div class="card-header">
          <div class="card-title">{{ orderDetail.cate_name }} ({{ orderDetail.periods }}期)</div>
          <van-button size="mini" type="danger" plain @click="viewTicket">查看票样</van-button>
        </div>

        <!-- 大乐透 -->
        <div v-if="orderDetail.cate_id === 5" class="lottery-content">
          <div v-for="(item, index) in orderDetail.odds" :key="index" class="lottery-item">
          
            <div class="ball-zone">
              <span class="zone-label">前区</span>
              <div class="number-list">
                <span v-for="num in item.front" :key="'front-' + num" class="number-ball red-ball">
                  {{ String(num).padStart(2, '0') }}
                </span>
              </div>
            </div>
            <div class="ball-zone">
              <span class="zone-label">后区</span>
              <div class="number-list">
                <span v-for="num in item.back" :key="'back-' + num" class="number-ball blue-ball">
                  {{ String(num).padStart(2, '0') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 排列三 -->
        <div v-if="orderDetail.cate_id === 6" class="lottery-content">
          <div v-for="(item, index) in getPl3Odds()" :key="index" class="lottery-item">
          
            <div class="position-group" v-if="item['1']">
              <span class="position-label">百位</span>
              <div class="number-list">
                <span v-for="num in item['1']" :key="'h-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group" v-if="item['2']">
              <span class="position-label">十位</span>
              <div class="number-list">
                <span v-for="num in item['2']" :key="'t-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group" v-if="item['3']">
              <span class="position-label">个位</span>
              <div class="number-list">
                <span v-for="num in item['3']" :key="'u-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 排列五 -->
        <div v-if="orderDetail.cate_id === 7" class="lottery-content">
          <div v-for="(item, index) in orderDetail.odds" :key="index" class="lottery-item">
          
            <div class="position-group" v-if="item['1']">
              <span class="position-label">万位</span>
              <div class="number-list">
                <span v-for="num in item['1']" :key="'tt-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group" v-if="item['2']">
              <span class="position-label">千位</span>
              <div class="number-list">
                <span v-for="num in item['2']" :key="'th-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group" v-if="item['3']">
              <span class="position-label">百位</span>
              <div class="number-list">
                <span v-for="num in item['3']" :key="'h-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group" v-if="item['4']">
              <span class="position-label">十位</span>
              <div class="number-list">
                <span v-for="num in item['4']" :key="'t-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group" v-if="item['5']">
              <span class="position-label">个位</span>
              <div class="number-list">
                <span v-for="num in item['5']" :key="'u-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 比赛信息 -->
      <div class="info-card" v-if="orderDetail.games && orderDetail.games.length > 0">
        <div class="card-header">
          <div class="card-title">比赛信息</div>
          <van-button size="mini" type="danger" plain @click="viewTicket">查看票样</van-button>
        </div>
        <div v-for="game in orderDetail.games" :key="game.id" class="game-item">
          <div class="game-header">
            <span class="game-number">{{ game.xuhao }}</span>
            <span class="game-league">{{ game.match?.name }}</span>
            <span class="game-time">{{ game.date }}</span>
          </div>
          <div class="game-teams">
            <span class="team-name">{{ game.home_team_name }}</span>
            <span class="vs">VS</span>
            <span class="team-name">{{ game.guest_team_name }}</span>
          </div>
          
          <div class="bet-options">
            <div v-for="rate in game.rates" :key="rate.id" class="bet-option">
              <div class="option-type">{{ getRateTypeName(rate.rate_type) }}{{ rate.rangqiu === 1 ? '(让球)' : '' }}</div>
              <div class="option-items">
                <div
                  v-for="(option, key) in getFilteredOptions(rate)"
                  :key="key"
                  :class="['option-item', { 'selected': isSelected(key) }]"
                >
                  <span class="option-name">{{ option.name }}</span>
                  <span class="option-value">{{ option.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息和店铺信息 -->
      <div class="info-card">
        <div class="info-row">
          <span class="label">订单号</span>
          <span class="value">{{ orderDetail.ordersn }}</span>
        </div>
        <div class="info-row">
          <span class="label">下单时间</span>
          <span class="value">{{ formatDateTime(orderDetail.createtime) }}</span>
        </div>
        <div class="info-row">
          <span class="label">投注倍数</span>
          <span class="value">{{ orderDetail.multi }}倍</span>
        </div>
        <div class="info-row">
          <span class="label">注数</span>
          <span class="value">{{ orderDetail.nums }}注</span>
        </div>
        <div class="info-row" v-if="!isDigitalLottery">
          <span class="label">串关方式</span>
          <span class="value">{{ formatRules(orderDetail.rules) }}</span>
        </div>
        <div class="info-row" v-if="isDigitalLottery">
          <span class="label">期号</span>
          <span class="value">第{{ orderDetail.periods }}期</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-container">
      <van-empty description="订单不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast, ImagePreview } from "vant";
import API from "../../request/api";

const router = useRouter();
const route = useRoute();

const orderId = route.query.id || "";
const loading = ref(true);
const orderDetail = ref(null);

// 判断是否为数字彩票
const isDigitalLottery = computed(() => {
  if (!orderDetail.value) return false;
  // cate_id: 6=排列三, 5=大乐透, 7=排列五
  return [5, 6, 7].includes(orderDetail.value.cate_id);
});

// 获取排列三的 odds 数据
function getPl3Odds() {
  if (!orderDetail.value || !orderDetail.value.odds) return [];
  // 排列三的 odds 是对象格式 {zx: [...], z3: [], z6: []}
  if (orderDetail.value.cate_id === 6 && orderDetail.value.odds.zx) {
    return orderDetail.value.odds.zx;
  }
  return [];
}

onMounted(() => {
  console.log("订单详情页面 - 订单ID:", orderId);
  loadOrderDetail();
});

async function loadOrderDetail() {
  try {
    loading.value = true;
    const res = await API.order_detail(orderId);
    console.log("订单详情API响应:", res);
    
    if (res.code === 1) {
      orderDetail.value = res.data;
    } else {
      showToast(res.msg || "获取订单详情失败");
    }
  } catch (error) {
    console.error("获取订单详情失败:", error);
    showToast("获取订单详情失败");
  } finally {
    loading.value = false;
  }
}

// 获取步骤条激活状态
function getStepActive(status) {
  // status: 0=无效订单, 1=未接单, 2=已接单, 3=中奖, 4=未中奖
  // 步骤: 0=确认下单, 1=店铺接单, 2=出票成功, 3=订单开奖, 4=订单派奖
  const stepMap = {
    0: 0,  // 无效订单 - 确认下单
    1: 1,  // 未接单 - 店铺接单
    2: 2,  // 已接单 - 出票成功
    3: 4,  // 已中奖 - 订单派奖
    4: 3   // 未中奖 - 订单开奖
  };
  return stepMap[status] || 0;
}

// 获取出票状态文本
function getBillStatusText(billStatus) {
  const textMap = {
    "-3": "过点撤单",
    "0": "未接单",
    "1": "待出票",
    "2": "出票成功",
    "-1": "拒绝接单",
     "-2": "出票失败",
  };
  return textMap[billStatus] || "未知";
}

// 查看票样
function viewTicket() {
  if (orderDetail.value && orderDetail.value.bill_images && orderDetail.value.bill_images.length > 0) {
    // 如果有票样图片，则显示图片预览
    ImagePreview(orderDetail.value.bill_images);
  } else {
    // 如果没有票样图片，则提示用户
    showToast("票样照片店主暂未上传");
  }
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function getRateTypeName(rateType) {
  const nameMap = {
    "1": "胜平负",
    "2": "让球胜平负",
    "3": "比分",
    "4": "总进球",
    "5": "半全场"
  };
  return nameMap[rateType] || "未知玩法";
}

function isSelected(key) {
  if (!orderDetail.value || !orderDetail.value.odds) return false;
  return orderDetail.value.odds.includes(key);
}

// 过滤选项：比分、总进球、半全场只显示选中的，其他显示全部
function getFilteredOptions(rate) {
  const rateType = rate.rate_type;
  const rates = rate.rates;

  // 比分(3)、总进球(4)、半全场(5)只显示选中的选项
  if (rateType === "3" || rateType === "4" || rateType === "5") {
    const filtered = {};
    Object.keys(rates).forEach(key => {
      if (isSelected(key)) {
        filtered[key] = rates[key];
      }
    });
    return filtered;
  }

  // 其他玩法显示全部选项
  return rates;
}

// 格式化串关方式显示
function formatRules(rules) {
  if (!rules) return "未知";
  // 将 "3#1" 格式转换为 "3串1" 格式
  return rules.replace("#", "串");
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
}

.nav-bar-center-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
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

.loading-container,
.empty-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 100px;
}

.content {
  flex: 1;
  padding: 56px 10px 15px;
}

/* 步骤条卡片 */
.steps-card {
  background: white;
  border-radius: 8px;
  padding: 20px 12px;
  margin-bottom: 10px;
}

.custom-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.step-circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #e5e5e5;
  margin-bottom: 8px;
  z-index: 2;
}

.step-item.active .step-circle {
  background-color: #fc3c3c;
}

.step-line {
  position: absolute;
  top: 5px;
  left: 50%;
  width: 100%;
  height: 1px;
  background-color: #e5e5e5;
  z-index: 1;
}

.step-item.active .step-line {
  background-color: #fc3c3c;
}

.step-item:last-child .step-line {
  display: none;
}

.step-text {
  font-size: 0.75rem;
  color: #999;
  text-align: center;
  white-space: nowrap;
}

.step-item.active .step-text {
  color: #333;
  font-weight: 500;
}

/* 金额信息卡片 */
.amount-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
}

.amount-row {
  display: flex;
}

.amount-item {
  flex: 1;
  text-align: center;
}

.amount-label {
  font-size: 0.75rem;
  color: #333;
  padding: 12px 0;
  background-color: #faeadd;
}

.amount-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  padding: 14px 0;
  background-color: #fff8f6;
}

/* 信息卡片 */
.info-card {
  background: white;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 1px;
  border-bottom: 1px solid #f5f5f5;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 0.75rem;
}

.info-row .label {
  color: #999;
}

.info-row .value {
  color: #333;
  font-weight: 500;
}

/* 比赛信息 */
.game-item {
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.game-item:last-child {
  border-bottom: none;
}

.game-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 0.7rem;
}

.game-number {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  color: white;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
  font-size: 0.7rem;
}

.game-league {
  color: #666;
  font-size: 0.7rem;
}

.game-time {
  color: #999;
  margin-left: auto;
  font-size: 0.7rem;
}

.game-teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.team-name {
  font-weight: 600;
  color: #333;
}

.vs {
  color: #999;
  font-size: 0.7rem;
}

/* 投注选项 */
.bet-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bet-option {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 6px 8px;
}

.option-type {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.option-items {
  display: flex;
  gap: 6px;
}

.option-item {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  max-width: 30%;
}

.option-item.selected {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  border-color: #fc3c3c;
}

.option-item.selected .option-name,
.option-item.selected .option-value {
  color: white;
}

.option-name {
  font-size: 0.75rem;
   font-weight: 600;
  color: #333;
}

.option-value {
  font-size: 0.75rem;
  color: #fc3c3c;
}

/* 数字彩票样式 */
.lottery-type-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  padding: 3px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(252, 60, 60, 0.3);
}

.lottery-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.lottery-item {
  background: linear-gradient(135deg, #fff9f5 0%, #fff 100%);
  border-radius: 8px;
  padding: 0px;
  position: relative;
}

.lottery-label {
  font-size: 0.7rem;
  color: #999;
  margin-bottom: 8px;
  font-weight: 500;
}

.position-group {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.position-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.ball-zone {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.zone-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.number-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.number-ball {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(252, 60, 60, 0.2);
}

.red-ball {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
}

.blue-ball {
  background: linear-gradient(135deg, #1e90ff 0%, #4dabf7 100%);
}

.period-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-label {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.period-value {
  font-size: 0.8rem;
  color: #fc3c3c;
  font-weight: 600;
}
</style>

