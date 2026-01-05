<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="个人资料" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>
    <div class="profile-list">
      <div class="profile-row" @click="triggerFileInput">
        <span class="profile-label">头像设置</span>
        <div class="profile-right">
          <img :src="avatarUrl" alt="头像" class="profile-avatar" />
          <van-icon name="arrow" color="#969799" size="16" />
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none;"
        @change="handleFileChange"
      />
      <div class="profile-row" @click="showNicknameDialog">
        <span class="profile-label">用户昵称</span>
        <div class="profile-right">
          <span class="profile-value">{{ username }}</span>
          <van-icon name="arrow" color="#969799" size="16" />
        </div>
      </div>
      <div class="profile-row">
        <span class="profile-label">注册时间</span>
        <span class="profile-value">{{ createTime }}</span>
      </div>

      <div class="profile-row" @click="gopassword">
        <span class="profile-label">登录密码</span>
        <div class="profile-right">
          <van-icon name="arrow" color="#969799" size="16" />
        </div>
      </div>
      <div class="profile-row" @click="go('/withdraw-password')">
        <span class="profile-label">提现密码</span>
        <div class="profile-right">
          <van-icon name="arrow" color="#969799" size="16" />
        </div>
      </div>
      <div class="profile-row">
        <span class="profile-label">版本号</span>
        <span class="profile-value">1.0.2</span>
      </div>

      <!-- <div class="profile-row" @click="gopassword">
        <span class="profile-label">清除缓存</span>
        <div class="profile-right">
          <van-icon name="arrow" color="#969799" size="16" />
        </div>
      </div> -->
    </div>
    <div class="logout-btn-wrap">
      <button class="logout-btn" @click="logout">退出登录</button>
    </div>

    <!-- 修改昵称弹窗 -->
    <van-dialog
      v-model:show="nicknameDialogVisible"
      title="修改昵称"
      show-cancel-button
      :before-close="onNicknameDialogClose"
    >
      <div class="dialog-content">
        <van-field
          v-model="newNickname"
          placeholder="请输入新昵称"
          maxlength="20"
          show-word-limit
        />
      </div>
    </van-dialog>


  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import { showConfirmDialog } from "vant";
import API from "../../request/api";

const router = useRouter();
const username = ref("未登录");
const avatarUrl = ref("/icons/avatar1.png");
const createTime = ref("");
const expireTime = ref("");

// 弹窗相关
const nicknameDialogVisible = ref(false);
const newNickname = ref("");

// 文件上传相关
const fileInput = ref(null);

function gopassword() {
  router.push("/forgetpassword");
}

function go(path) {
  router.push(path);
}

// 格式化时间戳
const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取用户信息
onMounted(async () => {
  // 先从本地存储读取
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      username.value = user.nickname || user.username || "用户";
      avatarUrl.value = user.avatar || "/icons/avatar1.png";
      createTime.value = formatTime(user.createtime);
      expireTime.value = formatTime(user.expiretime);
      // 有缓存就不调用接口了
      return;
    } catch (e) {
      console.error('解析本地用户信息失败:', e);
    }
  }

  // 只在没有缓存时才调用接口
  try {
    const res = await API.getUserInfo();
    console.log('用户信息:', res);

    if (res.code === 1 && res.data) {
      const user = res.data;
      username.value = user.nickname || user.username || "用户";
      avatarUrl.value = user.avatar || "/icons/avatar1.png";
      createTime.value = formatTime(user.createtime);
      expireTime.value = formatTime(user.expiretime);

      // 保存到本地存储
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
});

function onClickLeft() {
  router.back();
}

// 显示修改昵称弹窗
function showNicknameDialog() {
  newNickname.value = username.value;
  nicknameDialogVisible.value = true;
}

// 触发文件选择
function triggerFileInput() {
  fileInput.value?.click();
}

// 处理文件选择
async function handleFileChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件');
    return;
  }

  // 验证文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片大小不能超过5MB');
    return;
  }

  try {
    const toast = showToast({
      type: 'loading',
      message: '上传中...',
      forbidClick: true,
      duration: 0,
    });

    // 上传文件
    const res = await API.uploadFile(file);
    toast.close();

    if (res.code === 1 && res.data) {
      const uploadedUrl = res.data.fullurl || res.data.url || res.data;

      // 调用修改头像接口
      const modifyRes = await API.modifyUserInfo({
        avatar: uploadedUrl
      });

      if (modifyRes.code === 1) {
        showToast('头像修改成功');
        avatarUrl.value = uploadedUrl;
        await refreshUserInfo();
      } else {
        showToast(modifyRes.msg || '修改失败');
      }
    } else {
      showToast(res.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传头像失败:', error);
    showToast('上传失败，请稍后重试');
  } finally {
    // 清空文件选择
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
}

// 修改昵称弹窗关闭前的处理
async function onNicknameDialogClose(action) {
  if (action === 'confirm') {
    if (!newNickname.value || newNickname.value.trim() === '') {
      showToast('昵称不能为空');
      return false;
    }

    if (newNickname.value === username.value) {
      showToast('昵称未修改');
      return true;
    }

    try {
      const toast = showToast({
        type: 'loading',
        message: '修改中...',
        forbidClick: true,
        duration: 0,
      });

      const res = await API.modifyUserInfo({
        nickname: newNickname.value.trim()
      });

      toast.close();

      if (res.code === 1) {
        showToast('修改成功');
        username.value = newNickname.value.trim();

        // 重新获取用户信息
        await refreshUserInfo();
        return true;
      } else {
        showToast(res.msg || '修改失败');
        return false;
      }
    } catch (error) {
      console.error('修改昵称失败:', error);
      showToast('修改失败，请稍后重试');
      return false;
    }
  }
  return true;
}



// 刷新用户信息
async function refreshUserInfo() {
  try {
    const res = await API.getUserInfo();
    if (res.code === 1 && res.data) {
      const user = res.data;
      username.value = user.nickname || user.username || "用户";
      avatarUrl.value = user.avatar || "/icons/avatar1.png";
      createTime.value = formatTime(user.createtime);
      expireTime.value = formatTime(user.expiretime);
      localStorage.setItem("user", JSON.stringify(user));
    }
  } catch (error) {
    console.error('刷新用户信息失败:', error);
  }
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
.profile-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.profile-value {
  font-size: 0.9rem;
  color: #666;
}
.profile-action {
  font-size: 0.9rem;
  color: #d32121;
  font-weight: 500;
  cursor: pointer;
}
.profile-avatar {
  width: 48px;
  height: 48px;
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

/* 弹窗样式 */
.dialog-content {
  padding: 20px 16px;
}
</style>
