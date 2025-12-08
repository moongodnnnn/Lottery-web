<template>
  <div class="page">
    <!-- 顶部导航栏 -->
  <div class="nav-bar-center-wrap">
      <van-nav-bar title="邀请记录" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>

    <!-- Tabs 切换 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange" animated sticky>
      <van-tab title="好友记录">
        <!-- Loading 状态 -->
        <div v-if="loadingFriends" class="loading-container">
          <van-loading size="40px" vertical color="#fc3c3c">加载中...</van-loading>
        </div>

        <!-- 好友记录列表 -->
        <div v-else-if="friendRecords.length > 0" class="records-list">
          <div
            v-for="(record, index) in friendRecords"
            :key="index"
            class="record-item"
          >
            <div class="record-content">
              <div class="record-info">
                <div class="record-title">邀请好友</div>
                <div class="record-time">{{ record.time || '时间未知' }}</div>
              </div>
              <div class="record-status">
                <div class="record-status-text">{{ record.status || '待处理' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty v-else description="暂无好友邀请记录" />
      </van-tab>

      <van-tab title="店铺记录">
        <!-- Loading 状态 -->
        <div v-if="loadingStores" class="loading-container">
          <van-loading size="40px" vertical color="#fc3c3c">加载中...</van-loading>
        </div>

        <!-- 店铺记录列表 -->
        <div v-else-if="storeRecords.length > 0" class="records-list">
          <div
            v-for="(record, index) in storeRecords"
            :key="index"
            class="record-item"
          >
            <div class="record-content">
              <div class="record-info">
                <div class="record-title">邀请店铺</div>
                <div class="record-time">{{ record.time || '时间未知' }}</div>
              </div>
              <div class="record-status">
                <div class="record-status-text">{{ record.status || '待处理' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <van-empty v-else description="暂无店铺邀请记录" />
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import API from '../../request/api.js';

const router = useRouter();

// Tab 状态
const activeTab = ref(0);

// Loading 状态
const loadingFriends = ref(false);
const loadingStores = ref(false);

// 数据
const friendRecords = ref([]);
const storeRecords = ref([]);

function onClickLeft() {
  router.back();
}

// Tab 切换
const onTabChange = (index) => {
  if (index === 0 && friendRecords.value.length === 0) {
    getUserInvited();
  } else if (index === 1 && storeRecords.value.length === 0) {
    getStoreInvited();
  }
};

// 获取好友邀请记录
const getUserInvited = async () => {
  loadingFriends.value = true;
  try {
    const res = await API.getUserInvited();
    if (res.code === 1) {
      // 这里等待接口返回数据格式后再处理
      friendRecords.value = res.data || [];
    } else {
      showToast(res.msg || '获取好友邀请记录失败');
    }
  } catch (err) {
    console.error('获取好友邀请记录失败:', err);
    showToast(err.msg || '获取好友邀请记录失败');
  } finally {
    loadingFriends.value = false;
  }
};

// 获取店铺邀请记录
const getStoreInvited = async () => {
  loadingStores.value = true;
  try {
    const res = await API.getStoreInvited();
    if (res.code === 1) {
      // 这里等待接口返回数据格式后再处理
      storeRecords.value = res.data || [];
    } else {
      showToast(res.msg || '获取店铺邀请记录失败');
    }
  } catch (err) {
    console.error('获取店铺邀请记录失败:', err);
    showToast(err.msg || '获取店铺邀请记录失败');
  } finally {
    loadingStores.value = false;
  }
};

// 页面加载时获取好友记录
onMounted(() => {
  getUserInvited();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  max-width: 430px;
  margin: 0 auto;
}

/* Loading 容器 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

/* 记录列表 */
.records-list {
  padding: 12px;
}

.record-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.record-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.record-info {
  flex: 1;
}

.nav-bar-center-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
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


.record-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.record-time {
  font-size: 13px;
  color: #999;
}

.record-status {
  text-align: right;
}

.record-status-text {
  font-size: 14px;
  color: #fc3c3c;
  font-weight: 500;
}

/* Tabs 样式优化 */
:deep(.van-tabs__nav) {
  background: #fff;
}

:deep(.van-tab) {
  font-size: 15px;
  color: #666;
}

:deep(.van-tab--active) {
  color: #fc3c3c;
  font-weight: 600;
}

:deep(.van-tabs__line) {
  background: #fc3c3c;
  width: 40px;
}

/* 空状态样式 */
:deep(.van-empty) {
  padding: 80px 0;
}

:deep(.van-empty__description) {
  color: #999;
  font-size: 14px;
}
</style>
