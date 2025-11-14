<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="卡包中心" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="card-content">
      <!-- 账户列表 -->
      <div v-if="accounts.length > 0" class="card-list">
        <div v-for="account in accounts" :key="account.id" class="bank-card-item">
          <!-- 支付宝卡片 -->
          <div v-if="account.type === 'alipay'" class="gradient-card alipay-card">
            <div class="card-left">
              <van-icon name="alipay" size="42" color="#fff" class="payment-icon" />
              <div class="card-info">
                <div class="bank-name">支付宝</div>
                <div class="card-number">{{ account.real_name }} - {{ formatAccount(account.account) }}</div>
              </div>
            </div>
      
          </div>

          <!-- 微信卡片 -->
          <div v-else-if="account.type === 'wechat'" class="gradient-card wechat-card">
            <div class="card-left">
              <van-icon name="wechat-pay" size="42" color="#fff" class="payment-icon" />
              <div class="card-info">
                <div class="bank-name">微信支付</div>
                <div class="card-number">{{ account.real_name }} - {{ formatAccount(account.account) }}</div>
              </div>
            </div>
      
          </div>

          <!-- 银行卡卡片 -->
          <div v-else-if="account.type === 'bank'" class="gradient-card bank-card">
            <div class="card-left">
              <van-icon name="card" size="42" color="#fff" class="payment-icon" />
              <div class="card-info">
                <div class="bank-name">{{ account.bank_name }}</div>
                <div class="card-number">{{ account.real_name }} - {{ formatCardNumber(account.account) }}</div>
              </div>
            </div>
  
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <van-empty description="暂无收款方式" />
      </div>

      <!-- 添加收款方式按钮 -->
      <div class="add-card-section">
        <button class="add-card-btn" @click="handleAddCard">
          <van-icon name="plus" size="20" />
          <span>添加收款方式</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { useRouter } from "vue-router";
import API from "../../request/api";

const router = useRouter();

// 账户列表
const accounts = ref([]);

// 格式化卡号（显示后4位）
const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
};

// 格式化账号（支付宝/微信账号）
const formatAccount = (account) => {
  if (!account) return '';
  // 如果是手机号（11位数字）
  if (/^\d{11}$/.test(account)) {
    return account.slice(0, 3) + '****' + account.slice(-4);
  }
  // 其他账号显示前3位和后3位
  if (account.length > 6) {
    return account.slice(0, 3) + '****' + account.slice(-3);
  }
  return account;
};

// 添加收款方式
const handleAddCard = () => {
  router.push('/add-bank-card');
};

// 删除收款方式
const handleDeleteCard = async (account) => {
  try {
    let accountName = '';
    if (account.type === 'alipay') {
      accountName = `支付宝(${account.real_name})`;
    } else if (account.type === 'wechat') {
      accountName = `微信(${account.real_name})`;
    } else if (account.type === 'bank') {
      accountName = `${account.bank_name}(${formatCardNumber(account.account)})`;
    }

    await showConfirmDialog({
      title: '提示',
      message: `确定要删除${accountName}吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    // TODO: 调用删除接口
    showToast('删除成功');
    accounts.value = accounts.value.filter(item => item.id !== account.id);
  } catch (error) {
    if (error === 'cancel') return;
    console.error('删除失败:', error);
  }
};

// 获取账户列表
const getBankCards = async () => {
  const toast = showToast({
    type: 'loading',
    message: '加载中...',
    forbidClick: true,
    duration: 0,
  });

  try {
    const res = await API.accountList();
    toast.close();

    if (res.code === 1 && res.data) {
      accounts.value = res.data;
    } else {
      showToast(res.msg || '获取账户列表失败');
    }
  } catch (error) {
    toast.close();
    console.error('获取账户列表失败:', error);
    showToast('获取账户列表失败');
  }
};

onMounted(() => {
  getBankCards();
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

/* 内容区域 */
.card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 银行卡列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-card-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片通用样式 */
.gradient-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 14px;
  border-radius: 12px;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.gradient-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.gradient-card:active {
  transform: scale(0.98);
}

/* 支付宝卡片 */
.alipay-card {
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

/* 微信卡片 */
.wechat-card {
  background: linear-gradient(135deg, #07c160 0%, #2aae67 100%);
  box-shadow: 0 4px 12px rgba(7, 193, 96, 0.3);
}

/* 银行卡卡片 */
.bank-card {
  background: linear-gradient(135deg, #ff9500 0%, #ffb340 100%);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.3);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.payment-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bank-name {
  font-size: 15px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-number {
  font-size: 13px;
  opacity: 0.95;
  font-family: 'Courier New', monospace;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.card-right {
  cursor: pointer;
  padding: 8px;
  opacity: 0.9;
  transition: opacity 0.3s;
  z-index: 1;
}

.card-right:active {
  opacity: 1;
}

/* 空状态 */
.empty-state {
  padding: 60px 0;
}

/* 添加银行卡按钮 */
.add-card-section {
  margin-top: 20px;
}

.add-card-btn {
  width: 100%;
  height: 50px;
  background: #fff;
  border: 1px solid #d32121;
  border-radius: 8px;
  color: #d32121;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.add-card-btn:active {
  transform: scale(0.98);
  background: #fff7f7;
}
</style>

