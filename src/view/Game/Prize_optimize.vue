<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="奖金优化" left-arrow @click-left="onClickLeft" class="nav-bar">
        <template #right>
          <div class="help-btn" @click="showHelp = true">
            <van-icon name="question-o" size="20" />
          </div>
        </template>
      </van-nav-bar>
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <!-- 计划购买倍数 -->
    <div class="amount-input-section">
      <span class="amount-label">计划购买倍数</span>
      <div class="amount-controls">
        <van-button class="control-btn" icon="minus" @click="decreaseAmount" />
        <input class="amount-input" v-model.number="totalMultiple" type="number" min="1" @input="onAmountInput" />
        <van-button class="control-btn" icon="plus" @click="increaseAmount" />
        <span class="amount-unit">倍</span>
      </div>
    </div>

    <!-- 优化方式选择 -->
    <div class="optimize-tabs-section">
      <van-tabs v-model:active="activeTab" type="card" @change="onTabChange">
        <van-tab title="平均优化" name="average"></van-tab>
        <van-tab title="博热优化" name="hot"></van-tab>
        <van-tab title="博冷优化" name="cold"></van-tab>
      </van-tabs>
    </div>

    <!-- 投注列表表格 -->
    <div class="bet-cards-section">
      <!-- 表头 -->
      <div class="table-header">
        <div class="col-pass">过关</div>
        <div class="col-scheme">方案</div>
        <div class="col-multiple">倍数</div>
        <div class="col-prize">预计奖金</div>
      </div>

      <!-- 表格行 -->
      <div v-for="(bet, index) in optimizedBets" :key="index" class="table-row">
        <div class="col-pass">{{ getPassType(bet) }}</div>
        <div class="col-scheme">
          <div class="scheme-matches">
            <div v-for="(item, i) in bet.bets" :key="i" class="scheme-item">
              {{ item.gameInfo?.home_team_name || "主队" }}
              <span class="option-tag">{{ getDisplayOptionName(item) }}</span>
            </div>
          </div>
        </div>
        <div class="col-multiple">
          <div class="multiple-controls">
            <van-button class="mini-btn" icon="minus" @click="decreaseMultiple(index)" :disabled="bet.multiple <= 1" />
            <input class="multiple-input" v-model.number="bet.multiple" type="number" min="1" @input="onMultipleInput(index, $event)" />
            <van-button class="mini-btn" icon="plus" @click="increaseMultiple(index)" />
          </div>
        </div>
        <div class="col-prize">{{ bet.estimatedPrize }}元</div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <div class="total-info">
        <div class="info-item">
          <span class="info-label">共</span>
          <span class="info-value">{{ getTotalBets() }}</span>
          <span class="info-label">注</span>
        </div>
        <div class="info-divider">|</div>
        <div class="info-item">
          <span class="info-value highlight">{{ calculateTotalAmount() }}</span>
          <span class="info-label">元</span>
        </div>
      </div>
      <div class="action-buttons">
        <van-button class="next-btn" type="primary" @click="confirmOptimize">确认下单</van-button>
      </div>
    </div>

    <!-- 倍数选择器弹窗 -->
    <van-popup v-model:show="showMultiplePopup" position="bottom" round>
      <van-picker :columns="multipleColumns" @confirm="onMultipleConfirm" @cancel="showMultiplePopup = false" />
    </van-popup>

    <!-- 帮助说明弹窗 -->
    <van-popup v-model:show="showHelp" position="bottom" round :style="{ padding: '20px', maxHeight: '70vh' }">
      <div class="help-content">
        <h3 style="text-align: center; margin-bottom: 16px">奖金优化说明</h3>

        <div class="help-section">
          <h4>平均优化</h4>
          <p>将投注金额平均分配到所有投注组合上，无论哪个结果命中，获得的奖金都相对稳定。适合稳健型投资者。</p>
        </div>

        <div class="help-section">
          <h4>博热优化</h4>
          <p>将更多资金投注到赔率较低（热门）的选项上，提高中奖概率，但奖金相对较低。适合追求高命中率的投资者。</p>
        </div>

        <div class="help-section">
          <h4>博冷优化</h4>
          <p>将更多资金投注到赔率较高（冷门）的选项上，追求高额奖金回报，但风险较大。适合风险偏好型投资者。</p>
        </div>

        <van-button block type="primary" @click="showHelp = false" style="margin-top: 20px"> 我知道了 </van-button>
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

