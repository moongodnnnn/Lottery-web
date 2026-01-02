<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="提现" left-arrow @click-left="onClickLeft" class="nav-bar" :border="false" />
    </div>

    <div class="withdraw-content">
      <!-- 第一部分：收款方式选择 -->
      <div class="form-section">
        <div class="withdraw-to-row" @click="showAccountSheet = true">
          <div class="left-part">
            <span class="label-text">提现到</span>
            <div class="account-display" v-if="selectedAccount">
              <van-icon
                :name="selectedAccount.type === 'alipay' ? 'alipay' : selectedAccount.type === 'wechat' ? 'wechat-pay' : 'card'"
                size="22"
                :color="selectedAccount.type === 'alipay' ? '#1677ff' : selectedAccount.type === 'wechat' ? '#07c160' : '#ff9500'"
              />
              <span class="account-text"
                >{{ getAccountTypeName(selectedAccount.type) }} {{ selectedAccount.real_name }} ·
                {{ formatAccountDisplay(selectedAccount) }}</span
              >
            </div>
            <span class="placeholder-text" v-else>请选择收款方式</span>
          </div>
          <van-icon name="arrow" size="16" color="#c8c9cc" />
        </div>
      </div>

      <!-- 收款方式选择弹出层 -->
      <van-popup v-model:show="showAccountSheet" position="bottom" round :style="{ height: '40%' }">
        <div class="account-popup-header">
          <div class="popup-title">选择收款方式</div>
          <van-icon name="cross" size="20" @click="showAccountSheet = false" />
        </div>
        <div class="account-sheet-content">
          <!-- 收款方式列表 -->
          <div class="account-list">
            <div
              v-for="account in accountList"
              :key="account.id"
              class="account-item"
              :class="{ active: selectedAccount && selectedAccount.id === account.id }"
              @click="selectAccount(account)"
            >
              <van-icon
                :name="account.type === 'alipay' ? 'alipay' : account.type === 'wechat' ? 'wechat-pay' : 'card'"
                size="24"
                :color="account.type === 'alipay' ? '#1677ff' : account.type === 'wechat' ? '#07c160' : '#ff9500'"
              />
              <div class="account-item-info">
                <div class="account-item-detail">{{ account.real_name }} · {{ formatAccountDisplay(account) }}</div>
              </div>
              <van-icon v-if="selectedAccount && selectedAccount.id === account.id" name="success" size="20" color="#fc3c3c" />
            </div>
          </div>

          <!-- 添加收款方式按钮 -->
          <div class="add-account-btn" @click="onAddAccount">
            <van-icon name="plus" size="18" color="#fc3c3c" />
            <span>添加收款方式</span>
          </div>
        </div>
      </van-popup>

      <!-- 第二部分：提现金额 -->
      <div class="form-section">
        <div class="section-header">
          <div class="section-title">
            <span>提现金额</span>
          </div>
          <div class="info">预计2小时内到账</div>
        </div>
        <div class="amount-input-wrapper">
          <div class="amount-symbol">¥</div>
          <input
            class="amount-input"
            v-model="amount"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            placeholder="0.00"
            @input="onAmountInput"
          />
          <div class="all-btn" @click="withdrawAll">全部</div>
        </div>
        <div class="balance-info">可用余额 {{ balanceDisplay }} 元</div>
      </div>

      <!-- 第三部分：验证信息 -->
      <div class="form-section" style="padding: 4px 2px">
        <van-cell-group inset>
          <!-- 图形验证码 -->
          <van-field v-model="imgCode" center clearable label="图形验证码" placeholder="请输入图形验证码" maxlength="4">
            <template #button>
              <img @click="refreshImgCode" :src="imgurl" alt="图形验证码" class="captcha-img-inline" />
            </template>
          </van-field>

          <!-- 手机验证码 -->
          <van-field v-model="smsCode" center clearable label="短信验证码" placeholder="请输入短信验证码" type="digit" maxlength="6">
            <template #button>
              <van-button size="small" type="primary" :disabled="sending" @click="sendmsg">
                {{ pintext }}
              </van-button>
            </template>
          </van-field>
        </van-cell-group>
      </div>
    </div>

    <!-- 支付密码弹窗 -->
    <van-dialog
      v-model:show="showPasswordDialog"
      title="请输入支付密码"
      :show-confirm-button="false"
      :close-on-click-overlay="false"
      show-cancel-button
      @cancel="cancelPasswordInput"
    >
      <div class="password-dialog-content">
        <van-password-input :value="withdrawPassword" :focused="showKeyboard" @focus="showKeyboard = true" :gutter="8" :length="6" />
      </div>
    </van-dialog>

    <!-- 数字键盘 -->
    <van-number-keyboard v-model="withdrawPassword" :show="showKeyboard" @blur="showKeyboard = false" :maxlength="6" />

    <!-- 底部固定确认按钮 -->
    <div class="footer-fixed">
      <button class="submit-btn" :disabled="!canSubmit" type="button" @click="onConfirm">确认提现</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import API from "../../request/api";

