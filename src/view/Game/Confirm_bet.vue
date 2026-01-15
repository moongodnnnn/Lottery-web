<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="确认订单" left-arrow @click-left="onClickLeft" class="nav-bar">
        <template #right>
          <div class="rule-btn" @click="showRule = true"><van-icon name="question-o" size="22" /></div>
        </template>
      </van-nav-bar>
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div style="padding: 10px 10px 0px 10px">
      <img src="/img/gamebanner.png" alt="" style="width: 100%; cursor: pointer" @click="showBannerDetails" />
    </div>

    <!-- 调整方案和奖金优化按钮 -->
    <div style="padding: 4px 10px 0px 10px; display: flex; gap: 10px">
      <van-button
        type="default"
        block
        @click="adjustPlan"
        style="
          height: 40px;
          border: 1px solid #fc3c3c;
          color: #fc3c3c;
          background: #fff;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
        "
      >
        调整方案
      </van-button>
      <van-button
        type="default"
        block
        @click="optimizePrize"
        style="
          height: 40px;
          border: 1px solid #ff9500;
          color: #ff9500;
          background: #fff;
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
        "
      >
        奖金优化
      </van-button>
    </div>

    <!-- 投注内容列表 - 按比赛分组 -->
    <div class="bet-list">
      <!-- Loading 状态 -->
      <div v-if="isLoading" class="loading-container">
        <van-loading size="32px" color="#999999" vertical>
          <template #icon>
            <van-icon name="football-o" size="32" color="#999999" />
          </template>
          加载中...
        </van-loading>
      </div>

      <!-- 投注列表内容 -->
      <div v-else-if="Object.keys(groupedBets).length > 0">
        <div v-for="(game, gameId) in groupedBets" :key="gameId" class="bet-item">
          <!-- 比赛信息头部 - 单行显示 -->
          <div class="bet-header">
            <span class="bet-number">{{ game.gameInfo?.xuhao || "未知" }}</span>
            <span class="bet-teams">{{ game.gameInfo?.home_team_name }} VS {{ game.gameInfo?.guest_team_name }}</span>
            <span class="bet-league">{{ formatMatchTime(game.gameInfo?.start_time) }}</span>
            <span class="bet-time">{{ game.gameInfo?.league_name }} </span>
          </div>

          <!-- 投注选项列表 - 每排4个 -->
          <div class="bet-options-grid">
            <div v-for="bet in game.bets" :key="bet.betId" class="bet-option-item">
              <div class="option-name">{{ getDisplayOptionName(bet) }}</div>
              <div class="option-value">({{ bet.optionValue }})</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <van-empty description="暂无投注数据" />
      </div>
    </div>

    <!-- 串关方式选择弹窗 -->
    <van-popup v-model:show="showBetTypePopup" position="bottom" round :style="{ padding: '20px' }">
      <div class="bet-type-popup">
        <div class="popup-header">
          <span class="popup-title">串关方式选择</span>
        </div>

        <div class="bet-type-section" v-if="singleBetTypes.length > 0">
          <div class="section-title">单一串关（可多选）</div>
          <div class="bet-type-list">
            <div
              v-for="type in singleBetTypes"
              :key="type.value"
              class="bet-type-item"
              :class="{
                active: selectedBetTypes.includes(type.value),
                disabled: type.disabled,
              }"
              @click="toggleBetType(type)"
            >
              <span>{{ type.label }}</span>
            </div>
          </div>
        </div>

        <div class="bet-type-section" v-if="combinedBetTypes.length > 0">
          <div class="section-title">组合串关（单选）</div>
          <div class="bet-type-list">
            <div
              v-for="type in combinedBetTypes"
              :key="type.value"
              class="bet-type-item"
              :class="{
                active: selectedBetTypes.includes(type.value),
                disabled: type.disabled,
              }"
              @click="toggleBetType(type)"
            >
              <span>{{ type.label }}</span>
            </div>
          </div>
        </div>
        <div class="popup-actions">
          <van-button class="action-btn cancel-btn" @click="cancelBetTypeSelection">取消</van-button>
          <van-button class="action-btn confirm-btn" type="primary" @click="confirmBetTypeSelection">确认</van-button>
        </div>
      </div>
    </van-popup>

    <!-- 底部操作区域 - 紧凑版 -->
    <div class="bottom-action-bar">
      <!-- 上传票据复选框 -->
      <div class="upload-bill-row">
        <van-checkbox-group v-model="uploadBillChecked" shape="square">
          <van-checkbox name="upload" icon-size="18px" checked-color="#fc3c3c">
            <div class="upload-bill-label">
             
              <span>要求店主拍照上传票据,您可在方案详情页查看</span>
            </div>
          </van-checkbox>
        </van-checkbox-group>
      </div>

      <!-- 投注设置行 -->
      <div class="settings-row">
        <div class="setting-group" @click="showBetTypePopup = true">
          <span class="setting-label">串关</span>
          <div class="bet-type-display">
            <span class="bet-type-text">{{ selectedBetTypesText }}</span>
            <van-icon name="arrow-down" size="14" color="#999" />
          </div>
        </div>
        <div class="setting-group">
          <span class="setting-label">倍数</span>
          <div class="multiple-controls">
            <van-button class="control-btn" icon="minus" @click="decreaseMultiple" :disabled="betMultiple <= 1" />
            <input
              class="multiple-input"
              v-model.number="betMultiple"
              type="number"
              min="1"
              max="99999"
              @input="onMultipleInput"
              @blur="validateMultiple"
            />
            <van-button class="control-btn" icon="plus" @click="increaseMultiple" :disabled="betMultiple >= 99999" />
          </div>
        </div>
      </div>

      <!-- 倍数快捷选择行 -->
      <div class="quick-multiple-row">
        <div 
          v-for="value in quickMultipleOptions" 
          :key="value" 
          class="quick-multiple-item"
          :class="{ active: betMultiple === value }"
          @click="setQuickMultiple(value)"
        >
          {{ value }}倍
        </div>
      </div>

      <!-- 投注信息和按钮行 -->
      <div class="action-row">
        <div class="bet-info">
          <div class="info-line">
            <span class="info-text"
              >共 <span class="num">{{ totalBets }}</span> 注 <span class="num"> {{ betMultiple }} </span>倍
              <span class="amount">{{ totalAmount }}</span
              >元</span
            >
          </div>
          <div class="prize-line">
            <span style="color: #999; font-size: 0.8rem"> 预计</span>
            <span class="prize-text">{{ estimatedPrize }}</span>
          </div>
        </div>
        <button class="custom-btn publish-btn" :disabled="!canConfirm" @click="showPublishDialog">发单</button>
        <button class="custom-btn order-btn" :disabled="!canConfirm" @click="confirmSelection">下单</button>
      </div>
    </div>

    <!-- Banner详情弹窗 -->
    <van-popup
      v-model:show="showBannerPopup"
      position="bottom"
      :style="{ height: '80%', maxWidth: '430px', left: '50%', transform: 'translateX(-50%)' }"
      round
      closeable
    >
      <div class="banner-details-content">
        <img src="/img/bannerDetails.png" alt="活动详情" style="width: 100%; display: block" />
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { showToast, showDialog } from "vant";
import { useRouter, useRoute } from "vue-router";
import API from "../../request/api.js";

