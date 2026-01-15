<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="提现密码" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>
    <div class="forget-container">
      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span class="label">手机号</span>
          <div class="input-row">
            <input v-model="displayPhone" type="text" disabled class="item-input-disabled" />
          </div>
        </label>

        <label class="field">
          <span class="label">手机验证码</span>
          <div class="input-row">
            <input v-model="smsCode" type="text" maxlength="6" placeholder="请输入验证码" required />
            <button class="btnpin" type="button" @click="sendSms" :disabled="sending">{{ pintext }}</button>
          </div>
        </label>
        <label class="field">
          <span class="label">图形验证码</span>
          <div class="input-row">
            <input v-model="imgCode" type="text" maxlength="4" placeholder="请输入图形验证码" required />
            <img @click="refreshImgCode" :src="imgurl" alt="图形验证码" class="captcha-img" />
          </div>
        </label>
                   <label class="field">
          <span class="label">提现密码</span>
          <div class="password-input-wrapper">
            <!-- 密码输入框 -->
            <van-password-input
              :value="newPassword"
              :length="6"
              :gutter="4"
              :focused="showKeyboard"
              @focus="showKeyboard = true"
            />
          </div>
        </label>
        <label class="field">
          <span class="label">确认提现密码</span>
          <div class="password-input-wrapper">
            <!-- 确认密码输入框 -->
            <van-password-input
              :value="confirmPassword"
              :length="6"
              :gutter="4"
              :focused="showConfirmKeyboard"
              @focus="showConfirmKeyboard = true"
            />
          </div>
        </label>
  
        <button class="btn" type="submit" :disabled="!canSubmit">确认修改</button>
      </form>
    </div>

    <!-- 数字键盘 - 新密码 -->
    <van-number-keyboard
      v-model="newPassword"
      :show="showKeyboard"
      :maxlength="6"
      @blur="showKeyboard = false"
    />

    <!-- 数字键盘 - 确认密码 -->
    <van-number-keyboard
      v-model="confirmPassword"
      :show="showConfirmKeyboard"
      :maxlength="6"
      @blur="showConfirmKeyboard = false"
    />
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted, computed, watch } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import API from "../../request/api";

const router = useRouter();
const phone = ref(""); // 真实手机号
const displayPhone = ref(""); // 显示的手机号（脱敏）
const smsCode = ref("");
const imgCode = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const sending = ref(false);
const pintext = ref("获取验证码");
const countdown = ref(0);
let timer = null;
const uniqid = ref("");
const imgurl = ref("");
const showKeyboard = ref(false);
const showConfirmKeyboard = ref(false);

// 监听密码输入，输入满6位自动关闭键盘
watch(newPassword, (newVal) => {
  if (newVal.length === 6) {
    showKeyboard.value = false;
  }
});

watch(confirmPassword, (newVal) => {
  if (newVal.length === 6) {
    showConfirmKeyboard.value = false;
  }
});

function onClickLeft() {
  router.replace("/my");
}

const canSubmit = computed(() => {
  return (
    smsCode.value.trim() !== "" &&
    imgCode.value.trim() !== "" &&
    newPassword.value.length === 6 &&
    confirmPassword.value.length === 6
  );
});

function refreshImgCode() {
  uniqid.value = getUniqId();
  imgurl.value = ` https://atc.lxwdlz.cn/index/captcha/index/id/${uniqid.value}`;
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
function sendSms() {
  if (!imgCode.value) {
    showToast("请填写图形验证码");
    return;
  }
  API.sendSms({ mobile: phone.value, event: "setPPass", captcha: imgCode.value, uniqid: uniqid.value })
    .then((res) => {
      if (res.code == 1) {
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
    })
    .catch((error) => {
      showToast(error.message || "发送验证码失败");
    });
}
function onSubmit() {
  if (!smsCode.value) {
    showToast("请输入手机验证码");
    return;
  }
  if (!imgCode.value) {
    showToast("请输入图形验证码");
    return;
  }
  if (newPassword.value.length !== 6) {
    showToast("请输入6位数字密码");
    return;
  }
  if (!/^\d{6}$/.test(newPassword.value)) {
    showToast("密码必须是6位数字");
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    showToast("两次输入的密码不一致");
    return;
  }

  API.setWPass({
    mobile: phone.value,
    captcha: imgCode.value,
    code: smsCode.value,
    password: newPassword.value,
    repassword: confirmPassword.value,
    uniqid: uniqid.value,
  })
    .then((res) => {
      if (res.code == 1) {
        showToast("提现密码设置成功");
        setTimeout(() => {
          router.back();
        }, 1500);
        return;
      } else {
        showToast(res.msg || "设置失败");
        // 如果是图形验证码错误，刷新图形验证码
        if (res.msg && res.msg.includes("图形验证码")) {
          refreshImgCode();
          imgCode.value = "";
        }
      }
    })
    .catch((error) => {
      showToast(error.message || "设置失败");
    });
}
function getUniqId() {
  return Date.now().toString() + Math.floor(Math.random() * 100 + 1);
}

// 手机号脱敏处理
function maskPhone(phoneNumber) {
  if (!phoneNumber || phoneNumber.length !== 11) {
    return phoneNumber;
  }
  // 只显示后4位，其他用*代替
  return '******' + phoneNumber.slice(-4);
}

onMounted(() => {
  // 从localStorage获取用户信息
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.mobile) {
        phone.value = user.mobile; // 保存真实手机号用于API调用
        displayPhone.value = maskPhone(user.mobile); // 显示脱敏后的手机号
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }

  uniqid.value = getUniqId();
  imgurl.value = ` https://atc.lxwdlz.cn/index/captcha/index/id/${uniqid.value}`;
});

onBeforeUnmount(clearTimer);
</script>

<style scoped>
/* 页面整体布局优化 */
.page {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #0f172a;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.nav-bar-center-wrap {
  width: 100vw;
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

.forget-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 22px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  background: #fff;
  border-radius: 1rem;
  padding: 12px;
}

.form-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #d32121;
  margin-bottom: 10px;
  text-align: center;
}

.field .label {
  display: block;
  font-size: 0.8rem;
  color: #333;
  margin-bottom: 4px;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

input[type="text"],
input[type="password"] {
  flex: 1;
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  background: #f9f6f6;
  outline: none;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
}

input::placeholder {
  color: #c7c7c7;
  font-size: 0.9rem;
}

.item-input-disabled {
  background: #f5f5f5 !important;
  color: #999 !important;
  cursor: not-allowed;
}

.captcha-img {
  width: 88px;
  height: 42px;
  border-radius: 4px;
  cursor: pointer;
  background: #eee;
  border: 1px solid #e0e0e0;
}

.btn {
  margin-top: 8px;
  padding: 0.7rem;
  border-radius: 6px;
  border: none;
  background: linear-gradient(90deg, #d32121, #c8391c);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(211, 33, 33, 0.06);
  letter-spacing: 2px;
}

.btnpin {
  padding: 8px 0.8rem;
  border-radius: 6px;
  border: none;
  background: #c8391c;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn:disabled,
.btnpin:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.password-input-wrapper {
  margin-top: 8px;
}

:deep(.van-password-input) {
  margin: 0;
}

:deep(.van-password-input__security) {
  height: 50px;
}

:deep(.van-password-input__security li) {
  border-color: #e0e0e0;
  background: #f9f6f6;
}

:deep(.van-password-input__security i) {
  background-color: #333;
}
</style>