const router = useRouter();

// 收款方式相关
const accountList = ref([]);
const selectedAccount = ref(null);
const showAccountSheet = ref(false);

// 获取收款方式列表
const getAccountList = async () => {
  const toast = showToast({
    type: "loading",
    message: "加载中...",
    forbidClick: true,
    duration: 0,
  });

  try {
    const res = await API.accountList();
    toast.close();

    if (res.code === 1 && res.data) {
      accountList.value = res.data;
      // 默认选中第一个
      if (accountList.value.length > 0) {
        selectedAccount.value = accountList.value[0];
      }
    } else {
      showToast(res.msg || "获取收款方式失败");
    }
  } catch (error) {
    toast.close();
    console.error("获取收款方式失败:", error);
    showToast("获取收款方式失败");
  }
};

// 获取账户类型名称
const getAccountTypeName = (type) => {
  const typeMap = {
    alipay: "支付宝",
    wechat: "微信",
    bank: "银行卡",
  };
  return typeMap[type] || type;
};

// 格式化账号显示
const formatAccountDisplay = (account) => {
  if (account.type === "bank") {
    // 银行卡显示后4位
    return `**** ${account.account.slice(-4)}`;
  } else {
    // 支付宝/微信显示账号
    if (/^\d{11}$/.test(account.account)) {
      // 手机号脱敏
      return account.account.slice(0, 3) + "****" + account.account.slice(-4);
    }
    return account.account;
  }
};

// 选择收款方式
const selectAccount = (account) => {
  selectedAccount.value = account;
  showAccountSheet.value = false;
};

// 添加收款方式
const onAddAccount = () => {
  router.push("/add-bank-card");
};

// 金额与余额
const amount = ref("");
const balance = ref(0);
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

// 用户手机号
const userMobile = ref("");

// 图形验证码
const imgCode = ref("");
const uniqid = ref("");
const imgurl = ref("");

// 短信验证码
const smsCode = ref("");
const pintext = ref("获取验证码");
const sending = ref(false);
const countdown = ref(0);
let timer = null;

// 提现密码
const withdrawPassword = ref("");
const showKeyboard = ref(false);
const showPasswordDialog = ref(false);

// 监听密码输入，输入满6位自动提交
watch(withdrawPassword, async (newVal) => {
  if (newVal.length === 6) {
    showKeyboard.value = false;
    // 自动提交提现
    await submitWithdraw();
  }
});

// 取消密码输入
const cancelPasswordInput = () => {
  withdrawPassword.value = "";
  showPasswordDialog.value = false;
  showKeyboard.value = false;
};

// 生成唯一ID
function getUniqId() {
  return Date.now().toString() + Math.floor(Math.random() * 100 + 1);
}

