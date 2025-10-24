<template>
  <div class="page" role="main">
    <div class="mybg">
      <div class="user-info-bar">
        <div class="user-info-left">
          <img src="/icons/davatar.png" alt="" class="user-avatar small" v-show="!islogin" />
          <img src="/icons/avatar1.png" alt="" class="user-avatar small" v-show="islogin" />
          <div class="user-meta">
            <div class="user-name">
              {{ username }}
              <img src="/icons/copy.png" alt="" class="copy-icon" @click="copy(username)" v-if="islogin" />
            </div>
            <div class="user-follow-row">
              <div class="user-follow-item">
                <span class="user-follow-label">关注</span>
                <span class="user-follow-num">1</span>
              </div>

              <div class="user-follow-item">
                <span class="user-follow-label">粉丝</span>
                <span class="user-follow-num">12</span>
              </div>
            </div>
          </div>
        </div>
        <div class="user-setting" @click="router.push('/setting')">
          <van-icon name="setting-o" color="#000" size="28" />
        </div>
      </div>
    </div>

    <!-- 资金卡片 -->
    <div class="balance-card">
      <div class="balance-header">
        <div class="balance-title">余额（元）</div>
        <div class="balance-detail" @click="viewDetail">账目明细</div>
      </div>

      <div class="balance-amount">
        <div class="amount-text">100.00</div>
        <div class="balance-actions">
           <button class="action-btn withdraw-btn" @click="go('/withdraw')">提现</button>
          <button class="action-btn recharge-btn" @click="go('/recharge')">充值</button>
         
        </div>
      </div>

      <div class="balance-footer">
        <div class="reserved-text">预留金额（提现未处理与拼单保底金额累计）</div>
        <div class="reserved-amount">0元</div>
      </div>
    </div>
    <div style="height: 8px"></div>

    <!-- 功能入口卡片 -->
    <div class="function-grid">
      <div class="function-title">购彩记录</div>
      <div class="function-items">
        <div class="function-item" @click="go('/My_order')">
          <div class="function-icon">
            <img src="/icons/111.png" alt="我的订单" />
          </div>
          <div class="function-text">我的订单</div>
        </div>
        <div class="function-item" @click="goToMyInitiated">
          <div class="function-icon">
            <img src="/icons/222.png" alt="我发起的" />
          </div>
          <div class="function-text">我发起的</div>
        </div>
        <div class="function-item" @click="goToMyFollow">
          <div class="function-icon">
            <img src="/icons/333.png" alt="我的跟单" />
          </div>
          <div class="function-text">我的跟单</div>
        </div>
        <div class="function-item" @click="goToMyGroup">
          <div class="function-icon">
            <img src="/icons/444.png" alt="我的拼单" />
          </div>
          <div class="function-text">我的拼单</div>
        </div>
        <div class="function-item" @click="goToMyParticipated">
          <div class="function-icon">
            <img src="/icons/555.png" alt="我参与的" />
          </div>
          <div class="function-text">我参与的</div>
        </div>
      </div>
    </div>

    <!-- 轮播banner -->
    <div style="padding: 0rem 1rem 0.4rem 1rem; border-radius: 1rem">
      <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
        <van-swipe-item>
          <img src="/img/my1.png" alt="" style="width: 100%; border-radius: 1rem" />
        </van-swipe-item>
        <van-swipe-item>
          <img src="/img/my2.png" alt="" style="width: 100%; border-radius: 1rem" />
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="function-grid">
      <div class="function-title">常用工具</div>
      <div class="function-items">
        <div class="function-item" @click="goToOrders">
          <div class="function-icon1">
            <img src="/icons/my11.png" alt="店主认证" />
          </div>
          <div class="function-text">店主认证</div>
        </div>
        <div class="function-item" @click="go('/authentication')">
          <div class="function-icon1">
            <img src="/icons/my22.png" alt="实名认证" />
          </div>
          <div class="function-text">实名认证</div>
        </div>
        <div class="function-item" @click="goToMyFollow">
          <div class="function-icon1">
            <img src="/icons/my44.png" alt="卡包中心" />
          </div>
          <div class="function-text">卡包中心</div>
        </div>
        <div class="function-item" @click="goToMyGroup">
          <div class="function-icon1">
            <img src="/icons/my33.png" alt="帮助中心" />
          </div>
          <div class="function-text">消息中心</div>
        </div>
      </div>
      <div class="function-items">
        <div class="function-item" @click="goToOrders">
          <div class="function-icon1">
            <img src="/icons/my55.png" alt="邀请店主" />
          </div>
          <div class="function-text">邀请店主</div>
        </div>
        <div class="function-item" @click="goToMyInitiated">
          <div class="function-icon1">
            <img src="/icons/my66.png" alt="邀请好友" />
          </div>
          <div class="function-text">邀请好友</div>
        </div>
        <div class="function-item" @click="goToMyFollow">
          <div class="function-icon1">
            <img src="/icons/my77.png" alt="邀请记录" />
          </div>
          <div class="function-text">邀请记录</div>
        </div>
        <div class="function-item" @click="goToMyGroup">
          <div class="function-icon1">
            <img src="/icons/my88.png" alt="客服中心" />
          </div>
          <div class="function-text">客服中心</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const router = useRouter();
