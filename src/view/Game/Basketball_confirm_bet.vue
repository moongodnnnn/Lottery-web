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

    <!-- 调整方案按钮 -->
    <div style="padding: 10px 10px 0px 10px">
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
        <van-icon name="edit" style="margin-right: 4px;" />
        调整方案
      </van-button>
    </div>

    <!-- 投注内容列表 - 按比赛分组 -->
    <div class="bet-list">
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

    <!-- 底部操作区域 - 紧凑版 -->
    <div class="bottom-action-bar">
      <!-- 投注设置行 -->
      <div class="settings-row">
        <div class="setting-group">
          <span class="setting-label">串关方式</span>
          <div class="bet-type-display" @click="showBetTypePopup = true">
            <span>{{ selectedBetTypesText }}</span>
            <van-icon name="arrow-down" size="14" />
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
              max="99"
              @input="onMultipleInput"
              @blur="validateMultiple"
            />
            <van-button class="control-btn" icon="plus" @click="increaseMultiple" :disabled="betMultiple >= 99" />
          </div>
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

    <!-- 玩法说明弹窗 -->
    <van-popup
      v-model:show="showRule"
      position="bottom"
      :style="{ height: '80%', maxWidth: '430px', left: '50%', transform: 'translateX(-50%)' }"
      round
      closeable
    >
      <div class="rule-content">
        <h3 style="text-align: center; padding: 20px 0">竞彩篮球玩法说明</h3>
        <div style="padding: 0 20px 20px">
          <p style="line-height: 1.8; color: #666">
            竞彩篮球包含胜负、让分胜负、大小分、胜分差等多种玩法。您可以选择单场投注或串关投注，串关可以提高中奖金额。
          </p>
        </div>
      </div>
    </van-popup>

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
                disabled: type.disabled
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
                disabled: type.disabled
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
const betAmount = ref(2); // 每注金额，默认2元
const betMultiple = ref(10); // 投注倍数，默认10倍
const selectedBetTypes = ref([]); // 选中的投注方式数组，支持多选
const showRule = ref(false);
const showBannerPopup = ref(false); // Banner详情弹窗
const showBetTypePopup = ref(false); // 串关方式弹窗
const userBalance = ref(0); // 用户余额

// 投注方式选项（串关方式）
const betTypeOptions = computed(() => {
  const gameCount = Object.keys(groupedBets.value).length; // 比赛场次数
  const options = [];

  if (gameCount === 1) {
    // 1场比赛：只能单关
    options.push({ label: "单关", value: "1x1", disabled: false });
  } else if (gameCount === 2) {
    // 2场比赛：只能2串1
    options.push({ label: "2串1", value: "2x1", disabled: false });
  } else if (gameCount === 3) {
    // 3场比赛：2串1、3串1、3串3、3串4
    options.push(
      { label: "2串1", value: "2x1", disabled: false },
      { label: "3串1", value: "3x1", disabled: false },
      { label: "3串3", value: "3x3", disabled: false },
      { label: "3串4", value: "3x4", disabled: false }
    );
  } else if (gameCount === 4) {
    // 4场比赛：2串1、3串1、4串1、4串4、4串5、4串6、4串11
    options.push(
      { label: "2串1", value: "2x1", disabled: false },
      { label: "3串1", value: "3x1", disabled: false },
      { label: "4串1", value: "4x1", disabled: false },
      { label: "4串4", value: "4x4", disabled: false },
      { label: "4串5", value: "4x5", disabled: false },
      { label: "4串6", value: "4x6", disabled: false },
      { label: "4串11", value: "4x11", disabled: false }
    );
  } else if (gameCount === 5) {
    // 5场比赛：2串1、3串1、4串1、5串1、5串5、5串6、5串10、5串16、5串20、5串26
    options.push(
      { label: "2串1", value: "2x1", disabled: false },
      { label: "3串1", value: "3x1", disabled: false },
      { label: "4串1", value: "4x1", disabled: false },
      { label: "5串1", value: "5x1", disabled: false },
      { label: "5串5", value: "5x5", disabled: false },
      { label: "5串6", value: "5x6", disabled: false },
      { label: "5串10", value: "5x10", disabled: false },
      { label: "5串16", value: "5x16", disabled: false },
      { label: "5串20", value: "5x20", disabled: false },
      { label: "5串26", value: "5x26", disabled: false }
    );
  } else if (gameCount === 6) {
    // 6场比赛：2串1、3串1、4串1、5串1、6串1、6串6、6串7、6串15、6串20、6串22、6串35、6串42、6串50、6串57
    options.push(
      { label: "2串1", value: "2x1", disabled: false },
      { label: "3串1", value: "3x1", disabled: false },
      { label: "4串1", value: "4x1", disabled: false },
      { label: "5串1", value: "5x1", disabled: false },
      { label: "6串1", value: "6x1", disabled: false },
      { label: "6串6", value: "6x6", disabled: false },
      { label: "6串7", value: "6x7", disabled: false },
      { label: "6串15", value: "6x15", disabled: false },
      { label: "6串20", value: "6x20", disabled: false },
      { label: "6串22", value: "6x22", disabled: false },
      { label: "6串35", value: "6x35", disabled: false },
      { label: "6串42", value: "6x42", disabled: false },
      { label: "6串50", value: "6x50", disabled: false },
      { label: "6串57", value: "6x57", disabled: false }
    );
  } else if (gameCount >= 7) {
    // 7场及以上：简化显示常用串关
    options.push(
      { label: "2串1", value: "2x1", disabled: false },
      { label: "3串1", value: "3x1", disabled: false },
      { label: "4串1", value: "4x1", disabled: false },
      { label: "5串1", value: "5x1", disabled: false },
      { label: "6串1", value: "6x1", disabled: false },
      { label: "7串1", value: "7x1", disabled: false }
    );
  }

  return options;
});

