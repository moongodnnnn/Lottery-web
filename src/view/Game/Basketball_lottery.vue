<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="竞彩篮球" left-arrow @click-left="onClickLeft" class="nav-bar">
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
            <!-- 第一排：序号+时间 + 球队名 + 联赛 -->
            <div class="game-row-1">
              <div class="game-number">
                <div class="number-text">{{ game.xuhao }}</div>
                <div class="time-text">{{ formatGameTime(game.deal_time) }}</div>
              </div>
              <div class="teams-inline">
                  <span v-if="game.rates?.some(r => r.is_signle === 1)" class="single-badge">单</span>
                <span class="team-name">{{ game.guest_team_name }}</span>
                <span class="vs-text">VS</span>
              
                <span class="team-name">{{ game.home_team_name }}</span>
              </div>
              <div class="game-meta">
                <span class="game-league">{{ game.match?.name || "未知联赛" }}</span>
              </div>
            </div>

            <!-- 第二排：投注选项区域 - 表格布局 + 更多玩法 -->
            <div class="betting-container">
              <div class="betting-table">
                <!-- 胜负玩法 (rate_type = 6) - 从 rates 数组中查找 -->
                <template v-if="game.rates?.find((r) => r.rate_type === '6')">
                  <div v-for="rate in game.rates.filter((r) => r.rate_type === '6')" :key="'sf-' + rate.id" class="table-row">
                    <div class="row-label">胜负</div>
                    <div
                      class="table-cell"
                      :class="{ selected: isOptionSelected(game.id + '-6-1') }"
                      @click="selectOption(game.id, rate.rate_type, game.id + '-6-1', rate.rates[game.id + '-6-1'])"
                    >
                      <span class="cell-text">客胜 {{ rate.rates[game.id + '-6-1']?.value }}</span>
                    </div>
                    <div
                      class="table-cell"
                      :class="{ selected: isOptionSelected(game.id + '-6-0') }"
                      @click="selectOption(game.id, rate.rate_type, game.id + '-6-0', rate.rates[game.id + '-6-0'])"
                    >
                      <span class="cell-text">主胜 {{ rate.rates[game.id + '-6-0']?.value }}</span>
                    </div>
                  </div>
                </template>

                <!-- 让分胜负玩法 (rate_type = 7) -->
                <div v-for="rate in game.rates?.filter((r) => r.rate_type === '7')" :key="'rf-' + rate.id" class="table-row">
                  <div class="row-label">
                    <div class="label-text">让分</div>
                    <div class="label-value">{{ rate.rates[game.id + '-7-2']?.value }}</div>
                  </div>
                  <div
                    class="table-cell"
                    :class="{ selected: isOptionSelected(game.id + '-7-1') }"
                    @click="selectOption(game.id, rate.rate_type, game.id + '-7-1', rate.rates[game.id + '-7-1'])"
                  >
                    <span class="cell-text">客胜 {{ rate.rates[game.id + '-7-1']?.value }}</span>
                  </div>
                  <div
                    class="table-cell"
                    :class="{ selected: isOptionSelected(game.id + '-7-0') }"
                    @click="selectOption(game.id, rate.rate_type, game.id + '-7-0', rate.rates[game.id + '-7-0'])"
                  >
                    <span class="cell-text">主胜 {{ rate.rates[game.id + '-7-0']?.value }}</span>
                  </div>
                </div>

                <!-- 大小分玩法 (rate_type = 9) -->
                <div v-for="rate in game.rates?.filter((r) => r.rate_type === '9')" :key="'dx-' + rate.id" class="table-row">
                  <div class="row-label">
                    <div class="label-text">总分</div>
                    <div class="label-value">{{ rate.rates[game.id + '-9-2']?.value }}</div>
                  </div>
                  <div
                    class="table-cell"
                    :class="{ selected: isOptionSelected(game.id + '-9-0') }"
                    @click="selectOption(game.id, rate.rate_type, game.id + '-9-0', rate.rates[game.id + '-9-0'])"
                  >
                    <span class="cell-text">大于 {{ rate.rates[game.id + '-9-0']?.value }}</span>
                  </div>
                  <div
                    class="table-cell"
                    :class="{ selected: isOptionSelected(game.id + '-9-1') }"
                    @click="selectOption(game.id, rate.rate_type, game.id + '-9-1', rate.rates[game.id + '-9-1'])"
                  >
                    <span class="cell-text">小于 {{ rate.rates[game.id + '-9-1']?.value }}</span>
                  </div>
                </div>
              </div>

              <!-- 更多玩法按钮 -->
              <div class="more-play-btn-side" @click="showMorePlay(game)">
                <template v-if="getGameSelectedCount(game.id) > 0">
                  <div class="more-btn-text selected">已选</div>
                  <div class="more-btn-count">{{ getGameSelectedCount(game.id) }}</div>
                </template>
                <template v-else>
                  <div class="more-btn-text">更多</div>
                  <div class="more-btn-text">玩法</div>
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
          <div class="single-tip">以下玩法可投单关</div>
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

              <!-- 胜分差玩法 (rate_type = 8) -->
              <div v-if="rate.rate_type === '8'" class="more-rate-options">
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

              <!-- 其他玩法 -->
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

    <!-- 规则说明弹窗 -->
    <van-popup
      v-model:show="showRule"
      position="bottom"
      :style="{ height: '80%', maxWidth: '430px', left: '50%', transform: 'translateX(-50%)', borderRadius: '20px 20px 0 0' }"
      closeable
    >
      <div class="rule-popup-content">
        <div class="rule-popup-header">
          <h3>竞彩篮球玩法介绍</h3>
        </div>
        
        <div class="rule-popup-body">
          <h4>基本规则</h4>
          <p>篮球比赛由两支队伍在专用篮球场地竞赛，每队5名队员在场上比赛。</p>
          <p>比赛分为4节，每节12分钟（NBA）或10分钟（FIBA），中场休息后进行下半场比赛。</p>
          <p>竞彩篮球彩票竞猜的比赛结果为全场比赛（含加时赛）结束后的结果。</p>

          <h4>胜负玩法</h4>
          <p>竞猜主队和客队的胜负关系，只有两个选项：</p>
          <ul>
            <li><strong>主胜</strong>：主队得分高于客队</li>
            <li><strong>客胜</strong>：客队得分高于主队</li>
          </ul>
          <p class="tip-note">注：篮球比赛不存在平局，必有胜负。</p>

          <h4>让分胜负玩法</h4>
          <p>当两支球队实力悬殊较大时，采取让分的方式平衡双方胜负关系。让分数由官方指定并维持不变。</p>
          <p><strong>计算方式：</strong>主队得分 - 让分数 与 客队得分 进行比较</p>
          
          <h5>主队让分示例</h5>
          <p>假设主队让5.5分：</p>
          <ul>
            <li>主队胜出6分或以上 → 让分后主队胜</li>
            <li>主队胜出5分或以下 → 让分后客队胜</li>
            <li>客队获胜任意分数 → 让分后客队胜</li>
          </ul>

          <h5>客队让分示例</h5>
          <p>假设客队让3.5分：</p>
          <ul>
            <li>客队胜出4分或以上 → 让分后客队胜</li>
            <li>客队胜出3分或以下 → 让分后主队胜</li>
            <li>主队获胜任意分数 → 让分后主队胜</li>
          </ul>

          <h4>大小分玩法</h4>
          <p>竞猜双方全场总得分是否超过官方指定的预设总分值。</p>
          <p><strong>计算方式：</strong>主队得分 + 客队得分 = 总得分</p>
          <ul>
            <li><strong>大分</strong>：总得分 > 预设总分</li>
            <li><strong>小分</strong>：总得分 < 预设总分</li>
          </ul>
          
          <h5>示例说明</h5>
          <p>预设总分为 200.5 分：</p>
          <ul>
            <li>比赛结果 105:96，总分201分 → 大分</li>
            <li>比赛结果 98:95，总分193分 → 小分</li>
          </ul>

          <h4>胜分差玩法</h4>
          <p>竞猜获胜球队及其获胜的具体分差范围。共有12个选项：</p>
          
          <h5>主队胜分差选项</h5>
          <ul>
            <li>主胜 1-5 分</li>
            <li>主胜 6-10 分</li>
            <li>主胜 11-15 分</li>
            <li>主胜 16-20 分</li>
            <li>主胜 21-25 分</li>
            <li>主胜 26 分及以上</li>
          </ul>

          <h5>客队胜分差选项</h5>
          <ul>
            <li>客胜 1-5 分</li>
            <li>客胜 6-10 分</li>
            <li>客胜 11-15 分</li>
            <li>客胜 16-20 分</li>
            <li>客胜 21-25 分</li>
            <li>客胜 26 分及以上</li>
          </ul>

          <h4>混合过关说明</h4>
          <p>可以选择多场比赛、多种玩法进行组合投注：</p>
          <ul>
            <li><strong>场次要求</strong>：最少2场，最多8场</li>
            <li><strong>玩法组合</strong>：可以混合胜负、让分胜负、大小分等不同玩法</li>
            <li><strong>串关方式</strong>：2串1、3串1、4串1、5串1等多种组合</li>
            <li><strong>奖金计算</strong>：各场比赛赔率相乘，再乘以投注金额</li>
          </ul>

          <h4>温馨提示</h4>
          <ul>
            <li>所有玩法均以全场比赛（含加时赛）结束后的结果为准</li>
            <li>让分数、预设总分一旦确定将维持不变</li>
            <li>请理性购彩，量力而行</li>
            <li>未成年人不得购买彩票</li>
          </ul>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import API from "../../request/api.js";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const gamelist = ref([]);
