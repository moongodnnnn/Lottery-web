<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="实名认证" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <!-- 认证状态提示 -->
    <div v-if="isAuthenticated" class="auth-status success">
      <van-icon name="checked" size="24" color="#07c160" />
      <span class="status-text">已完成实名认证</span>
    </div>
    <div v-else class="auth-status pending">
      <van-icon name="info-o" size="24" color="#ff976a" />
      <span class="status-text">请完成实名认证</span>
    </div>

    <!-- 认证表单 -->
    <div class="auth-form">
      <!-- 证件类型 -->
      <div class="form-card">
        <div class="card-icon">
          <van-icon name="card" size="20" color="#fc3c3c" />
        </div>
        <div class="card-content">
          <div class="card-label">证件类型</div>
          <div class="card-value">居民身份证</div>
        </div>
      </div>

      <!-- 姓名 -->
      <div class="form-card">
        <div class="card-icon">
          <van-icon name="user-o" size="20" color="#fc3c3c" />
        </div>
        <div class="card-content">
          <div class="card-label">真实姓名</div>
          <input
            v-model="formData.realName"
            type="text"
            placeholder="请输入真实姓名"
            :disabled="isAuthenticated"
            class="card-input"
          />
        </div>
      </div>

      <!-- 身份证号 -->
      <div class="form-card">
        <div class="card-icon">
          <van-icon name="idcard" size="20" color="#fc3c3c" />
        </div>
        <div class="card-content">
          <div class="card-label">身份证号码</div>
          <input
            v-model="formData.idNumber"
            type="text"
            placeholder="请输入18位身份证号码"
            :disabled="isAuthenticated"
            maxlength="18"
            class="card-input"
          />
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-section">
        <div class="tips-title">
          <van-icon name="warning-o" size="16" color="#ff976a" />
          <span>温馨提示</span>
        </div>
        <div class="tips-content">
          <p>1. 请确保填写的信息真实有效</p>
          <p>2. 实名认证后不可修改</p>
          <p>3. 认证信息仅用于账户安全验证</p>
          <p>4. 我们将严格保护您的个人信息</p>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section" v-if="!isAuthenticated">
        <button class="submit-btn" @click="handleSubmit">提交认证</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import API from "../../request/api.js";

const router = useRouter();

// 认证状态
const isAuthenticated = ref(false);

// 表单数据
const formData = ref({
  realName: '',
  idType: '居民身份证',
  idNumber: ''
});

// 验证身份证号
const validateIdNumber = (idNumber) => {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return reg.test(idNumber);
};

// 提交认证
const handleSubmit = async () => {
  // 验证姓名
  if (!formData.value.realName || formData.value.realName.trim() === '') {
    showToast('请输入真实姓名');
    return;
  }

  // 验证身份证号
  if (!formData.value.idNumber || formData.value.idNumber.trim() === '') {
    showToast('请输入身份证号码');
    return;
  }

  if (!validateIdNumber(formData.value.idNumber)) {
    showToast('请输入正确的身份证号码');
    return;
  }

  try {
    showToast({
      type: 'loading',
      message: '提交中...',
      forbidClick: true,
      duration: 0,
    });

    // 调用实名认证接口
    const response = await API.userAudit({
      name: formData.value.realName.trim(),
      idno: formData.value.idNumber.trim()
    });

    console.log('实名认证响应:', response);

    if (response.code === 1) {
      showToast({
        type: 'success',
        message: '认证成功'
      });
      isAuthenticated.value = true;

      // 更新本地存储的用户信息
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.is_auth = 1;
          user.real_name = formData.value.realName.trim();
          user.id_number = formData.value.idNumber.trim();
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('更新本地用户信息失败:', error);
        }
      }

      // 延迟返回上一页
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      showToast(response.msg || '认证失败，请稍后重试');
    }
  } catch (error) {
    console.error('认证失败:', error);
    showToast(error.message || '认证失败，请稍后重试');
  }
};

// 获取认证状态
onMounted(() => {
  // 从本地存储获取认证状态
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      // 检查是否已认证
      if (user.is_auth === 1) {
        isAuthenticated.value = true;
        // 如果已认证，显示已认证的信息
        if (user.real_name) {
          formData.value.realName = user.real_name;
        }
        if (user.id_number) {
          formData.value.idNumber = user.id_number;
        }
      }
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
});

function onClickLeft() {
  router.back();
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
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

/* 认证状态 */
.auth-status {
  margin: 10px 16px 0px 16px;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-status.success {
  background: #f0f9ff;
  border: 1px solid #07c160;
}

.auth-status.pending {
  background: #fff7ed;
  border: 1px solid #ff976a;
}

.status-text {
  font-size: 15px;
  font-weight: 500;
  color: #323233;
}

/* 认证表单 */
.auth-form {
  padding: 16px;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.form-card:active {
  transform: scale(0.99);
}

.card-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #fff1f0 0%, #ffe7e5 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 13px;
  color: #969799;
  margin-bottom: 8px;
}

.card-value {
  font-size: 16px;
  color: #323233;
  font-weight: 500;
}

.card-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  color: #323233;
  background: transparent;
  padding: 0;
}

.card-input::placeholder {
  color: #c8c9cc;
  font-size: 15px;
}

.card-input:disabled {
  color: #969799;
  background: transparent;
}

/* 温馨提示 */
.tips-section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 500;
  color: #323233;
  margin-bottom: 12px;
}

.tips-content {
  font-size: 13px;
  color: #646566;
  line-height: 1.8;
}

.tips-content p {
  margin: 0;
  padding: 4px 0;
}

/* 提交按钮 */
.submit-section {
  padding: 16px 0;
}

.submit-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  border: none;
  border-radius: 24px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(252, 60, 60, 0.3);
  transition: all 0.3s;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(252, 60, 60, 0.3);
}
</style>
