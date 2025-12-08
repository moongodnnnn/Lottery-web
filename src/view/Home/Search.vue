<template>
  <div class="search-page">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="搜索大神" left-arrow @click-left="goBack" class="nav-bar" />
    </div>

    <!-- 搜索输入区域 -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <van-icon name="search" class="search-icon" />
        <input v-model="searchKeyword" type="text" placeholder="请输入大神名字" class="search-input" />
        <van-icon v-if="searchKeyword" name="clear" class="clear-icon" @click="clearSearch" />
      </div>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <!-- 推荐大神区域 -->
    <div class="recommend-section">
      <div class="section-title">推荐大神</div>

      <!-- Loading 状态 -->
      <div v-if="loading" class="loading-wrapper">
        <van-loading type="spinner" size="24px">加载中...</van-loading>
      </div>

      <!-- 推荐大神列表 -->
      <div v-else-if="recommendExperts.length > 0" class="expert-list">
        <div v-for="expert in recommendExperts.slice(0, 5)" :key="expert.id" class="expert-item" @click="goToExpertDetail(expert.id)">
          <img :src="expert.avatar" :alt="expert.name" class="expert-avatar" />
          <div class="expert-name">{{ expert.name }}</div>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="暂无推荐" />
    </div>

    <!-- 搜索结果区域 -->
    <div v-if="hasSearched" class="search-results">
      <div class="section-title">搜索结果</div>

      <!-- Loading 状态 -->
      <div v-if="searchLoading" class="loading-wrapper">
        <van-loading type="spinner" size="24px">搜索中...</van-loading>
      </div>

      <!-- 搜索结果列表 -->
      <div v-else-if="searchResults.length > 0" class="search-result-list">
        <div v-for="expert in searchResults" :key="expert.id" class="result-item" @click="goToExpertDetail(expert.id)">
          <img :src="expert.avatar" :alt="expert.name" class="result-avatar" />
          <div class="result-info">
            <div class="result-name">{{ expert.name }}</div>
            <div class="result-stats">
              盈利率: <span class="profit-rate">{{ expert.yl_7 }}%</span>
            </div>
          </div>
          <van-icon name="arrow" class="arrow-icon" />
        </div>
      </div>

      <!-- 搜索无结果 -->
      <van-empty v-else description="未找到相关大神" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { API } from "../../request/api";

const router = useRouter();
const searchKeyword = ref("");
const loading = ref(false);
const searchLoading = ref(false);
const hasSearched = ref(false);
const recommendExperts = ref([]);
const searchResults = ref([]);

// 返回上一页
const goBack = () => {
  router.back();
};

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = "";
  hasSearched.value = false;
  searchResults.value = [];
};

// 执行搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    showToast("请输入大神名字");
    return;
  }

  try {
    searchLoading.value = true;
    hasSearched.value = true;

    console.log("=== 搜索大神 ===");
    console.log("搜索关键词:", searchKeyword.value.trim());

    // 调用搜索用户接口
    const res = await API.searchUser(searchKeyword.value.trim());
    console.log("搜索接口返回:", res);

    if (res.code === 1 && res.data) {
      // 处理搜索结果数据
      const dataArray = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      searchResults.value = dataArray.map((item) => ({
        id: item.id,
        name: item.nickname || item.name || "未知用户",
        avatar: item.avatar || "/icons/avatar.png",
        yl_7: item.yl_7 || "0",
      }));

      console.log("搜索结果:", searchResults.value.length, "条");
      
      if (searchResults.value.length === 0) {
        showToast("未找到相关大神");
      }
    } else {
      searchResults.value = [];
      showToast(res.msg || "搜索失败");
    }
  } catch (error) {
    console.error("搜索失败:", error);
    showToast("搜索失败，请稍后重试");
    searchResults.value = [];
  } finally {
    searchLoading.value = false;
  }
};

// 跳转到专家详情页
const goToExpertDetail = (expertId) => {
  router.push({
    path: "/gendan_detail",
    query: { id: expertId },
  });
};

// 加载推荐大神（使用官方推荐）
const loadRecommendExperts = async () => {
  try {
    loading.value = true;
    const res = await API.getRank();

    if (res.code === 1 && res.data && res.data.tj) {
      // 使用官方推荐榜单的前10个
      recommendExperts.value = res.data.tj.slice(0, 10).map((item) => ({
        id: item.id,
        name: item.name || "未知用户",
        avatar: item.avatar || "/icons/avatar.png",
        yl_7: item.yl_7 || "0",
      }));
      console.log("推荐大神加载完成:", recommendExperts.value.length, "位");
    } else {
      recommendExperts.value = [];
    }
  } catch (error) {
    console.error("加载推荐大神失败:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRecommendExperts();
});
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  max-width: 430px;
  margin: 0 auto;
}

/* 搜索容器 */
.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background-color: #fff;
  margin-bottom: 10px;
}

.nav-bar-center-wrap {
  width: 100vw;
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
  margin: 0 auto;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 8px 14px;
  gap: 8px;
}

.search-icon {
  font-size: 18px;
  color: #999;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #333;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.clear-icon {
  font-size: 16px;
  color: #999;
  cursor: pointer;
}

.search-btn {
  padding: 8px 20px;
  background-color: #fc3c3c;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.search-btn:active {
  background-color: #e33212;
}

/* 推荐区域 */
.recommend-section,
.search-results {
  background-color: #fff;
  padding: 16px;
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-left: 10px;
  position: relative;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  background-color: #fc3c3c;
  border-radius: 2px;
}

/* Loading 容器 */
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

/* 专家列表 - 推荐大神区域（横向一排5个）*/
.expert-list {
  display: flex;
  flex-direction: row;
  gap: 10px;
  overflow-x: auto;
  justify-content: space-between;
}

.expert-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  flex: 0 0 auto;
  width: calc(20% - 8px);
  min-width: 60px;
}

.expert-item:active .expert-avatar {
  transform: scale(0.95);
}

.expert-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #f0f0f0;
  transition: transform 0.2s;
}

.expert-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 搜索结果列表（垂直列表样式）*/
.search-result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:active {
  background-color: #f0f0f0;
}

.result-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.result-stats {
  font-size: 13px;
  color: #666;
}

.expert-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.expert-stats {
  font-size: 13px;
  color: #666;
}

.profit-rate {
  color: #fc3c3c;
  font-weight: 500;
}

.arrow-icon {
  font-size: 16px;
  color: #ccc;
  flex-shrink: 0;
}
</style>