const expandedDays = ref([]);
const selectedBets = ref([]);
const showMorePlayPopup = ref(false);
const currentGame = ref(null);
const loadingMorePlay = ref(false);
const morePlayRates = ref([]);
const showRule = ref(false);

// 格式化比赛时间 - 只显示时分
const formatGameTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// 切换日期展开/收起
const toggleDay = (dayIndex) => {
  const index = expandedDays.value.indexOf(dayIndex);
  if (index > -1) {
    expandedDays.value.splice(index, 1);
  } else {
    expandedDays.value.push(dayIndex);
  }
};

// 判断选项是否被选中
const isOptionSelected = (optionKey) => {
  if (!optionKey) return false;
  return selectedBets.value.some((bet) => bet.optionKey === optionKey);
};

// 选择投注选项
const selectOption = (gameId, rateType, optionKey, option) => {
  const existingIndex = selectedBets.value.findIndex((bet) => bet.optionKey === optionKey);

  if (existingIndex > -1) {
    // 如果已选中，则取消选择
    selectedBets.value.splice(existingIndex, 1);
  } else {
    // 检查是否已选择同一场比赛的同一玩法类型
    const sameTypeIndex = selectedBets.value.findIndex((bet) => bet.gameId === gameId && bet.rateType === rateType);

    if (sameTypeIndex > -1) {
      // 如果是胜负或让分胜负，替换选择
      if (rateType === "1" || rateType === "2") {
        selectedBets.value.splice(sameTypeIndex, 1);
      }
    }

    // 添加新选择
    selectedBets.value.push({
      gameId,
      rateType,
      optionKey,
      option,
    });
  }
};