// 数据
const betDetails = ref([]);
const totalMultiple = ref("");
const betMultiple = ref(1);
const selectedBetTypes = ref([]);
const optimizeType = ref("average");
const activeTab = ref("average");
const showHelp = ref(false);
const showMultiplePopup = ref(false);
const multipleColumns = Array.from({ length: 99 }, (_, i) => ({ text: `${i + 1}倍`, value: i + 1 }));
const userBalance = ref(0); // 用户余额
const betAmount = ref(2); // 每注金额

// 按比赛分组
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

// 获取显示的选项名称
function getDisplayOptionName(bet) {
  if (bet.rateType === "2") {
    // 让球胜平负，加上"让"字
    return `让${bet.optionName}`;
  }
  return bet.optionName;
}

// 获取过关类型
function getPassType(bet) {
  const gameCount = bet.bets.length;
  return `${gameCount}串1`;
}

// Tab 切换事件
function onTabChange(name) {
  optimizeType.value = name;
}

// 优化后的投注组合
const optimizedBets = computed(() => {
  if (betDetails.value.length === 0) return [];

  const allCombinations = generateAllCombinations();
  return calculateOptimizedBets(allCombinations);
});

// 生成所有投注组合
function generateAllCombinations() {
  const gamesBets = Object.values(groupedBets.value).map((game) => game.bets);

  function cartesian(arrays) {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map((item) => [item]);

    const result = [];
    const [first, ...rest] = arrays;
    const restProduct = cartesian(rest);

    first.forEach((item) => {
      restProduct.forEach((combo) => {
        result.push([item, ...combo]);
      });
    });

    return result;
  }

  const combinations = cartesian(gamesBets);

  return combinations.map((combo) => {
    const totalOdds = combo.reduce((acc, bet) => acc * parseFloat(bet.optionValue), 1);

    return {
      bets: combo,
      totalOdds,
      multiple: 1,
    };
  });
}