// 单一串关（Nx1）
const singleBetTypes = computed(() => {
  return betTypeOptions.value.filter(opt => {
    const [, n] = opt.value.split('x').map(Number);
    return n === 1;
  });
});

// 组合串关（NxM where M>1）
const combinedBetTypes = computed(() => {
  return betTypeOptions.value.filter(opt => {
    const [, n] = opt.value.split('x').map(Number);
    return n > 1;
  });
});

// 显示选中的串关方式文本
const selectedBetTypesText = computed(() => {
  if (selectedBetTypes.value.length === 0) return '请选择';
  return selectedBetTypes.value.map(v => {
    // 特殊处理：1x1 显示为"单关"
    if (v === '1x1') return '单关';

    const option = betTypeOptions.value.find(opt => opt.value === v);
    return option ? option.label : v;
  }).join('、');
});

// 判断是否可多选
function isMultiSelectable(value) {
  const [, n] = value.split('x').map(Number);
  return n === 1;
}

// 切换串关选择
function toggleBetType(type) {
  if (type.disabled) return;

  const index = selectedBetTypes.value.indexOf(type.value);

  if (isMultiSelectable(type.value)) {
    // 单一串关：多选
    if (index > -1) {
      selectedBetTypes.value.splice(index, 1);
    } else {
      // 移除所有组合串关
      selectedBetTypes.value = selectedBetTypes.value.filter(v => isMultiSelectable(v));
      selectedBetTypes.value.push(type.value);
    }
  } else {
    // 组合串关：单选（替换所有）
    selectedBetTypes.value = [type.value];
  }
}

// 取消选择
function cancelBetTypeSelection() {
  showBetTypePopup.value = false;
}

// 确认选择
function confirmBetTypeSelection() {
  if (selectedBetTypes.value.length === 0) {
    showToast('请至少选择一种串关方式');
    return;
  }
  showBetTypePopup.value = false;
}

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

// 计算总注数（根据串关方式）- 支持多选
const totalBets = computed(() => {
  if (selectedBetTypes.value.length === 0) return 0;

  let total = 0;
  selectedBetTypes.value.forEach(betType => {
    const [m, n] = betType.split('x').map(Number);

    if (m === 1 && n === 1) {
      // 单关：每场比赛的投注选项数相乘
      let singleTotal = 1;
      Object.values(groupedBets.value).forEach(game => {
        singleTotal *= game.bets.length;
      });
      total += singleTotal;
    } else {
      // 串关注数直接使用n值
      total += n;
    }
  });

  return total;
});

// 计算总金额
const totalAmount = computed(() => {
  return (totalBets.value * betAmount.value * betMultiple.value).toFixed(2);
});