// 获取单场比赛已选择的选项数量
const getGameSelectedCount = (gameId) => {
  return selectedBets.value.filter((bet) => bet.gameId === gameId).length;
};

// 计算已选择的比赛场数
const selectedGamesCount = computed(() => {
  const gameIds = new Set(selectedBets.value.map((bet) => bet.gameId));
  return gameIds.size;
});

// 是否可以确认
const canConfirm = computed(() => {
  return selectedGamesCount.value >= 1 && selectedBets.value.length >= 1;
});

// 清空所有选择
const clearAll = () => {
  selectedBets.value = [];
};

// 显示更多玩法
const showMorePlay = (game) => {
  currentGame.value = game;
  showMorePlayPopup.value = true;
  loadMorePlayRates(game.id);
};

// 关闭更多玩法弹窗
const closeMorePlay = () => {
  showMorePlayPopup.value = false;
  currentGame.value = null;
  morePlayRates.value = [];
};

// 加载更多玩法
const loadMorePlayRates = async (gameId) => {
  loadingMorePlay.value = true;
  try {
    const res = await API.gamesRate(gameId);
    if (res.code === 1 && res.data) {
      const ratesArray = Object.values(res.data).filter(
        (rate) => rate.rate_type !== "6" && rate.rate_type !== "7" && rate.rate_type !== "9"
      );
      morePlayRates.value = ratesArray;
    } else {
      morePlayRates.value = [];
    }
  } catch (error) {
    console.error("加载更多玩法失败:", error);
    showToast("加载失败，请稍后重试");
    morePlayRates.value = [];
  } finally {
    loadingMorePlay.value = false;
  }
};

