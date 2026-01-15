<template>
  <div class="page" role="main">
    <div style="display: flex; justify-content: center; align-items: center">
      <img src="\loginimg1.png" alt="" style="width: 100%; height: auto; max-width: 430px; text-align: center" />
    </div>

    <main class="content">
      <div style="height: 8px"></div>

      <van-tabs v-model:active="activeName" color="#ff272e" line-height="4px" line-width="20px">
        <van-tab title="已有账号" name="a">
          <form class="form" autocomplete="on" novalidate @submit.prevent="login">
            <label class="field">
              <span class="label">用户名</span>
              <input v-model="loginUsername" type="text" autocomplete="username" placeholder="请输入用户名" required />
            </label>
            <label class="field">
              <span class="label">密码</span>
              <div class="input-row">
                <input v-model="loginPassword" type="password" autocomplete="current-password" placeholder="请输入密码" required />
              </div>
            </label>

            <label class="field">
              <span class="label">图形验证</span>
              <div class="input-row">
                <input v-model="loginImgCode" type="text" inputmode="numeric" placeholder="请输入图形验证" />
                <img @click="refreshImgCode" :src="imgurl" alt="图形验证码" style="width: 88px; height: 48px; border-radius: 4px" />
              </div>
            </label>

            <button class="btn" type="submit">登录</button>

            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #bc4749">
              <div @click="go('/forgotusername')">忘记用户名</div>
              <div @click="openKefu">在线客服</div>
              <div @click="go('/forgetpassword')">忘记密码</div>
            </div>
          </form>
        </van-tab>

        <van-tab title="注册账号" name="b">
          <form class="form" @submit.prevent="register" autocomplete="on" novalidate>
            <label class="field">
              <span class="label">用户名</span>
              <input v-model="username" type="text" autocomplete="username" placeholder="请输入用户名" required />
            </label>
            <label class="field">
              <span class="label">密码</span>
              <div class="input-row">
                <input v-model="password" type="password" autocomplete="current-password" placeholder="请输入密码" required />
              </div>
            </label>

            <label class="field">
              <span class="label">确认密码</span>
              <div class="input-row">
                <input v-model="confirmPassword" type="password" autocomplete="current-password" placeholder="请输入密码" required />
              </div>
            </label>

            <label class="field">
              <span class="label">手机号码</span>
              <input v-model="phone" type="text" autocomplete="username" placeholder="请输入手机号" required />
            </label>

            <label class="field">
              <span class="label">验证码</span>
              <div class="input-row">
                <input v-model="securityCode" type="text" inputmode="numeric" placeholder="请输入手机验证码" />
                <button class="btnpin" type="button" @click="sendmsg" :disabled="sending">{{ pintext }}</button>
              </div>
            </label>

            <label class="field">
              <span class="label">图形验证</span>
              <div class="input-row">
                <input v-model="imgCode" type="text" inputmode="numeric" placeholder="请输入图形验证" />
                <img @click="refreshImgCode" :src="imgurl" alt="图形验证码" style="width: 88px; height: 48px; border-radius: 4px" />
              </div>
            </label>

            <button class="btn" :disabled="!canSubmit" type="submit" aria-label="注册">注册</button>

            <div style="font-size: 0.8rem; display: flex; align-items: center; color: #999">
              <van-checkbox v-model="checked" checked-color="#ee0a24" icon-size="16px" style="padding-right: 6px"></van-checkbox>
              注册即表示您同意 
              <span style="color: #c8391c; cursor: pointer;" @click.stop="viewUserAgreement">《用户协议》</span> 
              <span style="color: #c8391c; cursor: pointer;" @click.stop="viewGdAgreement">《跟单服务条款》</span>
            </div>
          </form>
        </van-tab>
      </van-tabs>

      <div class="page-footer" style="width: 100%; max-width: 430px; margin-top: 12px; padding: 0 18px; box-sizing: border-box">
        <div style="display: flex; padding-top: 12px; align-items: center; width: 100%; max-width: 400px">
          <span style="color: #999; font-size: 0.8rem; width: 66px">出票地</span>
          <van-field v-model="fieldValue" is-link readonly @click="show = true" />
        </div>
        <div slot="footer" style="font-size: 0.75rem; color: #c8391c; margin-top: 4px; padding-bottom: 3rem">
          *为了保证及时出票，您的订单可能会被分配至其他店铺
        </div>
      </div>

      <div class="footer" style="text-align: center; font-size: 0.8rem; color: #333">
        <img src="/footer.png" alt="" style="width: 50%; height: auto; max-width: 150px; text-align: center" />
      </div>

      <van-popup v-model:show="show" round position="bottom" :close-on-click-overlay="true">
        <van-cascader v-model="cascaderValue" :options="options" title="请选择省/市" @close="show = false" @finish="onFinish" />
      </van-popup>
    </main>
    <div v-if="loading" class="global-loading-mask">
      <van-loading size="32px" vertical>加载中...</van-loading>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast, showDialog } from "vant";
