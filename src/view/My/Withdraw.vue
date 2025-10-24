<template>
  <div class="page" role="main">
 

    <div class="nav-bar-center-wrap">
      <van-nav-bar title="提现" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="withdraw-content">
      <!-- 第一部分：银行卡卡片（上下渐变） -->
      <div class="gradient-card">
        <div class="card-left" @click="onAddCard"><img src="/icons/bankcard.png" alt="" class="bank-icon" /> 请添加银行卡</div>
        <div class="card-right" @click="onModifyCard">修改</div>
      </div>

      <!-- 第二部分：提现区域 -->
      <div class="section">
        <div class="row between">
          <div class="label-strong">提现金额</div>
          <div class="muted">
            ￥<span style="font-size: 1rem"> {{ balanceDisplay }} </span>
          </div>
        </div>
        <div class="row"></div>
        <div class="row input-with-addon">
          <input
            class="underline-input flex-1"
            v-model="amount"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            placeholder="请输入提现金额"
            @input="onAmountInput"
          />
          <div @click="withdrawAll" style="font-size: 14px; color: #c8381d; width: 80px">全部提现</div>
        </div>
      </div>

      <!-- 第三部分：手机验证码 -->
      <div class="section">
        <div class="row code-inline">
          <input
            class="underline-input flex-1"
            v-model="smsCode"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="请输入手机验证码"
          />
          <button type="button" class="sms-btn" :disabled="sending" @click="sendmsg">{{ pintext }}</button>
        </div>
      </div>
    </div>

    <!-- 底部固定确认按钮 -->
    <div class="confirm-fixed">
      <button class="confirm-btn" :disabled="!canSubmit" type="button" @click="onConfirm">发起后2小时内到账,确认提款</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
// 银行卡操作（静态占位）
function onAddCard() {}
function onModifyCard() {}

// 金额与余额
const amount = ref("");
const balance = ref(12345.67);
const balanceDisplay = computed(() => `${balance.value.toFixed(2)}`);

function onAmountInput(e) {
  // 允许数字与小数点，限制为两位小数
  const raw = (e.target?.value || "").replace(/[^0-9.]/g, "");
  const parts = raw.split(".");
  const intPart = parts[0].replace(/^0+(\d)/, "$1");
  const decimalPart = parts[1] ? parts[1].slice(0, 2) : "";
  amount.value = decimalPart !== "" ? `${intPart}.${decimalPart}` : intPart;
}

function withdrawAll() {
  amount.value = balance.value.toFixed(2);
}

// 短信验证码（同步注册页实现）
const smsCode = ref("");
const pintext = ref("获取验证码");
const sending = ref(false);
const countdown = ref(0);
let timer = null;

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startCountdown(sec = 60) {
  sending.value = true;
  countdown.value = sec;
  pintext.value = `${countdown.value}s`;
  clearTimer();
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value > 0) {
      pintext.value = `${countdown.value}s`;
    } else {
      clearTimer();
      sending.value = false;
      pintext.value = "获取验证码";
    }
  }, 1000);
}

function sendmsg() {
  if (sending.value) return;
  // 这里后续可接入实际发送验证码接口
  startCountdown(60);
}

// 提交按钮可用条件
const canSubmit = computed(() => {
  const amt = parseFloat(amount.value);
  return !!smsCode.value && !isNaN(amt) && amt > 0;
});

// 提交占位（后续接入接口）
function onConfirm() {}

function onClickLeft() {
  router.back();
}

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei", "Segoe UI", Roboto, Arial, "Helvetica Neue", sans-serif;
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

/* 顶部栏 */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  background: #ffffff;
  padding: 0 12px;
}
.back-btn {
  background: transparent;
  border: none;
  color: #c8381d;
  font-size: 14px;
  padding: 6px 8px;
  cursor: pointer;
}
.topbar-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}
.topbar-spacer {
  width: 40px;
}

/* 页面内容容器 */
.withdraw-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gradient-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 14px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(180deg, #bd4949, #de7862);
}
.card-left {
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 3px;
}
.card-right {
  font-size: 12px;
  opacity: 0.9;
  cursor: pointer;
}

.section {
  background: #fff;
  border-radius: 10px;
  padding: 14px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.between {
  justify-content: space-between;
  padding-bottom: 10px;
}
.label-strong {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.label {
  font-size: 13px;
  color: #6b7280;
}
.muted {
  font-size: 0.8rem;
  color: #6b7280;
}
.flex-1 {
  flex: 1 1 auto;
}

/* 银行卡 */
.bank-icon {
  width: 42px;
  height: 42px;
  border-radius: 4px;
  margin-right: 8px;
}
.add-card {
  margin-top: 10px;
  font-size: 13px;
  color: #d32121;
  background-color: #fff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* 提现金额 */
.underline-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  border-bottom: 1px solid #dddddd;
  padding: 8px 0 10px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #131313;
}
.underline-input::placeholder {
  color: #b2b2b2;
  font-size: 14px;
}

.input-with-addon {
  gap: 10px;
}
.inline-btn {
  color: #c8381d;
  font-size: 12px;
  padding: 6px 10px;
}

/* 验证码 */
.code-inline {
  gap: 10px;
}
.sms-btn {
  white-space: nowrap;
  border: 1px solid #e5e7eb;
  background: #c8381d;
  color: #fff;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

/* 底部确认 */
.confirm-fixed {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 430px;
  background: #ffffff;
  padding: 10px 12px 12px 12px;
  border-top: 1px solid #f3f4f6;
}
.confirm-btn {
  display: block;
  width: 90%;
  height: 48px;
  font-size: 14px;
  margin: 0 auto;
  border-radius: 8px;
  background: #d32121;
  color: #ffffff;
  border: none;
  letter-spacing: 1px;
}
.confirm-btn:disabled {
  opacity: 0.6;
}

/* 预留：无弹窗版本，无需样式 */
</style>
