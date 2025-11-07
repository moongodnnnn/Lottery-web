<template>
  <div class="page" role="main">
    <!-- 顶部搜索区域 -->
    <div class="header">
      <div class="title">
        <img src="/icons/004.png" alt="" style="width: 66px;" />
      </div>
      <div class="search-box">
        <div class="search-input" @click="gotoSearchPage">
          <div class="search-placeholder">
            <van-icon name="search" class="search-icon" />
            <span>输入昵称搜索大神</span>
          </div>
          <div class="inner-search-btn">搜索</div>
        </div>
        <div class="favorite-icon">
          <van-icon name="like" size="24"/>
        </div>
      </div>
    </div>


    <div style="padding: 10px 10px 0px 10px;">
      <img src="/img/banner.png" alt="" style="width: 100%; max-width: 430px;"></img>
    </div>

    <!-- 本周最热区域 -->
    <div class="hot-section">
      <!-- 命中榜 -->
      <div class="rank-section">
        <div class="rank-header">
      
        </div>
        <div class="expert-scroll-wrapper">
          <div class="expert-scroll-container">
            <div class="expert-card" v-for="(expert, index) in topExperts.slice(0, 10)" :key="index">
              <div class="expert-avatar">
                <img :src="expert.avatar" :alt="expert.name" />
              </div>
              <div class="expert-name">{{ expert.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 盈利榜 -->
      <div class="rank-section">
        <div class="rank-header">
    
        </div>
        <div class="expert-scroll-wrapper">
          <div class="expert-scroll-container">
            <div class="expert-card" v-for="(expert, index) in topExperts.slice(0, 10)" :key="index + 10">
              <div class="expert-avatar">
                <img :src="expert.avatar" :alt="expert.name" />
              </div>
              <div class="expert-name">{{ expert.name }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 官网推荐 -->
      <div class="rank-section">
        <div class="rank-header">
     
        </div>
        <div class="expert-scroll-wrapper">
          <div class="expert-scroll-container">
            <div class="expert-card" v-for="(expert, index) in topExperts.slice(0, 10)" :key="index + 20">
              <div class="expert-avatar">
                <img :src="expert.avatar" :alt="expert.name" />
              </div>
              <div class="expert-name">{{ expert.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 专家分类选项卡 -->
    <div class="expert-tabs">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab-item" 
        :class="{ active: activeTab === index }"
        @click="activeTab = index"
      >
        {{ tab }}
      </div>
    </div>
    
    <!-- 排序选项 -->
    <div class="sort-options">
      <div 
        v-for="(option, index) in sortOptions" 
        :key="index" 
        class="sort-option" 
        :class="{ active: activeSortOption === index }"
        @click="activeSortOption = index"
      >
        {{ option }}
      </div>
    </div>
    
    <!-- 专家列表卡片 -->
    <div class="expert-list">
      <!-- Loading 状态 -->
      <div v-if="loading" class="loading-container">
        <van-loading type="spinner" size="24px" vertical>加载中...</van-loading>
      </div>

      <!-- 空状态 -->
      <van-empty v-else-if="!loading && filteredExperts.length === 0" description="暂无跟单数据" />

      <!-- 列表内容 -->
      <div v-else class="expert-list-card" v-for="(expert, index) in filteredExperts" :key="expert.id">
        <div class="expert-card-header">
          <!-- 盈利率展示 -->
   
          
          <div class="expert-card-avatar">
            <img :src="expert.avatar" :alt="expert.name" />
          </div>
          <div class="expert-card-info">
            <div class="expert-card-name">{{ expert.name }}</div>
            <div class="expert-card-time">跟单截至：{{ expert.publishTime }} 
            
            </div>
          </div>
          <div class="profit-rate-container">
            <div class="profit-rate-big">
              {{ expert.yl_7 }}
              <span style="font-size: 12px;">%</span>
            </div>
            <div class="profit-rate-label">盈利率</div>
          </div>
        </div> 
        
        <div class="expert-card-desc">
         <span style="color: #1bb0d3;"> 【{{ tabs[activeTab] }}】 </span> {{ expert.description }}
        </div>
      
        <!-- 详细信息区域 -->
        <div class="expert-card-detail-container">
          <div class="expert-card-detail">
            <div class="detail-col">
              <div class="detail-item">
                <div class="detail-value">
                  <div style="display: flex;align-items: center;">
                     <!-- 根据跟单人数显示火花：<10人=1个，>=10人=2个，>=20人=3个 -->
                     <van-icon name="fire" size="16" color="#fc3c3c"/>
                     <van-icon v-if="expert.followCount >= 10" name="fire" size="16" color="#fc3c3c"/>
                     <van-icon v-if="expert.followCount >= 20" name="fire" size="16" color="#fc3c3c"/>
                  </div>
                </div>
                 <div class="detail-label">跟单热度</div>
              </div>
              <div class="detail-item">
              
                <div class="detail-value">{{ expert.orderAmount }}元</div>
                  <div class="detail-label">自购金额</div>
              </div>
              <div class="detail-item">
                <div class="detail-value highlight-value">{{ expert.expectedReturn }}</div>
                  <div class="detail-label">预估回报率</div>
              </div>
            </div>
            <div class="follow-btn-container">
              <div class="follow-btn" @click="followExpert(expert.id)">跟单</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { showToast, showDialog, Field as VanField, Icon as VanIcon } from "vant";
import API from "../../request/api";

const searchValue = ref("");

// 假数据 - 热门专家
const topExperts = ref([
  {
    id: 1,
    name: "金牌分析师",
    avatar: "/icons/avatar.png",
    profit: "+4582元",
    record: "近10中7",
  },
  {
    id: 2,
    name: "足球大师",
    avatar: "/icons/davatar.png",
    profit: "+3829元",
    record: "6连胜",
  },
  {
    id: 3,
    name: "篮球达人",
    avatar: "/icons/avatar1.png",
    profit: "+3214元",
    record: "近12中8",
  },
  {
    id: 4,
    name: "冠军推荐",
    avatar: "/icons/davatar.png",
    profit: "+2910元",
    record: "4连胜",
  },
  {
    id: 5,
    name: "体彩专家",
    avatar: "/icons/avatar.png",
    profit: "+2745元",
    record: "近10中6",
  },
  {
    id: 6,
    name: "赔率分析",
    avatar: "/icons/avatar1.png",
    profit: "+2356元",
    record: "5连胜",
  },
  {
    id: 7,
    name: "足球前瞻",
    avatar: "/icons/davatar.png",
    profit: "+2103元",
    record: "近8中5",
  },
  {
    id: 8,
    name: "赢家攻略",
    avatar: "/icons/avatar.png",
    profit: "+1897元",
    record: "3连胜",
  },
]);

const onSearch = () => {
  if (searchValue.value) {
    showToast(`正在搜索: ${searchValue.value}`);
  } else {
    showToast("请输入搜索内容");
  }
};

const gotoSearchPage = () => {
  showToast("跳转到搜索页面");
  // 这里可以添加实际的页面跳转逻辑，比如：
  // router.push('/search');
};

const showRules = () => {
  showDialog({
    title: "后台配置即可",
    message: "本周盈利金额为专家在过去7天内的推荐方案累计盈利总额，每日更新排名，仅展示排名前8位的专家。",
    confirmButtonText: "知道了",
  });
};

// 专家分类选项卡
const tabs = ref(['足球竞彩', '排列三']);
const activeTab = ref(0); // 默认选中足球竞彩

// 排序选项
const sortOptions = ref(['金额', '人气', '盈利率', '我关注的']);
const activeSortOption = ref(0); // 默认按金额排序

// 获取当前选中游戏的 cate_id
const getCurrentCateId = () => {
  // 0=足球竞彩 cate_id:1, 1=排列三 cate_id:6
  return activeTab.value === 0 ? 1 : 6;
};

// 获取当前排序类型
const getCurrentSortType = () => {
  // 0=金额, 1=人气, 2=盈利率, 3=我关注的
  const typeMap = ['amount', 'mood', 'yl', 'follow'];
  return typeMap[activeSortOption.value];
};

// 专家列表数据（从接口获取，初始为空）
const expertList = ref([]);

// Loading 状态
const loading = ref(false);

// 直接使用接口返回的数据（接口已经按照 tab 和排序选项过滤和排序了）
const filteredExperts = computed(() => {
  return expertList.value;
});

// 跟单方法 - 跳转到跟单详情页
const router = useRouter();
const followExpert = (expertId) => {
  router.push({
    path: '/gendan_detail',
    query: { id: expertId }
  });
};

// 加载跟单列表数据
const get_gendan = async () => {
  try {
    loading.value = true; // 开始加载
    const cateId = getCurrentCateId();
    const sortType = getCurrentSortType();

    console.log(`=== 加载跟单列表 ===`);
    console.log(`游戏类型: ${activeTab.value === 0 ? '足球竞彩' : '排列三'} (cate_id: ${cateId})`);
    console.log(`排序方式: ${sortOptions.value[activeSortOption.value]} (type: ${sortType})`);

    const res = await API.gendan_list({ type: sortType, cate_id: cateId });
    console.log("跟单列表数据:", res);

    if (res.code === 1 && res.data && res.data.data) {
      // 更新专家列表数据（注意：数据在 res.data.data 中）
      expertList.value = res.data.data.map(item => {
        // 格式化截止时间（时间戳转为 MM-DD HH:mm 格式）
        let formattedTime = '';
        if (item.deal_time) {
          const date = new Date(item.deal_time * 1000);
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          formattedTime = `${month}-${day} ${hours}:${minutes}`;
        }

        return {
          id: item.id,
          name: item.nickname || '未知用户',
          avatar: item.avatar || '/icons/avatar.png',
          yl_7: item.yl_7 || '0',  // 7日盈利率
          profitRate: item.yl_7 || '0',
          publishTime: formattedTime,
          description: item.content || '暂无说明',
          orderAmount: item.amount || '0',
          expectedReturn: item.multi || '0', // 使用 multi 作为预估回报率
          followCount: item.mood || 0, // 跟单人数
        };
      });
      console.log("专家列表已更新，共", expertList.value.length, "条数据");
    } else {
      expertList.value = [];
      console.log("没有数据");
    }

    console.log("=== 数据加载完成 ===");
  } catch (error) {
    console.error("接口调用失败:", error);
    showToast("加载数据失败，请稍后重试");
  } finally {
    loading.value = false; // 加载完成
  }
}


// 监听 tab 切换
watch(activeTab, () => {
  console.log("切换游戏类型:", activeTab.value === 0 ? '足球竞彩' : '排列三');
  get_gendan();
});

// 监听排序选项切换
watch(activeSortOption, () => {
  console.log("切换排序方式:", sortOptions.value[activeSortOption.value]);
  get_gendan();
});

onMounted(() => {
  console.log("Expert 页面已挂载");
  get_gendan();


  API.getRank().then(res => {
    console.log(res);
  })

})

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
  padding-bottom: 60px;
}

/* 头部样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px;
  background-color: #fff;
}

.title {
  display: flex;
  align-items: center;
  min-width: 66px;
}

.search-box {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  margin-left: 10px;
}

.search-input {
  max-width: 200px;
  background-color: #f0f0f0;
  border-radius: 16px;
  overflow: hidden;
  height: 32px;
  border: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0 4px 0 10px;
}

.search-placeholder {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 12px;
  flex: 1;
}

.search-icon {
  margin-right: 5px;
  font-size: 14px;
}

.inner-search-btn {
  padding: 0 8px;
  background: #fc3c3c;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  margin-left: 4px;
}

.favorite-icon {
  color: #fc3c3c;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
}



.banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 热门专家区域 */
.hot-section {
  margin-top: 6px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-left: 12px;
  margin-right: 12px;
  background-image: url("/img/celebritybg.png");
  background-size: cover;
  background-position: center;
  min-height: 240px;
}

/* 榜单区域 */
.rank-section {
  margin-bottom: 16px;
}

.rank-section:last-child {
  margin-bottom: 0;
}

.rank-header {
  display: flex;
  align-items: center;
  margin-bottom: 1px;
}

.rank-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 10px;
}

.rank-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  border-radius: 2px;
}

/* 横向滚动容器 */
.expert-scroll-wrapper {
  overflow: hidden;
  margin: 0 -4px;
}

.expert-scroll-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 44px 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.expert-scroll-container::-webkit-scrollbar {
  display: none;
}

/* 专家卡片样式 */
.expert-card {
  flex: 0 0 60px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.expert-avatar {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f5f5f5;
  margin-bottom: 4px;
}

.expert-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.expert-name {
  font-size: 0.75rem;
  color: #333;
  text-align: center;
  font-weight: 600;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.2;
  word-break: break-all;
  width: 100%;
  max-height: 2.4em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 专家选项卡样式 */
.expert-tabs {
  display: flex;
  justify-content: flex-start;
  padding: 10px;
  background-color: #fff;
  overflow-x: auto;
  white-space: nowrap;
  gap: 20px;
  margin: 10px 10px 0px 10px;
}

.tab-item {
  padding: 6px;
  font-size: 14px;
  color: #8f8f8f;
  position: relative;
  flex-shrink: 0;
}

.tab-item.active {
  color: #fc3c3c;
  font-weight: 800;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: #fc3c3c;
}

/* 排序选项样式 */
.sort-options {
  display: flex;
  padding: 10px 20px;
  background-color: #fff;
  border-bottom: 1px solid #f2f2f2;
  margin: 0px  10px;
}

.sort-option {
  margin-right: 24px;
  font-size: 13px;
  color: #666;
  position: relative;
}

.sort-option.active {
  color: #fc3c3c;
  font-weight: 500;
}

/* 专家列表卡片样式 */
.expert-list {
  padding: 8px 12px;
  min-height: 300px;
  position: relative;
}

/* Loading 容器 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
}

.expert-list-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
}

.expert-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.expert-card-avatar {
  width: 40px;
  height: 40px;
  border-radius: 23px;
  overflow: hidden;
  border: 1px solid #eee;
  flex-shrink: 0;
  margin: 0 10px 0px 0px;
}

.expert-card-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.expert-card-info {
  flex: 1;
}

.expert-card-name {
  font-size: 0.85rem;
  color: #333;
  font-weight: 600;
}

.expert-card-time {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.expert-card-desc {
  margin-top: 8px;
  font-size: 0.8rem;
  color: #333;
  line-height: 1.6;
}

/* 盈利率区域样式 */
.profit-rate-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profit-rate-label {
  font-size: 0.65rem;
  color: #999;
  margin-bottom: 2px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profit-rate-big {
  font-size: 0.9rem;
  color: #fc3c3c;
  font-weight: 700;
  text-align: end;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
}

/* 详细信息区域样式 */
.expert-card-detail-container {
  margin-top: 10px;
  border-radius: 8px;
  background-color: #f4f5f9;
  padding: 4px 2px;
}

.expert-card-detail {
  display: flex;
  align-items: center;
}

.detail-col {
  flex: 1;
  display: flex;

  align-content: center;
    align-items: center;
}

.detail-item {
  padding-right: 8px;
  box-sizing: border-box;
  margin: 0 auto;
  text-align: center;
}

.detail-label {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 2px;
}

.detail-value {
  font-size: 0.9rem;
  color: #333;
  height: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.highlight-value {
  color: #fc3c3c;
  font-weight: 600;
}

.follow-btn-container {
  width: 80px;
  display: flex;
  justify-content: center;
}

.follow-btn {
  background-color: #e11e1e;
  color: white;
  padding: 6px 18px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
}
</style>