import { useCascaderAreaData } from "@vant/area-data";
import { API } from "../request/api";

const activeName = ref("a");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const phone = ref("");
const securityCode = ref("");
const show = ref(false);
const router = useRouter();
const imgCode = ref("");

const checked = ref(true);
const pintext = ref("获取验证码");
const sending = ref(false);
const countdown = ref(0);
const loading = ref(false);

// 协议ID
const userAgreeId = ref("");
const gdAgreeId = ref("");

// 客服URL
const kefuUrl = ref("");

let timer = null;

const fieldValue = ref("江西省/九江市");
const cascaderValue = ref("");
const options = useCascaderAreaData();

const loginUsername = ref("");
const loginPassword = ref("");
const loginImgCode = ref("");

const imgurl = ref("");
const uniqid = ref("");

const onFinish = ({ selectedOptions }) => {
  show.value = false;
  const items = selectedOptions
    .slice(0, 2)
    .map((option) => option.text)
    .filter(Boolean);
  fieldValue.value = items.join("/");
};

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function getUniqId() {
  return Date.now().toString() + Math.floor(Math.random() * 100 + 1);
}
function refreshImgCode() {
  uniqid.value = getUniqId();
  imgurl.value = `https://atc.lxwdlz.cn/index/captcha/index/id/${uniqid.value}`;
}

function go(path) {
  router.push(path);
}

// 打开在线客服
function openKefu() {
  if (!kefuUrl.value) {
    showToast("客服暂不可用");
    return;
  }
  window.open(kefuUrl.value, '_blank');
}

function login() {
  if (!loginUsername.value || loginUsername.value.trim() === "") {
    showToast("请完成填写用户名");
    return;
  }
  if (!loginPassword.value) {
    showToast("请完成填写密码");
    return;
  }
  const imgCodeTrim = (loginImgCode.value || "").trim();
  if (!imgCodeTrim) {
    showToast("请填写有效的图形验证码");
    return;
  }
  loading.value = true;
  API.login({ account: loginUsername.value, password: loginPassword.value, captcha: imgCodeTrim, uniqid: uniqid.value })
    .then((res) => {
      loading.value = false;
      if (res.code == 1) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        router.push("/home");
      } else {
        showToast(res.msg || "登录失败");
        refreshImgCode();
      }
    })
    .catch((err) => {
      loading.value = false;
      showToast(err?.msg || "登录失败");
    });
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

function register() {
  if (!username.value || username.value.trim() === "") {
    showToast("请完成填写用户名");
    return;
  }
  if (!password.value) {
    showToast("请完成填写密码");
    return;
  }
  if (password.value !== confirmPassword.value) {
    showToast("两次输入的密码不一致");
    return;
  }
  const phoneTrim = (phone.value || "").trim();
  const phoneRe = /^\d{11}$/;
  if (!phoneTrim || !phoneRe.test(phoneTrim)) {
    showToast("请填写有效的手机号码");
    return;
  }
  if (!securityCode.value || securityCode.value.trim() === "") {
    showToast("请输入手机验证码");
    return;
  }

  const params = {
    mobile: phoneTrim,
    username: username.value,
    password: password.value,
    code: securityCode.value
  };

  const savedRecom = localStorage.getItem("recom");
  if (savedRecom) {
    params.recom = savedRecom;
  }

  loading.value = true;
  API.register(params)
    .then((res) => {
      loading.value = false;
      if (res && res.code === 1) {
        showToast(res.msg || "注册成功");
        activeName.value = "a";
           setTimeout(() => {
          router.push("/download");
        }, 1500);
      } else {
        showToast(res.msg || "注册失败");
        refreshImgCode();
      }
    })
    .catch((err) => {
      loading.value = false;
      showToast(err?.message || "注册失败");
    });
}

function sendmsg() {
  if (!username.value || username.value.trim() === "") {
    showToast("请完成填写用户名");
    return;
  }
  if (!password.value) {
    showToast("请完成填写密码");
    return;
  }
  if (password.value !== confirmPassword.value) {
    showToast("两次输入的密码不一致");
    return;
  }
  const phoneTrim = (phone.value || "").trim();
  const phoneRe = /^\d{11}$/;
  if (!phoneTrim || !phoneRe.test(phoneTrim)) {
    showToast("请填写有效的手机号码");
    return;
  }
  if (!imgCode.value || imgCode.value.trim() === "") {
    showToast("请填写图形验证码");
    return;
  }
  loading.value = true;
  API.sendSms({ mobile: phoneTrim, event: "register" })
    .then((res) => {
      loading.value = false;
      if (res && res.code === 1) {
        startCountdown(60);
        showToast(res.msg || "发送短信验证码成功");
      } else {
        showToast(res.msg || "发送短信验证码失败");
      }
    })
    .catch((err) => {
      loading.value = false;
      showToast(err?.message || "发送短信验证码失败");
    });
}