const router = useRouter();
const route = useRoute();

// 接收传递的投注数据
const betDetails = ref([]);
const betAmount = ref(2);
const betMultiple = ref(10);
const selectedBetTypes = ref([]);
const showRule = ref(false);
const showBannerPopup = ref(false);
const showBetTypePopup = ref(false);
const userBalance = ref(0); // 用户余额
const isLoading = ref(true); // 加载状态
const uploadBillChecked = ref([]); // 是否上传票据照片(使用数组存储checkbox值)

// 快捷倍数选项
const quickMultipleOptions = [20, 50, 100, 500, 1000];

// 设置快捷倍数
const setQuickMultiple = (value) => {
  if (value > 99999) {
    betMultiple.value = 99999;
  } else {
    betMultiple.value = value;
  }
};

const hasScoreOrHalfPlay = computed(() => {
  return betDetails.value.some((bet) => bet.rateType === "3" || bet.rateType === "5");
});

const hasTotalGoals = computed(() => {
  return betDetails.value.some((bet) => bet.rateType === "4");
});

const hasOnlyWinDrawLoss = computed(() => {
  const rateTypes = new Set(betDetails.value.map((bet) => bet.rateType));
  return (
    (rateTypes.size === 1 && (rateTypes.has("1") || rateTypes.has("2"))) ||
    (rateTypes.size === 2 && rateTypes.has("1") && rateTypes.has("2"))
  );
});