// 刷新图形验证码
function refreshImgCode() {
  uniqid.value = getUniqId();
  imgurl.value = `https://atc.lxwdlz.cn/index/captcha/index/id/${uniqid.value}`;
}

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

// 发送验证码
async function sendmsg() {
  if (sending.value) return;

  if (!userMobile.value) {
    showToast("无法获取手机号");
    return;
  }

  if (!imgCode.value) {
    showToast("请填写图形验证码");
    return;
  }

  try {
    const res = await API.sendSms({
      mobile: userMobile.value,
      event: "withdraw",
      captcha: imgCode.value,
      uniqid: uniqid.value,
    });

    if (res.code === 1) {
      startCountdown(60);
      showToast("验证码已发送");
    } else {
      showToast(res.msg || "发送验证码失败");
      // 如果是图形验证码错误，刷新图形验证码
      if (res.msg && res.msg.includes("图形验证码")) {
        refreshImgCode();
        imgCode.value = "";
      }
    }
  } catch (error) {
    console.error("发送验证码失败:", error);
    showToast(error.message || "发送验证码失败");
  }
}

// 提交按钮可用条件（不再需要密码）
const canSubmit = computed(() => {
  const amt = parseFloat(amount.value);
  return !!selectedAccount.value && !!imgCode.value && !!smsCode.value && !isNaN(amt) && amt > 0;
});

// 确认提现 - 打开密码弹窗
function onConfirm() {
  if (!canSubmit.value) return;

  // 清空之前的密码
  withdrawPassword.value = "";
  // 打开密码弹窗
  showPasswordDialog.value = true;
  // 自动打开键盘
  setTimeout(() => {
    showKeyboard.value = true;
  }, 100);
}

// 提交提现请求
async function submitWithdraw() {
  const toast = showToast({
    type: "loading",
    message: "提交中...",
    forbidClick: true,
    duration: 0,
  });

  try {
    const res = await API.withdraw({
      aid: selectedAccount.value.id,
      amount: parseFloat(amount.value),
      code: smsCode.value,
      pass: withdrawPassword.value,
    });

    toast.close();

    if (res.code === 1) {
      // 关闭密码弹窗
      showPasswordDialog.value = false;
      showKeyboard.value = false;

      showToast({
        type: "success",
        message: "提现申请已提交",
        onClose: () => {
          router.back();
        },
      });
    } else {
      showToast(res.msg || "提现失败");
      // 密码错误时清空密码
      if (res.msg && res.msg.includes("密码")) {
        withdrawPassword.value = "";
      }
    }
  } catch (error) {
    toast.close();
    console.error("提现失败:", error);
    showToast(error.message || "提现失败");
  }
}

function onClickLeft() {
  router.back();
}

onMounted(async () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // 获取手机号
      if (user.is_wpass == 0) {
        showToast("请先设置提现密码,才可以进行提款操作");
        router.push("/withdraw-password");
        return;
      }

      if (user.is_auth == 0) {
        showToast("为了您的账户安全,请先进行实名认证");
        router.push("/authentication");
        return;
      }

      if (user.mobile) {
        userMobile.value = user.mobile;
      }
    } catch (error) {
      console.error("解析用户信息失败:", error);
    }
  }

  // 调用接口获取实时余额
  try {
    const balanceRes = await API.balanceof();
    if (balanceRes.code === 1 && balanceRes.data) {
      balance.value = parseFloat(balanceRes.data.withdraw);
    }
  } catch (error) {
    console.error("获取余额失败:", error);
  }

  // 初始化图形验证码
  uniqid.value = getUniqId();
  imgurl.value = `https://atc.lxwdlz.cn/index/captcha/index/id/${uniqid.value}`;

  getAccountList();
});

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  min-height: 100vh;
  box-sizing: border-box;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 120px;
}

.nav-bar-center-wrap {
  background: #fff;
}

.nav-bar {
  background: #fff;
}

