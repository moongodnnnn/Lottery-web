<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="添加银行卡" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="form-content">
      <div class="form-container">
        <!-- 持卡人姓名 -->
        <div class="form-item">
          <div class="item-label">持卡人姓名</div>
          <input
            v-model="formData.cardHolder"
            type="text"
            placeholder="请输入持卡人姓名"
            class="item-input"
          />
        </div>

        <!-- 开户银行 -->
        <div class="form-item">
          <div class="item-label">开户银行</div>
          <input
            v-model="formData.bankName"
            type="text"
            placeholder="请输入开户银行"
            class="item-input"
          />
        </div>

        <!-- 支行名称 -->
        <div class="form-item">
          <div class="item-label">支行名称</div>
          <input
            v-model="formData.branchName"
            type="text"
            placeholder="请输入支行名称"
            class="item-input"
          />
        </div>

        <!-- 银行卡号 -->
        <div class="form-item">
          <div class="item-label">银行卡号</div>
          <input
            v-model="formData.cardNumber"
            type="text"
            placeholder="请输入银行卡号"
            class="item-input"
            maxlength="19"
          />
        </div>

        <!-- 所在省份 -->
        <div class="form-item">
          <div class="item-label">所在省份</div>
          <input
            v-model="formData.province"
            type="text"
            placeholder="请输入所在省份"
            class="item-input"
          />
        </div>

        <!-- 所在城市 -->
        <div class="form-item">
          <div class="item-label">所在城市</div>
          <input
            v-model="formData.city"
            type="text"
            placeholder="请输入所在城市"
            class="item-input"
          />
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <button class="submit-btn" @click="handleSubmit">提交</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";

const router = useRouter();

// 表单数据
const formData = ref({
  cardHolder: '',
  bankName: '',
  branchName: '',
  cardNumber: '',
  province: '',
  city: ''
});

// 验证银行卡号
const validateCardNumber = (cardNumber) => {
  const reg = /^\d{16,19}$/;
  return reg.test(cardNumber);
};

// 提交表单
const handleSubmit = async () => {
  // 验证持卡人姓名
  if (!formData.value.cardHolder || formData.value.cardHolder.trim() === '') {
    showToast('请输入持卡人姓名');
    return;
  }

  // 验证开户银行
  if (!formData.value.bankName || formData.value.bankName.trim() === '') {
    showToast('请输入开户银行');
    return;
  }

  // 验证支行名称
  if (!formData.value.branchName || formData.value.branchName.trim() === '') {
    showToast('请输入支行名称');
    return;
  }

  // 验证银行卡号
  if (!formData.value.cardNumber || formData.value.cardNumber.trim() === '') {
    showToast('请输入银行卡号');
    return;
  }

  if (!validateCardNumber(formData.value.cardNumber)) {
    showToast('请输入正确的银行卡号');
    return;
  }

  // 验证省份
  if (!formData.value.province || formData.value.province.trim() === '') {
    showToast('请输入所在省份');
    return;
  }

  // 验证城市
  if (!formData.value.city || formData.value.city.trim() === '') {
    showToast('请输入所在城市');
    return;
  }

  try {
    showToast({
      type: 'loading',
      message: '提交中...',
      forbidClick: true,
      duration: 0,
    });

    // TODO: 调用添加银行卡接口
    // const res = await API.addBankCard(formData.value);

    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1500));

    showToast('添加成功');
    setTimeout(() => {
      router.back();
    }, 1500);
  } catch (error) {
    console.error('添加银行卡失败:', error);
    showToast('添加失败，请稍后重试');
  }
};

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

/* 表单内容 */
.form-content {
  padding: 16px;
}

.form-container {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 24px;
}

.form-item {
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
}

.form-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
  min-width: 90px;
  flex-shrink: 0;
}

.item-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #323233;
  background: transparent;
  text-align: right;
}

.item-input::placeholder {
  color: #c8c9cc;
}

.item-value {
  flex: 1;
  font-size: 15px;
  color: #323233;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.item-value.placeholder {
  color: #c8c9cc;
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

