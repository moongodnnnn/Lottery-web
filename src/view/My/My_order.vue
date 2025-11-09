<template>
  <div class="page" role="main">
    <!-- 顶部导航 -->
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="我的订单" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <!-- Tab分类 -->
    <div class="tabs-container">
      <van-tabs v-model:active="activeTab" @change="onTabChange" swipeable animated>
        <van-tab title="全部订单" name="all"></van-tab>
        <van-tab title="我发起的" name="initiated"></van-tab>
        <van-tab title="我的跟单" name="follow"></van-tab>
        <van-tab title="我的拼单" name="group"></van-tab>
        <van-tab title="我参与的" name="participated"></van-tab>
      </van-tabs>
    </div>

    <!-- 订单列表 -->
    <div class="orders-container">
      <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <!-- 订单卡片列表 -->
        <div class="orders-list">
          <div v-for="order in orders" :key="order.id" class="order-card" @click="viewOrderDetail(order)">
            <!-- 订单头部 -->
            <div class="order-header">
              <span class="game-badge">{{ order.cate_name }}</span>
              <span class="order-status" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>

            <!-- 订单内容 -->
            <div class="order-content">
              <!-- 第一行：下注日期和投注金额 -->
              <div class="order-main-row">
                <div class="order-date">
                  <span>{{ formatDate(order.createtime) }}</span>
                </div>
                <div class="order-amount">¥{{ order.amount }}</div>
              </div>

              <!-- 第二行：付款状态 -->
              <div class="order-pay-status-row">
                <div class="pay-status-left">
                  <span class="pay-status-label">付款状态</span>
                  <span class="pay-status-value" :class="{ 'unpaid': order.pay_status === 0 }">
                    {{ order.pay_status === 0 ? '未支付' : '已支付' }}
                  </span>
                </div>
                <van-button
                  v-if="order.pay_status === 0"
                  type="primary"
                  size="small"
                  class="pay-btn"
                  @click.stop="goPay(order)"
                >
                  去支付
                </van-button>
              </div>

              <!-- 第三行：中奖金额（仅中奖时显示） -->
              <div v-if="order.status === 3" class="order-prize-row">
                <span class="prize-label">中奖金额</span>
                <span class="prize-value">¥{{ order.reward_price }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && orders.length === 0" style="padding: 40px 20px; text-align: center">
          <van-empty description="暂无订单数据" />
        </div>
      </van-list>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import API from "../../request/api.js";

const router = useRouter();

// 返回上一页
function onClickLeft() {
  router.back();
}

// Tab相关
const activeTab = ref("all");
const loading = ref(false);
const finished = ref(false);
const orders = ref([]);
const page = ref(1);
const total = ref(0);

// Tab切换
function onTabChange(name) {
  console.log("切换到Tab:", name);
  // 重置数据
  orders.value = [];
  page.value = 1;
  finished.value = false;
  // 加载数据
  loadOrders();
}

// 上拉加载
function onLoad() {
  loadOrders();
}

// 加载订单数据
async function loadOrders() {
  try {
    // 根据不同的标签页传递不同的参数
    const params = { page: page.value };

    // 如果是"我发起的"标签页，传入 otype: 2
    if (activeTab.value === "initiated") {
      params.otype = 2;
    }

    const res = await API.get_order_list(params);
    console.log("订单列表:", res);

    if (res.code === 1 && res.data) {
      const newOrders = res.data.data || [];

      // 追加数据
      orders.value = [...orders.value, ...newOrders];

      // 更新分页信息
      total.value = res.data.total;
      page.value++;

      // 判断是否加载完成
      if (orders.value.length >= total.value) {
        finished.value = true;
      }

      loading.value = false;
    } else {
      showToast(res.msg || "加载订单失败");
      loading.value = false;
      finished.value = true;
    }
  } catch (error) {
    console.error("加载订单失败:", error);
    showToast("加载订单失败");
    loading.value = false;
    finished.value = true;
  }
}

// 获取状态样式类
function getStatusClass(status) {
  // status: 0=无效订单, 1=未接单, 2=已接单, 3=中奖, 4=未中奖
  const classMap = {
    0: "status-cancelled", // 无效订单 - 灰色
    1: "status-lost", // 未接单 - 灰色
    2: "status-pending", // 已接单 - 绿色
    3: "status-won", // 中奖 - 红色
    4: "status-lost", // 未中奖 - 灰色
  };
  return classMap[status] || "";
}

// 获取状态文本
function getStatusText(status) {
  // status: 0=无效订单, 1=未接单, 2=已接单, 3=中奖, 4=未中奖
  const textMap = {
    0: "无效订单",
    1: "未接单",
    2: "待开奖",
    3: "已中奖",
    4: "未中奖",
  };
  return textMap[status] || "未知";
}

// 格式化日期
function formatDate(timestamp) {
  // API返回的是秒级时间戳，需要转换为毫秒
  const date = new Date(timestamp * 1000);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

function viewOrderDetail(order) {
  router.push({ path: "/order_detail", query: { id: order.id } });
}

async function goPay(order) {
  try {
    const payRes = await API.toBalance({ id: order.id });
    if (payRes.code === 1) {
      showToast("支付成功");
      orders.value = [];
      page.value = 1;
      finished.value = false;
      loadOrders();
    } else {
      if (payRes.msg === "资金不足") {
        showDialog({
          message: "资金不足,去充值",
          messageAlign: "center",
          showCancelButton: true,
          confirmButtonText: "确认",
          cancelButtonText: "取消"
        })
          .then(() => {
            router.push('/recharge');
          })
          .catch(() => {
            console.log("用户取消充值");
          });
      } else {
        showToast(payRes.msg || "支付失败");
      }
    }
  } catch (error) {
    console.error("支付失败:", error);
    showToast("支付失败");
  }
}

onMounted(() => {
  // van-list会自动触发第一次加载
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
}

.nav-bar-center-wrap {
  background-color: #fff;
}

.nav-bar {
  background-color: #fff;
}

/* Tab容器 */
.tabs-container {
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}

:deep(.van-tabs__nav) {
  background-color: #fff;
}

:deep(.van-tab) {
  font-size: 0.85rem;
  color: #666;
}

:deep(.van-tab--active) {
  color: #fc3c3c;
  font-weight: 600;
}

:deep(.van-tabs__line) {
  background-color: #fc3c3c;
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

/* 订单容器 */
.orders-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 订单卡片 */
.order-card {
  background: white;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #f5f5f5;
}

.order-card:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.game-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.3px;
}

.order-status {
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-pending {
  color: #5ac44c;
}

.status-won {
  color: #fc3c3c;
}

.status-lost {
  color: #b3b3b3;
}

.status-cancelled {
  color: #b3b3b3;
}

/* 订单内容 */
.order-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 主要信息行（日期+金额） */
.order-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: #999;
}

.order-amount {
  font-size: 0.9rem;
  color: #333;
  letter-spacing: 0.5px;
}

/* 中奖金额行 */
.order-prize-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  margin-top: 2px;
}

.prize-label {
  font-size: 0.75rem;
  color: #ffffff;
}

.prize-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: #fc3c3c;
  letter-spacing: 0.5px;
}

.order-pay-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px;
  margin-top: 8px;
}

.pay-status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pay-status-label {
  font-size: 0.75rem;
  color: #666;
}

.pay-status-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #52c41a;
}

.pay-status-value.unpaid {
  color: #ff4d4f;
}

.pay-btn {
  background: #fc3c3c;
  border: none;
  border-radius: 4px;
  padding: 2px 12px;
  font-size: 0.7rem;
  height: 24px;
}
</style>
