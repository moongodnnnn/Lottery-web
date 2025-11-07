<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="卡包中心" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="card-content">
      <!-- 银行卡列表 -->
      <div v-if="bankCards.length > 0" class="card-list">
        <div v-for="card in bankCards" :key="card.id" class="bank-card-item">
          <div class="gradient-card">
            <div class="card-left">
              <img src="/icons/bankcard.png" alt="" class="bank-icon" />
              <div class="card-info">
                <div class="bank-name">{{ card.bankName }}</div>
                <div class="card-number">{{ formatCardNumber(card.cardNumber) }}</div>
              </div>
            </div>
            <div class="card-right" @click="handleDeleteCard(card)">
              <van-icon name="delete-o" size="18" />
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <van-empty description="暂无银行卡" />
      </div>

      <!-- 添加银行卡按钮 -->
      <div class="add-card-section">
        <button class="add-card-btn" @click="handleAddCard">
          <van-icon name="plus" size="20" />
          <span>添加银行卡</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { showToast, showConfirmDialog } from "vant";
import { useRouter } from "vue-router";

const router = useRouter();

// 银行卡列表
const bankCards = ref([]);

// 格式化卡号（显示后4位）
const formatCardNumber = (cardNumber) => {
  if (!cardNumber) return '';
  const last4 = cardNumber.slice(-4);
  return `**** **** **** ${last4}`;
};

// 添加银行卡
const handleAddCard = () => {
  router.push('/add-bank-card');
};

// 删除银行卡
const handleDeleteCard = async (card) => {
  try {
    await showConfirmDialog({
      title: '提示',
      message: `确定要删除${card.bankName}(${formatCardNumber(card.cardNumber)})吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    // TODO: 调用删除接口
    showToast('删除成功');
    bankCards.value = bankCards.value.filter(item => item.id !== card.id);
  } catch (error) {
    if (error === 'cancel') return;
    console.error('删除失败:', error);
  }
};

// 获取银行卡列表
const getBankCards = async () => {
  try {
    // TODO: 调用接口获取银行卡列表
    // const res = await API.getBankCards();
    
    // 模拟数据
    bankCards.value = [
      {
        id: 1,
        bankName: '中国工商银行',
        cardNumber: '6222021234567890123'
      },
      {
        id: 2,
        bankName: '中国建设银行',
        cardNumber: '6227001234567890123'
      }
    ];
  } catch (error) {
    console.error('获取银行卡列表失败:', error);
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

/* 银行卡卡片 */
.gradient-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 14px;
  border-radius: 8px;
  color: #ffffff;
  background: linear-gradient(180deg, #bd4949, #de7862);
  box-shadow: 0 4px 12px rgba(189, 73, 73, 0.2);
  transition: all 0.3s;
}

.gradient-card:active {
  transform: scale(0.98);
}

.card-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.bank-icon {
  width: 42px;
  height: 42px;
  border-radius: 4px;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bank-name {
  font-size: 15px;
  font-weight: 600;
}

.card-number {
  font-size: 13px;
  opacity: 0.9;
  font-family: 'Courier New', monospace;
}

.card-right {
  cursor: pointer;
  padding: 8px;
  opacity: 0.9;
  transition: opacity 0.3s;
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