// 获取玩法类型名称
const getRateTypeName = (rateType) => {
  const typeMap = {
    "6": "胜负",
    "7": "让分胜负",
    "8": "胜分差",
    "9": "大小分",
  };
  return typeMap[rateType] || "未知玩法";
};

// 确认选择
const confirmSelection = () => {
  if (!canConfirm.value) {
    showToast("请至少选择1场比赛");
    return;
  }

  // 检查是否只选了一场比赛
  const gameIds = new Set(selectedBets.value.map(bet => bet.gameId));
  
  // 如果只选了一场比赛，需要检查是否支持单关
  if (gameIds.size === 1) {
    let hasSingleGame = false;
    
    // 获取第一个投注的详情
    const firstBet = selectedBets.value[0];
    
    // 检查这场比赛是否支持单关（检查该比赛的任意一个rate是否有is_signle === 1）
    let foundSingleRate = false;
    for (const dayData of gamelist.value) {
      const game = dayData.games.find(g => g.id === firstBet.gameId);
      if (game && game.rates) {
        // 检查这场比赛的任意一个rate是否标记为单关
        const hasSingleRate = game.rates.some(r => r.is_signle === 1);
        if (hasSingleRate) {
          hasSingleGame = true;
          foundSingleRate = true;
          break;
        }
      }
    }
    
    // 如果找到了单关标记，跳出外层循环
    if (!foundSingleRate && !hasSingleGame) {
      showToast("选择非单关场次，需要再选择一场");
      return;
    }
  }

  // 准备传递给确认页面的数据
  const betsWithGameInfo = selectedBets.value.map((bet) => {
    // 找到对应的比赛信息
    let gameInfo = null;
    for (const dayData of gamelist.value) {
      const game = dayData.games.find((g) => g.id === bet.gameId);
      if (game) {
        gameInfo = {
          xuhao: game.xuhao,
          home_team_name: game.home_team_name,
          guest_team_name: game.guest_team_name,
          deal_time: game.deal_time,
          league_name: game.match?.name || "未知联赛",
        };
        break;
      }
    }

    return {
      gameId: bet.gameId,
      rateType: bet.rateType,
      optionKey: bet.optionKey,
      optionName: bet.option?.name || "",
      optionValue: bet.option?.value || "",
      gameInfo,
    };
  });

  console.log("传递的投注数据:", betsWithGameInfo);

  // 跳转到篮球确认投注页面
  router.push({
    path: "/Basketball_confirm_bet",
    query: {
      selectedBets: JSON.stringify(betsWithGameInfo),
    },
  });
};

// 返回
const onClickLeft = () => {
  router.back();
};