const betTypeOptions = computed(() => {
  const gameCount = Object.keys(groupedBets.value).length;
  const options = [];
  const hasScoreHalf = hasScoreOrHalfPlay.value;
  const hasGoals = hasTotalGoals.value;
  const onlyWinDrawLoss = hasOnlyWinDrawLoss.value;

  let maxGuan = 8;
  if (hasScoreHalf) {
    maxGuan = 4;
  } else if (hasGoals && !hasScoreHalf) {
    maxGuan = 6;
  } else if (onlyWinDrawLoss) {
    maxGuan = 8;
  }

  if (gameCount === 1) {
    if (onlyWinDrawLoss) {
      const hasSingleGame = betDetails.value.some((bet) => {
        return bet.isSingle === 1;
      });
      if (hasSingleGame) {
        options.push({ label: "单关", value: "1x1", disabled: false });
      }
    } else {
      options.push({ label: "单关", value: "1x1", disabled: false });
    }
  } else if (gameCount === 2) {
    options.push({ label: "2串1", value: "2x1", disabled: false });
  } else if (gameCount === 3) {
    options.push(
      { label: "2串1", value: "2x1", disabled: false },
      { label: "3串1", value: "3x1", disabled: maxGuan < 3 },
      { label: "3串3", value: "3x3", disabled: maxGuan < 3 },
      { label: "3串4", value: "3x4", disabled: maxGuan < 3 }
    );
  } else if (gameCount === 4) {
    options.push(
      { label: "2串1", value: "2x1", disabled: false },
      { label: "3串1", value: "3x1", disabled: maxGuan < 3 },
      { label: "4串1", value: "4x1", disabled: maxGuan < 4 },
      { label: "3串3", value: "3x3", disabled: maxGuan < 3 },
      { label: "3串4", value: "3x4", disabled: maxGuan < 3 },
      { label: "4串4", value: "4x4", disabled: maxGuan < 4 },
      { label: "4串5", value: "4x5", disabled: maxGuan < 4 },
      { label: "4串6", value: "4x6", disabled: maxGuan < 4 },
      { label: "4串11", value: "4x11", disabled: maxGuan < 4 }
    );
  } else if (gameCount >= 5) {
    options.push({ label: "2串1", value: "2x1", disabled: false });
    options.push({ label: "3串1", value: "3x1", disabled: maxGuan < 3 });
    options.push({ label: "4串1", value: "4x1", disabled: maxGuan < 4 });

    if (maxGuan >= 5) {
      options.push({ label: "5串1", value: "5x1", disabled: false });
    }
    if (maxGuan >= 6 && gameCount >= 6) {
      options.push({ label: "6串1", value: "6x1", disabled: false });
    }
    if (maxGuan >= 7 && gameCount >= 7) {
      options.push({ label: "7串1", value: "7x1", disabled: false });
    }
    if (maxGuan >= 8 && gameCount >= 8) {
      options.push({ label: "8串1", value: "8x1", disabled: false });
    }

    options.push({ label: "3串3", value: "3x3", disabled: maxGuan < 3 });
    options.push({ label: "3串4", value: "3x4", disabled: maxGuan < 3 });
    options.push({ label: "4串4", value: "4x4", disabled: maxGuan < 4 });
    options.push({ label: "4串5", value: "4x5", disabled: maxGuan < 4 });
    options.push({ label: "4串6", value: "4x6", disabled: maxGuan < 4 });
    options.push({ label: "4串11", value: "4x11", disabled: maxGuan < 4 });

    if (maxGuan >= 5 && gameCount >= 5) {
      options.push({ label: "5串5", value: "5x5", disabled: false });
      options.push({ label: "5串6", value: "5x6", disabled: false });
      options.push({ label: "5串10", value: "5x10", disabled: false });
      options.push({ label: "5串16", value: "5x16", disabled: false });
      options.push({ label: "5串20", value: "5x20", disabled: false });
      options.push({ label: "5串26", value: "5x26", disabled: false });
    }

    if (maxGuan >= 6 && gameCount >= 6) {
      options.push({ label: "6串6", value: "6x6", disabled: false });
      options.push({ label: "6串7", value: "6x7", disabled: false });
      options.push({ label: "6串15", value: "6x15", disabled: false });
      options.push({ label: "6串20", value: "6x20", disabled: false });
      options.push({ label: "6串22", value: "6x22", disabled: false });
      options.push({ label: "6串35", value: "6x35", disabled: false });
      options.push({ label: "6串42", value: "6x42", disabled: false });
      options.push({ label: "6串50", value: "6x50", disabled: false });
      options.push({ label: "6串57", value: "6x57", disabled: false });
    }
  }

  return options;
});

// 按比赛分组投注
const groupedBets = computed(() => {
  const groups = {};
  betDetails.value.forEach((bet) => {
    const gameId = bet.gameId;
    if (!groups[gameId]) {
      groups[gameId] = {
        gameInfo: bet.gameInfo,
        bets: [],
      };
    }
    groups[gameId].bets.push(bet);
  });
  return groups;
});

const singleBetTypes = computed(() => {
  return betTypeOptions.value.filter((opt) => {
    const [, n] = opt.value.split("x").map(Number);
    return n === 1;
  });
});

const combinedBetTypes = computed(() => {
  return betTypeOptions.value.filter((opt) => {
    const [, n] = opt.value.split("x").map(Number);
    return n > 1;
  });
});

const selectedBetTypesText = computed(() => {
  if (selectedBetTypes.value.length === 0) return "请选择";
  return selectedBetTypes.value
    .map((v) => {
      // 特殊处理：1x1 显示为"单关"
      if (v === "1x1") return "单关";

      const option = betTypeOptions.value.find((opt) => opt.value === v);
      return option ? option.label : v;
    })
    .join("、");
});

const totalBets = computed(() => {
  const gameCount = Object.keys(groupedBets.value).length;
  if (selectedBetTypes.value.length === 0) return 0;

  let total = 0;
  selectedBetTypes.value.forEach((betType) => {
    const [m, n] = betType.split("x").map(Number);

    if (m === 1 && n === 1) {
      let singleTotal = 1;
      Object.values(groupedBets.value).forEach((game) => {
        singleTotal *= game.bets.length;
      });
      total += singleTotal;
    } else {
      const betsPerGame = Object.values(groupedBets.value).map((game) => game.bets.length);
      const combinations = getCombinations(gameCount, m);
      let betTypeTotal = 0;
      combinations.forEach((combo) => {
        let comboTotal = 1;
        combo.forEach((idx) => {
          comboTotal *= betsPerGame[idx];
        });
        betTypeTotal += comboTotal;
      });
      total += betTypeTotal * n;
    }
  });

  return total;
});

