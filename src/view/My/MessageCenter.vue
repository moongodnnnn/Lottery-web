<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="消息中心" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="message-content">
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
              <div class="message-title">{{ item.title }}</div>
              <div class="message-time">{{ formatTime(item.createtime) }}</div>
            </div>
            <div class="message-content-text">{{ item.content }}</div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <van-empty description="暂无消息" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import API from "../../request/api";


const router = useRouter();

// 消息列表 - 静态数据
const messageList = ref([]);

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

// 点击消息
const handleMessageClick = async (item) => {
  // 标记为已读
  if (item.is_read === 0) {
    item.is_read = 1;
    // TODO: 调用接口标记已读
    // await API.markMessageRead(item.id);
  }

  // TODO: 根据消息类型跳转到不同页面
  showToast('查看消息详情');
};

function onClickLeft() {
  router.back();
};

onMounted(() => {
  API.getToast().then(res => {
    messageList.value = res.data.data;
  })
});



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

/* 消息内容 */
.message-content {
  flex: 1;
  overflow-y: auto;
}

/* 消息列表 */
.message-list {
  padding: 0;
}

.message-item {
  background: #fff;
  padding: 16px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.3s;
}

.message-item:active {
  background: #f9f9f9;
}

.message-icon {
  position: relative;
  width: 44px;
  height: 44px;
  background: #fff1f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.unread-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #fc3c3c;
  border-radius: 50%;
  border: 2px solid #fff;
}

.message-main {
  flex: 1;
  min-width: 0;
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

/* 空状态 */
.empty-state {
  padding: 80px 0;
}
</style>

