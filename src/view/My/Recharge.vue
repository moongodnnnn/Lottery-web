<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="充值" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <!-- 充值内容 -->
    <div class="recharge-content">
      <!-- 充值金额输入 -->
      <div class="amount-section">
        <h3 class="section-title">充值金额</h3>
        <div style="display: flex; align-items: center">
          <div style="font-size: 1.2rem">￥</div>
          <div style="padding-left: 10px;">
            <input
              class="underline-input"
              v-model="rechargeAmount"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              placeholder="请输入充值金额"
              @input="onAmountInput"
            />
          </div>
        </div>

        <div class="quick-amount-section">
          <div class="quick-amounts">
            <div
              class="amount-btn"
              :class="{ active: selectedQuickAmount === amount }"
              v-for="amount in quickAmounts"
              :key="amount"
              @click="selectQuickAmount(amount)"
            >
              <img src="/icons/rmb.png" alt="" style="width: 16px; padding-right: 4px" />{{ amount }}
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷金额选择 -->
      <div class="quick-amount-section1">
        <div class="tips-section">
          <h4 class="tips-title" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: 800">温馨提示</h4>
          <div class="tips-content">
            <p style="color: #cd3619">1 未满18岁未成年人禁止充值与游戏;</p>
            <p>2 充值金额以奇数(1-3-5-7-9)结尾，将享受优先到账;</p>
            <p>3 已发起的充值必须完成支付，否则10分钟内不能再次发起请求;</p>
            <p>4 充值金额全部用于充入店主彩票机内进行出票，非整百金额可享优先到账，大额支付请联系店主;</p>
            <p>5 充值后如长时间不消费(10日)，钱款原路返还至充值账户上;</p>
          </div>
        </div>
      </div>

      <!-- 温馨提示 -->

      <div style="padding: 1px">
        <img src="/img/00001.png" alt="" style="width: 100%" />
      </div>

      <!-- 充值方式选择 -->
      <div class="payment-section">
        <h3 class="section-title">充值方式</h3>
        <van-radio-group v-model="selectedPayment" class="payment-options">
          <div class="payment-option" :class="{ active: selectedPayment === 'union1' }" @click="selectedPayment = 'union1'">
            <div  aria-hidden="true">
              <img src="/icons/bank.png" alt="" class="payment-leading-icon">
            </div>
            <span class="payment-text">银联快捷1</span>
            <div class="payment-spacer"></div>
            <van-radio class="radio-right" name="union1" :checked="selectedPayment === 'union1'">
              <template #icon="props">
                <div class="radio-icon" :class="{ checked: props.checked }"></div>
              </template>
            </van-radio>
          </div>
          <div class="payment-option" :class="{ active: selectedPayment === 'union2' }" @click="selectedPayment = 'union2'">
            <div  aria-hidden="true">
              <img src="/icons/bank.png" alt="" class="payment-leading-icon">
            </div>
            <span class="payment-text">银联快捷2</span>
            <div class="payment-spacer"></div>
            <van-radio class="radio-right" name="union2" :checked="selectedPayment === 'union2'">
              <template #icon="props">
                <div class="radio-icon" :class="{ checked: props.checked }"></div>
              </template>
            </van-radio>
          </div>
        </van-radio-group>
      </div>

      <!-- 确认充值按钮 -->
      <div class="confirm-section">
        <div class="confirm-note">禁止未成年人购彩，适度娱乐，理性购彩，切勿沉迷</div>
        <van-button type="primary" class="confirm-btn" :disabled="!canSubmit" @click="confirmRecharge"> 确认充值 </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { showToast, Dialog } from "vant";
import { useRouter } from "vue-router";
import { showConfirmDialog } from "vant";

const router = useRouter();

// 充值相关数据
const rechargeAmount = ref("");
const selectedQuickAmount = ref(null);
const selectedPayment = ref("union1");
const quickAmounts = [12, 27, 93, 245, 357, 985, 1667, 3868];

// 格式化输入金额
function onAmountInput(e) {
  const onlyDigits = (e.target?.value || "").replace(/\D/g, "");
  rechargeAmount.value = onlyDigits;
}

// 计算是否可以提交
const canSubmit = computed(() => {
  return rechargeAmount.value && parseFloat(rechargeAmount.value) > 0 && selectedPayment.value;
});

// 选择快捷金额
function selectQuickAmount(amount) {
  selectedQuickAmount.value = amount;
  rechargeAmount.value = amount.toString();
}