const islogin = ref(false);
const username = ref("请登录");

function go(path) {
  router.push(path);
}

onMounted(() => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      username.value = user.nickname || user.username || "用户";
    } catch {
      username.value = "请登录";
    }
  } else {
    username.value = "请登录";
  }
  if (token) {
    islogin.value = true;
  } else {
    router.push("/login");
  }
});
</script>

<style scoped>
/* 全局样式 */
.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  color: #0f172a;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
}

.mybg {
  width: 100%;
  height: 200px;
  background-size: cover;
  margin-bottom: 30px;
  background-color: #fff;
  display: flex;
  align-items: flex-start;
}

.user-info-bar {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.2rem 1.1rem 0.7rem 1.1rem;
  box-sizing: border-box;
}

.user-info-left {
  display: flex;
  align-items: center;
}

.user-avatar.small {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  background: #fff;
  margin-right: 10px;
  border: 1px solid #fff;
}

.user-meta {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.user-name {
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 600;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.copy-icon {
  width: 18px;
  height: 18px;
  margin-left: 6px;
  font-weight: 600;
  color: #fff;
  vertical-align: middle;
  cursor: pointer;
}

.user-follow-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-follow-item {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.user-follow-num {
  font-size: 0.8rem;
  color: #ff4901;
  line-height: 1.1;
  font-weight: 900;
}

.user-follow-label {
  font-size: 0.75rem;
  color: #000;
  margin-left: 1px;
  letter-spacing: 0.5px;
}

.user-setting {
  display: flex;
  align-items: center;
  cursor: pointer;

  border-radius: 50%;
  padding: 6px;
}

.user-setting :deep(.van-icon) {
  font-size: 22px !important;
}

.user-setting:hover {
  background: rgba(0, 0, 0, 0.18);
}

/* 资金卡片样式 */
.balance-card {
  margin: -9.4rem 0.8rem 0.8rem 0.8rem;
  padding: 0.5rem 0.8rem;
  background: linear-gradient(135deg, #ff260e 0%, #fc3c3c 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(244, 215, 170, 0.3);
  position: relative;
  overflow: hidden;
}

.balance-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.balance-title {
  font-size: 0.8rem;
  color: #fff;
  font-weight: 600;
}

.balance-detail {
  font-size: 0.7rem;
  color: #fff;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.2s;
}

.balance-detail:hover {
  background: rgba(255, 255, 255, 0.6);
}

.balance-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}

.amount-text {
  font-size: 1.7rem;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(139, 105, 20, 0.1);
}

.balance-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 5px 20px;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.recharge-btn {
  background: linear-gradient(135deg, #feeeda, #f6baa5);
  color: #873303;
}

.recharge-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 107, 0.3);
}

.withdraw-btn {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
  color: white;
}

.withdraw-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(78, 205, 196, 0.3);
}

.balance-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.3rem;
}

.reserved-text {
  font-size: 0.75rem;
  color: #fff;
  flex: 1;
  margin-right: 1rem;
}

.reserved-amount {
  font-size: 0.9rem;
  color: #fff;
  font-weight: 600;
}

/* 功能入口样式 */
.function-grid {
  background: #fff;
  margin: 0 0.8rem 0.6rem 0.8rem;
  border-radius: 12px;
  padding: 0.9rem 0.2rem;
}

.function-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  text-align: left;
  padding-left: 0.6rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.function-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.function-item:hover {
  transform: translateY(-2px);
}

.function-item:active {
  transform: translateY(0);
}

.function-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.function-icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.function-icon1 {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.function-icon1 img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.function-text {
  font-size: 0.75rem;
  color: #333;
  text-align: center;
  font-weight: 400;
  line-height: 1.6;
}

.function-item:hover .function-text {
  color: #333;
}

.my-swipe .van-swipe-item {
  color: #fff;
  font-size: 20px;
  text-align: center;
}

/* 横幅适配 */
.banner-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0.9rem 1.2rem 0.9rem;
  gap: 3%;
}

.banner-bg {
  width: 49%;
  height: 72px;
  border-radius: 10px;
  background: url("/img/bg1.png") center center/cover no-repeat;
  position: relative;
  overflow: hidden;
}

.banner-bg1 {
  width: 49%;
  height: 72px;
  border-radius: 10px;
  background: url("/img/bg2.png") center center/cover no-repeat;
  position: relative;
  overflow: hidden;
}

.banner-content {
  color: #000;
  text-align: end;
  padding: 10px 12px 12px 12px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.banner-title {
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

.banner-desc {
  font-size: 0.78rem;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}

/* 响应式适配 */
@media (max-width: 375px) {
  .function-grid {
    padding: 1rem;
  }

  .function-icon img {
    width: 28px;
    height: 28px;
  }

  .function-text {
    font-size: 0.7rem;
  }
}
</style>
