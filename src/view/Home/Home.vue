<template>
  <div class="page" role="main">
    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton-container">
      <!-- 轮播图骨架屏 -->
      <van-skeleton-image class="skeleton-banner" />

      <!-- 公告骨架屏 -->
      <div class="skeleton-notice">
        <van-skeleton :row="1" :loading="true" />
      </div>

      <!-- 开奖结果骨架屏 -->
      <div class="skeleton-card">
        <van-skeleton-title />
        <div class="skeleton-games-grid">
          <div v-for="i in 4" :key="i" class="skeleton-game-card">
            <van-skeleton :row="2" :loading="true" />
          </div>
        </div>
      </div>

      <!-- 游戏入口骨架屏 -->
      <div class="skeleton-card">
        <van-skeleton-title />
        <div class="skeleton-entry-grid">
          <div v-for="i in 8" :key="i" class="skeleton-entry-item">
            <van-skeleton-avatar size="3.6rem" />
            <van-skeleton :row="1" :loading="true" />
          </div>
        </div>
      </div>

      <!-- 排行榜骨架屏 -->
      <div class="skeleton-card">
        <van-skeleton-title />
        <div class="skeleton-ranking-tabs">
          <van-skeleton-title style="width: 48%; height: 36px" />
          <van-skeleton-title style="width: 48%; height: 36px" />
        </div>
        <div class="skeleton-ranking-list">
          <div v-for="i in 5" :key="i" class="skeleton-ranking-item">
            <van-skeleton-avatar size="44px" />
            <div class="skeleton-ranking-info">
              <van-skeleton :row="2" :loading="true" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 实际内容 -->
    <div v-else>
      <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
        <van-swipe-item v-for="item in banner" :key="item.id">
          <img :src="item.imageurl" alt="" style="width: 100%; height: auto" />
        </van-swipe-item>
      </van-swipe>

      <div class="notice-wrapper content">
        <van-notice-bar>
          <template #left-icon>
            <img src="/icons/notice.png" alt="notice" class="notice-icon" />
          </template>
          {{ gonggao }}
        </van-notice-bar>
      </div>

      <main class="content">
        <!-- 开奖结果区域 -->
        <div class="result-card">
          <div class="result-card-header">
            <img src="/icons/Lotterydraw.png" alt="" class="header-left-icon" />

            <div
              style="background-color: #ff4747; color: #fff; border-radius: 12px; padding: 2px 6px; font-size: 12px"
              @click="go('/lottery_results')"
            >
              开奖公告
            </div>
          </div>

          <van-notice-bar
            :scrollable="false"
            color="#ff0404"
            background="#fcf3ea"
            style="height: 20px; font-size: 12px; padding: 6px 8px; margin: 4px 10px"
          >
            <van-swipe vertical class="notice-swipe" :autoplay="3000" :touchable="false" :show-indicators="false">
              <van-swipe-item v-for="value in winners">
                {{ value }}
              </van-swipe-item>
            </van-swipe>
          </van-notice-bar>

          <div class="game-row">
            <div class="games-grid">
              <!-- 双色球 -->
              <div class="game-card" :style="{ backgroundImage: `url('/icons/open1.png')` }">
                <div class="game-card-content">
                  <div class="game-card-info">{{ results.loto.phase }}期&nbsp; {{ results.loto.date }}</div>
                  <div class="game-number-list">
                    <div
                      v-for="(value, index) in results.loto.draw_numbers"
                      :key="index"
                      class="number-ball"
                      :class="{ yellow: index >= 5 }"
                    >
                      {{ value }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 七星彩 -->
              <div class="game-card" :style="{ backgroundImage: `url('/icons/open2.png')` }">
                <div class="game-card-content">
                  <div class="game-card-info">{{ results.qxc.phase }}期&nbsp; {{ results.qxc.date }}</div>
                  <div class="game-number-list">
                    <div
                      v-for="(value, index) in results.qxc.draw_numbers"
                      :key="index"
                      class="number-ball7"
                      :class="{ yellow: index >= 6 }"
                    >
                      {{ value }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 排列5 -->
              <div class="game-card" :style="{ backgroundImage: `url('/icons/open3.png')` }">
                <div class="game-card-content">
                  <div class="game-card-info">{{ results.pl5.phase }}期&nbsp; {{ results.pl5.date }}</div>
                  <div class="game-number-list">
                    <div
                      v-for="(value, index) in results.pl5.draw_numbers"
                      :key="index"
                      class="number-ball3"
                      :class="{ yellow: index >= 5 }"
                    >
                      {{ value }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 排列3 -->
              <div class="game-card" :style="{ backgroundImage: `url('/icons/open4.png')` }">
                <div class="game-card-content">
                  <div class="game-card-info">{{ results.pl3.phase }}期&nbsp; {{ results.pl3.date }}</div>
                  <div class="game-number-list">
                    <div
                      v-for="(value, index) in results.pl3.draw_numbers"
                      :key="index"
                      class="number-ball3"
                      :class="{ yellow: index >= 5 }"
                    >
                      {{ value }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏入口区域 -->
        <div class="game-entry-card">
          <div class="result-card-header">
            <img src="/icons/game.png" alt="" class="header-left-icon game-header-icon" />
          </div>

          <div class="game-entry-grid">
            <div class="game-entry-item" v-for="value in gamelist" :key="value.id">
              <img :src="value.cimage" alt="" class="entry-item-img" @click="go(value.code)" />
              <span class="entry-item-text">{{ value.name }}</span>
            </div>
          </div>
        </div>

        <!-- 排行榜模块 -->
        <div class="game-entry-card ranking-card">
          <!-- 排行榜列表 -->
          <div class="ranking-list">
            <!-- 红单榜 -->
            <div v-if="activeRankingTab === 'redList'" class="ranking-content">
              <!-- 领奖台（前3名） -->
              <div class="podium-container">
                <!-- Tab切换 -->
                <div class="ranking-tabs">
                  <div :class="['ranking-tab', { active: activeRankingTab === 'redList' }]" @click="activeRankingTab = 'redList'">
                    红单榜
                  </div>
                  <div :class="['ranking-tab', { active: activeRankingTab === 'hitList' }]" @click="activeRankingTab = 'hitList'">
                    命中榜
                  </div>
                </div>

                <!-- 领奖台 -->
                <!-- 第2名 -->
                <div class="podium-item rank-2">
                  <div class="podium-base rank-2-base">
                    <div class="avatar-wrapper">
                      <img class="podium-avatar" :src="redListRanking[1].avatar" alt="" />
                      <img src="/icons/top2.png" alt="" class="crown-icon" />
                    </div>
                    <div class="podium-name">{{ redListRanking[1].name }}</div>
                    <div class="podium-value">¥{{ redListRanking[1].amount.toLocaleString() }}</div>
                  </div>
                </div>

                <!-- 第1名 -->
                <div class="podium-item rank-1">
                  <div class="podium-base rank-1-base">
                    <div class="avatar-wrapper">
                      <img class="podium-avatar" :src="redListRanking[0].avatar" alt="" />
                      <img src="/icons/top1.png" alt="" class="crown-icon" />
                    </div>
                    <div class="podium-name">{{ redListRanking[0].name }}</div>
                    <div class="podium-value">¥{{ redListRanking[0].amount.toLocaleString() }}</div>
                  </div>
                </div>

                <!-- 第3名 -->
                <div class="podium-item rank-3">
                  <div class="podium-base rank-3-base">
                    <div class="avatar-wrapper">
                      <img class="podium-avatar" :src="redListRanking[2].avatar" alt="" />
                      <img src="/icons/top3.png" alt="" class="crown-icon" />
                    </div>
                    <div class="podium-name">{{ redListRanking[2].name }}</div>
                    <div class="podium-value">¥{{ redListRanking[2].amount.toLocaleString() }}</div>
                  </div>
                </div>
              </div>

              <!-- 4-10名列表 -->
              <div class="ranking-normal-list">
                <div v-for="(user, index) in redListRanking.slice(3)" :key="user.id" class="ranking-item">
                  <div class="ranking-number">{{ index + 4 }}</div>
                  <img class="ranking-avatar" :src="user.avatar" alt="" />
                  <div class="ranking-info">
                    <div class="ranking-name">{{ user.name }}</div>
                    <div class="ranking-desc">中奖金额</div>
                  </div>
                  <div class="ranking-value">
                    <span class="amount">¥{{ user.amount.toLocaleString() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 命中榜 -->
            <div v-if="activeRankingTab === 'hitList'" class="ranking-content">
              <!-- 领奖台（前3名） -->
              <div class="podium-container">
                <!-- Tab切换 -->
                <div class="ranking-tabs">
                  <div :class="['ranking-tab', { active: activeRankingTab === 'redList' }]" @click="activeRankingTab = 'redList'">
                    红单榜
                  </div>
                  <div :class="['ranking-tab', { active: activeRankingTab === 'hitList' }]" @click="activeRankingTab = 'hitList'">
                    命中榜
                  </div>
                </div>

                <!-- 领奖台 -->
                <!-- 第2名 -->
                <div class="podium-item rank-2">
                  <div class="podium-base rank-2-base">
                    <div class="avatar-wrapper">
                      <img class="podium-avatar" :src="hitListRanking[1].avatar" alt="" />
                      <img src="/icons/top2.png" alt="" class="crown-icon" />
                    </div>
                    <div class="podium-name">{{ hitListRanking[1].name }}</div>
                    <div class="podium-value">{{ hitListRanking[1].count }}次</div>
                  </div>
                </div>

                <!-- 第1名 -->
                <div class="podium-item rank-1">
                  <div class="podium-base rank-1-base">
                    <div class="avatar-wrapper">
                      <img class="podium-avatar" :src="hitListRanking[0].avatar" alt="" />
                      <img src="/icons/top1.png" alt="" class="crown-icon" />
                    </div>
                    <div class="podium-name">{{ hitListRanking[0].name }}</div>
                    <div class="podium-value">{{ hitListRanking[0].count }}次</div>
                  </div>
                </div>

                <!-- 第3名 -->
                <div class="podium-item rank-3">
                  <div class="podium-base rank-3-base">
                    <div class="avatar-wrapper">
                      <img class="podium-avatar" :src="hitListRanking[2].avatar" alt="" />
                      <img src="/icons/top3.png" alt="" class="crown-icon" />
                    </div>
                    <div class="podium-name">{{ hitListRanking[2].name }}</div>
                    <div class="podium-value">{{ hitListRanking[2].count }}次</div>
                  </div>
                </div>
              </div>

              <!-- 4-10名列表 -->
              <div class="ranking-normal-list">
                <div v-for="(user, index) in hitListRanking.slice(3)" :key="user.id" class="ranking-item">
                  <div class="ranking-number">{{ index + 4 }}</div>
                  <img class="ranking-avatar" :src="user.avatar" alt="" />
                  <div class="ranking-info">
                    <div class="ranking-name">{{ user.name }}</div>
                    <div class="ranking-desc">中奖次数</div>
                  </div>
                  <div class="ranking-value">
                    <span class="count">{{ user.count }}次</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <van-overlay :show="show" @click="show = false" z-index="100">
      <div class="wrapper">
        <div class="block" @click.stop></div>
        <img :src="Noticeimg" alt="" style="width: 320px" />
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// 时间戳转年月日
function formatDate(ts) {
  if (!ts) return "";
  // 兼容10位和13位时间戳
  const t = ts.toString().length === 10 ? Number(ts) * 1000 : Number(ts);
  const d = new Date(t);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}
import { useRouter } from "vue-router";
import { showToast } from "vant";
import { API } from "../../request/api";

const router = useRouter();

const go = (code) => {
  if (code == "zq") {
    router.push("/Football_lottery");
    return;
  }

  if (code == "lq") {
    router.push("/Basketball_lottery");
    return;
  }
  if (code == "loto") {
    router.push("/daletou");
    return;
  }
  if (code == "pl3") {
    router.push("/pl3");
    return;
  }

  if (code == "pl5") {
    router.push("/pl5");
    return;
  }

  if (code == "qxc") {
    router.push("/qxc");
    return;
  }

  router.push(code);
};

const gamelist = ref([]);
const gonggao = ref("");
const show = ref(false);
const loading = ref(false);
const Noticeimg = ref("");
const lslist = ref([]);

function handleError(error, fallbackMsg) {
  // error 可能是Error对象，也可能是接口返回的res
  let msg = error?.msg || error?.message || fallbackMsg || "请求失败";
  if (/timeout|超时/i.test(msg)) msg = "网络连接超时，请稍后重试";
  showToast(msg);
}

onMounted(async () => {
  loading.value = true;

  try {
    const lotRes = await API.lotteryloto("all");
    if (lotRes.code === 1) {
      results.value = lotRes.data;
    }

    if (lotRes.code !== 1) {
      handleError(lotRes, "获取彩种信息失败");
    }
  } catch (e) {
    handleError(e, "获取彩种信息失败");
  }

  // 缓存key
  const CACHE_KEY = "home_data_cache";
  const CACHE_TIME_KEY = "home_data_cache_time";
  const POPUP_TIME_KEY = "home_popup_last_time";
  const now = Date.now();
  let cache = null;
  let cacheTime = Number(localStorage.getItem(CACHE_TIME_KEY) || 0);

  let needRequest = true;
  // 5分钟缓存
  if (now - cacheTime < 5 * 60 * 1000) {
    try {
      cache = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cache) {
        news.value = cache.news || [];
        gonggao.value = cache.gonggao || "";
        banner.value = cache.banner || [];
        winners.value = cache.winners || [];
        gamelist.value = cache.gamelist || [];
        needRequest = false;
      }
    } catch {}
  }
  if (needRequest) {
    try {
      // 资讯
      const zxRes = await API.toast("zx");
      if (zxRes.code === 1) {
        news.value = zxRes.data;
      } else {
        handleError(zxRes, "获取资讯失败");
      }

      // 公告
      const ggRes = await API.toast("gg");
      if (ggRes.code === 1) {
        gonggao.value = ggRes.data[0]?.title || "";
      } else {
        handleError(ggRes, "获取公告失败");
      }

      // 轮播图
      const bannerRes = await API.getAdsByMark("index_banner");
      if (bannerRes.code === 1) {
        banner.value = bannerRes.data;
      } else {
        handleError(bannerRes, "获取广告失败");
      }

      // 开奖数据
      const drawRes = await API.toastDraws();
      if (drawRes.code === 1) {
        winners.value = drawRes.data;
      } else {
        handleError(drawRes, "获取开奖数据失败");
      }

      const lslistRes = await API.lsList();
      if (lslistRes.code === 1) {
        lslist.value = lslistRes.data;
      } else {
        handleError(lslistRes, "获取连胜数据失败");
      }

      // 游戏列表
      const cateRes = await API.category();
      if (cateRes.code === 1) {
        gamelist.value = cateRes.data;
      } else {
        handleError(cateRes, "获取游戏列表失败");
      }

      // 缓存数据
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          news: news.value,
          gonggao: gonggao.value,
          banner: banner.value,
          winners: winners.value,
          gamelist: gamelist.value,
        })
      );
      localStorage.setItem(CACHE_TIME_KEY, now.toString());
    } catch (error) {
      handleError(error, "网络异常或超时");
    }
  }
  // 弹窗10分钟展示一次，首次进入立即展示，initConfig接口也做10分钟缓存
  const CONFIG_CACHE_KEY = "config";
  const CONFIG_CACHE_TIME_KEY = "config_cache_time";
  let configCache = null;
  let configCacheTime = Number(localStorage.getItem(CONFIG_CACHE_TIME_KEY) || 0);
  if (now - configCacheTime < 10 * 60 * 1000) {
    try {
      configCache = JSON.parse(localStorage.getItem(CONFIG_CACHE_KEY));
      if (configCache) {
        Noticeimg.value = configCache.index_popup;
        const lastPopup = Number(localStorage.getItem(POPUP_TIME_KEY) || 0);
        if (configCache.is_open_popup === "1" && configCache.index_popup) {
          if (now - lastPopup > 10 * 60 * 1000) {
            show.value = true;
            localStorage.setItem(POPUP_TIME_KEY, now.toString());
          }
        }
      }
    } catch {}
  } else {
    try {
      const configRes = await API.initConfig();
      if (configRes.code === 1) {
        Noticeimg.value = configRes.data.index_popup;
        localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(configRes.data));
        localStorage.setItem(CONFIG_CACHE_TIME_KEY, now.toString());
        const lastPopup = Number(localStorage.getItem(POPUP_TIME_KEY) || 0);
        if (configRes.data.is_open_popup === "1" && configRes.data.index_popup) {
          if (now - lastPopup > 10 * 60 * 1000) {
            show.value = true;
            localStorage.setItem(POPUP_TIME_KEY, now.toString());
          }
        }
      } else {
        handleError(configRes, "初始化配置失败");
      }
    } catch (e) {
      handleError(e, "初始化配置失败");
    }
  }
  loading.value = false;
});

const banner = ref([]);

const winners = ref([]);

const results = ref(
  (() => {
    const cached = localStorage.getItem("lottery_results");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      loto: { title: "双色球", draw_numbers: [0, 0, 0, 0, 0, 0, 0], date: "2025-09-20", phase: "2025090" },
      qxc: { title: "七星彩", draw_numbers: [0, 0, 0, 0, 0, 0, 0], date: "2025-09-20", phase: "2025090" },
      pl5: { title: "排列5", draw_numbers: [0, 0, 0, 0, 0], date: "2025-09-20", phase: "2025090" },
      pl3: { title: "排列3", draw_numbers: [0, 0, 0], date: "2025-09-20", phase: "2025090" },
    };
  })()
);