// 计算优化后的投注分配
function calculateOptimizedBets(combinations) {
  if (combinations.length === 0) return [];

  const perBetAmount = 2; // 每注基础金额2元
  let totalBets = totalMultiple.value; // 直接使用倍数

  let optimized = [];

  if (optimizeType.value === "average") {
    // 平均优化：让所有方案的预计奖金相同
    // 预计奖金 = 倍数 × 2元 × 赔率
    // 要使奖金相同，倍数应该与赔率成反比

    // 找出最高赔率
    const maxOdds = Math.max(...combinations.map((c) => c.totalOdds));

    // 计算每个方案需要的倍数比例（赔率越低需要的倍数越高）
    const oddsRatios = combinations.map((combo) => maxOdds / combo.totalOdds);
    const totalRatio = oddsRatios.reduce((sum, ratio) => sum + ratio, 0);

    // 按比例分配总倍数（先用 floor）
    optimized = combinations.map((combo, index) => {
      const ratio = oddsRatios[index] / totalRatio;
      const multiple = Math.floor(totalBets * ratio);
      return {
        ...combo,
        multiple: Math.max(1, multiple),
        estimatedPrize: 0,
      };
    });

    // 计算已分配的倍数
    let allocatedMultiple = optimized.reduce((sum, bet) => sum + bet.multiple, 0);
    
    // 如果还有剩余倍数，分配给赔率最低（需要倍数最多）的方案
    if (allocatedMultiple < totalBets) {
      const remaining = totalBets - allocatedMultiple;
      const maxRatioIndex = oddsRatios.indexOf(Math.max(...oddsRatios));
      optimized[maxRatioIndex].multiple += remaining;
    }
    
    // 更新预计奖金
    optimized.forEach(bet => {
      bet.estimatedPrize = (perBetAmount * bet.multiple * bet.totalOdds).toFixed(2);
    });

  } else if (optimizeType.value === "hot") {
    // 博热优化：保本策略
    // 目标：所有非热门方案各自保本，剩余全部倍数给热门方案追求高回报
    
    const totalInvestment = totalBets * perBetAmount; // 总投入金额
    
    // 找出赔率最低的方案（热门）
    const minOdds = Math.min(...combinations.map(c => c.totalOdds));
    const hotIndex = combinations.findIndex(c => c.totalOdds === minOdds);
    
    // 计算所有非热门方案各自保本所需的倍数
    let totalNeededForOthers = 0;
    const multipleMap = new Map();
    
    combinations.forEach((combo, index) => {
      if (index !== hotIndex) {
        // 非热门方案：计算保本所需倍数
        const neededMultiple = Math.ceil(totalInvestment / (perBetAmount * combo.totalOdds));
        multipleMap.set(index, neededMultiple);
        totalNeededForOthers += neededMultiple;
      }
    });
    
    // 热门方案获得剩余所有倍数
    const hotMultiple = Math.max(1, totalBets - totalNeededForOthers);
    multipleMap.set(hotIndex, hotMultiple);
    
    console.log('博热优化:', `总投入${totalInvestment}元, 热门方案获得${hotMultiple}倍, 其他方案保本共需${totalNeededForOthers}倍`);
    
    // 分配倍数
    optimized = combinations.map((combo, index) => {
      return {
        ...combo,
        multiple: multipleMap.get(index) || 1,
        estimatedPrize: 0,
      };
    });
    
    // 更新预计奖金
    optimized.forEach(bet => {
      bet.estimatedPrize = (perBetAmount * bet.multiple * bet.totalOdds).toFixed(2);
    });
    
  } else if (optimizeType.value === "cold") {
    // 博冷优化：保本策略
    // 目标：所有非冷门方案各自保本，剩余全部倍数给冷门方案追求高回报
    
    const totalInvestment = totalBets * perBetAmount; // 总投入金额
    
    // 找出赔率最高的方案（冷门）
    const maxOdds = Math.max(...combinations.map(c => c.totalOdds));
    const coldIndex = combinations.findIndex(c => c.totalOdds === maxOdds);
    
    // 计算所有非冷门方案各自保本所需的倍数
    let totalNeededForOthers = 0;
    const multipleMap = new Map();
    
    combinations.forEach((combo, index) => {
      if (index !== coldIndex) {
        // 非冷门方案：计算保本所需倍数
        const neededMultiple = Math.ceil(totalInvestment / (perBetAmount * combo.totalOdds));
        multipleMap.set(index, neededMultiple);
        totalNeededForOthers += neededMultiple;
      }
    });
    
    // 冷门方案获得剩余所有倍数
    const coldMultiple = Math.max(1, totalBets - totalNeededForOthers);
    multipleMap.set(coldIndex, coldMultiple);
    
    console.log('博冷优化:', `总投入${totalInvestment}元, 冷门方案获得${coldMultiple}倍, 其他方案保本共需${totalNeededForOthers}倍`);
    
    // 分配倍数
    optimized = combinations.map((combo, index) => {
      return {
        ...combo,
        multiple: multipleMap.get(index) || 1,
        estimatedPrize: 0,
      };
    });
    
    // 更新预计奖金
    optimized.forEach(bet => {
      bet.estimatedPrize = (perBetAmount * bet.multiple * bet.totalOdds).toFixed(2);
    });
  }

  return optimized;
}

// 计算总注数
function getTotalBets() {
  return optimizedBets.value.length;
}

// 计算总金额
function calculateTotalAmount() {
  const total = optimizedBets.value.reduce((sum, bet) => sum + bet.multiple * 2, 0);
  return total + " ";
}

// 倍数调整
function decreaseAmount() {
  if (totalMultiple.value > 1) {
    totalMultiple.value -= 1;
  }
}

function increaseAmount() {
  totalMultiple.value += 1;
}

function onAmountInput(e) {
  let value = e.target.value;
  if (value < 1) {
    totalMultiple.value = 1;
  }
}

