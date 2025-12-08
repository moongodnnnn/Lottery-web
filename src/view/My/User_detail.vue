<template>
  <div class="page">
    <!-- 自定义导航栏 - 白色背景，黑色文字 -->
    <div class="custom-navbar">
      <div class="navbar-left" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </div>
      <div class="navbar-title">用户详情</div>
      <div class="navbar-right"></div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" type="spinner" size="24px" vertical class="loading-container">
      加载中...
    </van-loading>

    <!-- 内容区域 -->
    <div v-else-if="userInfo" class="content">
      <!-- 用户信息区域 -->
      <div class="user-section">
        <!-- 头像 -->
        <div class="user-avatar">
          <img :src="userInfo.user?.avatar || '/icons/avatar.png'" :alt="userInfo.user?.nickname" />
        </div>

        <!-- 名字和关注按钮 -->
        <div class="user-name-row">
          <span class="user-name">{{ userInfo.user?.nickname || '未知用户' }}</span>
          <button :class="['follow-btn', { 'followed': isFollowed }]" @click="toggleFollow">
            {{ getFollowButtonText() }}
          </button>
        </div>

        <!-- 粉丝数 -->
        <div class="user-fans">粉丝：{{ userInfo.user?.fans || 0 }}</div>

        <!-- 数据统计 -->
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.user?.zj_amount || 0 }}</div>
            <div class="stat-label">累计中奖金额</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.user?.yl_7 || 0 }}%</div>
            <div class="stat-label">7日盈利率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ userInfo.user?.mz_7 || '0-0' }}</div>
            <div class="stat-label">7日命中</div>
          </div>
        </div>

   

        <!-- 最近走势 -->
        <div class="trend-section">
          <div class="trend-label">最近走势</div>
          <div class="trend-list">
            <span v-for="(item, index) in getTrendList()" :key="index" :class="['trend-dot', item.status]">
              {{ item.status === 'win' ? '中' : '未' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 中奖记录卡片 -->
      <div class="records-card">
        <div class="card-title">最近战绩</div>
        
        <!-- 有记录时显示列表 -->
        <div v-if="userInfo.zj && userInfo.zj.length > 0" class="records-list">
          <div 
            v-for="(record, index) in userInfo.zj" 
            :key="record.id" 
            class="record-item"
          >
            <div class="record-header">
              <div class="record-title">
                <span class="record-cate">【{{ record.cate_name }}】</span>
                <span class="record-name">{{ record.name }}</span>
              </div>
    
            </div>
            
            <!-- 第二排：所有信息在同一行 -->
            <div class="record-info">
              <div class="record-info-item">
                <div class="info-value">{{ record.amount }}</div>
                <div class="info-label">投注金额</div>
              </div>
              <div class="record-info-item">
                <div class="info-value" style="font-size: 12px;">{{ record.rules }}</div>
                <div class="info-label">玩法</div>
              </div>
              <div class="record-info-item">
                <div class="info-value">{{ record.mood }}</div>
                <div class="info-label">跟单人数</div>
              </div>
              <div class="record-info-item">
                <div class="info-value" :class="{ highlight: record.reward_price > 10 }">¥{{ record.reward_price }}</div>
                <div class="info-label">中奖金额</div>
              </div>
          
            </div>
          </div>
        </div>

        <!-- 无记录时显示空状态 -->
        <div v-else class="no-records">
          <van-empty description="暂无中奖记录" />
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="!loading && !userInfo" description="暂无数据" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import API from '../../request/api';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const userInfo = ref(null);
const isFollowed = ref(false);

// 返回上一页
const goBack = () => {
  router.back();
};

// 获取关注按钮文字
const getFollowButtonText = () => {
  const followStatus = userInfo.value?.user?.is_follow;
  if (followStatus === 2) {
    return '互相关注';
  } else if (followStatus === 1) {
    return '已关注';
  } else {
    return '+ 关注';
  }
};

// 获取最近走势（根据 zs 数组）
const getTrendList = () => {
  // zs 数组：0=未中，1=中
  if (userInfo.value?.zs && Array.isArray(userInfo.value.zs)) {
    return userInfo.value.zs.map(item => ({
      status: item === 1 ? 'win' : 'lose'
    }));
  }
  return Array(5).fill({ status: 'lose' });
};

// 获取订单状态文字
const getStatusText = (orderStatus) => {
  const statusMap = {
    1: '待开奖',
    2: '未中奖',
    3: '部分中奖',
    4: '已中奖',
    5: '已退款'
  };
  return statusMap[orderStatus] || '未知';
};

// 获取订单状态样式类
const getStatusClass = (orderStatus) => {
  if (orderStatus === 4) return 'status-win';
  if (orderStatus === 2) return 'status-lose';
  if (orderStatus === 3) return 'status-partial';
  return 'status-pending';
};

// 获取记录状态文字
const getOrderStatusText = (status) => {
  if (status === 'done') return '已完成';
  if (status === 'ing') return '进行中';
  return '未开始';
};

// 切换关注状态
const toggleFollow = async () => {
  try {
    const userId = userInfo.value?.user?.id;
    if (!userId) {
      showToast('用户信息错误');
      return;
    }

    console.log('关注/取关用户，ID:', userId);
    const res = await API.addFollow(userId);
    console.log('关注/取关结果:', res);

    if (res.code === 1) {
      // 切换关注状态
      isFollowed.value = !isFollowed.value;
      showToast(isFollowed.value ? '关注成功' : '取消关注');

      // 更新用户数据中的关注状态
      if (userInfo.value?.user) {
        userInfo.value.user.is_follow = isFollowed.value ? 1 : 0;
      }
    } else {
      showToast(res.msg || '操作失败，请稍后重试');
    }
  } catch (error) {
    console.error('关注/取关失败:', error);
    showToast('操作失败，请稍后重试');
  }
};

// 获取用户详情
const getUserDetail = async () => {
  try {
    loading.value = true;
    const userId = route.query.id;
    
    if (!userId) {
      showToast('缺少用户ID');
      router.back();
      return;
    }

    console.log('获取用户详情，ID:', userId);
    const res = await API.getlistUserInfo(userId);
    console.log('用户详情数据:', res);

    if (res.code === 1 && res.data) {
      userInfo.value = res.data;

      // 初始化关注状态：0=未关注，1=关注，2=互关
      if (res.data.user?.is_follow !== undefined) {
        isFollowed.value = res.data.user.is_follow >= 1;
      }
    } else {
      showToast(res.msg || '获取详情失败');
    }
  } catch (error) {
    console.error('获取用户详情失败:', error);
    showToast('获取详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getUserDetail();
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 20px;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 430px;
  margin: 0 auto;
  height: 46px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 999;
  border-bottom: 1px solid #f5f5f5;
}

.navbar-left {
  width: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.navbar-left .van-icon {
  color: #323233;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.navbar-right {
  width: 40px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  margin-top: 46px;
}

.content {
  padding-top: 46px;
}

/* 用户信息区域 */
.user-section {
  background: #ffffff;
  padding: 20px 16px;
  margin: 12px;
  border-radius: 12px;
  text-align: center;
}

.user-avatar {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 10px;
  border: 3px solid #f5f5f5;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.follow-btn {
  padding: 5px 16px;
  background: #fc3c3c;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-btn:active {
  opacity: 0.8;
}

.follow-btn.followed {
  background: #969799;
}

.user-fans {
  font-size: 14px;
  color: #969799;
  margin-bottom: 16px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #323233;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}

/* 累计中奖金额 */
.prize-section {
  margin: 16px 0;
  padding: 12px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
  border-radius: 8px;
}

.prize-label {
  font-size: 13px;
  color: #646566;
  margin-bottom: 6px;
}

.prize-amount {
  font-size: 24px;
  font-weight: 700;
  color: #fc3c3c;
}

/* 最近走势 */
.trend-section {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-label {
  font-size: 14px;
  color: #646566;
  font-weight: 500;
}

.trend-list {
  display: flex;
  gap: 8px;
  align-items: center;
}

.trend-dot {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.trend-dot.win {
  background: #fc3c3c;
  color: #ffffff;
}

.trend-dot.lose {
  background: #dcdee0;
  color: #ffffff;
}

/* 中奖记录卡片 */
.records-card {
  background: #ffffff;
  margin: 12px;
  padding: 16px;
  border-radius: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 6px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  padding: 8px 1px;
  background: #ffffff;
  border-radius: 8px;
} 

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.record-title {
  flex: 1;
  font-size: 14px;
  color: #323233;
  font-weight: 500;
  line-height: 1.4;
}

.record-cate {
  color: #fc3c3c;
  font-weight: 600;
  margin-right: 4px;
}

.record-status {
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 10px;
  font-weight: 500;
  flex-shrink: 0;
  margin-left: 8px;
}

.status-win {
  background: #fff5f5;
  color: #fc3c3c;
}

.status-lose {
  background: #f5f5f5;
  color: #969799;
}

.status-partial {
  background: #fff7e6;
  color: #ff9800;
}

.status-pending {
  background: #e8f4ff;
  color: #1989fa;
}

/* 第二排：所有信息紧凑排列 */
.record-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #e5e5e5;
}

.record-info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.record-info-item:last-child {
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-label {
  color: #969799;
  font-size: 11px;
  margin-top: 4px;
}

.info-value {
  color: #323233;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.2;
}

/* 中奖金额特殊样式 */
.info-value.highlight {
  color: #fc3c3c;
  font-size: 16px;
  font-weight: 700;
}

/* 中奖结果标签 */
.record-result-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  white-space: nowrap;
}

.record-result-tag.win {
  background: #fc3c3c;
  color: #ffffff;
}

.record-result-tag.lose {
  background: #dcdee0;
  color: #ffffff;
}

/* 隐藏旧的样式 */
.record-footer {
  display: none;
}

.record-reward,
.reward-label,
.reward-value,
.record-result {
  display: none;
}

.no-records {
  padding: 20px 0;
}
</style>
