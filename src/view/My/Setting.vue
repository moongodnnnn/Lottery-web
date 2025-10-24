<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="个人资料" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>
    <div class="profile-list">
      <div class="profile-row" @click="changeAvatar">
        <span class="profile-label">头像设置</span>
        <img :src="avatarUrl" alt="头像" class="profile-avatar" />
      </div>
      <div class="profile-row">
        <span class="profile-label">用户昵称</span>
        <span class="profile-value">{{ username }}</span>
      </div>
      <div class="profile-row" @click="gopassword">
        <span class="profile-label">登录密码</span>
        <span class="profile-action">修改</span>
      </div>
      <div class="profile-row" @click="gopassword">
        <span class="profile-label">提现密码</span>
        <span class="profile-action">设置</span>
      </div>
      <div class="profile-row" @click="gopassword">
        <span class="profile-label">帮助中心</span>
        <span class="profile-action"><van-icon name="arrow" color="#999" /></span>
      </div>
      <div class="profile-row" @click="gopassword">
        <span class="profile-label">版本号</span>
        <span class="profile-action"> <div style="color: #999">1.0.1</div> </span>
      </div>
    
          <div class="profile-row" @click="gopassword">
        <span class="profile-label">清除缓存</span>
        <span class="profile-action"> 清除 </span>
      </div>
    </div>
    <div class="logout-btn-wrap">
      <button class="logout-btn" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { showToast, Dialog } from "vant";
import { useRouter } from "vue-router";
import { showConfirmDialog } from "vant";

const router = useRouter();
const username = ref("未登录");
const avatarUrl = ref("/icons/avatar1.png");
const showPwd = ref(false);
const oldPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

function gopassword() {
  router.push("/forgetpassword");
}

// 模拟获取用户信息
onMounted(() => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      username.value = user.nickname || user.username || "用户";
      avatarUrl.value = user.avatar || "/icons/avatar1.png";
    } catch {
      username.value = "未登录";
    }
  }
});

function onClickLeft() {
  router.back();
}

function changeAvatar() {
  showToast("更换头像功能开发中");
}

function logout() {
  showConfirmDialog({
    title: "提示",
    message: "确定要退出登录吗？",
  })
    .then(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/login");
    })
    .catch(() => {});
}

function changePassword() {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    showToast("请填写完整信息");
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    showToast("两次输入的新密码不一致");
    return;
  }
  // 这里应调用API修改密码
  showToast("密码修改成功（模拟）");
  showPwd.value = false;
  oldPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
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
</style>
