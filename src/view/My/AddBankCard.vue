<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="添加收款方式" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="form-content">
      <!-- 收款方式选择 -->
      <van-tabs v-model:active="activeTab" @change="onTabChange" class="payment-tabs" animated swipeable>
        <van-tab name="alipay">
          <template #title>
            <div class="tab-title">
              <van-icon name="alipay" size="20" />
              <span>支付宝</span>
            </div>
          </template>
        </van-tab>
        <van-tab name="wechat">
          <template #title>
            <div class="tab-title">
              <van-icon name="wechat-pay" size="20" />
              <span>微信</span>
            </div>
          </template>
        </van-tab>
        <van-tab name="bank">
          <template #title>
            <div class="tab-title">
              <van-icon name="card" size="20" />
              <span>银行卡</span>
            </div>
          </template>
        </van-tab>
      </van-tabs>

      <div class="form-container">
        <!-- 真实姓名 - 所有类型都需要 -->
        <div class="form-item">
          <div class="item-label">
            <van-icon name="contact" size="16" color="#fc3c3c" />
            <span>真实姓名</span>
          </div>
          <input v-model="formData.real_name" type="text" placeholder="请输入真实姓名" class="item-input" />
        </div>

        <!-- 支付宝账号 -->
        <div class="form-item" v-if="activeTab === 'alipay'">
          <div class="item-label">
            <van-icon name="alipay" size="16" color="#1677ff" />
            <span>支付宝账号</span>
          </div>
          <input v-model="formData.account" type="text" placeholder="请输入支付宝账号/手机号" class="item-input" />
        </div>

        <!-- 支付宝二维码 -->
        <div class="form-item upload-item" v-if="activeTab === 'alipay'">
          <div class="item-label">
            <van-icon name="qr" size="16" color="#1677ff" />
            <span>收款二维码</span>
            <span class="optional-tag">选填</span>
          </div>
          <div class="upload-wrapper" @click="triggerFileInput">
            <div class="qrcode-preview" v-if="formData.url">
              <img :src="formData.url" alt="收款二维码" class="qrcode-image" />
              <div class="qrcode-mask">
                <van-icon name="photograph" size="24" color="#fff" />
                <span>重新上传</span>
              </div>
            </div>
            <div class="upload-btn" v-else>
              <van-icon name="photograph" size="28" color="#dcdee0" />
              <span>上传收款二维码</span>
              <span class="upload-tip">建议尺寸 500x500</span>
            </div>
          </div>
        </div>

        <!-- 微信账号 -->
        <div class="form-item" v-if="activeTab === 'wechat'">
          <div class="item-label">
            <van-icon name="wechat-pay" size="16" color="#07c160" />
            <span>微信账号</span>
          </div>
          <input v-model="formData.account" type="text" placeholder="请输入微信号/手机号" class="item-input" />
        </div>

        <!-- 微信二维码 -->
        <div class="form-item upload-item" v-if="activeTab === 'wechat'">
          <div class="item-label">
            <van-icon name="qr" size="16" color="#07c160" />
            <span>收款二维码</span>
            <span class="optional-tag">选填</span>
          </div>
          <div class="upload-wrapper" @click="triggerFileInput">
            <div class="qrcode-preview" v-if="formData.url">
              <img :src="formData.url" alt="收款二维码" class="qrcode-image" />
              <div class="qrcode-mask">
                <van-icon name="photograph" size="24" color="#fff" />
                <span>重新上传</span>
              </div>
            </div>
            <div class="upload-btn" v-else>
              <van-icon name="photograph" size="28" color="#dcdee0" />
              <span>上传收款二维码</span>
              <span class="upload-tip">建议尺寸 500x500</span>
            </div>
          </div>
        </div>

        <!-- 隐藏的文件选择器 -->
        <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange" />

        <!-- 银行卡号 -->
        <div class="form-item" v-if="activeTab === 'bank'">
          <div class="item-label">
            <van-icon name="card" size="16" color="#ff9500" />
            <span>银行卡号</span>
          </div>
          <input v-model="formData.account" type="text" placeholder="请输入银行卡号" class="item-input" maxlength="19" />
        </div>

        <!-- 开户银行 -->
        <div class="form-item" v-if="activeTab === 'bank'">
          <div class="item-label">
            <van-icon name="shop-o" size="16" color="#ff9500" />
            <span>开户银行</span>
          </div>
          <input v-model="formData.bank_name" type="text" placeholder="例如：中国工商银行" class="item-input" />
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="tips-section">
        <div class="tips-title">
          <van-icon name="info-o" size="14" />
          <span>温馨提示</span>
        </div>
        <div class="tips-content">
          <p v-if="activeTab === 'alipay'">• 请确保支付宝账号与真实姓名一致</p>
          <p v-if="activeTab === 'alipay'">• 上传收款二维码可提高收款效率</p>
          <p v-if="activeTab === 'wechat'">• 请确保微信账号与真实姓名一致</p>
          <p v-if="activeTab === 'wechat'">• 上传收款二维码可提高收款效率</p>
          <p v-if="activeTab === 'bank'">• 请仔细核对银行卡号，避免输入错误</p>
          <p v-if="activeTab === 'bank'">• 开户银行名称需与银行卡一致</p>
        </div>
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <button class="submit-btn" @click="handleSubmit">
          <van-icon name="success" size="18" />
          <span>确认添加</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import API from "../../request/api";

