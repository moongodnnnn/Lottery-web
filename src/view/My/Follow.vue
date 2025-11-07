<template>
  <div class="follow-page">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="pageTitle"
      left-arrow
      @click-left="onClickLeft"
      :style="{ background: '#fff', color: '#323233' }"
    />

    <!-- 标签页 -->
    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="关注" name="follow"></van-tab>
      <van-tab title="粉丝" name="fans"></van-tab>
    </van-tabs>

    <!-- 列表内容 -->
    <div class="follow-content">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="loadList"
      >
        <div class="follow-list">
          <div v-for="item in list" :key="item.id" class="follow-item">
            <img :src="item.avatar || '/icons/avatar1.png'" class="follow-avatar" />
            <div class="follow-info">
              <div class="follow-name">{{ item.nickname || '未知用户' }}</div>
              <div class="follow-prize">中奖额度：{{ item.zj_amount || 0 }}元</div>
            </div>
            <button v-if="activeTab === 'follow'" class="unfollow-btn" @click="handleUnfollow(item)">
              取消关注
            </button>
          </div>
        </div>
      </van-list>

      <!-- 空状态 -->
      <van-empty v-if="!loading && list.length === 0" :description="emptyText" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import API from '../../request/api';

const router = useRouter();
const route = useRoute();

const activeTab = ref('follow');
const loading = ref(false);
const finished = ref(false);
const list = ref([]);
const userId = ref('');

// 页面标题
const pageTitle = computed(() => {
  return activeTab.value === 'follow' ? '我的关注' : '我的粉丝';
});

// 空状态文字
const emptyText = computed(() => {
  return activeTab.value === 'follow' ? '暂无关注' : '暂无粉丝';
});

// 返回上一页
const onClickLeft = () => {
  router.back();
};

// 切换标签
const onTabChange = () => {
  list.value = [];
  finished.value = false;
  loadList();
};

// 加载列表
const loadList = async () => {
  if (loading.value || finished.value) return;

  loading.value = true;

  try {
    const params = {
      type: activeTab.value, // fans 或 follow
    };

    const res = await API.getFollowList(userId.value, params);
    console.log('粉丝/关注列表:', res);

    if (res.code === 1 && res.data) {
      const newList = res.data.data || res.data || [];
      list.value = [...list.value, ...newList];

      // 判断是否还有更多数据
      if (res.data.last_page && res.data.current_page >= res.data.last_page) {
        finished.value = true;
      } else if (newList.length === 0) {
        finished.value = true;
      }
    } else {
      finished.value = true;
    }
  } catch (error) {
    console.error('加载列表失败:', error);
    showToast('加载失败，请稍后重试');
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 取消关注/移除粉丝
const handleUnfollow = async (item) => {
  try {
    const actionText = activeTab.value === 'follow' ? '取消关注' : '移除粉丝';
    await showConfirmDialog({
      title: '提示',
      message: `确定要${actionText}"${item.nickname}"吗？`,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    });

    // 调用取关接口
    const res = await API.addFollow(item.id);
    console.log('取关结果:', res);

    if (res.code === 1) {
      showToast(`${actionText}成功`);

      // 从列表中移除
      list.value = list.value.filter(i => i.id !== item.id);
    } else {
      showToast(res.msg || `${actionText}失败`);
    }
  } catch (error) {
    // 用户取消操作
    if (error === 'cancel') {
      return;
    }
    console.error('操作失败:', error);
    showToast('操作失败，请稍后重试');
  }
};

// 初始化
onMounted(() => {
  // 从本地存储获取用户ID
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userId.value = user.id || user.user_id || '';
    } catch (e) {
      console.error('解析用户信息失败:', e);
      showToast('获取用户信息失败');
      return;
    }
  }

  if (!userId.value) {
    showToast('请先登录');
    router.push('/login');
    return;
  }

  // 从路由参数获取类型
  const type = route.query.type;
  if (type === 'fans') {
    activeTab.value = 'fans';
  } else {
    activeTab.value = 'follow';
  }

  loadList();
});
</script>

<style scoped>
.follow-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.follow-content {
  padding: 12px;
}

.follow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.follow-item {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.follow-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.follow-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.follow-name {
  font-size: 15px;
  color: #323233;
  font-weight: 500;
}

.follow-prize {
  font-size: 13px;
  color: #969799;
}

.unfollow-btn {
  padding: 6px 16px;
  background: #fff;
  border: 1px solid #fc3c3c;
  border-radius: 16px;
  color: #fc3c3c;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.unfollow-btn:active {
  opacity: 0.8;
}
</style>