/* 页面内容 */
.withdraw-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 表单区块 */
.form-section {
  background: #fff;
  border-radius: 8px;
  padding: 12px 12px;
}

.form-section2 {
  background: #fff;
  border-radius: 8px;
  padding: 12px 2px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.info {
  font-size: 12px;
  color: #b0b0b0;
}

.add-link {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #1989fa;
  cursor: pointer;
}

.balance-info {
  font-size: 13px;
  color: #969799;
  padding-top: 10px;
}

/* 提现到行 */
.withdraw-to-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 0;
  cursor: pointer;
}

.left-part {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.label-text {
  font-size: 15px;
  color: #646566;
  white-space: nowrap;
}

.account-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.account-text {
  font-size: 14px;
  color: #323233;
}

.placeholder-text {
  font-size: 14px;
  color: #c8c9cc;
}

/* 收款方式弹出层 */
.account-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.account-popup-header .van-icon {
  cursor: pointer;
  color: #969799;
}

.account-popup-header .van-icon:active {
  opacity: 0.6;
}

.account-sheet-content {
  padding: 16px;
  max-height: calc(50vh - 60px);
  overflow-y: auto;
}

.account-list {
  margin-bottom: 16px;
}

.account-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #ffffff;
  border-radius: 6px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.account-item:last-child {
  margin-bottom: 0;
}

.account-item:active {
  background: #ebedf0;
}

.account-item.active {
  background: #ffebeb;
  border: 1px solid #fc3c3c;
}

.account-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-item-name {
  font-size: 12px;
  font-weight: 500;
  color: #2e2e2e;
}

.account-item-detail {
  font-size: 12px;
  color: #2f2f2f;
}

.add-account-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border: 1px dashed #fc3c3c;
  border-radius: 6px;
  color: #fc3c3c;
  font-size: 13px;
  cursor: pointer;
}

.add-account-btn:active {
  opacity: 0.7;
}

/* 支付密码弹窗 */
.password-dialog-content {
  padding: 24px 16px;
}

.password-dialog-content :deep(.van-password-input) {
  margin: 0;
}

.password-dialog-content :deep(.van-password-input__security li) {
  border: 1px solid #ebedf0;
  background: #fafafa;
  height: 48px;
  line-height: 48px;
  border-radius: 6px;
}

.password-dialog-content :deep(.van-password-input__security li.van-password-input__item--focus) {
  border-color: #fc3c3c;
}

/* 提现金额输入 */
.amount-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 4px;
}

.amount-symbol {
  font-size: 22px;
  font-weight: 600;
  color: #323233;
  padding-top: 8px;
}

.amount-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 32px;
  font-weight: 600;
  color: #323233;
  max-width: 75%;
}

.amount-input::placeholder {
  color: #c8c9cc;
}

.all-btn {
  font-size: 14px;
  color: #fc3c3c;
  background: #fff;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.all-btn:active {
  opacity: 0.7;
}

/* van-cell-group 样式调整 */
.form-section :deep(.van-cell-group--inset) {
  margin: 0;
}

.form-section :deep(.van-field__button) {
  padding-left: 8px;
}

.form-section :deep(.van-button--small) {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  background: #fc3c3c;
  border-color: #fc3c3c;
}

.form-section :deep(.van-button--small:disabled) {
  background: #c8c9cc;
  border-color: #c8c9cc;
}

.captcha-img-inline {
  width: 90px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  background: #f7f8fa;
  border: 1px solid #ebedf0;
  display: block;
}

.captcha-img-inline:active {
  opacity: 0.7;
}

/* 底部固定区域 */
.footer-fixed {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 90%;
  max-width: 430px;
  background: #fff;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  border-top: 1px solid #ebedf0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 6px;
  background: #fc3c3c;
  color: #fff;
  border: none;
  cursor: pointer;
}

.submit-btn:active {
  opacity: 0.8;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