// 倍数调整
function decreaseMultiple(index) {
  if (optimizedBets.value[index].multiple > 1) {
    optimizedBets.value[index].multiple--;
    updateEstimatedPrize(index);
  }
}

function increaseMultiple(index) {
  optimizedBets.value[index].multiple++;
  updateEstimatedPrize(index);
}

function onMultipleInput(index, e) {
  let value = parseInt(e.target.value);
  if (isNaN(value) || value < 1) {
    optimizedBets.value[index].multiple = 1;
  }
  updateEstimatedPrize(index);
}

function updateEstimatedPrize(index) {
  const bet = optimizedBets.value[index];
  bet.estimatedPrize = (2 * bet.multiple * bet.totalOdds).toFixed(2);
}

function onMultipleConfirm(value) {
  // 处理倍数确认
  showMultiplePopup.value = false;
}

// 保存优化方案
function saveOptimize() {
  showToast("方案已保存");
}

// 确认优化方案（下单）
async function confirmOptimize() {
  const calculatedTotalAmount = calculateTotalAmount().trim();

  // 检查余额是否充足
  if (userBalance.value < parseFloat(calculatedTotalAmount)) {
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
    message: `订单金额：¥${calculatedTotalAmount}`,
    allowHtml: true,
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

// 准备订单参数（奖金优化版）
function prepareOrderParams() {
  // 1. 提取所有比赛ID（去重）
  const games = [...new Set(betDetails.value.map((bet) => bet.gameId))];

  // 2. 提取所有投注选项ID
  const odds = betDetails.value.map((bet) => bet.betId);

  // 3. 提取所有玩法类型（去重并拼接）
  const rateTypes = [...new Set(betDetails.value.map((bet) => bet.rateType))];
  const rate_type = rateTypes.join(",");

  // 4. 过关规则（从传入的 selectedBetTypes 转换）
  const rules = selectedBetTypes.value.map((bt) => convertBetTypeToRules(bt)).join(",");

  // 5. 计算最大奖金
  const maxPrize = calculateMaxPrizeForOptimized();

  // 6. 生成优化后的组合（bell_all）
  const bell_all = generateOptimizedBellAll();

  // 7. 计算总注数（所有优化后的投注的倍数总和）
  const totalNums = optimizedBets.value.reduce((sum, bet) => sum + bet.multiple, 0);

  // 8. 计算总金额
  const totalAmountValue = optimizedBets.value.reduce((sum, bet) => sum + bet.multiple * 2, 0);

  // 9. 生成 odds_value（每场比赛每种玩法的赔率）
  const odds_value = generateOddsValue();

  // 10. 生成 opt_values（优化的内容）
  const opt_values = generateOptValues();

  // 11. 生成 bill_data（每组交易数据）
  const bill_data = generateBillData();

  return {
    amount: parseFloat(totalAmountValue.toFixed(2)),
    bell_all: bell_all,
    bill_nums: 1, // 奖金优化时，每个组合有自己的倍数
    cate_id: 1, // 足球彩票
    games: games,
    max_price: maxPrize,
    multi: 1, // 奖金优化时，倍数已经分配到各个组合中
    nums: totalNums,
    odds: odds,
    rate_type: rate_type,
    rules: rules,
    upload_bill: 1,
    opt: 1, // 奖金优化标识
    odds_value: odds_value, // 每场比赛每种玩法的赔率
    opt_values: opt_values, // 优化的内容
    bill_data: bill_data, // 每组交易数据
  };
}

// 转换串关方式为过关规则格式
function convertBetTypeToRules(betType) {
  // 1x1 -> 1#1, 2x1 -> 2#1, 3x4 -> 3#4, etc.
  const [m, n] = betType.split("x");
  return `${m}#${n}`;
}

// 生成 odds_value（每场比赛每种玩法的赔率）
// 格式：{ "14351-2-1": "3.30", "14353-2-0": "3.4" }
// 规则：比赛id-玩法类型-选项索引: 赔率值
function generateOddsValue() {
  const oddsValue = {};

  betDetails.value.forEach((bet) => {
    // 构建 key: gameId-rateType-optionIndex
    // betId 格式可能是 "gameId-rateType-optionIndex"
    // 或者我们需要从 bet 对象中提取这些信息
    const key = bet.betId; // 假设 betId 就是这个格式
    const value = bet.optionValue; // 赔率值

    oddsValue[key] = String(value);
  });

  return oddsValue;
}

// 生成 opt_values（优化的内容）
// 格式：[{ multi: 倍数, pl: 优化后的赔率, list: [...] }]
function generateOptValues() {
  const optValues = [];

  optimizedBets.value.forEach((bet) => {
    const optItem = {
      multi: bet.multiple, // 倍数
      pl: bet.totalOdds.toFixed(2), // 优化之后每组的赔率（总赔率）
      list: bet.bets.map((item) => ({
        game: item.gameInfo, // 比赛信息
        gid: item.gameId, // 比赛id
        id: item.betId, // 当前这个玩法的id（比赛id-玩法-每种玩法对应的小玩法索引）
        name: item.optionName, // 玩法名称
        val: item.optionValue, // 赔率
      })),
    };

    optValues.push(optItem);
  });

  return optValues;
}

// 生成 bill_data（每组交易数据）
// 格式：[{ gr: {比赛id:玩法id}, max_reward: 本组理论奖金, multi: 倍数, nums: 倍数, odds: [...], rate_type: [...] }]
function generateBillData() {
  const billData = [];

  optimizedBets.value.forEach((bet) => {
    // 构建 gr 对象：{ 比赛id: 玩法id }
    const gr = {};
    bet.bets.forEach((item) => {
      gr[item.gameId] = item.rateType;
    });

    // 构建 odds 数组：[比赛id-玩法id-索引, ...]
    const odds = bet.bets.map((item) => item.betId);

    // 构建 rate_type 数组：[玩法id, ...]
    const rateType = bet.bets.map((item) => item.rateType);

    // 计算本组理论奖金（倍数 × 2元 × 总赔率）
    const maxReward = (bet.multiple * 2 * bet.totalOdds).toFixed(2);

    const billItem = {
      gr: gr,
      max_reward: parseFloat(maxReward),
      multi: bet.multiple,
      nums: bet.multiple, // 两个填写相同
      odds: odds,
      rate_type: rateType,
    };

    billData.push(billItem);
  });

  return billData;
}

// 计算优化后的最大奖金
function calculateMaxPrizeForOptimized() {
  if (optimizedBets.value.length === 0) return 0;

  let maxPrize = 0;
  optimizedBets.value.forEach((bet) => {
    const prize = parseFloat(bet.estimatedPrize);
    maxPrize = Math.max(maxPrize, prize);
  });

  return maxPrize;
}

// 生成优化后的投注组合
function generateOptimizedBellAll() {
  const allCombinations = [];

  optimizedBets.value.forEach((bet) => {
    // 每个优化后的投注组合，根据其倍数生成对应数量的条目
    const combo = bet.bets.map((item) => item.betId);

    // 根据倍数重复添加
    for (let i = 0; i < bet.multiple; i++) {
      allCombinations.push([[combo]]);
    }
  });

  return allCombinations;
}

// 获取笛卡尔积（辅助函数）
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

// 返回
function onClickLeft() {
  router.back();
}

onMounted(async () => {
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
    }

    if (route.query.totalMultiple) {
      totalMultiple.value = parseFloat(route.query.totalMultiple);
    } else if (route.query.totalAmount) {
      // 兼容旧的 totalAmount 参数，转换为倍数
      totalMultiple.value = Math.floor(parseFloat(route.query.totalAmount) / 2);
    }

    if (route.query.betMultiple) {
      betMultiple.value = parseInt(route.query.betMultiple);
    }

    if (route.query.selectedBetTypes) {
      selectedBetTypes.value = JSON.parse(route.query.selectedBetTypes);
    }
  } catch (error) {
    console.error("解析数据失败:", error);
    showToast("数据加载失败");
    router.back();
  }
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  min-height: 100vh;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 80px;
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
  box-sizing: border-box;
  margin: 0 auto;
}

.help-btn {
  color: #999;
  cursor: pointer;
}

/* 截止时间提示 */
.deadline-notice {
  background: #f0f0f0;
  padding: 10px 16px;
  text-align: center;
  font-size: 0.85rem;
  color: #666;
}

/* 计划购买金额 */
.amount-input-section {
  background: #fff;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
}

.amount-label {
  font-size: 0.9rem;
  color: #333;
  font-weight: 500;
}

.amount-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid #fc3c3c;
  color: #fc3c3c;
  background: #fff;
}