function getCombinations(n, r) {
  const result = [];
  const combo = [];

  function backtrack(start) {
    if (combo.length === r) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < n; i++) {
      combo.push(i);
      backtrack(i + 1);
      combo.pop();
    }
  }

  backtrack(0);
  return result;
}

const totalAmount = computed(() => {
  return (totalBets.value * betAmount.value * betMultiple.value).toFixed(2);
});

const estimatedPrize = computed(() => {
  if (betDetails.value.length === 0 || selectedBetTypes.value.length === 0) return "0.00~0.00元";

  let minPrize = Infinity;
  let maxPrize = 0;

  const gamesOdds = Object.values(groupedBets.value).map((game) => {
    const gameOdds = game.bets.map((bet) => parseFloat(bet.optionValue));
    return {
      min: Math.min(...gameOdds),
      max: Math.max(...gameOdds),
    };
  });

  selectedBetTypes.value.forEach((betType) => {
    const [m] = betType.split("x").map(Number);

    if (m === 1) {
      const currentMin = Math.min(...gamesOdds.map((g) => g.min)) * betAmount.value * betMultiple.value;
      const currentMax = Math.max(...gamesOdds.map((g) => g.max)) * betAmount.value * betMultiple.value;
      minPrize = Math.min(minPrize, currentMin);
      maxPrize = Math.max(maxPrize, currentMax);
    } else {
      const minOdds = gamesOdds
        .map((g) => g.min)
        .sort((a, b) => a - b)
        .slice(0, m)
        .reduce((acc, odd) => acc * odd, 1);
      const maxOdds = gamesOdds
        .map((g) => g.max)
        .sort((a, b) => b - a)
        .slice(0, m)
        .reduce((acc, odd) => acc * odd, 1);

      const currentMin = minOdds * betAmount.value * betMultiple.value;
      const currentMax = maxOdds * betAmount.value * betMultiple.value;
      minPrize = Math.min(minPrize, currentMin);
      maxPrize = Math.max(maxPrize, currentMax);
    }
  });

  return `${minPrize.toFixed(2)}~${maxPrize.toFixed(2)}元`;
});

// 是否可以确认
const canConfirm = computed(() => {
  return betDetails.value.length > 0 && totalBets.value > 0;
});

// 组合数计算 C(n, r)
function combination(n, r) {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  let result = 1;
  for (let i = 0; i < r; i++) {
    result *= n - i;
    result /= i + 1;
  }
  return Math.round(result);
}

// 计算串关注数
// gameCount: 比赛场次数
// m: 串关的场次（例如3串1中的3）
// n: 串关的注数倍数（例如3串1中的1，3串4中的4）
function calculatePassBets(gameCount, m, n) {
  // 获取每场比赛的投注选项数
  const optionsPerGame = Object.values(groupedBets.value).map((game) => game.bets.length);

  if (n === 1) {
    // m串1：从gameCount场中选m场的组合数 × 每场选项数的乘积
    // 计算所有可能的m场组合的投注数总和
    let totalBets = 0;

    // 生成所有m场的组合
    const allCombinations = generateCombinations(gameCount, m);

    allCombinations.forEach((combo) => {
      let bets = 1;
      combo.forEach((gameIndex) => {
        bets *= optionsPerGame[gameIndex];
      });
      totalBets += bets;
    });

    return totalBets;
  } else {
    // 复杂串关（如3串3、3串4、4串11等）
    // 这些是多个不同串关的组合
    return calculateComplexPassBets(gameCount, m, n, optionsPerGame);
  }
}

// 生成组合
function generateCombinations(n, m) {
  const result = [];
  const temp = [];

  function backtrack(start) {
    if (temp.length === m) {
      result.push([...temp]);
      return;
    }

    for (let i = start; i < n; i++) {
      temp.push(i);
      backtrack(i + 1);
      temp.pop();
    }
  }

  backtrack(0);
  return result;
}