const canSubmit = computed(() => username.value.trim() !== "" && password.value !== "" && securityCode.value !== "");

function onSubmit() {
  if (!canSubmit.value) {
    showToast("请完整填写用户名和密码");
    return;
  }
}

// 查看用户协议
async function viewUserAgreement() {
  if (!userAgreeId.value) {
    showToast("协议加载中，请稍后");
    return;
  }
  try {
    const res = await API.toastDetail(userAgreeId.value);
    if (res.code === 1) {
      showDialog({
        title: res.data.title || "用户协议",
        message: res.data.content || "",
        confirmButtonText: "我知道了",
        allowHtml: true,
        messageAlign: "left",
      });
    } else {
      showToast(res.msg || "获取协议失败");
    }
  } catch (error) {
    showToast("获取协议失败");
  }
}

// 查看跟单服务条款
async function viewGdAgreement() {
  if (!gdAgreeId.value) {
    showToast("协议加载中，请稍后");
    return;
  }
  try {
    const res = await API.toastDetail(gdAgreeId.value);
    if (res.code === 1) {
      showDialog({
        title: res.data.title || "跟单服务条款",
        message: res.data.content || "",
        confirmButtonText: "我知道了",
        allowHtml: true,
        messageAlign: "left",
      });
    } else {
      showToast(res.msg || "获取协议失败");
    }
  } catch (error) {
    showToast("获取协议失败");
  }
}

onMounted(async () => {
  uniqid.value = getUniqId();
  imgurl.value = ` https://atc.lxwdlz.cn/index/captcha/index/id/${uniqid.value}`;

  // 获取协议ID和客服URL
  try {
    const configRes = await API.initConfig();
    if (configRes.code === 1) {
      userAgreeId.value = configRes.data.user_agree || "";
      gdAgreeId.value = configRes.data.gd_agree || "";
      kefuUrl.value = configRes.data.kefu_url || "";
    }
  } catch (error) {
    console.error("获取配置失败:", error);
  }
});

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #0f172a;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #d32121, #d31313);
  color: #fff;
  box-shadow: 0 2px 8px rgba(211, 33, 33, 0.12);
  max-width: 100%;
}

.topbar-title {
  font-size: 16px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: -20px 0 0 0;
  padding: 8px 18px;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 1.4rem 1.4rem 0rem 0rem;
}

.form {
  width: 100%;
  max-width: 430px;
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  gap: 14px;
}

/* 字段样式：输入背景 #faf6f6，默认无描边，聚焦时显示描边 */
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

input[type="password"] {
  letter-spacing: 3px;
  /* 添加密码字符间距 */
}

/* 输入框占位符样式 */
input::placeholder {
  color: #c7c7c7;
  /* 提示文字颜色 */
  font-size: 0.9rem;
  /* 提示文字大小 */
}

/* 眼睛按钮 / 显示密码 */
.eye {
  background: transparent;
  border: none;
  font-size: 0.9rem;
  padding: 6px 8px;
  cursor: pointer;
  color: #d32121;
}

/* 登录按钮 使用主色；未满足输入时为不可点击状态 */
.btn {
  margin-top: 1rem;
  padding: 0.7rem;
  border-radius: 6px;
  border: none;
  background: #c8391c;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.btnpin {
  margin-top: 2px;
  padding: 10px 0.8rem;
  border-radius: 6px;
  border: none;
  background: #c8391c;
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
  background: linear-gradient(90deg, rgba(211, 33, 33, 0.35), rgba(179, 24, 24, 0.35));
}

/* 忘记密码链接 */
.row {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.text-link {
  background: transparent;
  border: none;
  color: #d32121;
  font-size: 0.9rem;
  cursor: pointer;
}

.footer {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 430px;
  padding: 6px 18px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(6px);
  z-index: 50;
  box-shadow: 0 -3px 12px rgba(15, 23, 42, 0.02);
}
</style>

<style scoped>
.global-loading-mask {
  position: fixed;
  left: 40%;
  top: 40%;
  width: 98px;
  height: 98px;
  background: rgba(11, 11, 11, 0.8);
  z-index: 9999;
  display: flex;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
}
</style>
