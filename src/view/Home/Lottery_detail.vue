<template>
  <div class="lottery-detail">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="开奖详情" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>

    <div class="content">
      <!-- 加载状态 -->
      <van-loading v-if="loading" type="spinner" size="50" vertical>加载中...</van-loading>

      <!-- 详情内容 -->
      <div v-else-if="detailData" class="detail-content">
        <!-- 期号和日期 -->

        <!-- 开奖号码 -->
        <div class="numbers-section">
          <div class="section-title">
            <div>
              {{ lotteryTypeMap[currentType] }}
              <span style="font-size: 14px; color: #999; font-weight: 500; padding-left: 10px">
                {{ detailData.phase }}期 {{ detailData.date }}
              </span>
            </div>

            <div 
              style="background-color: #edeeef; padding: 4px 10px; border-radius: 4px; font-size: 12px; color: #000; cursor: pointer; display: flex; align-items: center; gap: 4px;"
              @click="toggleHistory"
            >
              更多期号
              <span
                style="display: inline-block; transition: transform 0.3s"
                :style="{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }"
              >
                <van-icon name="arrow-down" size="12" />
              </span>
            </div>
          </div>

          <!-- 开奖历史展开区域 -->
          <transition name="slide-fade">
            <div v-if="showHistory" class="history-section">
              <div 
                v-for="item in historyData" 
                :key="item.period" 
                class="history-item"
                @click="loadHistoryDetail(item.period)"
              >
                <span class="history-period">{{ item.period }}期</span>
                <div class="history-balls">
                  <span class="ball-group red-group">
                    <span v-for="red in item.redBalls" :key="red" class="history-ball red-ball">{{ red }}</span>
                  </span>
                  <!-- 只有大乐透显示蓝球 -->
                  <template v-if="currentType === 'loto' && item.blueBalls.length > 0">
                    <span class="ball-group blue-group">
                      <span v-for="blue in item.blueBalls" :key="blue" class="history-ball blue-ball">{{ blue }}</span>
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </transition>

          <div class="draw-numbers">
            <template v-if="currentType === 'loto'">
              <!-- 大乐透：前区5个红球 + 后区2个蓝球 -->
              <div class="number-group">
                <span v-for="(num, index) in detailData.draw_numbers.slice(0, 5)" :key="index" class="ball red">{{ num }}</span>
              </div>
              <span class="separator">|</span>
              <div class="number-group">
                <span v-for="(num, index) in detailData.draw_numbers.slice(5, 7)" :key="index" class="ball blue">{{ num }}</span>
              </div>
            </template>
            <template v-else>
              <!-- 其他彩票：直接显示所有号码 -->
              <div class="number-group">
                <span v-for="(num, index) in detailData.draw_numbers" :key="index" class="ball">{{ num }}</span>
              </div>
            </template>
          </div>
        </div>

        <!-- 销量和奖池 -->
        <div class="info-section">
          <div class="info-item">
            <div class="value highlight">{{ formatNumber(detailData.sales) }}亿</div>
            <div class="label">本期销量</div>
          </div>
          <div class="info-item" v-if="currentType === 'loto' || currentType === 'pl5' || currentType === 'qxc'">
            <div class="value highlight">{{ formatNumber(detailData.pool) }}亿</div>
            <div class="label">累计奖池</div>
          </div>
        </div>

        <!-- 中奖信息 -->
        <div class="prize-section">
          <div class="prize-table">
            <table>
              <thead>
                <tr>
                  <th>奖级</th>
                  <th>中奖条件</th>
                  <th>中奖注数</th>
                  <th>单注奖金</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(prize, index) in detailData.prizes" :key="index">
                  <td class="prize-level">{{ prize.level }}</td>
                  <td class="prize-condition">{{ prize.condition }}</td>
                  <td class="prize-count">{{ prize.count }}</td>
                  <td class="prize-amount">{{ formatMoney(prize.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <van-empty v-else description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { API } from "../../request/api";
import { showToast } from "vant";

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const detailData = ref(null);
const currentType = ref("");
const showHistory = ref(false);
const historyData = ref([]);

// 彩票类型映射
const lotteryTypeMap = {
  loto: "超级大乐透",
  pl3: "排列三",
  pl5: "排列五",
  qxc: "七星彩",
};

function onClickLeft() {
  router.back();
}

// 页面标题
const lotteryTitle = computed(() => {
  const typeName = lotteryTypeMap[currentType.value] || "彩票";
  return `${typeName}开奖`;
});

// 格式化数字（以亿为单位，保留2位小数）
const formatNumber = (num) => {
  if (!num) return "0.00";
  const billion = Number(num) / 100000000;
  return billion.toFixed(2);
};

// 格式化金额（千分位）
const formatMoney = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 切换开奖历史显示状态
const toggleHistory = () => {
  showHistory.value = !showHistory.value;
};

// 获取开奖历史数据
const fetchHistoryData = async () => {
  try {
    let res;
    
    // 根据游戏类型调用不同的接口
    if (currentType.value === 'loto') {
      // 大乐透
      res = await API.lottoHistory();
    } else if (currentType.value === 'pl3' || currentType.value === 'pl5') {
      // 排列三和排列五使用同一个接口
      const plType = currentType.value === 'pl3' ? 0 : 1; // 0=排列3, 1=排列5
      res = await API.lottery_pailie(plType);
    } else if (currentType.value === 'qxc') {
      // 七星彩使用 lottery_pailie(2)
      res = await API.lottery_pailie(2);
    }

    if (res && res.code === 1) {
      // 根据游戏类型处理历史数据
      if (currentType.value === 'loto') {
        // 大乐透历史数据
        if (res.data.done_phase && res.data.done_phase.length > 0) {
          historyData.value = res.data.done_phase.map(item => ({
            period: item.phase,
            redBalls: [
              item.front_n1,
              item.front_n2,
              item.front_n3,
              item.front_n4,
              item.front_n5
            ],
            blueBalls: [
              item.back_n1,
              item.back_n2
            ]
          }));
        }
      } else if (currentType.value === 'pl3') {
        // 排列三历史数据
        if (res.data.done_phase && res.data.done_phase.length > 0) {
          historyData.value = res.data.done_phase.map(item => ({
            period: item.phase,
            redBalls: [item.xuhao1, item.xuhao2, item.xuhao3],
            blueBalls: [] // 排列三没有蓝球
          }));
        }
      } else if (currentType.value === 'pl5') {
        // 排列五历史数据
        if (res.data.done_phase && res.data.done_phase.length > 0) {
          historyData.value = res.data.done_phase.map(item => ({
            period: item.phase,
            redBalls: [
              item.xuhao1,
              item.xuhao2,
              item.xuhao3,
              item.xuhao4,
              item.xuhao5
            ],
            blueBalls: [] // 排列五没有蓝球
          }));
        }
      } else if (currentType.value === 'qxc') {
        // 七星彩历史数据
        if (res.data.done_phase && res.data.done_phase.length > 0) {
          historyData.value = res.data.done_phase.map(item => ({
            period: item.phase,
            redBalls: [
              item.xuhao1 || 0,
              item.xuhao2 || 0,
              item.xuhao3 || 0,
              item.xuhao4 || 0,
              item.xuhao5 || 0,
              item.xuhao6 || 0,
              item.xuhao7 || 0
            ],
            blueBalls: [] // 七星彩没有蓝球
          }));
        }
      }
    }
  } catch (error) {
    console.error('获取历史数据失败:', error);
  }
};

// 获取详情数据
const fetchLotteryDetail = async () => {
  try {
    loading.value = true;
    const type = route.query.type;
    const phase = route.query.phase;

    if (!type || !phase) {
      showToast("参数错误");
      router.back();
      return;
    }

    currentType.value = type;

    const res = await API.lotoInfo({
      phase: phase,
      type: type,
    });

    if (res.code === 1 && res.data) {
      const data = res.data;

      // 构建开奖号码数组
      let drawNumbers = [];
      if (type === "loto") {
        // 大乐透：前区5个 + 后区2个
        drawNumbers = [data.front_n1, data.front_n2, data.front_n3, data.front_n4, data.front_n5, data.back_n1, data.back_n2];
      } else if (type === "pl3") {
        // 排列三：3个号码
        drawNumbers = [data.xuhao1, data.xuhao2, data.xuhao3];
      } else if (type === "pl5") {
        // 排列五：5个号码
        drawNumbers = [data.xuhao1, data.xuhao2, data.xuhao3, data.xuhao4, data.xuhao5];
      } else if (type === "qxc") {
        // 七星彩：7个号码
        drawNumbers = [data.n1, data.n2, data.n3, data.n4, data.n5, data.n6, data.n7];
      }

      // 构建中奖信息数组（根据不同彩票类型）
      let prizes = [];
      
      if (type === "loto") {
        // 大乐透的中奖信息
        prizes = [
          {
            level: "一等奖",
            condition: "5+2",
            count: data.first_z_zs || 0,
            amount: data.first_z_prize || 0,
          },
          {
            level: "一等奖（追加）",
            condition: "5+2",
            count: data.first_b_zs || 0,
            amount: data.first_b_prize || 0,
          },
          {
            level: "二等奖",
            condition: "5+1",
            count: data.second_z_zs || 0,
            amount: data.second_z_prize || 0,
          },
          {
            level: "二等奖（追加）",
            condition: "5+1",
            count: data.second_b_zs || 0,
            amount: data.second_b_prize || 0,
          },
        ];
      } else if (type === "pl3") {
        // 排列三的中奖信息
        prizes = [
          {
            level: "直选",
            condition: "号码按位相符",
            count: data.zx_nums || 0,
            amount: data.zx_prize || 0,
          },
          {
            level: "组选3",
            condition: "号码相符(2同号)",
            count: data.z3_nums || 0,
            amount: data.z3_prize || 0,
          },
          {
            level: "组选6",
            condition: "号码相符(无同号)",
            count: data.z6_nums || 0,
            amount: data.z6_prize || 0,
          },
        ];
      } else if (type === "pl5") {
        // 排列五的中奖信息
        prizes = [
          {
            level: "一等奖",
            condition: "号码按位相符",
            count: data.zx_nums || 0,
            amount: data.zx_prize || 0,
          },
        ];
      } else if (type === "qxc") {
        // 七星彩的中奖信息
        prizes = [
          {
            level: "一等奖",
            condition: "7位相符",
            count: data.first_zs || 0,
            amount: data.first_prize || 0,
          },
          {
            level: "二等奖",
            condition: "6位相符",
            count: data.second_zs || 0,
            amount: data.second_prize || 0,
          },
          {
            level: "三等奖",
            condition: "5位相符",
            count: data.third_zs || 0,
            amount: data.third_prize || 0,
          },
          {
            level: "四等奖",
            condition: "4位相符",
            count: data.four_zs || 0,
            amount: data.four_prize || 0,
          },
          {
            level: "五等奖",
            condition: "3位相符",
            count: data.five_zs || 0,
            amount: data.five_prize || 0,
          },
          {
            level: "六等奖",
            condition: "2位相符",
            count: data.six_zs || 0,
            amount: data.six_prize || 0,
          },
        ];
      }

      detailData.value = {
        phase: data.phase,
        date: data.date,
        draw_numbers: drawNumbers,
        sales: data.total,
        pool: data.jackpot,
        prizes: prizes,
      };
    } else {
      showToast(res.msg || "获取详情失败");
    }
  } catch (error) {
    console.error("获取开奖详情失败:", error);
    showToast("获取详情失败");
  } finally {
    loading.value = false;
  }
};

// 点击历史记录项，加载该期详情
const loadHistoryDetail = async (phase) => {
  try {
    loading.value = true;
    
    const res = await API.lotoInfo({
      phase: phase,
      type: currentType.value, // 保持当前类型不变
    });

    if (res.code === 1 && res.data) {
      const data = res.data;

      // 构建开奖号码数组
      let drawNumbers = [];
      if (currentType.value === "loto") {
        drawNumbers = [data.front_n1, data.front_n2, data.front_n3, data.front_n4, data.front_n5, data.back_n1, data.back_n2];
      } else if (currentType.value === "pl3") {
        drawNumbers = [data.xuhao1, data.xuhao2, data.xuhao3];
      } else if (currentType.value === "pl5") {
        drawNumbers = [data.xuhao1, data.xuhao2, data.xuhao3, data.xuhao4, data.xuhao5];
      } else if (currentType.value === "qxc") {
        drawNumbers = [data.n1, data.n2, data.n3, data.n4, data.n5, data.n6, data.n7];
      }

      // 构建中奖信息数组（根据不同彩票类型）
      let prizes = [];
      
      if (currentType.value === "loto") {
        prizes = [
          {
            level: "一等奖",
            condition: "5+2",
            count: data.first_z_zs || 0,
            amount: data.first_z_prize || 0,
          },
          {
            level: "一等奖（追加）",
            condition: "5+2",
            count: data.first_b_zs || 0,
            amount: data.first_b_prize || 0,
          },
          {
            level: "二等奖",
            condition: "5+1",
            count: data.second_z_zs || 0,
            amount: data.second_z_prize || 0,
          },
          {
            level: "二等奖（追加）",
            condition: "5+1",
            count: data.second_b_zs || 0,
            amount: data.second_b_prize || 0,
          },
        ];
      } else if (currentType.value === "pl3") {
        prizes = [
          {
            level: "直选",
            condition: "号码按位相符",
            count: data.zx_nums || 0,
            amount: data.zx_prize || 0,
          },
          {
            level: "组选3",
            condition: "号码相符(2同号)",
            count: data.z3_nums || 0,
            amount: data.z3_prize || 0,
          },
          {
            level: "组选6",
            condition: "号码相符(无同号)",
            count: data.z6_nums || 0,
            amount: data.z6_prize || 0,
          },
        ];
      } else if (currentType.value === "pl5") {
        prizes = [
          {
            level: "一等奖",
            condition: "号码按位相符",
            count: data.zx_nums || 0,
            amount: data.zx_prize || 0,
          },
        ];
      } else if (currentType.value === "qxc") {
        // 七星彩的中奖信息
        prizes = [
          {
            level: "一等奖",
            condition: "7位相符",
            count: data.first_zs || 0,
            amount: data.first_prize || 0,
          },
          {
            level: "二等奖",
            condition: "6位相符",
            count: data.second_zs || 0,
            amount: data.second_prize || 0,
          },
          {
            level: "三等奖",
            condition: "5位相符",
            count: data.third_zs || 0,
            amount: data.third_prize || 0,
          },
          {
            level: "四等奖",
            condition: "4位相符",
            count: data.four_zs || 0,
            amount: data.four_prize || 0,
          },
          {
            level: "五等奖",
            condition: "3位相符",
            count: data.five_zs || 0,
            amount: data.five_prize || 0,
          },
          {
            level: "六等奖",
            condition: "2位相符",
            count: data.six_zs || 0,
            amount: data.six_prize || 0,
          },
        ];
      }

      detailData.value = {
        phase: data.phase,
        date: data.date,
        draw_numbers: drawNumbers,
        sales: data.total,
        pool: data.jackpot || 0,
        prizes: prizes,
      };

      // 关闭历史记录面板
      showHistory.value = false;

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast(res.msg || "获取详情失败");
    }
  } catch (error) {
    console.error("获取开奖详情失败:", error);
    showToast("获取详情失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLotteryDetail();
  fetchHistoryData();
});
</script>

<style scoped>
.lottery-detail {
  min-height: 100vh;
  background: #f5f5f5;
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

.content {
  padding: 10px;
  min-height: calc(100vh - 46px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.detail-content {
  width: 100%;
  max-width: 430px;
}

/* 信息区块 */
.info-section {
  background: white;
  border-radius: 8px;
  padding: 2px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.info-item {
  padding: 8px 0;
  text-align: center;
}

.info-item .label {
  font-size: 12px;
  color: #666;
  min-width: 80px;
}

.info-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.info-item .value.highlight {
  color: #e33212;
  font-weight: 800;
  font-size: 16px;
}

/* 区块标题 */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  display: flex;
  justify-content: space-between;
}

/* 开奖号码区域 */
.numbers-section {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
}

.draw-numbers {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 0;
}

.number-group {
  display: flex;
  gap: 8px;
}

.ball {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
   background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.ball.red {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 1px 6px rgba(238, 90, 111, 0.3);
}

.ball.blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  box-shadow: 0 1px 6px rgba(79, 172, 254, 0.3);
}

.separator {
  font-size: 24px;
  color: #999;
  font-weight: bold;
}

/* 中奖信息区域 */
.prize-section {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
}

.prize-table {
  overflow-x: auto;
}

.prize-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.prize-table thead {
  background: #fff;
  padding: 10px;
}

.prize-table th {
  padding: 12px 14px;
  font-weight: 600;
  color: #999;
  border-bottom: 1px solid #e5e5e5;
  font-size: 12px;
  text-align: left;
}

.prize-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.prize-table tbody tr:last-child td {
  border-bottom: none;
}

.prize-table tbody tr:hover {
  background: #f9f9f9;
}

.prize-level {
  color: #333;
  font-weight: 600;
  text-align: left !important;
  padding-left: 12px !important;
  font-size: 10px !important;
}

.prize-condition {
  color: #666;
  font-weight: 500;
}

.prize-count {
  color: #666;
}

.prize-amount {
  color: #e33212;
  font-weight: 600;
  text-align: center !important;
  padding-right: 12px !important;
}

/* 加载状态 */
:deep(.van-loading) {
  margin-top: 100px;
}

/* 空状态 */
:deep(.van-empty) {
  margin-top: 100px;
}

/* 开奖历史样式 */
.history-section {
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 12px;
  overflow: hidden;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: #f0f0f0;
}

.history-item:active {
  background-color: #e8e8e8;
}

.history-item:last-child {
  border-bottom: none;
}

.history-period {
  color: #666;
  font-weight: 500;
  min-width: 70px;
  font-size: 12px;
}

.history-balls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1; /* 占据剩余空间 */
  justify-content: flex-end; /* 靠右对齐 */
  overflow-x: auto; /* 如果内容过宽，允许横向滚动 */
}

.ball-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap; /* 允许换行，以防号码过多 */
}

.history-ball {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 600;
}

.history-ball.red-ball {
  color: #ff1744;
  border: 1px solid #ff6f76;
  background: #fff;
}

.history-ball.blue-ball {
  color: #10aeff;
  border: 1px solid #10aeff;
  background: #fff;
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