// 确认充值
function confirmRecharge() {
  if (!canSubmit.value) {
    showToast("请输入有效的充值金额");
    return;
  }

  const amount = parseFloat(rechargeAmount.value);
  if (amount < 10) {
    showToast("充值金额不能少于10元");
    return;
  }

  showConfirmDialog({
    title: "确认充值",
    message: `确认充值 ${amount} 元？\n支付方式：${selectedPayment.value === "union1" ? "银联快捷1" : "银联快捷2"}`,
  })
    .then(() => {
      // 处理充值逻辑
      showToast("正在跳转到支付页面...");
      // 这里可以调用充值API
      console.log("充值金额:", amount);
      console.log("支付方式:", selectedPayment.value);
    })
    .catch(() => {
      // 用户取消
    });
}

function onClickLeft() {
  router.back();
}

onMounted(() => {
  // 初始化页面数据
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f3f3f3;
  color: #0f172a;
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  max-width: 430px;
  margin: 0 auto;
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
.profile-list {
  margin: 12px 18px 0 18px;
  max-width: 430px;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}
.profile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  border-bottom: 1px solid #f2f2f2;
}
.profile-row:last-child {
  border-bottom: none;
}
.profile-label {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}
.profile-value {
  font-size: 0.9rem;
  color: #666;
}
.profile-action {
  font-size: 0.9rem;
  color: #d32121;
  font-weight: 500;
}
.profile-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #f5f5f5;
  background: #fff;
}
.logout-btn-wrap {
  margin: 36px 18px 0 18px;
}
.logout-btn {
  width: 100%;
  padding: 0.9rem 0;
  border-radius: 8px;
  border: none;
  background: linear-gradient(90deg, #dddddd, #d5d5d5);
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  letter-spacing: 2px;
  margin-top: 60px;
}
.pwd-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

/* 充值页面样式 */
.recharge-content {
  padding: 0.8rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 100px; /* 预留底部固定操作栏空间，避免内容被遮挡 */
}

.tips-section {
  padding-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* 充值金额输入区域 */
.amount-section {
  background: #fff;
  padding: 16px;
  border-radius: 12px;
}

/* 自定义原生输入框（仅底部横线） */
.underline-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  border-bottom: 1px solid #dddddd;
  padding: 6px 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #131313;
}

.underline-input::placeholder {
  color: #b2b2b2;
  font-size: 14px;
}

:deep(.van-cell) {
  padding: 0px 0px;
}




/* 快捷金额选择 */
.quick-amount-section {
  background: #fff;
  padding: 16px 0px 0px 0px;
  border-radius: 12px;
}

.quick-amount-section1 {
  background: #fff;
  padding: 12px 12px 0px 12px;
  border-radius: 12px;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.amount-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 8px;
  text-align: center;
  background: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}
.amount-btn.active {
  color: #e31919;
  border: 2px solid #e31919;
}
.amount-btn:hover {
  background: #fff;
}

.tips-title {
  font-size: 0.9rem;
  color: #000;
  margin: 0 0 10px 0;
}

.tips-content {
  font-size: 0.7rem;
  color: #b2b2b2;
  line-height: 1.4;
}

.tips-content p {
  margin: 4px 0;
}

/* 支付方式选择 */
.payment-section {
  background: #fff;
  padding: 12px 12px;
  border-radius: 8px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-option {
  padding: 8px 12px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
  cursor: pointer;
}

.payment-option.active {
  border-color: #d32121;
  background: #ffffff;
}

.payment-option:hover {
  border-color: #e0e0e0;
}

.payment-option.active:hover {
  border-color: #d32121;
}

.radio-icon {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  margin-right: 12px;
  position: relative;
  transition: all 0.2s;
}

.radio-icon.checked {
  border-color: #d32121;
  background: #d32121;
}

.radio-icon.checked::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
}

.payment-text {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}

/* 左侧图标占位，后续可替换为实际图标背景或 <img> */
.payment-leading-icon {
  width: 36px;
  height: 32px;
  border-radius: 6px;
  margin-right: 10px;
}

/* 让右侧单选按钮顶到最右 */
.payment-spacer {
  flex: 1 1 auto;
}

.radio-right {
  margin-left: 10px;
}

/* 确认充值按钮（固定底部） */
.confirm-section {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 430px;
  background: #ffffff;
  padding: 10px 12px 14px 12px;
}

.confirm-btn {
  width: 90%;
  height: 46px;
  font-size: 12px;
  margin: 0 auto;
  font-weight: 600;
  border-radius: 10px;
  background: #c8381d;
  border: none;
  letter-spacing: 1px;
  display: block;
}

.confirm-btn:disabled {
  background: #ccc;
  opacity: 0.6;
}

.confirm-note {
  text-align: center;
  color: #cd3619;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
}

.selected-dot {
  width: 8px;
  height: 8px;
  background-color: #d32121;
  border-radius: 50%;
  margin-left: 60%;
}
</style>