// 计算复杂串关注数
function calculateComplexPassBets(gameCount, m, n, optionsPerGame) {
  // 串关组合映射表
  const passTypeMap = {
    "3x3": [{ m: 2, count: 3 }], // 3场2串1，共3注
    "3x4": [
      { m: 2, count: 3 },
      { m: 3, count: 1 },
    ], // 3场2串1(3注) + 3场3串1(1注)
    "4x4": [{ m: 3, count: 4 }], // 4场3串1，共4注
    "4x5": [
      { m: 3, count: 4 },
      { m: 4, count: 1 },
    ], // 4场3串1(4注) + 4场4串1(1注)
    "4x6": [{ m: 2, count: 6 }], // 4场2串1，共6注
    "4x11": [
      { m: 2, count: 6 },
      { m: 3, count: 4 },
      { m: 4, count: 1 },
    ], // 2串1(6注) + 3串1(4注) + 4串1(1注)
    "5x5": [{ m: 4, count: 5 }], // 5场4串1，共5注
    "5x6": [
      { m: 4, count: 5 },
      { m: 5, count: 1 },
    ], // 5场4串1(5注) + 5场5串1(1注)
    "5x10": [{ m: 3, count: 10 }], // 5场3串1，共10注
    "5x16": [
      { m: 3, count: 10 },
      { m: 4, count: 5 },
      { m: 5, count: 1 },
    ], // 3串1(10注) + 4串1(5注) + 5串1(1注)
    "5x20": [
      { m: 2, count: 10 },
      { m: 3, count: 10 },
    ], // 2串1(10注) + 3串1(10注)
    "5x26": [
      { m: 2, count: 10 },
      { m: 3, count: 10 },
      { m: 4, count: 5 },
      { m: 5, count: 1 },
    ], // 全包
    "6x6": [{ m: 5, count: 6 }], // 6场5串1，共6注
    "6x7": [
      { m: 5, count: 6 },
      { m: 6, count: 1 },
    ], // 6场5串1(6注) + 6场6串1(1注)
    "6x15": [{ m: 4, count: 15 }], // 6场4串1，共15注
    "6x20": [{ m: 3, count: 20 }], // 6场3串1，共20注
    "6x22": [
      { m: 4, count: 15 },
      { m: 5, count: 6 },
      { m: 6, count: 1 },
    ], // 4串1(15注) + 5串1(6注) + 6串1(1注)
    "6x35": [
      { m: 3, count: 20 },
      { m: 4, count: 15 },
    ], // 3串1(20注) + 4串1(15注)
    "6x42": [
      { m: 3, count: 20 },
      { m: 4, count: 15 },
      { m: 5, count: 6 },
      { m: 6, count: 1 },
    ], // 3串1 + 4串1 + 5串1 + 6串1
    "6x50": [
      { m: 2, count: 15 },
      { m: 3, count: 20 },
      { m: 4, count: 15 },
    ], // 2串1(15注) + 3串1(20注) + 4串1(15注)
    "6x57": [
      { m: 2, count: 15 },
      { m: 3, count: 20 },
      { m: 4, count: 15 },
      { m: 5, count: 6 },
      { m: 6, count: 1 },
    ], // 全包
  };

  const key = `${m}x${n}`;
  const passTypes = passTypeMap[key];

  if (!passTypes) {
    // 如果没有映射，默认按m串1计算
    return calculatePassBets(gameCount, m, 1);
  }

  let totalBets = 0;

  passTypes.forEach(({ m: passM }) => {
    // 生成所有passM场的组合
    const allCombinations = generateCombinations(gameCount, passM);

    allCombinations.forEach((combo) => {
      let bets = 1;
      combo.forEach((gameIndex) => {
        bets *= optionsPerGame[gameIndex];
      });
      totalBets += bets;
    });
  });

  return totalBets;
}