// 计算预计中奖金额范围（最低~最高）- 支持多选
const estimatedPrize = computed(() => {
  if (betDetails.value.length === 0 || selectedBetTypes.value.length === 0) return "0.00~0.00元";

  let minPrize = Infinity;
  let maxPrize = 0;

  selectedBetTypes.value.forEach(betType => {
    const [m, n] = betType.split('x').map(Number);

    // 获取每场比赛的赔率（取每场的最小和最大赔率）
    const gamesOdds = Object.values(groupedBets.value).map(game => {
      const gameOdds = game.bets.map(bet => parseFloat(bet.optionValue));
      return {
        min: Math.min(...gameOdds),
        max: Math.max(...gameOdds)
      };
    });

    let currentMin, currentMax;

    if (m === 1 && n === 1) {
      // 单关：取所有场次中的最小和最大赔率
      const minOdds = Math.min(...gamesOdds.map(g => g.min));
      const maxOdds = Math.max(...gamesOdds.map(g => g.max));
      currentMin = parseFloat((minOdds * betAmount.value * betMultiple.value).toFixed(2));
      currentMax = parseFloat((maxOdds * betAmount.value * betMultiple.value).toFixed(2));
    } else {
      // 串关：取m场的最小和最大赔率相乘
      const sortedMinOdds = gamesOdds.map(g => g.min).sort((a, b) => a - b);
      const sortedMaxOdds = gamesOdds.map(g => g.max).sort((a, b) => b - a);

      let minProduct = 1;
      let maxProduct = 1;
      for (let i = 0; i < m; i++) {
        minProduct *= sortedMinOdds[i];
        maxProduct *= sortedMaxOdds[i];
      }

      currentMin = parseFloat((minProduct * betAmount.value * betMultiple.value).toFixed(2));
      currentMax = parseFloat((maxProduct * betAmount.value * betMultiple.value).toFixed(2));
    }

    minPrize = Math.min(minPrize, currentMin);
    maxPrize = Math.max(maxPrize, currentMax);
  });

  return `${minPrize.toFixed(2)}~${maxPrize.toFixed(2)}元`;
});

// 是否可以确认
const canConfirm = computed(() => {
  return betDetails.value.length > 0 && totalBets.value > 0;
});

// 格式化比赛时间（只显示时分）
function formatMatchTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 获取显示的选项名称（篮球玩法）
function getDisplayOptionName(bet) {
  // 篮球玩法：
  // rate_type = 6: 胜负
  // rate_type = 7: 让分胜负
  // rate_type = 8: 胜分差
  // rate_type = 9: 大小分

  if (bet.rateType === "7") {
    // 让分胜负：在选项名称前加"让"
    return `让${bet.optionName}`;
  }

  // 其他类型直接返回选项名称
  return bet.optionName;
}

// 增加倍数
function increaseMultiple() {
  if (betMultiple.value < 99) {
    betMultiple.value++;
  }
}

// 减少倍数
function decreaseMultiple() {
  if (betMultiple.value > 1) {
    betMultiple.value--;
  }
}

// 倍数输入验证
function onMultipleInput(e) {
  let value = e.target.value;
  // 移除非数字字符
  value = value.replace(/[^\d]/g, '');
  // 限制范围
  if (value === '') {
    betMultiple.value = 1;
  } else {
    let num = parseInt(value);
    if (num < 1) num = 1;
    if (num > 99) num = 99;
    betMultiple.value = num;
  }
}

