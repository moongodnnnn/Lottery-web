<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="竞彩足球" left-arrow @click-left="onClickLeft" class="nav-bar">
        <template #right>
          <div class="rule-btn" @click="showRule = true"><van-icon name="question-o" size="22" /></div>
        </template>
      </van-nav-bar>
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div style="padding: 10px; background-color: #f4ebec; color: #c63804; font-size: 0.8rem">页面数据取自官方，或有延时请以票面为准。</div>

    <!-- 渲染可参与下注比赛区域 -->
    <div class="games-container">
      <!-- Loading状态 -->
      <div v-if="loading" style="padding: 40px 20px; text-align: center">
        <van-loading size="24px" vertical>加载中...</van-loading>
      </div>

      <!-- 空状态提示 -->
      <div v-if="!loading && (!gamelist || gamelist.length === 0)" style="padding: 40px 20px; text-align: center">
        <van-empty description="暂无比赛数据" />
      </div>

      <!-- 比赛列表 -->
      <div v-for="(dayData, dayIndex) in gamelist" :key="dayData.date" class="day-card">
        <!-- 日期卡片头部 -->
        <div class="day-header" @click="toggleDay(dayIndex)">
          <div class="day-info">
            <div class="day-date">{{ dayData.date }} 期</div>
          </div>

          <div style="display: flex; align-items: center">
            <div class="day-meta">{{ dayData.week_name }} {{ dayData.nums }}场比赛</div>
            <div class="expand-icon" :class="{ expanded: expandedDays.includes(dayIndex) }">
              <span style="padding-right: 10px; padding-left: 12px"> <van-icon name="arrow-down" size="19" color="#c8381e" /> </span>
            </div>
          </div>
        </div>

        <!-- 比赛列表 -->
        <div v-show="expandedDays.includes(dayIndex)" class="games-list">
          <div v-for="game in dayData.games" :key="game.id" class="game-item">
            <!-- 第一排：序号 + 球队名 -->
            <div class="game-row-1">
              <span class="game-number">{{ game.xuhao }}</span>
              <div class="teams-inline">
                <span class="team-name">{{ game.home_team_name }}</span>
                <span class="vs-text">VS</span>
                <span class="team-name">{{ game.guest_team_name }}</span>
              </div>
            </div>

            <!-- 第二排：左边联赛时间 + 右边投注区 -->
            <div class="game-row-2">
              <!-- 左侧：联赛和时间 -->
              <div class="game-meta">
                <div class="game-league">{{ game.match?.name || "未知联赛" }}</div>
                <div class="game-time">{{ formatGameTime(game.start_time) }}</div>
              </div>

              <!-- 中间：投注选项 -->
              <div class="betting-compact" v-if="game.rates && game.rates.length">
                <!-- 第一排：不让球胜平负 (rate_type = 1) -->
                <div v-for="rate in game.rates.filter((r) => r.rate_type === '1')" :key="rate.id" class="rate-compact">
                  <div class="rate-label">
                    <span class="handicap-small zero">0</span>
                  </div>
                  <div class="rate-buttons">
                    <div
                      v-for="(option, key) in rate.rates"
                      :key="key"
                      class="rate-btn"
                      :class="{ selected: isOptionSelected(key) }"
                      @click="selectOption(game.id, rate.rate_type, key, option)"
                    >
                      <span class="btn-name">{{ option.name }}</span>
                      <span class="btn-value">{{ option.value }}</span>
                    </div>
                  </div>
                </div>

                <!-- 第二排：让球胜平负 (rate_type = 2) -->
                <div v-for="rate in game.rates.filter((r) => r.rate_type === '2')" :key="rate.id" class="rate-compact">
                  <div class="rate-label">
                    <span
                      class="handicap-small"
                      :class="{
                        zero: rate.rangqiu === 0,
                        positive: rate.rangqiu > 0,
                        negative: rate.rangqiu < 0,
                      }"
                    >
                      {{ rate.rangqiu > 0 ? "+" : "" }}{{ rate.rangqiu }}
                    </span>
                  </div>
                  <div class="rate-buttons">
                    <div
                      v-for="(option, key) in rate.rates"
                      :key="key"
                      class="rate-btn"
                      :class="{ selected: isOptionSelected(key) }"
                      @click="selectOption(game.id, rate.rate_type, key, option)"
                    >
                      <span class="btn-name">让{{ option.name }}</span>
                      <span class="btn-value">{{ option.value }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右侧：更多玩法按钮 -->
              <div class="more-play-btn" @click="showMorePlay(game)">
                <template v-if="getGameSelectedCount(game.id) > 0">
                  <span style="color: #fc3c3c; font-weight: 600">已选</span>
                  <span style="color: #fc3c3c; font-weight: 600">{{ getGameSelectedCount(game.id) }}项</span>
                </template>
                <template v-else>
                  <span style="color: #333">更多</span>
                  <span style="color: #333">玩法</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮区域 -->
    <div class="action-section">
      <div class="action-buttons">
        <div @click="clearAll" style="padding: 22px">
          <van-icon name="delete-o" size="24" />
        </div>

        <div style="text-align: center">
          <div>已选 <span style="color: #ff1744">{{ selectedGamesCount }}</span> 场</div>

          <div style="font-size: 0.7rem; color: #999">
            <span>共 {{ selectedBets.length }} 个选项</span>
          </div>
        </div>

        <van-button type="primary" class="confirm-btn" :disabled="!canConfirm" @click="confirmSelection"> 确认 </van-button>
      </div>
    </div>

    <!-- 更多玩法弹窗 -->
    <van-popup
      v-model:show="showMorePlayPopup"
      position="bottom"
      :style="{ height: '60%', maxWidth: '430px', left: '50%', transform: 'translateX(-50%)' }"
      round
      closeable
      @close="closeMorePlay"
    >
      <div class="more-play-content">
        <div class="more-play-header">
          <div v-if="currentGame" class="game-info-mini">
            <span class="mini-number">{{ currentGame.xuhao }}</span>
            <span class="mini-teams">{{ currentGame.home_team_name }} VS {{ currentGame.guest_team_name }}</span>
          </div>
        </div>

        <div class="more-play-body">
          <!-- Loading状态 -->
          <div v-if="loadingMorePlay" class="loading-container">
            <van-loading size="24px" vertical>加载中...</van-loading>
          </div>

          <!-- 更多玩法列表 -->
          <div v-else-if="morePlayRates.length > 0" class="more-rates-list">
            <div style="height: 10px; background-color: #fff"></div>
            <div v-for="rate in morePlayRates" :key="rate.id" class="more-rate-group">
              <div class="more-rate-title">
                {{ rate.type_name || getRateTypeName(rate.rate_type) }}
              </div>

              <!-- 比分玩法 (rate_type = 3) - 统一显示所有比分 -->
              <template v-if="rate.rate_type === '3'">
                <div class="score-section">
                  <div class="more-rate-options score-options">
                    <!-- 主胜比分 -->
                    <div
                      v-for="(option, key) in rate.rates['1']"
                      :key="'win-' + key"
                      class="more-rate-option score-option"
                      :class="{ selected: isOptionSelected(key) }"
                      @click="selectOption(currentGame.id, rate.rate_type, key, option)"
                    >
                      <span class="more-option-name">{{ option.name }}</span>
                      <span class="more-option-value">{{ option.value }}</span>
                    </div>
                    <!-- 平局比分 -->
                    <div
                      v-for="(option, key) in rate.rates['2']"
                      :key="'draw-' + key"
                      class="more-rate-option score-option"
                      :class="{ selected: isOptionSelected(key) }"
                      @click="selectOption(currentGame.id, rate.rate_type, key, option)"
                    >
                      <span class="more-option-name">{{ option.name }}</span>
                      <span class="more-option-value">{{ option.value }}</span>
                    </div>
                    <!-- 主负比分 -->
                    <div
                      v-for="(option, key) in rate.rates['3']"
                      :key="'lose-' + key"
                      class="more-rate-option score-option"
                      :class="{ selected: isOptionSelected(key) }"
                      @click="selectOption(currentGame.id, rate.rate_type, key, option)"
                    >
                      <span class="more-option-name">{{ option.name }}</span>
                      <span class="more-option-value">{{ option.value }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- 总进球数 (rate_type = 4) - 每排4个 -->
              <div v-else-if="rate.rate_type === '4'" class="more-rate-options goals-options">
                <div
                  v-for="(option, key) in rate.rates"
                  :key="key"
                  class="more-rate-option goals-option"
                  :class="{ selected: isOptionSelected(key) }"
                  @click="selectOption(currentGame.id, rate.rate_type, key, option)"
                >
                  <span class="more-option-name">{{ option.name }}</span>
                  <span class="more-option-value">{{ option.value }}</span>
                </div>
              </div>

              <!-- 半全场 (rate_type = 5) - 左右布局 -->
              <div v-else-if="rate.rate_type === '5'" class="more-rate-options half-options">
                <div
                  v-for="(option, key) in rate.rates"
                  :key="key"
                  class="more-rate-option half-option"
                  :class="{ selected: isOptionSelected(key) }"
                  @click="selectOption(currentGame.id, rate.rate_type, key, option)"
                >
                  <span class="more-option-name">{{ option.name }}</span>
                  <span class="more-option-value">{{ option.value }}</span>
                </div>
              </div>

              <!-- 其他玩法 - 正常处理 -->
              <div v-else class="more-rate-options">
                <div
                  v-for="(option, key) in rate.rates"
                  :key="key"
                  class="more-rate-option"
                  :class="{ selected: isOptionSelected(key) }"
                  @click="selectOption(currentGame.id, rate.rate_type, key, option)"
                >
                  <span class="more-option-name">{{ option.name }}</span>
                  <span class="more-option-value">{{ option.value }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-container">
            <van-empty description="暂无更多玩法" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import API from "../../request/api.js";

const router = useRouter();

// 响应式数据
const showRule = ref(false);

const method = ref(["混合投注", "胜负平", "比分", "进球数", "半全场"]);

const gamelist = ref([]);
const expandedDays = ref([0]); // 默认展开第一天
const loading = ref(false);
const showMorePlayPopup = ref(false); // 更多玩法弹窗
const currentGame = ref(null); // 当前选中的比赛
const morePlayRates = ref([]); // 更多玩法的赔率数据
const loadingMorePlay = ref(false); // 加载更多玩法的loading状态

// 选中的投注选项列表
const selectedBets = ref([]);

// 存储选项的详细信息 { betId: { gameId, gameInfo, rateType, optionKey, optionName, optionValue } }
const selectedBetsDetails = ref({});

// 添加缺失的变量和函数
const canConfirm = computed(() => {
  return selectedBets.value.length > 0;
});

// 计算已选场次（去重比赛ID）
const selectedGamesCount = computed(() => {
  const gameIds = new Set(selectedBets.value.map(bet => bet.split('-')[0]));
  return gameIds.size;
});

// 清空选择函数
function clearAll() {
  selectedBets.value = [];
  selectedBetsDetails.value = {};
}

// 确认选择函数
function confirmSelection() {
  if (selectedBets.value.length === 0) {
    showToast("请先选择投注选项");
    return;
  }

  console.log("已选择的投注内容:", selectedBets.value);
  console.log("投注详细信息:", selectedBetsDetails.value);

  // 将详细信息传递到确认页面
  router.push({
    path: '/Confirm_bet',
    query: {
      bets: JSON.stringify(selectedBets.value),
      details: JSON.stringify(Object.values(selectedBetsDetails.value))
    }
  });
}

// 错误处理函数
function handleError(error, fallbackMsg) {
  let msg = error?.msg || error?.message || fallbackMsg || "请求失败";
  if (/timeout|超时/i.test(msg)) msg = "网络连接超时，请稍后重试";
  showToast(msg);
}

// 切换日期展开状态
function toggleDay(dayIndex) {
  const index = expandedDays.value.indexOf(dayIndex);
  if (index > -1) {
    expandedDays.value.splice(index, 1);
  } else {
    expandedDays.value.push(dayIndex);
  }
}

// 格式化比赛时间
function formatGameTime(timestamp) {
  if (!timestamp) return "未知时间";
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 获取赔率类型名称
function getRateTypeName(rateType) {
  const typeMap = {
    1: "胜平负",
    2: "让球胜平负",
    3: "比分",
    4: "进球数",
    5: "半全场",
  };
  return typeMap[rateType] || "未知玩法";
}

// 选择投注选项
function selectOption(gameId, rateType, optionKey, option) {
  // 构建选项ID：格式为 "gameId-rateType-optionKey"
  const betId = optionKey;

  // 检查是否已选中
  const index = selectedBets.value.indexOf(betId);

  if (index > -1) {
    // 已选中，取消选择
    selectedBets.value.splice(index, 1);
    delete selectedBetsDetails.value[betId];
  } else {
    // 未选中，添加选择
    selectedBets.value.push(betId);

    // 查找比赛信息
    let gameInfo = null;
    for (const dayData of gamelist.value) {
      const game = dayData.games.find(g => g.id === gameId);
      if (game) {
        gameInfo = {
          id: game.id,
          xuhao: game.xuhao,
          home_team_name: game.home_team_name,
          guest_team_name: game.guest_team_name,
          league_name: game.match?.name || game.league_name || "未知联赛",
          start_time: game.start_time,
        };
        break;
      }
    }

    // 存储详细信息
    selectedBetsDetails.value[betId] = {
      betId: betId,
      gameId: gameId,
      gameInfo: gameInfo,
      rateType: rateType,
      rateTypeName: getRateTypeName(rateType),
      optionKey: optionKey,
      optionName: option.name,
      optionValue: option.value,
    };
  }
}

// 检查选项是否已选中
function isOptionSelected(optionKey) {
  return selectedBets.value.includes(optionKey);
}

// 计算某场比赛已选择的选项数量
function getGameSelectedCount(gameId) {
  return selectedBets.value.filter(bet => bet.startsWith(`${gameId}-`)).length;
}

// 显示更多玩法
async function showMorePlay(game) {
  currentGame.value = game;
  showMorePlayPopup.value = true;
  loadingMorePlay.value = true;

  try {
    // 调用API获取更多玩法的赔率
    const response = await API.gamesRate(game.id);

    if (response.code === 1) {
      // 将对象转换为数组，并过滤出进球数、比分等其他玩法 (rate_type = 3, 4, 5等)
      const ratesData = response.data;
      morePlayRates.value = Object.values(ratesData).filter((r) => r.rate_type !== "1" && r.rate_type !== "2");

      console.log("更多玩法数据:", morePlayRates.value);

      if (morePlayRates.value.length === 0) {
        showToast("暂无更多玩法");
      }
    } else {
      handleError(response, "获取更多玩法失败");
    }
  } catch (error) {
    handleError(error, "获取更多玩法失败");
  } finally {
    loadingMorePlay.value = false;
  }
}

// 关闭更多玩法弹窗
function closeMorePlay() {
  showMorePlayPopup.value = false;
  currentGame.value = null;
  morePlayRates.value = [];
}

onMounted(async () => {
  loading.value = true;
  try {
    const getGames = await API.Games(0);
    if (getGames.code === 1) {
      gamelist.value = getGames.data.games;
    } else {
      handleError(getGames, "获取游戏列表失败");
    }
  } catch (error) {
    handleError(error, "请求失败");
  } finally {
    loading.value = false;
  }



  API.analysisData(411).then(res => {
    console.log(res);
  })


});





function onClickLeft() {
  router.back();
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f4f9;
  color: #0f172a;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-y: auto;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 60px;
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

.rule-btn {
  color: #fc3c3c;
  font-size: 0.9rem;
  cursor: pointer;
}

/* 倒计时区域 */
.countdown-section {
  background: linear-gradient(135deg, #fc3c3c, #ff6b6b);
  color: white;
  padding: 16px;
  margin: 8px 12px;
  border-radius: 12px;
  text-align: center;
}

.period-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.period-number {
  font-size: 1.1rem;
  font-weight: 600;
}

.countdown-label {
  font-size: 0.9rem;
}

.countdown-time {
  font-size: 1.8rem;
  font-weight: bold;
  font-family: "Courier New", monospace;
}

/* 下注区域 */
.betting-section {
  padding: 0px 12px;
}

.ball-section {
  background: white;
  border-radius: 12px;
  padding: 16px 12px;
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.section-desc {
  font-size: 0.8rem;
  color: #666;
}

.selected-count {
  font-size: 0.8rem;
  color: #fc3c3c;
  font-weight: 500;
}

.ball-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.ball {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.red-ball {
  background: #fff;
  color: #ff1744;
  border: 1px solid #ff6f76;
}

.red-ball.selected {
  background: #ff1744;
  border-color: #ff3742;
  color: white;
}

.blue-ball {
  background: #ffffff;
  border: 1px solid #10aeff;
  color: #10aeff;
}

.blue-ball.selected {
  background: #10aeff;
  border-color: #10aeff;
  color: white;
  transform: scale(1.1);
}

/* 操作按钮区域 */
.action-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: white;
  padding: 0px;
  height: 4rem;
}

.action-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.clear-btn {
  flex: 1;
  background: white;
  font-size: 1rem;
  max-width: 80px;
  height: 4rem;
}

.confirm-btn {
  flex: 2;
  background: #fc3c3c;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  max-width: 80px;
  height: 4rem;
  border-radius: 0px;
}

.confirm-btn:disabled {
  background: #ccc;
  opacity: 0.6;
}

/* 玩法说明弹窗 */
.rule-popup {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.rule-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.rule-content {
  flex: 1;
  overflow-y: auto;
}

.rule-item {
  margin-bottom: 24px;
}

.rule-item h3 {
  color: #fc3c3c;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.rule-item p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

/* 开奖历史样式 */
.history-section {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f5f5f5;
  font-size: 0.7rem;
}

.history-item:last-child {
  border-bottom: none;
}

.history-period {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.history-balls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ball-group {
  display: flex;
  gap: 3px;
}

.history-ball {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  font-size: 0.6rem;
  font-weight: 500;
}

.history-ball.red-ball {
  color: #ff1744;
  border: 1px solid #ff6f76;
}

.history-ball.blue-ball {
  color: #10aeff;
  border: 1px solid #10aeff;
}

/* 比赛列表样式 */
.games-container {
  padding: 12px 0px;
}

.day-card {
  background: white;
  margin-bottom: 12px;
  overflow: hidden;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #f4ebec;
  color: #c14d3a;
}

.day-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-date {
  font-size: 1rem;
  color: #e55234;
}

.day-meta {
  font-size: 0.9rem;
  color: #e55234;
}

.expand-icon {
  transition: transform 0.3s ease;
  color: #999;
  display: flex;
  align-items: center;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.games-list {
  padding: 0;
}

.game-item {
  padding: 14px 8px;
  border-bottom: 10px solid #f5f4f9;
  background: white;
}

.game-item:last-child {
  border-bottom: none;
}

/* 第一排：序号 + 球队名 */
.game-row-1 {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 10px;
}

.game-number {
  font-size: 0.85rem;
  color: #333;
  padding: 0px 4px;
}

.teams-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
  font-weight: 600;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.team-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.vs-text {
  font-size: 0.7rem;
  color: #999;
  font-weight: 500;
}

/* 第二排：左右布局 */
.game-row-2 {
  display: flex;
  justify-content: space-between;
  gap: 2px;
}

/* 左侧：联赛和时间 */
.game-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 50px;
  align-items: center;
  justify-content: center;
}

.game-league {
  font-size: 0.65rem;
  color: #fff;
  background: #650000;
  padding: 8px;
  border-radius: 3px;
  min-width: 1.8rem;
  text-align: center;
  white-space: nowrap;
}

.game-time {
  font-size: 0.9rem;
  color: #333;
  padding: 6px 8px;
}

/* 右侧：投注区域（紧凑版） */
.betting-compact {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.rate-compact {
  display: flex;
  align-items: center;
  gap: 2px;
}

.rate-label {
  font-size: 0.7rem;
  color: #666;
  white-space: nowrap;
  min-width: 30px;
}

.handicap-small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.2s;
}

/* 让球数为0 - 黑色 */
.handicap-small.zero {
  color: #333;
  border-color: #333;
  background-color: #f5f5f5;
}

/* 让球数大于0 - 红色 */
.handicap-small.positive {
  color: #f90000;
  border-color: #ff4444;
  background-color: #fff5f5;
}

/* 让球数小于0 - 绿色 */
.handicap-small.negative {
  color: #038f03;
  border-color: #00aa00;
  background-color: #f0fff0;
}

/* 更多玩法按钮 */
.more-play-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 4px 8px;
  background: #f9efee;
  color: #333;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.more-play-btn:active {
  transform: scale(0.95);
  box-shadow: 0 1px 2px rgba(102, 126, 234, 0.3);
}

.more-play-btn span {
  font-size: 0.7rem;
  color: white;
  font-weight: 500;
}

.more-play-btn .van-icon {
  color: white;
}

/* 更多玩法弹窗样式 */
.more-play-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  max-width: 430px;
  margin: 0 auto;
  box-sizing: border-box;
}

.more-play-header {
  padding: 16px 16px 12px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  box-sizing: border-box;
}

.more-play-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.game-info-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.mini-number {
  font-size: 0.7rem;
  color: white;
  background: #fc3c3c;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.mini-teams {
  font-size: 0.9rem;
  color: #333;
}

.more-play-body {
  flex: 1;
  overflow-y: auto;
  box-sizing: border-box;
}

.loading-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.more-rates-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.more-rate-group {
  background: white;
  border-radius: 8px;
  padding: 4px 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.more-rate-title {
  color: #333;
  padding: 4px 12px 10px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

/* 比分分组样式 */
.score-section {
  margin-bottom: 8px;
}

.score-section:last-child {
  margin-bottom: 0;
}

.score-section-title {
  background: #f5f5f5;
  color: #666;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  border-left: 3px solid #667eea;
}

.more-rate-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #fff;
  padding: 1px;
  box-sizing: border-box;
}

/* 比分选项 - 每排6个 */
.more-rate-options.score-options {
  grid-template-columns: repeat(6, 1fr);
  gap: 1px;
}

/* 总进球数选项 - 每排4个 */
.more-rate-options.goals-options {
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
}

/* 半全场选项 - 每排3个 */
.more-rate-options.half-options {
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
}

.more-rate-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: #f4f5f7;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 20px;
  margin: 1px;
  box-sizing: border-box;
}

.more-rate-option:active {
  background: #f0f8ff;
  transform: scale(0.98);
}

.more-rate-option.selected {
  background: #fc3c3c;
}

.more-option-name {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
  font-weight: 600;
}

.more-rate-option.selected .more-option-name {
  color: white;
}

.more-option-value {
  font-size: 0.95rem;
  color: #fc3c3c;
}

.more-rate-option.selected .more-option-value {
  color: white;
}

/* 比分选项样式 - 更紧凑 */
.score-option {
  padding: 4px 2px;
  min-height: 40px;
}

.score-option .more-option-name {
  font-size: 0.75rem;
  color: #333;
  margin-bottom: 2px;
}

.score-option .more-option-value {
  font-size: 0.7rem;
  color: #333;
  font-weight: 500;
}

.score-option.selected .more-option-name,
.score-option.selected .more-option-value {
  color: white;
}

/* 总进球数选项样式 - 左右布局 */
.goals-option {
  padding: 8px 12px;
  min-height: 26px;
  margin: 2px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.goals-option .more-option-name {
  font-size: 0.75rem;
  color: #333;
  margin-bottom: 0;
  font-weight: 600;
}

.goals-option .more-option-value {
  font-size: 0.75rem;
  color: #333;
}

.goals-option.selected .more-option-name,
.goals-option.selected .more-option-value {
  color: white;
}

/* 半全场选项样式 - 左右布局 */
.half-option {
  padding: 8px 18px;
  min-height: 28px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.half-option .more-option-name {
  font-size: 0.75rem;
  color: #333;
  margin-bottom: 0;
  font-weight: 600;
}

.half-option .more-option-value {
  font-size: 0.75rem;
  color: #333;
}

.half-option.selected .more-option-name,
.half-option.selected .more-option-value {
  color: white;
}

.rate-buttons {
  display: flex;
  gap: 2px;
  flex: 1;
}

.rate-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background: #f4f5f9;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.rate-btn:active {
  transform: scale(0.95);
}

.rate-btn.selected {
  background: #fc3c3c;
  border-color: #fc3c3c;
}

.btn-name {
  font-size: 0.75rem;
  color: #3c3c3c;
}

.rate-btn.selected .btn-name {
  color: white;
}

.btn-value {
  font-size: 0.75rem;
  color: #393939;
  padding-left: 4px;
}

.rate-btn.selected .btn-value {
  color: white;
}

/* 过渡动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
</style>