const news = ref([]);

// 排行榜相关
const activeRankingTab = ref("redList"); // 当前激活的排行榜tab

// 红单榜数据（按中奖金额排序）
const redListRanking = ref([
  { id: 1, name: "幸运星", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 158800 },
  { id: 2, name: "财神到", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 128600 },
  { id: 3, name: "中奖王", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 98500 },
  { id: 4, name: "好运来", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 78300 },
  { id: 5, name: "大富翁", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 68200 },
  { id: 6, name: "福星高照", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 58100 },
  { id: 7, name: "鸿运当头", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 48900 },
  { id: 8, name: "财运亨通", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 38700 },
  { id: 9, name: "喜从天降", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 28500 },
  { id: 10, name: "锦鲤本鲤", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", amount: 18300 },
]);

// 命中榜数据（按中奖次数排序）
const hitListRanking = ref([
  { id: 1, name: "常胜将军", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 156 },
  { id: 2, name: "神算子", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 142 },
  { id: 3, name: "预言家", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 128 },
  { id: 4, name: "分析师", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 115 },
  { id: 5, name: "专家", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 98 },
  { id: 6, name: "高手", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 87 },
  { id: 7, name: "达人", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 76 },
  { id: 8, name: "老手", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 65 },
  { id: 9, name: "新星", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 54 },
  { id: 10, name: "潜力股", avatar: "https://img01.yzcdn.cn/vant/cat.jpeg", count: 43 },
]);
</script>

<style scoped>
/* 全局样式 */
.page {
  display: flex;
  flex-direction: column;
  background-color: #f7f7f7;
  color: #0f172a;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  min-height: (100vh - 88px);
  max-width: 430px;
  margin: 0 auto;
}

.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 0 14px 14px;
  box-sizing: border-box;
  max-width: 430px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
}