// 格式化比赛时间 - 只显示时分
function formatMatchTime(timestamp) {
  if (!timestamp) return "未知";
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 获取显示的选项名称
function getDisplayOptionName(bet) {
  // 如果是让球胜平负 (rate_type = 2)，在选项名称前加"让"
  if (bet.rateType === "2") {
    return `让${bet.optionName}`;
  }
  // 其他类型直接返回选项名称（比分、半全场等已经包含完整信息）
  return bet.optionName;
}

function isMultiSelectable(value) {
  const [, n] = value.split("x").map(Number);
  return n === 1;
}

function toggleBetType(type) {
  if (type.disabled) return;

  const index = selectedBetTypes.value.indexOf(type.value);

  if (isMultiSelectable(type.value)) {
    if (index > -1) {
      selectedBetTypes.value.splice(index, 1);
    } else {
      selectedBetTypes.value = selectedBetTypes.value.filter((v) => isMultiSelectable(v));
      selectedBetTypes.value.push(type.value);
    }
  } else {
    selectedBetTypes.value = [type.value];
  }
}

function cancelBetTypeSelection() {
  showBetTypePopup.value = false;
}

function confirmBetTypeSelection() {
  if (selectedBetTypes.value.length === 0) {
    showToast("请至少选择一种串关方式");
    return;
  }
  showBetTypePopup.value = false;
}

function increaseMultiple() {
  if (betMultiple.value < 99999) {
    betMultiple.value++;
  }
}

function decreaseMultiple() {
  if (betMultiple.value > 1) {
    betMultiple.value--;
  }
}

// 倍数输入验证
function onMultipleInput(e) {
  let value = e.target.value;
  // 移除非数字字符
  value = value.replace(/[^\d]/g, "");
  // 限制范围
  if (value === "") {
    betMultiple.value = "";
  } else {
    let num = parseInt(value);
    if (num < 1) num = 1;
    if (num > 99999) num = 99999;
    betMultiple.value = num;
  }
}

// 失去焦点时验证
function validateMultiple() {
  if (!betMultiple.value || betMultiple.value < 1) {
    betMultiple.value = 1;
  } else if (betMultiple.value > 99999) {
    betMultiple.value = 99999;
  }
}

// 显示Banner详情
function showBannerDetails() {
  showBannerPopup.value = true;
}

// 显示发单确认弹窗
function showPublishDialog() {
  if (!canConfirm.value) {
    showToast("请先选择投注选项");
    return;
  }

  // 检查方案金额是否满足发单要求
  if (totalAmount.value < 20) {
    showToast("方案金额必须大于等于20元才能发单");
    return;
  }

  showDialog({
    title: "发单确认",
    message: `<div style="text-align: center;">
      <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 12px;">方案金额：${totalAmount.value}元</div>
      <div style="font-size: 14px; color: #666;">您确认进入发单设置吗？</div>
    </div>`,
    allowHtml: true,
    showCancelButton: true,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  })
    .then(() => {
      const orderData = {
        type: "football", // 足球竞猜
        betDetails: betDetails.value,
        groupedBets: groupedBets.value,
        totalBets: totalBets.value,
        betMultiple: betMultiple.value,
        totalAmount: totalAmount.value,
        selectedBetTypes: selectedBetTypes.value,
        estimatedPrize: estimatedPrize.value,
      };

      // 跳转到发单页面
      router.push({
        path: "/publish_order",
        query: {
          orderData: JSON.stringify(orderData),
        },
      });
    })
    .catch(() => {
      // 用户点击取消
      console.log("用户取消发单");
    });
}

// 确认下单
async function confirmSelection() {
  if (!canConfirm.value) {
    showToast("请先选择投注选项");
    return;
  }

  // 先检查余额是否充足
  if (userBalance.value < totalAmount.value) {
    // 余额不足，直接提示
    showDialog({
      message: `资金不足,去充值<br/><div style="font-size: 14px; color: #999;padding-top: 20px;">当前余额：¥${userBalance.value.toFixed(
        2
      )}</div>`,
      messageAlign: "center",
      title: "温馨提示",
      showCancelButton: true,
      confirmButtonText: "去充值",
      cancelButtonText: "取消",
      allowHtml: true,
    })
      .then(() => {
        router.push("/recharge");
      })
      .catch(() => {
        console.log("用户取消充值");
      });
    return;
  }

  // 余额充足，弹出确认对话框
  showDialog({
    messageAlign: "center",
    showCancelButton: true,
    title: "温馨提示",
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    message: `订单金额：¥${totalAmount.value} \n  \n 确认提交此方案吗？`,
  })
    .then(async () => {
      const orderParams = prepareOrderParams();

      try {
        const response = await API.add_order(orderParams);

        console.log("接口响应:", response);

        if (response.code === 1) {
          const orderId = response.data?.id || response.data?.order_id || "";

          try {
            const payRes = await API.toBalance({ id: orderId });
            if (payRes.code === 1) {
              router.replace({
                path: "/bet_success",
                query: { orderId },
              });
            } else {
              if (payRes.msg === "资金不足") {
                // 获取最新余额
                try {
                  const balanceRes = await API.balanceof();
                  if (balanceRes.code === 1 && balanceRes.data) {
                    userBalance.value = parseFloat(balanceRes.data.all_amount);
                  }
                } catch (error) {
                  console.error("获取余额失败:", error);
                }

                showDialog({
                  message: `资金不足,去充值<br/><div style="font-size: 14px; color: #999;padding-top: 20px;">当前余额：¥${userBalance.value.toFixed(
                    2
                  )}</div>`,
                  messageAlign: "center",
                  title: "温馨提示",
                  showCancelButton: true,
                  confirmButtonText: "去充值",
                  cancelButtonText: "取消",
                  allowHtml: true,
                })
                  .then(() => {
                    router.push("/recharge");
                  })
                  .catch(() => {
                    console.log("用户取消充值");
                  });
              } else {
                showToast(payRes.msg || "支付失败");
              }
            }
          } catch (error) {
            console.error("余额支付失败:", error);
            showToast("支付失败");
          }
        } else {
          showToast(response.msg || "订单提交失败");
        }
      } catch (error) {
        console.error("提交订单失败:", error);
        showToast(error.message || "订单提交失败，请重试");
      }
    })
    .catch(() => {
      console.log("用户取消下单");
    });
}

// 准备订单参数
function prepareOrderParams() {
  // 1. 提取所有比赛ID（去重）
  const games = [...new Set(betDetails.value.map((bet) => bet.gameId))];

  // 2. 提取所有投注选项ID
  const odds = betDetails.value.map((bet) => bet.betId);

  // 3. 提取所有玩法类型（去重并拼接）
  const rateTypes = [...new Set(betDetails.value.map((bet) => bet.rateType))];
  const rate_type = rateTypes.join(",");

  const rules = selectedBetTypes.value.map((bt) => convertBetTypeToRules(bt)).join(",");

  const maxPrize = calculateMaxPrize();

  // 6. 生成所有组合（bell_all）
  const bell_all = generateBellAll();

  return {
    amount: parseFloat(totalAmount.value),
    bell_all: bell_all,
    bill_nums: betMultiple.value,
    cate_id: 1, // 足球彩票
    games: games,
    max_price: maxPrize,
    multi: betMultiple.value,
    nums: totalBets.value,
    odds: odds,
    rate_type: rate_type,
    rules: rules,
    upload_bill: uploadBillChecked.value.includes('upload') ? 1 : 0, // 根据复选框设置
  };
}

// 转换串关方式为过关规则格式
function convertBetTypeToRules(betType) {
  // 1x1 -> 1#1, 2x1 -> 2#1, 3x4 -> 3#4, etc.
  const [m, n] = betType.split("x");
  return `${m}#${n}`;
}

function calculateMaxPrize() {
  if (betDetails.value.length === 0 || selectedBetTypes.value.length === 0) return 0;

  const gamesMaxOdds = Object.values(groupedBets.value).map((game) => {
    const gameOdds = game.bets.map((bet) => parseFloat(bet.optionValue));
    return Math.max(...gameOdds);
  });

  let maxPrize = 0;
  selectedBetTypes.value.forEach((betType) => {
    const [m] = betType.split("x").map(Number);

    if (m === 1) {
      const maxOdds = Math.max(...gamesMaxOdds);
      const prize = parseFloat((maxOdds * betAmount.value * betMultiple.value).toFixed(2));
      maxPrize = Math.max(maxPrize, prize);
    } else {
      const sortedOdds = [...gamesMaxOdds].sort((a, b) => b - a);
      const maxOdds = sortedOdds.slice(0, m).reduce((acc, odd) => acc * odd, 1);
      const prize = parseFloat((maxOdds * betAmount.value * betMultiple.value).toFixed(2));
      maxPrize = Math.max(maxPrize, prize);
    }
  });

  return maxPrize;
}

function generateBellAll() {
  const gamesBets = Object.values(groupedBets.value).map((game) => game.bets.map((bet) => bet.betId));

  if (selectedBetTypes.value.length === 0) return [];

  const allCombinations = [];
  selectedBetTypes.value.forEach((betType) => {
    const [m] = betType.split("x").map(Number);

    if (m === 1) {
      gamesBets.forEach((gameBets) => {
        gameBets.forEach((betId) => {
          allCombinations.push([[[betId]]]);
        });
      });
    } else {
      const gameIndices = Array.from({ length: gamesBets.length }, (_, i) => i);
      const gameCombinations = generateCombinationsFromIndices(gameIndices, m);

      gameCombinations.forEach((gameCombo) => {
        const selectedGamesBets = gameCombo.map((index) => gamesBets[index]);
        const cartesianProduct = getCartesianProduct(selectedGamesBets);

        cartesianProduct.forEach((combo) => {
          allCombinations.push([[combo]]);
        });
      });
    }
  });

  return allCombinations;
}

// 生成索引组合
function generateCombinationsFromIndices(indices, m) {
  const result = [];
  const temp = [];

  function backtrack(start) {
    if (temp.length === m) {
      result.push([...temp]);
      return;
    }

    for (let i = start; i < indices.length; i++) {
      temp.push(indices[i]);
      backtrack(i + 1);
      temp.pop();
    }
  }

  backtrack(0);
  return result;
}

// 获取笛卡尔积
function getCartesianProduct(arrays) {
  if (arrays.length === 0) return [[]];
  if (arrays.length === 1) return arrays[0].map((item) => [item]);

  const result = [];
  const [first, ...rest] = arrays;
  const restProduct = getCartesianProduct(rest);

  first.forEach((item) => {
    restProduct.forEach((combo) => {
      result.push([item, ...combo]);
    });
  });

  return result;
}

function onClickLeft() {
  router.back();
}

// 调整方案 - 返回到 Football_lottery 页面
function adjustPlan() {
  // 将当前的投注详情传回去
  router.push({
    path: "/football_lottery",
    query: {
      adjustMode: "true",
      betDetails: JSON.stringify(betDetails.value),
    },
  });
}

// 奖金优化
function optimizePrize() {
  if (!canConfirm.value) {
    showToast("请先选择投注选项");
    return;
  }

  // 跳转到奖金优化页面，传递投注数据
  router.push({
    path: "/prize-optimize",
    query: {
      details: JSON.stringify(betDetails.value),
      totalAmount: totalAmount.value,
      betMultiple: betMultiple.value,
      selectedBetTypes: JSON.stringify(selectedBetTypes.value),
    },
  });
}

onMounted(async () => {
  isLoading.value = true; // 开始加载

  // 获取用户余额
  try {
    const balanceRes = await API.balanceof();
    if (balanceRes.code === 1 && balanceRes.data) {
      userBalance.value = parseFloat(balanceRes.data.all_amount);
    }
  } catch (error) {
    console.error("获取余额失败:", error);
  }

  try {
    if (route.query.details) {
      betDetails.value = JSON.parse(route.query.details);
      console.log("接收到的投注详情:", betDetails.value);

      const gameCount = Object.keys(groupedBets.value).length;
      const hasScoreHalf = hasScoreOrHalfPlay.value;

      if (gameCount === 1) {
        selectedBetTypes.value = ["1x1"];
      } else if (gameCount === 2) {
        selectedBetTypes.value = ["2x1"];
      } else if (gameCount === 3) {
        selectedBetTypes.value = ["3x1"];
      } else if (gameCount === 4) {
        selectedBetTypes.value = ["4x1"];
      } else if (gameCount >= 5) {
        if (hasScoreHalf) {
          selectedBetTypes.value = ["4x1"];
        } else {
          selectedBetTypes.value = [`${gameCount}x1`];
        }
      }
    } else {
      showToast("未找到投注数据");
      router.back();
    }
  } catch (error) {
    console.error("解析投注数据失败:", error);
    showToast("数据解析失败");
    router.back();
  } finally {
    isLoading.value = false; // 加载完成
  }
});
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
  padding-bottom: 110px;
  /* 防止 Safari 双击缩放 */
  touch-action: manipulation;
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

/* 投注列表 */
.bet-list {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
}

/* Loading 容器 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px 0;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px 0;
}

.bet-item {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.bet-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.bet-number {
  font-size: 0.7rem;
  color: white;
  background: #fc3c3c;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: 600;
  flex-shrink: 0;
}

.bet-teams {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.bet-league {
  font-size: 0.8em;
  color: #333;
  flex-shrink: 0;
}

.bet-time {
  font-size: 0.75rem;
  color: #fc3c3c;
  font-weight: 600;
  flex-shrink: 0;
}

/* 投注选项网格 - 每排4个 */
.bet-options-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-top: 8px;
}

