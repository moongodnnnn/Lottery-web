<template>
  <div class="page" role="main">
    <!-- 顶部tab栏 -->
    <div class="top-bar">
      <div class="tab-wrap">
        <van-tabs v-model:active="activeTab" @change="onTabChange" animated>
          <van-tab name="message">
            <template #title>
              <span v-if="activeTab !== 'message'">消息</span>
              <span v-else>
            <span>消息</span>
              </span>
            </template>
          </van-tab>
          <van-tab name="kefu">
            <template #title>
              <span v-if="activeTab !== 'kefu'">客服</span>
              <span v-else>
               <span>客服</span>
              </span>
            </template>
          </van-tab>
        </van-tabs>
      </div>

    </div>

    <!-- Tab内容区域 -->
    <div class="tab-content-wrapper">
      <!-- 消息Tab内容 -->
      <div v-show="activeTab === 'message'" class="tab-content">
        <!-- 消息列表 -->
        <div v-if="messageList.length > 0" class="message-list">
          <div
            v-for="item in messageList"
            :key="item.id"
            class="message-item"
            @click="handleMessageClick(item)"
          >
            <div class="message-icon">
              <van-icon name="bell" size="24" color="#fc3c3c" />
              <span v-if="item.is_read === 0" class="unread-dot"></span>
            </div>
            <div class="message-main">
              <div class="message-header">
                <div class="message-title">{{ item.type_text || '系统消息' }}</div>
                <div class="message-time">{{ item.time || formatTime(item.createtime) }}</div>
              </div>
              <div class="message-content-text">{{ item.msg }}</div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <van-empty description="暂无消息" />
        </div>
      </div>

      <!-- 客服Tab内容 -->
      <div v-show="activeTab === 'kefu'" class="tab-content kefu-content">
        <iframe v-if="kefuUrl" :src="kefuUrl" class="kefu-iframe"></iframe>
        <div v-else class="empty-state">
          <van-empty description="客服暂不可用" />
        </div>
      </div>
    </div>

    <!-- 消息详情弹窗 -->
    <van-popup 
      v-model:show="showMessageDetail" 
      position="bottom" 
      :style="{ maxHeight: '70%', borderRadius: '20px 20px 0 0' }"
    >
      <div class="message-detail">
        <div class="detail-header">
          <div class="detail-title">{{ currentMessage?.type_text || '系统消息' }}</div>
          <van-icon name="cross" @click="showMessageDetail = false" />
        </div>
        <div class="detail-time">{{ currentMessage?.time || formatTime(currentMessage?.createtime) }}</div>
        <div class="detail-content">{{ currentMessage?.msg }}</div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import API from "../../request/api";

const router = useRouter();

// Tab相关
const activeTab = ref('message');

// 消息相关
const messageList = ref([]);
const showMessageDetail = ref(false);
const currentMessage = ref(null);

// 客服相关
const kefuUrl = ref('');

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now - date;
  
  // 一分钟内
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 一小时内
  if (diff < 3600000) {
    return Math.floor(diff / 60000) + '分钟前';
  }
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0');
  }
  
  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天 ' + date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0');
  }
  
  // 其他日期
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return month + '-' + day;
};

// Tab切换
const onTabChange = (name) => {
  console.log('切换到:', name);
};

// 跳转到消息中心
const goToMessageCenter = () => {
  router.push('/message-center');
};

// 点击消息
const handleMessageClick = async (item) => {
  // 设置当前消息并显示弹窗
  currentMessage.value = item;
  showMessageDetail.value = true;

  // 标记为已读
  if (item.is_read === 0) {
    item.is_read = 1;
    try {
      await API.markMessageRead(item.id);
      console.log('标记消息已读成功:', item.id);
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  }
};

// 加载消息列表
const loadMessages = async () => {
  try {
    const res = await API.getToast();
    console.log('消息列表数据:', res);
    
    if (res.code === 1 && res.data) {
      messageList.value = res.data.data || [];
    } else {
      showToast(res.msg || '获取消息失败');
    }
  } catch (error) {
    console.error('获取消息列表失败:', error);
    showToast('获取消息失败');
  }
};

// 加载客服URL
const loadKefuUrl = () => {
  const config = JSON.parse(localStorage.getItem('config') || '{}');
  if (config?.kefu_url) {
    kefuUrl.value = config.kefu_url;
  }
};

onMounted(() => {
  loadMessages();
  loadKefuUrl();
});
</script>

<style scoped>
/* 全局样式 */
.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  color: #0f172a;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
}

/* 顶部栏样式 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 4px 12px 0 2px;
}

.tab-wrap {
  flex: 1;
  max-width: 140px;
}

.filter-wrap {
  margin-left: 12px;
  cursor: pointer;
}

/* tabs样式优化 */
:deep(.van-tabs__nav .van-tab) {
  font-size: 0.9rem;
  color: #bcbcbc;
  transition: font-size 0.2s, color 0.2s;
}

:deep(.van-tabs__nav .van-tab.van-tab--active) {
  font-size: 1.2rem;
  color: #333;
}

:deep(.van-tabs--line .van-tabs__wrap) {
  height: 48px;
}

:deep(.van-tabs__line) {
  background: #fc3c3c;
  width: 20px;
  height: 3px;
}

/* Tab内容区域 */
.tab-content-wrapper {
  flex: 1;
  overflow: hidden;
}

.tab-content {
  height: calc(100vh - 52px);
  overflow-y: auto;
  background: #f5f5f5;
}

/* 消息列表样式 */
.message-list {
  padding: 0;
}

.message-item {
  background: #fff;
  padding: 16px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-item:active {
  background-color: #f5f5f5;
}

.message-icon {
  position: relative;
  flex-shrink: 0;
}

.unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: #ff4444;
  border-radius: 50%;
  border: 2px solid #fff;
}

.message-main {
  flex: 1;
  overflow: hidden;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-title {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}

.message-time {
  font-size: 12px;
  color: #969799;
  flex-shrink: 0;
  margin-left: 8px;
}

.message-content-text {
  font-size: 14px;
  color: #646566;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 客服内容 */
.kefu-content {
  padding: 0;
  height: calc(100vh - 52px);
}

.kefu-iframe {
  width: 100%;
  height:90%;
  border: none;
}

/* 空状态 */
.empty-state {
  padding: 80px 0;
}

/* 消息详情弹窗 */
.message-detail {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.detail-header .van-icon {
  font-size: 20px;
  color: #999;
  cursor: pointer;
}

.detail-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
}

.detail-content {
  font-size: 15px;
  color: #333;
  line-height: 1.8;
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
