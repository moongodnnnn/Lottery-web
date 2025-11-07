<template>
  <div class="page">
    <!-- 顶部标题 -->

    <div class="nav-bar-center-wrap">
      <van-nav-bar title="下单成功" left-arrow @click-left="goHome" class="nav-bar"> </van-nav-bar>
    </div>

    <!-- 主内容区域 -->
    <div class="content">
      <!-- 成功图标 -->
      <div class="success-icon">
        <van-icon name="checked" color="#5ac44c" size="80" />
      </div>

      <!-- 成功文字 -->
      <div class="success-text">
        <h2>付款成功 下单成功</h2>
        <p>已安排店铺接单，请注意查看订单状态</p>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <van-button type="primary" block @click="goHome" class="home-btn"> 返回首页 </van-button>
        <van-button type="default" block @click="goOrderDetail" class="order-btn"> 订单详情 </van-button>
      </div>

      <!-- 重要提示 -->
      <div class="tips-section">
        <div class="tips-header">
          <span>重要提示</span>
        </div>
        <div class="tips-content">
          <p>1、彩店是一家依托于实体彩票店的技术服务平台，所有投注均为实店出票(并可向投注用户提供个人投注所有相关实体票)。</p>
          <p>2、用户所有购彩方案实体票均由彩店代为保存，并且实时向用户提供，用户可随时检验自己购彩方案的实体票。</p>
          <p>3、如需查看实体票，可以在APP直接联系客服或者对应店主，客服与店主会第一时间出具相应购彩方案的实体票。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const orderId = route.query.orderId || "";

function goHome() {
  router.replace("/home");
}

function goOrderDetail() {
  router.replace("/My_order");
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #ffffff;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  padding-top: 60px;
}

/* 成功图标 */
.success-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 成功文字 */
.success-text {
  text-align: center;
  margin-bottom: 40px;
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

.success-text h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
}

.success-text p {
  font-size: 0.75rem;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  padding: 0 40px;
}

.home-btn {
  width: 100%;
  height: 44px;
  font-size: 0.9rem;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  border: none;
}

.order-btn {
  width: 100%;
  height: 44px;
  font-size: 0.9rem;
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

/* 重要提示 */
.tips-section {
  background: white;
  border-radius: 8px;
  padding: 12px;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.tips-content {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.6;
}

.tips-content p {
  margin: 0 0 10px 0;
}

.tips-content p:last-child {
  margin-bottom: 0;
}
</style>