// 加载比赛列表
const loadGameList = async () => {
  loading.value = true;
  try {
    const res = await API.Games(1); // type=1 表示篮球
    if (res.code === 1 && res.data) {
      const games = res.data.games || [];
      const odds = res.data.odds || {};

      // 处理每个日期的比赛数据
      gamelist.value = games.map((dayData) => {
        return {
          ...dayData,
          games: dayData.games.map((game) => {
            // 检查是否有胜负玩法（rate_type = 6）
            const hasSfRate = game.rates?.some((r) => r.rate_type === "6");

            // 如果没有胜负玩法，但 odds 中有数据，则添加
            if (!hasSfRate && odds[`${game.id}-6-0`]) {
              const sfRate = {
                id: `sf-${game.id}`,
                lotter_games_id: game.id,
                rate_type: "6",
                rates: {
                  [`${game.id}-6-0`]: odds[`${game.id}-6-0`],
                  [`${game.id}-6-1`]: odds[`${game.id}-6-1`],
                },
                rangqiu: 0,
                is_signle: 0,
                draw_rates: null,
                is_fail: 0,
              };
              game.rates = game.rates ? [sfRate, ...game.rates] : [sfRate];
            }

            return game;
          }),
        };
      });

      // 默认展开第一个日期
      if (gamelist.value.length > 0) {
        expandedDays.value = [0];
      }
    } else {
      showToast(res.msg || "获取比赛列表失败");
      gamelist.value = [];
    }
  } catch (error) {
    console.error("加载比赛列表失败:", error);
    showToast("加载失败，请稍后重试");
    gamelist.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadGameList();

  // 检查是否是调整方案模式
  if (route.query.adjustMode === 'true' && route.query.selectedBets) {
    try {
      const previousBets = JSON.parse(route.query.selectedBets);
      console.log('恢复之前的投注:', previousBets);

      // 恢复选中状态
      previousBets.forEach(bet => {
        // bet.betId 已经是完整的格式 "gameId_rateType_optionKey"
        const key = bet.betId;

        // 添加到选中列表
        if (!selectedBets.value.includes(key)) {
          selectedBets.value.push(key);
        }

        // 添加到详细信息（直接使用原有的完整数据）
        selectedBetsMap.value[key] = {
          betId: bet.betId,
          gameId: bet.gameId,
          rateType: bet.rateType,
          rateTypeName: bet.rateTypeName,
          optionName: bet.optionName,
          optionValue: bet.optionValue,
          gameInfo: bet.gameInfo
        };
      });

      console.log('已恢复选中状态:', selectedBets.value);
      console.log('已恢复详细信息:', selectedBetsMap.value);
    } catch (error) {
      console.error('恢复投注失败:', error);
    }
  }
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
  background: #ffffff;
  color: #333;
  width: 100vw;
  max-width: 430px;
  min-width: 320px;
  box-sizing: border-box;
  margin: 0 auto;
}

.rule-btn {
  cursor: pointer;
  padding: 4px;
}

.games-container {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.day-card {
  background: white;
  margin-bottom: 10px;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
}

.day-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-date {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
}

.day-meta {
  font-size: 0.85rem;
  color: #666;
}

.expand-icon {
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.games-list {
  background: #f8f8f8;
}

.game-item {
  background: white;
  margin: 8px;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.game-row-1 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.game-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fc3c3c;
  color: white;
  padding: 4px 2px;
  border-radius: 4px;
  min-width: 40px;
  flex-shrink: 0;
  gap: 2px;
}

.number-text {
  font-size: 0.6rem;
  font-weight: 600;
}

.time-text {
  font-size: 0.65rem;
  font-weight: 500;
  opacity: 0.95;
}

.teams-inline {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
}

.team-name {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #333;
}

.vs-text {
  font-size: 0.75rem;
  color: #999;
  padding: 0 4px;
  font-weight: 500;
}

.single-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  background: #fc3c3c;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 2px;
  margin-right: 2px;
}

.game-meta {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.game-league {
  font-size: 0.7rem;
  color: #666;
}

.betting-container {
  display: flex;
  gap: 2px;
  align-items: stretch;
}

.betting-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  overflow: hidden;
  flex: 1;
}

.table-row {
  display: grid;
  grid-template-columns: 50px 1fr 1fr;
  border-bottom: 1px solid #e5e5e5;
}

.table-row:last-of-type {
  border-bottom: none;
}

.row-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  background: #fafafa;
  border-right: 1px solid #e5e5e5;
  gap: 2px;
}

.label-text {
  font-size: 0.7rem;
  color: #666;
  font-weight: 600;
}

.label-value {
  font-size: 0.7rem;
  color: #333;
  font-weight: 700;
}

.table-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
  border-right: 1px solid #e5e5e5;
  min-height: 36px;
}

