<template>
  <div class="page" role="main">
    <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="item in banner" :key="item.id">
        <img :src="item.image" alt="" class="swipe-img" />
      </van-swipe-item>
    </van-swipe>

    <div class="notice-wrapper">
      <van-notice-bar>
        <template #left-icon>
          <img src="/icons/notice.png" alt="notice" class="notice-icon" />
        </template>
        我是测试公告！无论我们能活多久，我们能够享受的只有无法分割的此刻，此外别无其他。
      </van-notice-bar>
    </div>

    <main class="content">
      <!-- 开奖结果区域 -->
      <div class="result-card">
        <div class="result-card-header">
          <img src="/icons/Lotterydraw.png" alt="" class="header-left-icon" />
          <img src="/icons/More.png" alt="" class="header-right-icon" />
        </div>

        <van-notice-bar
          :scrollable="false"
          color="#ff0404"
          background="#fcf3ea"
          style="height: 20px; font-size: 12px; padding: 6px 8px; margin: 4px 10px"
        >
          <van-swipe vertical class="notice-swipe" :autoplay="3000" :touchable="false" :show-indicators="false">
            <van-swipe-item v-for="value in winners" :key="value.id">
              恭喜 {{ value.name }} &nbsp; {{ value.game }} &nbsp;收米 <span style="font-size: 14px"> {{ value.amount }}</span> 元
            </van-swipe-item>
          </van-swipe>
        </van-notice-bar>

        <div class="game-row">
          <div class="games-grid">
            <!-- 双色球 -->
            <div class="game-card" :style="{ backgroundImage: `url('/icons/open1.png')` }">
              <div class="game-card-content">
                <div class="game-card-info">{{ results.ssq.number }}期&nbsp; {{ results.ssq.time }}</div>
                <div class="game-number-list">
                  <div v-for="(value, index) in results.ssq.result" :key="index" class="number-ball" :class="{ yellow: index >= 5 }">
                    {{ value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 七星彩 -->
            <div class="game-card" :style="{ backgroundImage: `url('/icons/open2.png')` }">
              <div class="game-card-content">
                <div class="game-card-info">{{ results.qxc.number }}期&nbsp; {{ results.qxc.time }}</div>
                <div class="game-number-list">
                  <div v-for="(value, index) in results.qxc.result" :key="index" class="number-ball" :class="{ yellow: index >= 6 }">
                    {{ value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 排列5 -->
            <div class="game-card" :style="{ backgroundImage: `url('/icons/open3.png')` }">
              <div class="game-card-content">
                <div class="game-card-info">{{ results.pl5.number }}期&nbsp; {{ results.pl5.time }}</div>
                <div class="game-number-list">
                  <div v-for="(value, index) in results.pl5.result" :key="index" class="number-ball" :class="{ yellow: index >= 5 }">
                    {{ value }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 排列3 -->
            <div class="game-card" :style="{ backgroundImage: `url('/icons/open4.png')` }">
              <div class="game-card-content">
                <div class="game-card-info">{{ results.pl3.number }}期&nbsp; {{ results.pl3.time }}</div>
                <div class="game-number-list">
                  <div v-for="(value, index) in results.pl3.result" :key="index" class="number-ball" :class="{ yellow: index >= 5 }">
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
          <img src="/icons/More.png" alt="" class="header-right-icon" />
        </div>

        <div class="game-entry-grid">
          <div class="game-entry-item">
            <img src="/gameicon/football.png" alt="足球游戏" class="entry-item-img" />
            <span class="entry-item-text">足球游戏</span>
          </div>
          <div class="game-entry-item">
            <img src="/gameicon/basketball.png" alt="篮球游戏" class="entry-item-img" />
            <span class="entry-item-text">篮球游戏</span>
          </div>
          <div class="game-entry-item">
            <img src="/gameicon/lottery.png" alt="大乐透" class="entry-item-img" />
            <span class="entry-item-text">大乐透</span>
          </div>
          <div class="game-entry-item">
            <img src="/gameicon/star.png" alt="七星彩" class="entry-item-img" />
            <span class="entry-item-text">七星彩</span>
          </div>
          <div class="game-entry-item">
            <img src="/gameicon/five.png" alt="排列5" class="entry-item-img" />
            <span class="entry-item-text">排列5</span>
          </div>
          <div class="game-entry-item">
            <img src="/gameicon/three.png" alt="排列3" class="entry-item-img" />
            <span class="entry-item-text">排列3</span>
          </div>
        </div>
      </div>

      <!-- 连胜人员 -->
      <div class="red-card">
        <div style="padding: 8px 2px 0px 2px; display: flex; justify-content: space-between; align-items: center">
          <img src="/icons/123.png" alt="" class="header-left-icon" />
          <div style="font-size: 11px; color: #fff; cursor: pointer">查看更多</div>
        </div>
        <div class="winner-list">
          <div class="winner-item" v-for="(item, idx) in 4" :key="idx">
            <img class="winner-avatar" src="/icons/avatar.png" alt="头像" />
            <div class="winner-info">
              <div class="winner-name">张三</div>
              <div class="winner-prize"><span>中奖</span><span class="winner-amount">39800</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 资讯模块 -->
      <div class="game-entry-card news-card">
        <div class="result-card-header news-header">
          <div class="news-title">资讯总览</div>
          <div class="news-more">查看更多</div>
        </div>
        <div class="news-list">
          <div class="news-item" v-for="value in news" :key="value.id">
            <img class="news-img" :src="value.img" alt="" />
            <div class="news-info">
              <div class="news-item-title">{{ value.title }}</div>
              <div class="news-item-date">{{ value.date }}</div>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { showToast } from "vant";

const banner = ref([
  { id: 1, image: "/banner1.png" },
  { id: 2, image: "/banner2.png" },
]);

const winners = ref([
  { id: 1, name: "张**", amount: "5680", game: "双色球" },
  { id: 2, name: "吴**", amount: "8180", game: "足球竞猜" },
  { id: 3, name: "张**", amount: "20100", game: "七星彩" },
]);

const results = ref({
  ssq: { title: "双色球", result: [1, 5, 12, 18, 2, 33, 7], time: "2025-09-20", number: "2025090" },
  qxc: { title: "七星彩", result: [3, 9, 3, 2, 7, 1, 9], time: "2025-09-20", number: "2025090" },
  pl5: { title: "排列5", result: [6, 8, 3, 1, 5], time: "2025-09-20", number: "2025090" },
  pl3: { title: "排列3", result: [1, 2, 3], time: "2025-09-20", number: "2025090" },
});

const news = ref([
  {
    id: 1,
    title: "701万彩票大奖近50天无人认领：兑奖截止日10月9日",
    date: "2025-09-20",
    img: "https://pics6.baidu.com/feed/279759ee3d6d55fb21792c5bdedbcf5a21a4dd1e.jpeg@f_auto?token=40940bf61541d1ce69cbf97b1eba3ba1",
  },
  {
    id: 2,
    title: "2025浙江体彩公益嘉年华活动在杭州钱江新城日月同辉广场正式启动",
    date: "2025-09-20",
    img: "https://pics2.baidu.com/feed/03087bf40ad162d9e6e2f1f0f1d3f2d3572cc8e5.jpeg@f_auto?token=5b1c3a",
  },
  {
    id: 3,
    title: "数字织就期待，理性守护快乐",
    date: "2025-09-18",
    img: "https://pics4.baidu.com/feed/ac4bd11373f0820281cbf6910af37afdaa641bdf.jpeg@f_auto?token=063bc0724735cac2a799df3e5db8d216",
  },
]);
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
  max-width: 439px;
  margin: 0 auto;
  width: 100%;
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
  max-width: 439px;
  height: auto;
  margin: 0 auto;
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
  border-radius: 1rem;
  margin-top: 8px;
}

/* 连胜人员卡片优化 */
.red-card {
  background: linear-gradient(90deg, #fd351a 0%, #a11709 100%);
  border-radius: 14px;
  margin-top: 10px;
  padding: 0px 8px 6px 8px;
}

.winner-list {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  background-color: #fff;
  border-radius: 12px;
}

.winner-item {
  border-radius: 0.8rem;
  padding: 6px 2px 4px 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 22%;
  min-width: 70px;
  box-sizing: border-box;
}

.winner-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 4px;
}

.winner-info {
  text-align: center;
}
.winner-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  margin-bottom: 2px;
}
.winner-prize {
  font-size: 10px;
  color: #333;
}
.winner-amount {
  color: #f23118;
  font-weight: bold;
  font-size: 14px;
  margin-left: 2px;
}

.game-entry-card {
  margin-top: 12px;
}

.result-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 10px 4px 14px;
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

.number-ball.yellow {
  background: linear-gradient(to bottom, #ffd700, #ffa500);
  color: #000;
}

/* 游戏入口样式 */
.game-entry-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px 14px 14px;
  align-items: center;
}

.game-entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
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

/* 资讯模块优化 */
.news-card {
  margin-top: 14px;
  padding-bottom: 8px;
}
.news-header {
  padding-bottom: 0;
}
.news-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #d32121;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}
.news-more {
  font-size: 0.85rem;
  color: #888;
  cursor: pointer;
}
.news-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}
.news-item {
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 8px 10px;
  transition: box-shadow 0.2s;
}
.news-item:hover {
  box-shadow: 0 2px 8px rgba(211,33,33,0.08);
}
.news-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 12px;
}
.news-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.news-item-title {
  font-size: 0.98rem;
  color: #222;
  font-weight: 500;
  margin-bottom: 6px;
  line-height: 1.3;
}
.news-item-date {
  font-size: 0.8rem;
  color: #bdbdbd;
}
</style>