const router = useRouter();

// 当前选中的收款方式
const activeTab = ref("alipay");

// 表单数据
const formData = ref({
  real_name: "",
  account: "",
  url: "",
  bank_name: "",
});

// 文件输入框引用
const fileInput = ref(null);

// 切换收款方式时重置表单
const onTabChange = () => {
  formData.value = {
    real_name: formData.value.real_name, // 保留真实姓名
    account: "",
    url: "",
    bank_name: "",
  };
};

// 触发文件选择
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// 处理文件选择
const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    return;
  }

  // 验证文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    showToast("图片大小不能超过5MB");
    return;
  }

  try {
    const toast = showToast({
      type: "loading",
      message: "上传中...",
      forbidClick: true,
      duration: 0,
    });

    const res = await API.uploadFile(file);
    toast.close();

    if (res.code === 1 && res.data) {
      const uploadedUrl = res.data.fullurl || res.data.url || res.data;
      formData.value.url = uploadedUrl;
      showToast("上传成功");
    } else {
      showToast(res.msg || "上传失败");
    }
  } catch (error) {
    console.error("上传失败:", error);
    showToast("上传失败，请稍后重试");
  } finally {
    // 清空文件选择
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

// 验证银行卡号
const validateCardNumber = (cardNumber) => {
  const reg = /^\d{16,19}$/;
  return reg.test(cardNumber);
};

// 提交表单
const handleSubmit = async () => {
  // 验证真实姓名
  if (!formData.value.real_name || formData.value.real_name.trim() === "") {
    showToast("请输入真实姓名");
    return;
  }

  // 验证账号
  if (!formData.value.account || formData.value.account.trim() === "") {
    if (activeTab.value === "alipay") {
      showToast("请输入支付宝账号");
    } else if (activeTab.value === "wechat") {
      showToast("请输入微信账号");
    } else {
      showToast("请输入银行卡号");
    }
    return;
  }

  // 验证银行卡号格式
  if (activeTab.value === "bank" && !validateCardNumber(formData.value.account)) {
    showToast("请输入正确的银行卡号");
    return;
  }

  // 验证开户银行
  if (activeTab.value === "bank" && (!formData.value.bank_name || formData.value.bank_name.trim() === "")) {
    showToast("请输入开户银行");
    return;
  }

  // 验证二维码（支付宝和微信可选）
  if ((activeTab.value === "alipay" || activeTab.value === "wechat") && !formData.value.url) {
    // 二维码是可选的，不强制要求
  }

  try {
    showToast({
      type: "loading",
      message: "提交中...",
      forbidClick: true,
      duration: 0,
    });

    const payload = {
      type: activeTab.value,
      real_name: formData.value.real_name,
      account: formData.value.account,
    };

    // 添加可选字段
    if (formData.value.url) {
      payload.url = formData.value.url;
    }
    if (activeTab.value === "bank" && formData.value.bank_name) {
      payload.bank_name = formData.value.bank_name;
    }

    const res = await API.addAccount(payload);

    if (res.code === 1) {
      showToast("添加成功");
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      showToast(res.msg || "添加失败");
    }
  } catch (error) {
    console.error("添加收款方式失败:", error);
    showToast(error.message || "添加失败，请稍后重试");
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
  background: linear-gradient(180deg, #fff 0%, #f7f8fa 100%);
  color: #0f172a;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
  max-width: 430px;
  margin: 0 auto;
}

.nav-bar-center-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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

:deep(.van-nav-bar__title) {
  font-size: 17px;
  font-weight: 600;
}

/* 表单内容 */
.form-content {
  padding: 0;
  flex: 1;
}

.payment-tabs {
  background: #fff;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tab-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}

:deep(.van-tabs__nav) {
  background: #fff;
  padding: 8px 0;
}

:deep(.van-tab) {
  font-size: 15px;
  color: #646566;
  padding: 0 12px;
}

:deep(.van-tab--active) {
  color: #fc3c3c;
  font-weight: 600;
}

:deep(.van-tab--active .tab-title) {
  color: #fc3c3c;
}

.form-container {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 16px 16px;
  padding: 8px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.form-item {
  padding: 16px;
  border-bottom: 1px solid #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  transition: background 0.2s;
}

.form-item:last-child {
  border-bottom: none;
}

.form-item:active {
  background: #f7f8fa;
}

.item-label {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
  min-width: 100px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.optional-tag {
  font-size: 11px;
  color: #969799;
  background: #f2f3f5;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 4px;
}

.item-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #323233;
  background: transparent;
  text-align: right;
  padding: 4px 0;
}

.item-input::placeholder {
  color: #c8c9cc;
  font-size: 14px;
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

/* 上传组件 */
.upload-item {
  flex-direction: column;
  align-items: flex-start;
  padding: 20px 16px;
}

.upload-wrapper {
  width: 100%;
  margin-top: 12px;
  cursor: pointer;
}

.upload-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 140px;
  height: 140px;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  background: #fafbfc;
  color: #969799;
  font-size: 13px;
  gap: 8px;
  transition: all 0.3s;
  position: relative;
}

.upload-btn::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 12px;
  padding: 2px;
  background: linear-gradient(135deg, #fc3c3c, #ff6b6b);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
}

.upload-btn:active::before {
  opacity: 1;
}

.upload-btn:active {
  background: #fff5f5;
  border-color: transparent;
}

.upload-tip {
  font-size: 11px;
  color: #c8c9cc;
  margin-top: -4px;
}

.qrcode-preview {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
}

.qrcode-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qrcode-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(252, 60, 60, 0.9), rgba(255, 107, 107, 0.9));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
}

.qrcode-preview:active .qrcode-mask {
  opacity: 1;
}

/* 温馨提示 */
.tips-section {
  margin: 0 16px 16px;
  padding: 16px;
  background: linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%);
  border-radius: 12px;
  border-left: 3px solid #ff9500;
}

.tips-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #ff9500;
  margin-bottom: 12px;
}

.tips-content {
  font-size: 13px;
  color: #646566;
  line-height: 1.8;
}

.tips-content p {
  margin: 4px 0;
  padding-left: 4px;
}

/* 提交按钮 */
.submit-section {
  padding: 16px;
  padding-bottom: 24px;
}

.submit-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  border: none;
  border-radius: 25px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(252, 60, 60, 0.35);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.submit-btn:active::before {
  width: 300px;
  height: 300px;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(252, 60, 60, 0.3);
}
</style>