.amount-input {
  width: 52px;
  height: 28px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.amount-unit {
  font-size: 0.9rem;
  color: #333;
}

.total-count {
  padding: 0 4px;
  font-size: 14px;
  font-weight: 600;
}

/* 优化方式选择 */
.optimize-tabs-section {
  background: #fff;
  padding: 0 16px;
  margin-bottom: 8px;
}

/* 投注列表表格 */
.bet-cards-section {
  padding: 10px 12px 16px;
  overflow-y: auto;
}

/* 表头 */
.table-header {
  display: grid;
  grid-template-columns: 42px 120px 66px 80px;
  gap: 6px;
  background: #eaeaea;
  color: #5d5d5d;
  padding: 8px 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 8px 8px 0 0;
  margin-bottom: 0;
}

.col-pass,
.col-scheme,
.col-multiple,
.col-prize {
  display: flex;
  align-items: center;
  justify-content: end;
}

/* 表格行 */
.table-row {
  display: grid;
 grid-template-columns: 42px 120px 66px 80px;
  gap: 6px;
  background: #fff;
  padding: 10px 6px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.75rem;
  align-items: center;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #fafafa;
}

.table-row:last-child {
  border-bottom: none;
  border-radius: 0 0 8px 8px;
}

/* 过关列 */
.table-row .col-pass {
  font-weight: 600;
  color: #333;
  font-size: 0.7rem;
  text-align: center;
}

/* 方案列 */
.table-row .col-scheme {
  flex-direction: column;
  gap: 3px;
  padding: 0 4px;
}

.scheme-matches {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;
}

.scheme-item {
  font-size: 0.75rem;
  color: #333;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.option-tag {
  display: inline-block;
  color: #fc3c3c;
  font-size: 0.7rem;
  font-weight: 500;
  white-space: nowrap;
}

/* 倍数列 */
.table-row .col-multiple {
  justify-content: center;
}

.multiple-controls {
  display: flex;
  align-items: center;
  gap: 3px;
}

.mini-btn {
  width: 20px;
  height: 20px;
  padding: 0;
  min-width: 20px;
  border-radius: 3px;
  border: 1px solid #666;
  color: #666;
  background: #fff;
  font-size: 0.7rem;
}

.mini-btn:active {
  background: #f0f0f0;
}

.multiple-input {
  width: 54px;
  height: 20px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #ddd;
  border-radius: 3px;
  outline: none;
  padding: 0;
}

/* 预计奖金列 */
.table-row .col-prize {
  font-size: 0.75rem;
  color: #333;
  text-align: right;
  font-weight: 600;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 430px;
  background: #fff;
  padding: 12px 40px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.info-divider {
  font-size: 1rem;
  color: #ddd;
  font-weight: 300;
}

.info-label {
  font-size: 0.8rem;
  color: #999;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

.info-value.highlight {
  font-size: 1.3rem;
  color: #fc3c3c;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.save-btn {
  padding: 0 24px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: #fff;
  color: #666;
}

.next-btn {
  padding: 0 28px;
  height: 40px;
  border-radius: 20px;
  background: linear-gradient(135deg, #fc3c3c 0%, #fc3c3c 100%);
  border: none;
  color: #fff;
}

/* 帮助弹窗 */
.help-content {
  max-height: 70vh;
  overflow-y: auto;
}

.help-section {
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.help-section h4 {
  font-size: 0.9rem;
  margin: 0 0 8px 0;
  color: #333;
}

.help-section p {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* 隐藏数字输入框的上下箭头 */
.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button,
.multiple-input::-webkit-outer-spin-button,
.multiple-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.amount-input[type="number"],
.multiple-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>