/* 轮播图样式 */
.my-swipe {
  max-width: 430px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.my-swipe .van-swipe-item {
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
}

.swipe-img {
  display: block;
  width: 100%;
  max-width: 430px;
  height: auto;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 公告样式 */
.notice-wrapper {
  margin-top: -30px;
  padding: 0 14px 0px 14px;
}

.notice-icon {
  width: 32px;
  object-fit: contain;
  padding-right: 8px;
}

/* 结果卡片通用样式 */
.result-card,
.game-entry-card {
  background-color: #fff;
  border-radius: 14px;
  margin-top: 8px;
}

.game-entry-card {
  margin-top: 12px;
}

.result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 4px 14px;
}

.header-left-icon {
  width: 62px;
  object-fit: contain;
}

.game-header-icon {
  width: 72px;
}

.header-right-icon {
  width: 60px;
  object-fit: contain;
  padding-right: 8px;
}

/* 开奖卡片内容样式 */
.games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  padding: 0 10px 4px 12px;
}

.game-card {
  position: relative;
  border-radius: 0.6rem;
  overflow: hidden;
  cursor: pointer;
  background-color: #fff;
  width: 100%;
  aspect-ratio: 1.88;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

.top {
  width: 38px;
  height: 26px;
}

.game-card-content {
  padding-top: 1.8rem;
  padding-left: 0.8rem;
}

.game-card-info {
  font-size: 0.7rem;
}

.game-number-list {
  font-size: 0.8rem;
  padding-top: 4px;
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
}

/* 号码球样式 */
.number-ball {
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  background: linear-gradient(to bottom, #4a90e2, #3068b7);
  color: #fff;
}

.number-ball7 {
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  background: linear-gradient(to bottom, #989edb, #202a66);
  color: #fff;
}

.number-ball3 {
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border-radius: 50%;
  font-size: 12px;
  background: linear-gradient(to bottom, #df90dc, #a85094);
  color: #fff;
}

.number-ball.yellow {
  background: linear-gradient(to bottom, #ffd700, #ffa500);
  color: #000;
}

.number-ball7.yellow {
  background: linear-gradient(to bottom, #ffd700, #ffa500);
  color: #000;
}

/* 游戏入口样式 */
.game-entry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px;
  align-items: center;
}

.game-entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.entry-item-img {
  width: 3.6rem;
  height: 3.6rem;
  object-fit: contain;
}

.entry-item-text {
  font-size: 0.7rem;
  color: #333;
}

/* 页脚样式 */
.footer {
  text-align: center;
  font-size: 0.8rem;
  color: #333;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 430px;
  padding: 6px 18px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(6px);
  z-index: 50;
  box-shadow: 0 -3px 12px rgba(15, 23, 42, 0.02);
}

.footer-img {
  width: 50%;
  height: auto;
  max-width: 150px;
  text-align: center;
}

/* 冗余样式清理（原样式中未使用或重复部分） */
.game-row {
  padding: 0;
}

.game-card.small {
  width: 23%;
  height: 90px;
}

.game-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.game-overlay {
  display: none;
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.game-title {
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.game-result {
  font-size: 0.8rem;
  color: #fff;
}

.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #d32121, #d31313);
  color: #fff;
  box-shadow: 0 2px 8px rgba(211, 33, 33, 0.12);
  max-width: 100%;
}

.notice-swipe {
  height: 32px;
  line-height: 32px;
}

.notice-bar-winner :deep(.van-notice-bar) {
  background: #e8f7ff;
  color: #1a73e8;
}

/* 排行榜模块 */
.ranking-card {
  margin-top: 10px;
  padding-bottom: 8px;
}

/* Tab切换 - 在领奖台容器内 */
.ranking-tabs {
  display: flex;
  justify-content: center;
  gap: 32px;
  width: 100%;
  padding: 10px 4px 12px 4px;
}

.ranking-tab {
  position: relative;
  padding: 4px 10px 10px 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ranking-tab.active {
  color: #fc3c3c;
  font-weight: 600;
}

.ranking-tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: #fc3c3c;
  border-radius: 2px;
}

/* 排行榜列表 */
.ranking-list {
  margin-top: 4px;
}

.ranking-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 领奖台容器 */
.podium-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  padding: 0 8px 10px 8px;
  background: linear-gradient(180deg, #fff9f0 0%, #fff 100%);
  border-radius: 10px;
}

/* Tab切换占满整行 */
.podium-container .ranking-tabs {
  flex-basis: 100%;
  order: -1;
}

/* 领奖台单项 */
.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 110px;
}

/* 领奖台底座 */
.podium-base {
  width: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 5px 6px 5px;
  position: relative;
}

.rank-1-base {
  min-height: 114px;
  background: linear-gradient(135deg, #f5d673 0%, #fefcaf 50%, #f9ee7b 100%);
  box-shadow: 0 2px 10px rgba(255, 215, 0, 0.35);
}

.rank-2-base {
  min-height: 98px;
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.25);
}

.rank-3-base {
  min-height: 86px;
  background: linear-gradient(135deg, #cd7f32 0%, #e8a87c 100%);
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.25);
}

/* 头像容器 */
.avatar-wrapper {
  position: relative;
  margin-bottom: 6px;
}

/* 头像 */
.podium-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  display: block;
}

.rank-1-base .podium-avatar {
  width: 46px;
  height: 46px;
}

/* 皇冠图标 */
.crown-icon {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 24px;
  z-index: 1;
}

.rank-1-base .crown-icon {
  width: 38px;
  height: 28px;
  top: -24px;
}

/* 名称 */
.podium-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-1-base .podium-name {
  font-size: 0.85rem;
  font-weight: 700;
}

/* 数值 */
.podium-value {
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 6px;
}

.podium-medal {
  font-size: 1.4rem;
  margin-top: auto;
}

/* 4-10名普通列表 */
.ranking-normal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 4px 16px;
  background: #fff;
  border-radius: 8px;
  transition: all 0.2s;
}

.ranking-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #999;
  margin-right: 4px;
}

.ranking-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  border: 2px solid #f0f0f0;
}

.ranking-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ranking-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.ranking-desc {
  font-size: 0.7rem;
  color: #999;
}

.ranking-value {
  display: flex;
  align-items: center;
}

.ranking-value .amount {
  font-size: 0.9rem;
  font-weight: 700;
  color: #fc3c3c;
}

.ranking-value .count {
  font-size: 0.9rem;
  font-weight: 700;
  color: #ff4747;
}

/* 骨架屏样式 */
.skeleton-container {
  padding: 0 14px 14px;
  max-width: 430px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.skeleton-banner {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.skeleton-notice {
  margin-top: -30px;
  margin-bottom: 8px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  box-sizing: border-box;
}

.skeleton-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.skeleton-games-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.skeleton-game-card {
  height: 80px;
  border-radius: 8px;
}

.skeleton-entry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 12px;
}

.skeleton-entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.skeleton-red-card {
  background: linear-gradient(90deg, #fd351a 0%, #a11709 100%);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
}

.skeleton-ranking-tabs {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 2px 0;
}

.skeleton-ranking-list {
  margin-top: 12px;
}

.skeleton-ranking-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.skeleton-ranking-info {
  flex: 1;
}
</style>