.bet-option-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  min-height: 28px;
  gap: 2px;
}

.option-name {
  font-size: 0.8rem;
  color: #333;
  font-weight: 600;
  text-align: center;
  line-height: 1;
}

.option-value {
  font-size: 0.8rem;
  color: #333;
  text-align: center;
}

/* 投注方式下拉选择框 */
.bet-type-select {
  height: 32px;
  padding: 0 8px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%23fc3c3c' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 26px;
  min-width: 80px;
}

.bet-type-select:focus {
  border-color: #fc3c3c;
  background-color: white;
}

.bet-type-select option:disabled {
  color: #ccc;
}

/* 倍数控制 */
.multiple-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 6px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  font-weight: 600;
  /* 防止 Safari 双击缩放 */
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.control-btn:active {
  transform: scale(0.95);
}

.control-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  border-color: #f0f0f0;
}

.multiple-input {
  width: 66px;
  height: 28px;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fc3c3c;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
  outline: none;
  padding: 0;
}

.multiple-input:focus {
  border-color: #fc3c3c;
  background: #fff;
}

/* 隐藏数字输入框的上下箭头 */
.multiple-input::-webkit-outer-spin-button,
.multiple-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.multiple-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* 底部操作区域 - 紧凑版 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  background: white;
  z-index: 100;
  padding: 8px 10px 0px 10px;
  border-top: 1px solid #f0f0f0;
}