.table-cell:last-child {
  border-right: none;
}

.table-cell:active {
  transform: scale(0.98);
}

.table-cell.selected {
  background: #fc3c3c;
}

.cell-text {
  font-size: 0.75rem;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.table-cell.selected .cell-text {
  color: white;
  font-weight: 600;
}

.more-play-btn-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  background: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
  min-width: 30px;
  gap: 4px;
}

.more-play-btn-side:active {
  background: #f0f0f0;
}

.more-btn-text {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
  line-height: 1.2;
}

.more-btn-text.selected {
  color: #fc3c3c;
  font-weight: 600;
}

.more-btn-count {
  font-size: 0.85rem;
  color: #fc3c3c;
  font-weight: 700;
}

.betting-compact {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rate-compact {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rate-label {
  min-width: 40px;
  text-align: center;
}

.handicap-small {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 600;
  background: #f0f0f0;
  color: #666;
}

.handicap-small.zero {
  background: #e8f5e9;
  color: #4caf50;
}

.handicap-small.positive {
  background: #fff3e0;
  color: #ff9800;
}

.handicap-small.negative {
  background: #e3f2fd;
  color: #2196f3;
}

.rate-buttons {
  display: flex;
  gap: 2px;
  flex: 1;
}

.rate-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 6px 4px;
  background: #f4f5f9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
}

.rate-btn:active {
  transform: scale(0.95);
}

.rate-btn.selected {
  background: #fc3c3c;
}

.btn-name {
  font-size: 0.7rem;
  color: #3c3c3c;
  margin-bottom: 2px;
}

.rate-btn.selected .btn-name {
  color: white;
}

.btn-value {
  font-size: 0.75rem;
  color: #393939;
  font-weight: 600;
}

.rate-btn.selected .btn-value {
  color: white;
}

.more-play-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
  min-width: 50px;
  font-size: 0.7rem;
}

.more-play-btn:active {
  background: #f0f0f0;
}

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

.more-play-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.more-play-header {
  background: white;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.game-info-mini {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-number {
  background: #fc3c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.mini-teams {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.single-tip {
  font-size: 0.75rem;
  color: #fc3c3c;
  margin-top: 8px;
  padding: 4px 8px;
  background: #fff5f5;
  border-radius: 4px;
  display: inline-block;
}

.more-play-body {
  flex: 1;
  overflow-y: auto;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.more-rates-list {
  display: flex;
  flex-direction: column;
}

.more-rate-group {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.more-rate-title {
  color: #333;
  padding: 8px 0;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.more-rate-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.more-rate-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: #f4f5f7;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.more-rate-option:active {
  transform: scale(0.98);
}

.more-rate-option.selected {
  background: #fc3c3c;
}

.more-option-name {
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 4px;
  font-weight: 600;
}

.more-rate-option.selected .more-option-name {
  color: white;
}

.more-option-value {
  font-size: 0.9rem;
  color: #fc3c3c;
  font-weight: 600;
}

.more-rate-option.selected .more-option-value {
  color: white;
}




/* 规则说明弹窗样式 */
.rule-popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
}

.rule-popup-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.rule-popup-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.rule-popup-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  line-height: 1.8;
  color: #333;
}

.rule-popup-body h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 20px 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.rule-popup-body h4:first-child {
  margin-top: 0;
}

.rule-popup-body h5 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #666;
  margin: 16px 0 8px 0;
}

.rule-popup-body p {
  margin: 8px 0;
  font-size: 0.9rem;
  color: #666;
}

.rule-popup-body ul {
  margin: 8px 0;
  padding-left: 20px;
}

.rule-popup-body ul li {
  margin: 6px 0;
  font-size: 0.9rem;
  color: #666;
  list-style-type: disc;
}

.rule-popup-body strong {
  color: #333;
  font-weight: 600;
}

.tip-note {
  background: #fff3e0;
  padding: 8px 12px;
  border-radius: 4px;
  color: #e65100;
  font-size: 0.85rem;
  margin: 8px 0;
}
</style>




