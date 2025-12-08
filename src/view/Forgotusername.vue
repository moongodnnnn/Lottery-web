<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="忘记用户名" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>
    <div class="forget-container">
      <form class="form" @submit.prevent="onSubmit">
        <label class="field">
          <span class="label">手机号</span>
          <div class="input-row">
            <input v-model="phone" type="text" maxlength="11" placeholder="请输入手机号" required />
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

        <button class="btn" type="submit" :disabled="!canSubmit">确认找回</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, onMounted, computed } from "vue";
import { showToast, showDialog } from "vant";
import { useRouter } from "vue-router";
import { API } from "../request/api";

const router = useRouter();
const phone = ref("");
const smsCode = ref("");
const imgCode = ref("");
const sending = ref(false);
const pintext = ref("获取验证码");
const countdown = ref(0);
let timer = null;
const uniqid = ref("");
const imgurl = ref("");

function onClickLeft() {
  router.back();
}

function onSubmit() {
  API.forgetUser({
    mobile: phone.value,
    code: smsCode.value,
  })
    .then((res) => {
      if (res.code == 1) {
        showDialog({
          message: "您的用户名为：" + res.data.user[0].username,
          showCancelButton: false,
          confirmButtonText: "确定",
        }).then(() => {});
      } else {
        showToast(res.msg || "找回用户名失败");
      }
    })
    .catch((error) => {
      showToast(error.msg || "找回用户名失败");
    });
}

const canSubmit = computed(() => {
  return /^\d{11}$/.test(phone.value) && smsCode.value.trim() !== "" && imgCode.value.trim() !== "";
});

function refreshImgCode() {
  uniqid.value = getUniqId();
  imgurl.value = `https://lottery.hongxiu88.com/index/captcha/index/id/${uniqid.value}`;
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
  if (!/^\d{11}$/.test(phone.value)) {
    showToast("请输入有效手机号");
    return;
  }
  if (!imgCode.value) {
    showToast("请填写图形验证码");
    return;
  }
  // 这里应调用API发送短信验证码
  API.sendSms({ mobile: phone.value, event: "forgetUser", captcha: imgCode.value, uniqid: uniqid.value })
    .then((res) => {
      if (res.code == 1) {
        startCountdown(60);
        showToast("验证码已发送");
      } else {
        showToast(res.msg || "发送验证码失败");
      }
    })
    .catch((error) => {
      showToast(error.msg || "发送验证码失败");
    });
}

function getUniqId() {
  return Date.now().toString() + Math.floor(Math.random() * 100 + 1);
}

onMounted(() => {
  uniqid.value = getUniqId();
  imgurl.value = `https://lottery.hongxiu88.com/index/captcha/index/id/${uniqid.value}`;
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
</style>