/* 上传票据复选框行 */
.upload-bill-row {
  padding: 4px 18px 10px 18px;
  border-bottom: 1px solid #f5f5f5;
}

.upload-bill-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #333;
  margin-left: 4px;
}

.upload-bill-label span {
  font-weight: 500;
  color: #666;
}

/* 投注设置行 */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 18px 4px 18px;
  border-bottom: 1px solid #f5f5f5;
}

/* 快捷倍数选择行 */
.quick-multiple-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.quick-multiple-row::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.quick-multiple-item {
  flex-shrink: 0;
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.quick-multiple-item:active {
  transform: scale(0.95);
}

.quick-multiple-item.active {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  color: white;
  border-color: #fc3c3c;
  font-weight: 600;
}

.setting-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

.bet-type-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}

.bet-type-text {
  font-size: 0.75rem;
  color: #333;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bet-type-popup {
  width: 100%;
}

.popup-header {
  text-align: center;
  margin-bottom: 16px;
}

.popup-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.bet-type-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 10px;
  padding-left: 4px;
  font-weight: 500;
}

.bet-type-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.bet-type-item {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.85rem;
}

.bet-type-item.active {
  background: #fc3c3c;
  color: #fff;
  border-color: #fc3c3c;
}

.bet-type-item.disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.popup-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: none;
}

.confirm-btn {
  background: #fc3c3c;
  border: none;
}

/* 投注信息和按钮行 */
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0px;
  padding: 2px 0px 0px 4px;
}

.bet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 10px;
}

.info-line {
  display: flex;
  align-items: center;
}

.info-text {
  font-size: 1rem;
  color: #333;
}

.info-text .num {
  color: #fc3c3c;
  padding: 0 2px;
  font-size: 0.9rem;
}

.info-text .amount {
  color: #fc3c3c;
  padding: 0 2px;
  font-size: 0.9rem;
}

.prize-line {
  display: flex;
  align-items: center;
  gap: 4px;
}

.prize-text {
  font-size: 0.8rem;
  color: #c8381d;
}

/* 自定义按钮 */
.custom-btn {
  height: 4.2rem;
  max-width: 72px;
  flex: 1;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.custom-btn:active {
  opacity: 0.8;
}

.custom-btn:disabled {
  background: #ccc !important;
  opacity: 0.6;
  cursor: not-allowed;
}

.publish-btn {
  background: #ff9500;
}

.order-btn {
  background: #fc3c3c;
}

:deep(.van-dialog__message) {
  font-size: 0.85rem;
}

/* Banner详情弹窗 */
.banner-details-content {
  height: 100%;
  overflow-y: auto;
  background: white;
  padding: 12px;
}

.banner-details-content img {
  display: block;
  width: 100%;
  height: auto;
}
</style>
