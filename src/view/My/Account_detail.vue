<template>
  <div class="page">
    <!-- 导航栏 -->
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="账目明细" left-arrow @click-left="goBack" class="nav-bar" />
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <van-tabs v-model:active="activeTab" @change="onTabChange" color="#fc3c3c" title-active-color="#fc3c3c">
        <van-tab title="全部" name="-1"></van-tab>
        <van-tab title="添加" name="0"></van-tab>
        <van-tab title="扣减" name="1"></van-tab>
      </van-tabs>
    </div>

    <!-- 时间筛选 -->
    <div class="time-filter">
      <div
        v-for="item in timeOptions"
        :key="item.value"
        :class="['time-option', { active: activeTime === item.value }]"
        @click="onTimeChange(item.value)"
      >
        {{ item.label }}
      </div>
    </div>

    <!-- 账目列表 -->
    <div class="content">
      <!-- 空状态 -->
      <van-empty v-if="!loading && accountList.length === 0" description="暂无账目记录" />

      <!-- 列表 -->
      <div v-else class="account-list">
        <div v-for="item in accountList" :key="item.id" class="account-card">
          <!-- 第一排：用途和金额（加粗） -->
          <div class="card-row-1">
            <div class="card-memo">{{ item.memo || '-' }}</div>
            <div class="card-amount" :class="{ 'amount-add': item.type === 'add', 'amount-reduce': item.type !== 'add' }">
              {{ item.type === 'add' ? '+' : '-' }}{{ item.money }}
            </div>
          </div>

          <!-- 第二排：类型和余额 -->
          <div class="card-row-2">
            <div class="card-type">{{ item.type === 'add' ? '添加' : '扣减' }}</div>
            <div class="card-balance">余额：{{ item.after_money }}</div>
          </div>

          <!-- 第三排：时间 -->
          <div class="card-row-3">
            <div class="card-time">{{ formatTime(item.createtime) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import API from '../../request/api';

const router = useRouter();
const activeTab = ref('-1'); // -1全部 0添加 1扣减
const activeTime = ref('week'); // week一周 month一个月 year一年
const loading = ref(false);
const finished = ref(false);
const accountList = ref([]);
const page = ref(1);
const total = ref(0);

// 时间选项
const timeOptions = [
  { label: '最近一周', value: 'week' },
  { label: '最近一个月', value: 'month' },
  { label: '最近一年', value: 'year' },
];

// 返回上一页
const goBack = () => {
  router.back();
};

// 格式化时间戳为显示时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

// 格式化日期为 Y-m-d 格式
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取时间范围
const getTimeRange = (type) => {
  const now = new Date();
  const endDate = formatDate(now);
  let startDate;

  if (type === 'week') {
    // 最近一周
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    startDate = formatDate(weekAgo);
  } else if (type === 'month') {
    // 最近一个月
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDate = formatDate(monthAgo);
  } else if (type === 'year') {
    // 最近一年
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    startDate = formatDate(yearAgo);
  }

  return { st: startDate, et: endDate };
};

// 切换类型标签
const onTabChange = () => {
  // 重置数据
  accountList.value = [];
  page.value = 1;
  finished.value = false;
  // 加载新数据
  loadAccountList();
};

// 切换时间范围
const onTimeChange = (timeType) => {
  activeTime.value = timeType;
  // 重置数据
  accountList.value = [];
  page.value = 1;
  finished.value = false;
  // 加载新数据
  loadAccountList();
};

// 加载账目列表
const loadAccountList = async () => {
  if (loading.value || finished.value) return;

  try {
    loading.value = true;

    // 获取时间范围
    const timeRange = getTimeRange(activeTime.value);

    const params = {
      st: timeRange.st,        // 开始时间 Y-m-d
      et: timeRange.et,        // 结束时间 Y-m-d
      type: activeTab.value,   // 类型 -1全部 0添加 1扣减
      page: page.value,        // 分页
    };

    console.log('请求账目明细，参数:', params);
    const res = await API.getAccountDetail(params);
    console.log('账目明细响应:', res);

    if (res.code === 1 && res.data) {
      // 获取列表数据
      const listData = res.data.list || {};
      const newList = listData.data || [];

      // 追加数据
      accountList.value = [...accountList.value, ...newList];

      // 更新分页信息
      if (listData.total !== undefined) {
        total.value = listData.total;
      }
      page.value++;

      // 判断是否加载完成
      if (newList.length === 0 || (listData.last_page && page.value > listData.last_page)) {
        finished.value = true;
      }
    } else {
      showToast(res.msg || '加载账目明细失败');
      finished.value = true;
    }
  } catch (error) {
    console.error('加载账目明细失败:', error);
    showToast('加载账目明细失败');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // 首次加载
  loadAccountList();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
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

.filter-tabs {
  background: #fff;
  padding: 0;
}

.time-filter {
  background: #fff;
  display: flex;
  justify-content: space-around;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
}

.time-option {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  color: #646566;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s;
}

.time-option.active {
  background: #fc3c3c;
  color: #fff;
  font-weight: 500;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background-color: #fff;
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 账目卡片 */
.account-card {
  background: #fff;
  padding: 8px;
}

/* 第一排：用途和金额（加粗） */
.card-row-1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-memo {
  font-size: 15px;
  color: #323233;
  font-weight: 700;
  flex: 1;
}

.card-amount {
  font-size: 18px;
  font-weight: 700;
}

.card-amount.amount-add {
  color: #52c41a;
}

.card-amount.amount-reduce {
  color: #ff4d4f;
}

/* 第二排：类型和余额 */
.card-row-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-type {
  font-size: 13px;
  color: #646566;
}

.card-balance {
  font-size: 13px;
  color: #646566;
}

/* 第三排：时间 */
.card-row-3 {
  display: flex;
  align-items: center;
}

.card-time {
  font-size: 12px;
  color: #969799;
}
</style>

