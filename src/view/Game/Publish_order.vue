<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="发单设置" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div style="font-size: 0.75rem;color: #c8381d;padding: 8px;background-color: #f4ebec;">
       温馨提示:购彩有节制，请理性购彩，避免沉迷过度
    </div>

    <div class="publish-container">
      <!-- 订单信息卡片 -->
      <div class="lottery-info-card">
        <!-- 游戏名称和方案金额 -->
        <div class="lottery-header">
          <div class="lottery-name">
            <span class="game-name-badge">{{ gameName }}</span>
            <span class="play-type">{{ orderData.gameName }}</span>
          </div>
          <span class="amount-badge">{{ totalAmount }}元</span>
        </div>

        <!-- 下单内容 -->
        <div class="selection-display">
          <!-- 排列三 -->
          <div v-if="orderData.type === 'pl3'" class="pl3-selection">
            <!-- 注数显示在右上角 -->
            <div class="bet-count-badge">共{{ orderData.totalBets }}注</div>

            <div class="position-group">
              <span class="position-label">百位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.hundred" :key="'h-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">十位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.ten" :key="'t-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">个位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.unit" :key="'u-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
          </div>

          <!-- 排列五 -->
          <div v-if="orderData.type === 'pl5'" class="pl3-selection">
            <div class="bet-count-badge">共{{ orderData.totalBets }}注</div>

            <div class="position-group">
              <span class="position-label">万位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.tenThousand" :key="'tt-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">千位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.thousand" :key="'th-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">百位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.hundred" :key="'h-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">十位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.ten" :key="'t-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
            <div class="position-group">
              <span class="position-label">个位</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.unit" :key="'u-' + num" class="number-ball">{{ num }}</span>
              </div>
            </div>
          </div>

          <!-- 大乐透 -->
          <div v-if="orderData.type === 'daletou'" class="daletou-selection">
            <div class="bet-count-badge">共{{ orderData.totalBets }}注</div>

            <div class="ball-zone">
              <span class="zone-label">前区</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.red" :key="'red-' + num" class="number-ball red-ball">
                  {{ String(num).padStart(2, "0") }}
                </span>
              </div>
            </div>
            <div class="ball-zone">
              <span class="zone-label">后区</span>
              <div class="number-list">
                <span v-for="num in orderData.selections.blue" :key="'blue-' + num" class="number-ball blue-ball">
                  {{ String(num).padStart(2, "0") }}
                </span>
              </div>
            </div>
          </div>

          <!-- 足球竞猜 -->
          <div v-if="orderData.type === 'football'" class="football-selection">
            <div class="bet-count-badge">共{{ orderData.totalBets }}注</div>

            <div v-for="(game, gameId) in orderData.groupedBets" :key="gameId" class="football-game-item">
              <div class="game-header-simple">
                <span class="game-number">{{ game.gameInfo?.xuhao }}</span>
                <span class="game-teams">{{ game.gameInfo?.home_team_name }} VS {{ game.gameInfo?.guest_team_name }}</span>
              </div>
              <div class="game-options">
                <span v-for="bet in game.bets" :key="bet.betId" class="option-tag">
                  {{ getDisplayOptionName(bet) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 倍数信息 -->
        <div class="bet-summary">
          <span v-if="orderData.type === 'football'">
            {{ orderData.selectedBetType }} × {{ orderData.betMultiple }} 倍
          </span>
          <span v-else>
            共 {{ orderData.totalBets }} 注 × {{ orderData.multiple }} 倍
          </span>
        </div>
      </div>

      <!-- 佣金设置 -->
      <div class="commission-section">
        <div class="section-header">
          <span class="section-title">佣金设置</span>
          <span class="section-tip">选择佣金比例</span>
        </div>
        <div class="commission-grid">
          <div
            v-for="rate in commissionRates"
            :key="rate"
            class="commission-item"
            :class="{ active: selectedCommission === rate }"
            @click="selectCommission(rate)"
          >
            {{ rate }}%
          </div>
        </div>
      </div>

      <!-- 保密设置 -->
      <div class="privacy-section">
        <div class="section-header">
          <span class="section-title">保密设置</span>
          <span class="section-tip">默认截止后公开</span>
        </div>
        <div class="privacy-display">
          <van-icon name="clock-o" color="#999" size="16" />
          <span>截止后公开</span>
        </div>
      </div>

      <!-- 发单宣言 -->
      <div class="declaration-section">
        <van-field
          v-model="declaration"
          rows="4"
          autosize
          type="textarea"
          maxlength="200"
          placeholder="请输入发单宣言，让更多人关注您的方案..."
          show-word-limit
          class="declaration-input"
        />
      </div>
    </div>

    <!-- 底部确认按钮 -->
    <div class="bottom-action">
      <van-button type="primary" class="confirm-btn" :disabled="!canPublish" @click="confirmPublish"> 确认发单 </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { showToast, showDialog } from "vant";
import { useRouter, useRoute } from "vue-router";
import API from "../../request/api.js";

const router = useRouter();
const route = useRoute();

// 订单数据
const orderData = ref({});
const gameName = ref("");
const totalAmount = ref(0);

// 佣金设置
const commissionRates = [1, 2, 3, 4, 5, 6, 7, 8];
const selectedCommission = ref(1);

// 保密设置 - 固定为截止后公开
const privacySetting = "after"; // 固定为截止后公开

// 发单宣言
const declaration = ref("");

// 是否可以发单
const canPublish = computed(() => {
  return selectedCommission.value > 0 && declaration.value.trim().length > 0;
});

// 选择佣金
function selectCommission(rate) {
  selectedCommission.value = rate;
}

// 获取显示的选项名称（足球竞猜）
function getDisplayOptionName(bet) {
  if (bet.rateType === "2") {
    return `让${bet.optionName}`;
  }
  return bet.optionName;
}

// 返回
function onClickLeft() {
  router.back();
}

// 确认发单
async function confirmPublish() {
  if (!canPublish.value) {
    showToast("请完善发单信息");
    return;
  }

  showDialog({
    title: "确认发单",
    message: `<div style="text-align: center; padding: 0px;max-height: 180px;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px;">
        <div style="flex: 1; text-align: center; padding: 0px; background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%); border-radius: 10px; border: 1px solid #e8e8e8; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
          <div style="font-size: 11px; color: #999; margin-bottom: 6px; font-weight: 500;">方案金额</div>
          <div style="font-size: 17px; font-weight: 700; color: #333;">${totalAmount.value}元</div>
        </div>
        <div style="flex: 1; text-align: center; padding: 0px; background: linear-gradient(135deg, #fff5f5 0%, #fff 100%); border-radius: 10px; border: 1px solid #ffe5e5; box-shadow: 0 2px 8px rgba(200,56,29,0.08);">
          <div style="font-size: 1rem; color: #999; margin-bottom: 6px; font-weight: 500;">佣金比例</div>
          <div style="font-size: 0.9rem; font-weight: 700; color: #c8381d;">${selectedCommission.value}%</div>
        </div>
      </div>
    
    </div>`,
    allowHtml: true,
    showCancelButton: true,
    confirmButtonText: "确认发布",
    cancelButtonText: "取消",
    confirmButtonColor: "#c8381d",
    cancelButtonColor: "#999",
  })
    .then(async () => {
      try {
        // 准备发单参数
        const publishParams = preparePublishParams();

        // 调用下单接口（发单也使用下单接口）
        const response = await API.add_order(publishParams);

        console.log("发单接口响应:", response);

        if (response.code === 1) {
          showToast("发单成功");
          // 跳转到下单成功页面
          router.replace({
            path: "/bet_success",
            query: {
              orderId: response.data?.id || response.data?.order_id || "",
            },
          });
        } else {
          showToast(response.msg || "发单失败");
        }
      } catch (error) {
        console.error("发单失败:", error);
        showToast(error.message || "发单失败，请重试");
      }
    })
    .catch(() => {
      console.log("用户取消发单");
    });
}

// 准备发单参数
function preparePublishParams() {
  // 足球竞猜
  if (orderData.value.type === 'football') {
    // 提取所有比赛ID
    const games = [...new Set(orderData.value.betDetails.map((bet) => bet.gameId))];

    // 提取所有投注选项ID
    const odds = orderData.value.betDetails.map((bet) => bet.betId);

    // 提取所有玩法类型
    const rateTypes = [...new Set(orderData.value.betDetails.map((bet) => bet.rateType))];
    const rate_type = rateTypes.join(",");

    // 转换过关方式
    const [m, n] = orderData.value.selectedBetType.split('x');
    const rules = `${m}#${n}`;

    // 计算最高奖金
    const gamesMaxOdds = Object.values(orderData.value.groupedBets).map(game => {
      const gameOdds = game.bets.map(bet => parseFloat(bet.optionValue));
      return Math.max(...gameOdds);
    });

    let maxPrize = 0;
    if (m === '1' && n === '1') {
      const maxOdds = Math.max(...gamesMaxOdds);
      maxPrize = parseFloat((maxOdds * 2 * orderData.value.betMultiple).toFixed(2));
    } else {
      const sortedOdds = gamesMaxOdds.sort((a, b) => b - a);
      const topOdds = sortedOdds.slice(0, parseInt(m));
      const oddsProduct = topOdds.reduce((acc, odd) => acc * odd, 1);
      maxPrize = parseFloat((oddsProduct * 2 * orderData.value.betMultiple * parseInt(n)).toFixed(2));
    }

    // 生成 bell_all（简化版，实际应该生成所有组合）
    const bell_all = odds.join(',');

    return {
      amount: parseFloat(totalAmount.value),
      bell_all: bell_all,
      bill_nums: orderData.value.betMultiple,
      cate_id: 1, // 足球彩票
      games: games,
      max_price: maxPrize,
      multi: orderData.value.betMultiple,
      nums: orderData.value.totalBets,
      odds: odds,
      rate_type: rate_type,
      rules: rules,
      upload_bill: 1,
      // 发单专用参数
      otype: 3, // 3表示发单
      desc: declaration.value, // 发单宣言
      commission: selectedCommission.value, // 佣金比例
      is_pub: 0, // 是否公开：0=截止后公开，1=立即公开
    };
  }

  // 数字彩票
  const lotteryTypeMap = {
    pl3: 6, // 排列3
    pl5: 7, // 排列5
    seven_stars: 8, // 七星彩
    daletou: 5, // 大乐透
  };

  return {
    amount: parseFloat(totalAmount.value),
    bill_nums: orderData.value.multiple,
    cate_id: lotteryTypeMap[orderData.value.type] || 4,
    multi: orderData.value.multiple,
    nums: orderData.value.totalBets,
    odds: orderData.value.betData,
    upload_bill: 1,
    rules: "",
    rate_type: "",
    phase: orderData.value.period, // 期号
    // 发单专用参数（只有排列三有发单功能）
    otype: 3, // 3表示发单
    desc: declaration.value, // 发单宣言
    commission: selectedCommission.value, // 佣金比例
    is_pub: 0, // 是否公开：0=截止后公开，1=立即公开
  };
}

// 页面加载
onMounted(() => {
  // 从路由参数获取订单数据
  if (route.query.orderData) {
    try {
      const data = JSON.parse(route.query.orderData);
      orderData.value = data;
      totalAmount.value = data.totalAmount || 0;

      // 设置游戏名称
      if (data.type === 'football') {
        gameName.value = "竞彩足球";
      } else {
        const gameNameMap = {
          pl3: "排列三",
          pl5: "排列五",
          seven_stars: "七星彩",
          daletou: "大乐透",
        };
        gameName.value = gameNameMap[data.type] || "未知游戏";
      }
    } catch (error) {
      console.error("解析订单数据失败:", error);
      showToast("数据错误");
      router.back();
    }
  } else {
    showToast("缺少订单数据");
    router.back();
  }
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.nav-bar-center-wrap {
  position: sticky;
  top: 0;
  z-index: 999;
  max-width: 430px;
  margin: 0 auto;
}

.nav-bar {
  background: white;
}

.publish-container {
  max-width: 430px;
  margin: 0 auto;
  padding: 12px;
}

/* 订单信息卡片 - 与 Lottery_bet.vue 相同样式 */
.lottery-info-card {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.lottery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.lottery-name {
  display: flex;
  align-items: center;
  gap: 6px;
}

.game-name-badge {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  padding: 3px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(252, 60, 60, 0.3);
}

.play-type {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}

.amount-badge {
  font-size: 0.9rem;
  color: #c8381d;
  background: #fff5f5;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 700;
}

.selection-display {
  margin-bottom: 8px;
}

.pl3-selection {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: linear-gradient(135deg, #fff9f5 0%, #fff 100%);
  border-radius: 6px;
  padding: 8px;
}

.bet-count-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.7rem;
  color: #fc3c3c;
  background: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(252, 60, 60, 0.15);
  z-index: 1;
}

.position-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 0;
}

.position-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #666;
  min-width: 32px;
  text-align: right;
}

.number-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.number-ball {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(252, 60, 60, 0.2);
}

/* 大乐透选号展示 */
.daletou-selection {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: linear-gradient(135deg, #fff9f5 0%, #fff 100%);
  border-radius: 6px;
  padding: 10px;
}

.ball-zone {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.zone-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.red-ball {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
}

.blue-ball {
  background: linear-gradient(135deg, #1e90ff 0%, #4dabf7 100%);
}

.bet-summary {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
  font-size: 0.75rem;
  color: #c8381d;
  font-weight: 600;
  text-align: right;
}

/* 佣金设置 */
.commission-section {
  background: white;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}

.section-tip {
  font-size: 0.7rem;
  color: #999;
}

.commission-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.commission-item {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1.5px solid transparent;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.commission-item.active {
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border-color: #c8381d;
  color: #c8381d;
  box-shadow: 0 2px 6px rgba(200, 56, 29, 0.15);
}

.commission-item:active {
  transform: scale(0.96);
}

/* 保密设置 */
.privacy-section {
  background: white;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
}

.privacy-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #666;
}

/* 发单宣言 */
.declaration-section {
  background: white;
  border-radius: 8px;
  padding:0px;
  margin-bottom: 10px;
}

.declaration-input {
  margin-top: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
}

/* 底部按钮 */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 430px;
  padding: 12px;
}

.confirm-btn {
  width: 100%;
  height: 48px;
  background: #c8381d;
  border: none;
  font-size: 14px;
  font-weight: 600;
  border-radius: 24px;
}

.confirm-btn:disabled {
  background: #ccc;
  opacity: 0.6;
}

/* 足球竞猜样式 */
.football-selection {
  position: relative;
}

.football-game-item {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.football-game-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.game-header-simple {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.game-number {
  font-size: 0.75rem;
  color: white;
  background: #c8381d;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.game-teams {
  font-size: 0.8rem;
  color: #333;
  font-weight: 500;
  flex: 1;
}

.game-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-left: 8px;
}

.option-tag {
  font-size: 0.75rem;
  color: #c8381d;
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffe5e5;
  padding: 3px 8px;
  border-radius: 4px;
  font-weight: 500;
}
</style>