// 失去焦点时验证
function validateMultiple() {
  if (!betMultiple.value || betMultiple.value < 1) {
    betMultiple.value = 1;
  } else if (betMultiple.value > 99) {
    betMultiple.value = 99;
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
    title: '发单确认',
    message: `<div style="text-align: center;">
      <div style="font-size: 18px; font-weight: 600; color: #333; margin-bottom: 12px;">方案金额：${totalAmount.value}元</div>
      <div style="font-size: 14px; color: #666;">您确认进入发单设置吗？</div>
    </div>`,
    allowHtml: true,
    showCancelButton: true,
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
    .then(() => {
      // 用户点击确认，跳转到发单设置页面
      console.log("用户确认发单，跳转到发单设置页面");

      // 准备订单数据
      const orderData = {
        type: 'basketball', // 篮球竞猜
        betDetails: betDetails.value,
        groupedBets: groupedBets.value,
        totalBets: totalBets.value,
        betMultiple: betMultiple.value,
        totalAmount: totalAmount.value,
        selectedBetTypes: selectedBetTypes.value,
        estimatedPrize: estimatedPrize.value
      };

      // 跳转到发单页面
      router.push({
        path: '/publish_order',
        query: {
          orderData: JSON.stringify(orderData)
        }
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
      message: `资金不足,去充值<br/><div style="font-size: 14px; color: #999;padding-top: 20px;">当前余额：¥${userBalance.value.toFixed(2)}</div>`,
      messageAlign: "center",
      title:'温馨提示',
      showCancelButton: true,
      confirmButtonText: "去充值",
      cancelButtonText: "取消",
      allowHtml: true
    })
      .then(() => {
        router.push('/recharge');
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
    title:'温馨提示',
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    message: `订单金额：¥${totalAmount.value} <br/> 确认提交此方案吗？`,
  })
    .then(async () => {
      // 用户点击确认，准备接口参数
      const orderParams = prepareOrderParams();

      try {
        // 调用下单接口
        const response = await API.add_order(orderParams);

        console.log("接口响应:", response);

        if (response.code === 1) {
          const orderId = response.data?.id || response.data?.order_id || '';

          // 调用余额支付接口
          try {
            const payRes = await API.toBalance({ id: orderId });
            if (payRes.code === 1) {
              // 跳转到下单成功页面
              router.replace({
                path: '/bet_success',
                query: { orderId }
              });
            } else {
              if (payRes.msg === "资金不足") {
                // 获取最新余额
                try {
                  const balanceRes = await API.balanceof();
                  if (balanceRes.code === 1 && balanceRes.data) {
                    userBalance.value = parseFloat(balanceRes.data.amount);
                  }
                } catch (error) {
                  console.error('获取余额失败:', error);
                }

                showDialog({
                  message: `资金不足,去充值<br/><div style="font-size: 14px; color: #999;padding-top: 20px;">当前余额：¥${userBalance.value.toFixed(2)}</div>`,
                  messageAlign: "center",
                  title:'温馨提示',
                  showCancelButton: true,
                  confirmButtonText: "去充值",
                  cancelButtonText: "取消",
                  allowHtml: true
                })
                  .then(() => {
                    router.push('/recharge');
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
      // 用户点击取消，不做任何操作
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

  // 4. 转换过关方式 - 支持多选
  const rules = selectedBetTypes.value.map(bt => convertBetTypeToRules(bt)).join(',');

  // 5. 计算最高奖金
  const maxPrize = calculateMaxPrize();

  // 6. 生成所有组合（bell_all）
  const bell_all = generateBellAll();

  return {
    amount: parseFloat(totalAmount.value),
    bell_all: bell_all,
    bill_nums: betMultiple.value,
    cate_id: 60, // 篮球彩票（根据后端定义，可能需要调整）
    games: games,
    max_price: maxPrize,
    multi: betMultiple.value,
    nums: totalBets.value,
    odds: odds,
    rate_type: rate_type,
    rules: rules,
    upload_bill: 1,
  };
}

// 转换串关方式为过关规则格式
function convertBetTypeToRules(betType) {
  // 1x1 -> 1#1, 2x1 -> 2#1, 3x4 -> 3#4, etc.
  const [m, n] = betType.split('x');
  return `${m}#${n}`;
}

// 计算最高奖金 - 支持多选，取所有串关方式中的最大值
function calculateMaxPrize() {
  if (betDetails.value.length === 0 || selectedBetTypes.value.length === 0) return 0;

  let maxPrize = 0;

  selectedBetTypes.value.forEach(betType => {
    const [m, n] = betType.split('x').map(Number);

    // 获取每场比赛的最大赔率
    const gamesMaxOdds = Object.values(groupedBets.value).map(game => {
      const gameOdds = game.bets.map(bet => parseFloat(bet.optionValue));
      return Math.max(...gameOdds);
    });

    let currentPrize = 0;

    if (m === 1 && n === 1) {
      // 单关：取所有场次中的最大赔率
      const maxOdds = Math.max(...gamesMaxOdds);
      currentPrize = parseFloat((maxOdds * betAmount.value * betMultiple.value).toFixed(2));
    } else {
      // 串关：取m场的最大赔率相乘
      const sortedOdds = gamesMaxOdds.sort((a, b) => b - a);
      let product = 1;
      for (let i = 0; i < m; i++) {
        product *= sortedOdds[i];
      }
      currentPrize = parseFloat((product * betAmount.value * betMultiple.value).toFixed(2));
    }

    maxPrize = Math.max(maxPrize, currentPrize);
  });

  return maxPrize;
}

// 生成所有组合（bell_all）
function generateBellAll() {
  // 按比赛分组，每个比赛的所有选项ID
  const gameGroups = Object.values(groupedBets.value).map(game =>
    game.bets.map(bet => bet.betId)
  );

  // 生成笛卡尔积
  function cartesianProduct(arrays) {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map(item => [item]);

    const [first, ...rest] = arrays;
    const restProduct = cartesianProduct(rest);

    return first.flatMap(item =>
      restProduct.map(combination => [item, ...combination])
    );
  }

  const combinations = cartesianProduct(gameGroups);

  // 转换为字符串格式：每个组合用逗号分隔，组合之间用分号分隔
  return combinations.map(combo => combo.join(',')).join(';');
}

// 返回
function onClickLeft() {
  router.back();
}

// 调整方案 - 返回到 Basketball_lottery 页面
function adjustPlan() {
  // 将当前的投注详情传回去
  router.push({
    path: '/basketball_lottery',
    query: {
      adjustMode: 'true',
      selectedBets: JSON.stringify(betDetails.value)
    }
  });
}

// 页面加载时解析传递的数据
onMounted(async () => {
  // 获取用户余额
  try {
    const balanceRes = await API.balanceof();
    if (balanceRes.code === 1 && balanceRes.data) {
      userBalance.value = parseFloat(balanceRes.data.amount);
    }
  } catch (error) {
    console.error('获取余额失败:', error);
  }

  try {
    const selectedBetsStr = route.query.selectedBets;
    console.log("接收到的原始数据:", selectedBetsStr);

    if (selectedBetsStr) {
      const selectedBets = JSON.parse(selectedBetsStr);
      console.log("解析后的数据:", selectedBets);

      // 转换为 betDetails 格式
      betDetails.value = selectedBets.map((bet) => ({
        gameId: bet.gameId,
        betId: bet.optionKey,
        rateType: bet.rateType,
        optionName: bet.optionName,
        optionValue: bet.optionValue,
        gameInfo: bet.gameInfo,
      }));

      console.log("转换后的betDetails:", betDetails.value);
      console.log("分组后的比赛:", groupedBets.value);

      // 设置默认投注方式
      const gameCount = Object.keys(groupedBets.value).length;
      if (gameCount === 1) {
        selectedBetTypes.value = ["1x1"];
      } else if (gameCount === 2) {
        selectedBetTypes.value = ["2x1"];
      } else if (gameCount === 3) {
        selectedBetTypes.value = ["3x1"];
      } else if (gameCount === 4) {
        selectedBetTypes.value = ["4x1"];
      } else {
        selectedBetTypes.value = [`${gameCount}x1`];
      }

      console.log("总注数:", totalBets.value);
      console.log("总金额:", totalAmount.value);
      console.log("预计奖金:", estimatedPrize.value);
    }
  } catch (error) {
    console.error("解析投注数据失败:", error);
    showToast("数据加载失败");
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

.bet-item {
  background: white;
  border-radius: 8px;
  padding: 12px;
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

/* 投注选项网格 - 每排3个（篮球） */
.bet-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
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
  font-size: 0.75rem;
  color: #333;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
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
  width: 50px;
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

/* 投注设置行 */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 2px 18px 10px 18px;
  border-bottom: 1px solid #f5f5f5;
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

/* 投注信息和按钮行 */
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0px;
  padding: 2px 0px 0px 12px;
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
  padding: 0 4px;
  font-size: 1rem;
}

.info-text .amount {
  color: #fc3c3c;
  padding: 0 4px;
  font-size: 1rem;
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

/* 玩法说明弹窗 */
.rule-content {
  height: 100%;
  overflow-y: auto;
  background: white;
}

/* 串关方式显示 */
.bet-type-display {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

/* 串关方式弹窗 */
.bet-type-popup {
  max-height: 70vh;
  overflow-y: auto;
}

.popup-header {
  text-align: center;
  margin-bottom: 20px;
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
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
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

:deep(.van-dialog__message) {
  font-size: 0.85rem;
}
</style>

