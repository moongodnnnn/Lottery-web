<template>
    <div class="page" role="main">
        <div class="nav-bar-center-wrap">
            <van-nav-bar title="七星彩" left-arrow @click-left="onClickLeft" class="nav-bar">
                <template #right>
                    <div class="rule-btn" @click="showRule = true"><van-icon name="question-o" size="22" /></div>
                </template>
            </van-nav-bar>
        </div>
        <div style="height: 1px; background-color: #f5f5f5"></div>

        <div
            style="display: flex; justify-content: space-between; align-items: center; background-color: #fff; padding: 10px 12px">
            <div style="font-size: 0.75rem">
                {{ currentPeriod }}期 &nbsp; 
                <span v-if="countdownDisplay !== '已截止'">距离截止还有 <span style="color: #ff1744">{{ countdownDisplay }}</span></span>
                <span v-else style="color: #999">{{ countdownDisplay }}</span>
            </div>

            <div style="font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px"
                @click="toggleHistory">
                开奖历史
                <span style="display: inline-block; transition: transform 0.3s"
                    :style="{ transform: showHistory ? 'rotate(180deg)' : 'rotate(0deg)' }">
                    <van-icon name="arrow-down" />
                </span>
            </div>
        </div>

        <!-- 开奖历史展开区域 -->
        <transition name="slide-fade">
            <div v-if="showHistory" class="history-section">
                <div v-for="item in historyData" :key="item.period" class="history-item" @click="goToDetail(item.period)">
                    <span class="history-period">{{ item.period }}期</span>
                    <div class="history-balls">
                        <span class="ball-group pl3-group">
                            <span v-for="(num, index) in item.numbers" :key="index" class="history-ball pl3-ball">{{ num
                                }}</span>
                        </span>
                    </div>
                </div>
            </div>
        </transition>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px">
            <div style="font-size: 0.85rem">选择号码</div>
            <div style="padding: 8px 12px; background-color: #fff; border-radius: 6px; font-size: 0.8rem"
                @click="randomSelect">
                机选 <van-icon name="arrow-down" />
            </div>
        </div>

        <!-- 下注区域 -->
        <div class="betting-section">
            <!-- 第一位 -->
            <div class="ball-section">
                <div class="section-header">
                    <span class="section-title">第一位</span>
                    <span class="section-count">已选 {{ firstBalls.length }} 个</span>
                </div>
                <div class="ball-grid-pl3">
                    <div v-for="num in 10" :key="'first-' + (num - 1)"
                        :class="['ball', 'pl3-ball', { selected: firstBalls.includes(num - 1) }]"
                        @click="toggleFirstBall(num - 1)">
                        {{ num - 1 }}
                    </div>
                </div>
            </div>

            <!-- 第二位 -->
            <div class="ball-section">
                <div class="section-header">
                    <span class="section-title">第二位</span>
                    <span class="section-count">已选 {{ secondBalls.length }} 个</span>
                </div>
                <div class="ball-grid-pl3">
                    <div v-for="num in 10" :key="'second-' + (num - 1)"
                        :class="['ball', 'pl3-ball', { selected: secondBalls.includes(num - 1) }]"
                        @click="toggleSecondBall(num - 1)">
                        {{ num - 1 }}
                    </div>
                </div>
            </div>

            <!-- 第三位 -->
            <div class="ball-section">
                <div class="section-header">
                    <span class="section-title">第三位</span>
                    <span class="section-count">已选 {{ thirdBalls.length }} 个</span>
                </div>
                <div class="ball-grid-pl3">
                    <div v-for="num in 10" :key="'third-' + (num - 1)"
                        :class="['ball', 'pl3-ball', { selected: thirdBalls.includes(num - 1) }]"
                        @click="toggleThirdBall(num - 1)">
                        {{ num - 1 }}
                    </div>
                </div>
            </div>

            <!-- 第四位 -->
            <div class="ball-section">
                <div class="section-header">
                    <span class="section-title">第四位</span>
                    <span class="section-count">已选 {{ fourthBalls.length }} 个</span>
                </div>
                <div class="ball-grid-pl3">
                    <div v-for="num in 10" :key="'fourth-' + (num - 1)"
                        :class="['ball', 'pl3-ball', { selected: fourthBalls.includes(num - 1) }]"
                        @click="toggleFourthBall(num - 1)">
                        {{ num - 1 }}
                    </div>
                </div>
            </div>

            <!-- 第五位 -->
            <div class="ball-section">
                <div class="section-header">
                    <span class="section-title">第五位</span>
                    <span class="section-count">已选 {{ fifthBalls.length }} 个</span>
                </div>
                <div class="ball-grid-pl3">
                    <div v-for="num in 10" :key="'fifth-' + (num - 1)"
                        :class="['ball', 'pl3-ball', { selected: fifthBalls.includes(num - 1) }]"
                        @click="toggleFifthBall(num - 1)">
                        {{ num - 1 }}
                    </div>
                </div>
            </div>

            <!-- 第六位 -->
            <div class="ball-section">
                <div class="section-header">
                    <span class="section-title">第六位</span>
                    <span class="section-count">已选 {{ sixthBalls.length }} 个</span>
                </div>
                <div class="ball-grid-pl3">
                    <div v-for="num in 10" :key="'sixth-' + (num - 1)"
                        :class="['ball', 'pl3-ball', { selected: sixthBalls.includes(num - 1) }]"
                        @click="toggleSixthBall(num - 1)">
                        {{ num - 1 }}
                    </div>
                </div>
            </div>

            <!-- 第七位（后区 0-14） -->
            <div class="ball-section">
                <div class="section-header">
                    <span class="section-title">第七位（后区）</span>
                    <span class="section-count">已选 {{ seventhBalls.length }} 个</span>
                </div>
                <div class="ball-grid-pl3">
                    <div v-for="num in 15" :key="'seventh-' + (num - 1)"
                        :class="['ball', 'blue-ball', { selected: seventhBalls.includes(num - 1) }]"
                        @click="toggleSeventhBall(num - 1)">
                        {{ num - 1 }}
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
                    <div>
                        共 <span style="color: #ff1744">{{ betCount }}</span> 注 <span style="color: #ff1744">{{ betAmount
                            }}</span> 元
                    </div>

                    <div style="font-size: 0.7rem; color: #999">
                        <span v-if="!canConfirm">第一至第七位至少各选1个</span>
                        <span v-else>①{{ firstBalls.length }} ②{{ secondBalls.length }} ③{{ thirdBalls.length }} ④{{ fourthBalls.length }} ⑤{{ fifthBalls.length }} ⑥{{ sixthBalls.length }} ⑦{{ seventhBalls.length }}</span>
                    </div>
                </div>

                <van-button type="primary" class="confirm-btn" :disabled="!canConfirm" @click="confirmSelection"> 确认
                </van-button>
            </div>
        </div>

        <!-- 机选弹窗 -->
        <van-popup v-model:show="showRandomPopup" position="bottom" round :style="{ padding: '20px' }">
            <div class="random-popup">
                <div class="random-header">
                    <span class="random-title">机选注数</span>
                    <van-icon name="cross" @click="showRandomPopup = false" />
                </div>
                <div class="random-options">
                    <div class="random-btn" @click="confirmRandomSelect(1)">
                        随机1注
                    </div>
                    <div class="random-btn" @click="confirmRandomSelect(6)">
                        随机6注
                    </div>
                    <div class="random-btn" @click="confirmRandomSelect(10)">
                        随机10注
                    </div>
                </div>
            </div>
        </van-popup>

        <!-- 玩法说明弹窗 -->
        <van-popup v-model:show="showRule" position="bottom" :style="{ height: '60%' }">
            <div class="rule-popup">
                <div class="rule-header">
                    <span class="rule-title">七星彩玩法说明</span>
                    <van-icon name="cross" @click="showRule = false" />
                </div>
                <div class="rule-content">
                    <div class="rule-item">
                        <h3>玩法介绍</h3>
                        <p>七星彩是从第一位至第七位七个位置分别选择号码进行投注的玩法。前六位（第一至第六位）从0-9中选择，第七位（后区）从0-14中选择。</p>
                    </div>
                    <div class="rule-item">
                        <h3>投注规则</h3>
                        <p>• 第一位：从0-9中至少选择1个号码</p>
                        <p>• 第二位：从0-9中至少选择1个号码</p>
                        <p>• 第三位：从0-9中至少选择1个号码</p>
                        <p>• 第四位：从0-9中至少选择1个号码</p>
                        <p>• 第五位：从0-9中至少选择1个号码</p>
                        <p>• 第六位：从0-9中至少选择1个号码</p>
                        <p>• 第七位（后区）：从0-14中至少选择1个号码</p>
                        <p>• 单注金额：2元</p>
                        <p>• 注数计算：第一位 × 第二位 × 第三位 × 第四位 × 第五位 × 第六位 × 第七位</p>
                    </div>
                    <div class="rule-item">
                        <h3>开奖时间</h3>
                        <p>每周二、五、日晚上20:30开奖</p>
                    </div>
                    <div class="rule-item">
                        <h3>示例</h3>
                        <p>选择第一位：1，第二位：2，第三位：3，第四位：4，第五位：5，第六位：6，第七位：7、8</p>
                        <p>共1×1×1×1×1×1×2=2注，金额4元</p>
                        <p>组合：1234567、1234568</p>
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
import API from "../../request/api";

const router = useRouter();

// 响应式数据
const showRule = ref(false);
const showRandomPopup = ref(false); // 机选弹窗
const firstBalls = ref([]); // 第一位
const secondBalls = ref([]); // 第二位
const thirdBalls = ref([]); // 第三位
const fourthBalls = ref([]); // 第四位
const fifthBalls = ref([]); // 第五位
const sixthBalls = ref([]); // 第六位
const seventhBalls = ref([]); // 第七位（后区 0-14）
const currentPeriod = ref("加载中...");
const countdownDisplay = ref("加载中...");

// 开奖历史相关
const showHistory = ref(false);
const historyData = ref([]);

// 倒计时相关
let countdownTimer = null;
const targetTime = ref(new Date().getTime() + 6 * 3600 * 1000 + 38 * 60 * 1000 + 31 * 1000);

// 组合数计算函数
function combination(n, r) {
    if (r > n || r < 0) return 0;
    if (r === 0 || r === n) return 1;

    let result = 1;
    for (let i = 0; i < r; i++) {
        result = (result * (n - i)) / (i + 1);
    }
    return Math.round(result);
}

// 计算属性
const canConfirm = computed(() => {
    return firstBalls.value.length >= 1 &&
        secondBalls.value.length >= 1 &&
        thirdBalls.value.length >= 1 &&
        fourthBalls.value.length >= 1 &&
        fifthBalls.value.length >= 1 &&
        sixthBalls.value.length >= 1 &&
        seventhBalls.value.length >= 1;
});

// 计算注数
const betCount = computed(() => {
    const firstCount = firstBalls.value.length;
    const secondCount = secondBalls.value.length;
    const thirdCount = thirdBalls.value.length;
    const fourthCount = fourthBalls.value.length;
    const fifthCount = fifthBalls.value.length;
    const sixthCount = sixthBalls.value.length;
    const seventhCount = seventhBalls.value.length;

    if (firstCount < 1 || secondCount < 1 || thirdCount < 1 || fourthCount < 1 ||
        fifthCount < 1 || sixthCount < 1 || seventhCount < 1) {
        return 0;
    }

    // 七星彩注数 = 第一位 × 第二位 × 第三位 × 第四位 × 第五位 × 第六位 × 第七位
    return firstCount * secondCount * thirdCount * fourthCount * fifthCount * sixthCount * seventhCount;
});

// 计算金额
const betAmount = computed(() => {
    return betCount.value * 2;
});

// 第一位选择逻辑
function toggleFirstBall(num) {
    const index = firstBalls.value.indexOf(num);
    if (index > -1) {
        firstBalls.value.splice(index, 1);
    } else {
        firstBalls.value.push(num);
        firstBalls.value.sort((a, b) => a - b);
    }
}

// 第二位选择逻辑
function toggleSecondBall(num) {
    const index = secondBalls.value.indexOf(num);
    if (index > -1) {
        secondBalls.value.splice(index, 1);
    } else {
        secondBalls.value.push(num);
        secondBalls.value.sort((a, b) => a - b);
    }
}

// 第三位选择逻辑
function toggleThirdBall(num) {
    const index = thirdBalls.value.indexOf(num);
    if (index > -1) {
        thirdBalls.value.splice(index, 1);
    } else {
        thirdBalls.value.push(num);
        thirdBalls.value.sort((a, b) => a - b);
    }
}

// 第四位选择逻辑
function toggleFourthBall(num) {
    const index = fourthBalls.value.indexOf(num);
    if (index > -1) {
        fourthBalls.value.splice(index, 1);
    } else {
        fourthBalls.value.push(num);
        fourthBalls.value.sort((a, b) => a - b);
    }
}

// 第五位选择逻辑
function toggleFifthBall(num) {
    const index = fifthBalls.value.indexOf(num);
    if (index > -1) {
        fifthBalls.value.splice(index, 1);
    } else {
        fifthBalls.value.push(num);
        fifthBalls.value.sort((a, b) => a - b);
    }
}

// 第六位选择逻辑
function toggleSixthBall(num) {
    const index = sixthBalls.value.indexOf(num);
    if (index > -1) {
        sixthBalls.value.splice(index, 1);
    } else {
        sixthBalls.value.push(num);
        sixthBalls.value.sort((a, b) => a - b);
    }
}

// 第七位选择逻辑（后区 0-14）
function toggleSeventhBall(num) {
    const index = seventhBalls.value.indexOf(num);
    if (index > -1) {
        seventhBalls.value.splice(index, 1);
    } else {
        seventhBalls.value.push(num);
        seventhBalls.value.sort((a, b) => a - b);
    }
}

// 清空选择
function clearAll() {
    firstBalls.value = [];
    secondBalls.value = [];
    thirdBalls.value = [];
    fourthBalls.value = [];
    fifthBalls.value = [];
    sixthBalls.value = [];
    seventhBalls.value = [];
}

// 确认选择
function confirmSelection() {
    if (!canConfirm.value) {
        showToast("第一至第七位至少各选1个");
        return;
    }

}

// 打开机选弹窗
function randomSelect() {
    showRandomPopup.value = true;
}

// 确认机选
function confirmRandomSelect(betCount) {
    if (!betCount) return;

    // 清空当前选择
    firstBalls.value = [];
    secondBalls.value = [];
    thirdBalls.value = [];
    fourthBalls.value = [];
    fifthBalls.value = [];
    sixthBalls.value = [];
    seventhBalls.value = [];

    // 根据注数生成随机组合
    if (betCount === 1) {
        // 随机1注：每个位置选1个号码
        firstBalls.value = [Math.floor(Math.random() * 10)];
        secondBalls.value = [Math.floor(Math.random() * 10)];
        thirdBalls.value = [Math.floor(Math.random() * 10)];
        fourthBalls.value = [Math.floor(Math.random() * 10)];
        fifthBalls.value = [Math.floor(Math.random() * 10)];
        sixthBalls.value = [Math.floor(Math.random() * 10)];
        seventhBalls.value = [Math.floor(Math.random() * 15)]; // 第七位 0-14
    } else if (betCount === 6) {
        // 随机6注：使用 1×1×1×1×1×2×3 组合
        firstBalls.value = [Math.floor(Math.random() * 10)];
        secondBalls.value = [Math.floor(Math.random() * 10)];
        thirdBalls.value = [Math.floor(Math.random() * 10)];
        fourthBalls.value = [Math.floor(Math.random() * 10)];
        fifthBalls.value = [Math.floor(Math.random() * 10)];

        const availableSixth = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * availableSixth.length);
            sixthBalls.value.push(availableSixth[randomIndex]);
            availableSixth.splice(randomIndex, 1);
        }

        const availableSeventh = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * availableSeventh.length);
            seventhBalls.value.push(availableSeventh[randomIndex]);
            availableSeventh.splice(randomIndex, 1);
        }
    } else if (betCount === 10) {
        // 随机10注：使用 1×1×1×1×1×2×5 组合
        firstBalls.value = [Math.floor(Math.random() * 10)];
        secondBalls.value = [Math.floor(Math.random() * 10)];
        thirdBalls.value = [Math.floor(Math.random() * 10)];
        fourthBalls.value = [Math.floor(Math.random() * 10)];
        fifthBalls.value = [Math.floor(Math.random() * 10)];

        const availableSixth = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < 2; i++) {
            const randomIndex = Math.floor(Math.random() * availableSixth.length);
            sixthBalls.value.push(availableSixth[randomIndex]);
            availableSixth.splice(randomIndex, 1);
        }

        const availableSeventh = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * availableSeventh.length);
            seventhBalls.value.push(availableSeventh[randomIndex]);
            availableSeventh.splice(randomIndex, 1);
        }
    }

    // 排序
    firstBalls.value.sort((a, b) => a - b);
    secondBalls.value.sort((a, b) => a - b);
    thirdBalls.value.sort((a, b) => a - b);
    fourthBalls.value.sort((a, b) => a - b);
    fifthBalls.value.sort((a, b) => a - b);
    sixthBalls.value.sort((a, b) => a - b);
    seventhBalls.value.sort((a, b) => a - b);

    // 关闭弹窗
    showRandomPopup.value = false;

}

// 倒计时更新
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetTime.value - now;

    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // 如果超过24小时,显示天数
        if (days > 0) {
            countdownDisplay.value = `${days}天 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        } else {
            countdownDisplay.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }
    } else {
        countdownDisplay.value = "已截止";
        clearInterval(countdownTimer);
    }
}

onMounted(() => {
    // 获取彩票数据
    API.lottery_pailie(2)
        .then((res) => {
            if (res.code === 1) {
                console.log("七星彩数据:", res.data);

                // 设置当前期号
                if (res.data.phase) {
                    currentPeriod.value = res.data.phase.phase;

                    // 设置倒计时目标时间（endtime是秒级时间戳）
                    targetTime.value = res.data.phase.endtime * 1000;

                    // 启动倒计时
                    countdownTimer = setInterval(updateCountdown, 1000);
                    updateCountdown();
                }

                // 设置历史开奖记录（七星彩有7个号码）
                if (res.data.done_phase && res.data.done_phase.length > 0) {
                    historyData.value = res.data.done_phase.map(item => ({
                        period: item.phase,
                        numbers: [
                            String(item.n1),
                            String(item.n2),
                            String(item.n3),
                            String(item.n4),
                            String(item.n5),
                            String(item.n6),
                            String(item.n7)
                        ]
                    }));
                }
            } else {
                showToast(res.msg || "获取期号失败");
            }
        })
        .catch((err) => {
            console.error("获取七星彩数据失败:", err);
            showToast(err.msg || "获取期号失败");
        });
});

onUnmounted(() => {
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
});

// 切换开奖历史显示状态
function toggleHistory() {
    showHistory.value = !showHistory.value;
}

// 跳转到开奖详情页
function goToDetail(phase) {
    router.push({
        path: '/lottery-detail',
        query: {
            type: 'qxc',
            phase: phase
        }
    });
}

function onClickLeft() {
    router.back();
}
</script>

<style scoped>
.page {
    display: flex;
    flex-direction: column;
    background-color: #f4f5f9;
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
    padding: 14px 12px;
    margin-bottom: 12px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
}

.section-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
}

.section-desc {
    font-size: 0.8rem;
    color: #666;
}

.section-count {
    font-size: 0.85rem;
    color: #a8a8a8;
    font-weight: 500;
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

.ball-grid-pl3 {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
    max-width: 100%;
    justify-items: center;
    align-items: center;
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

.ball-grid-pl3 .ball {
    width: 100%;
    max-width: 2.3rem;
    height: 2.3rem;
    aspect-ratio: 1;
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
    background: #fff;
    border: 1px solid #5daffc;
    color: #369eff;
    font-size: 1rem;
}

.blue-ball.selected {
    background: #369eff;
    border-color: #1890ff;
    color: white;
    transform: scale(1.1);
}

/* 排列3球样式 */
.pl3-ball {
    background: #fff;
    color: #fc3c3c;
    border: 1px solid #ffcccc;
    font-size: 1rem;
}

.pl3-ball.selected {
    background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
    border-color: #fc3c3c;
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
}

.confirm-btn:disabled {
    background: #ccc;
    opacity: 0.6;
}

/* 机选弹窗 */
.random-popup {
    padding: 10px 0;
}

.random-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.random-title {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
}

.random-options {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.random-btn {
    flex: 1;
    padding: 10px 8px;
    background: #f5f5f5;
    border: none;
    border-radius: 8px;
    text-align: center;
    font-size: 0.9rem;
    color: rgb(75, 75, 75);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

.random-btn:active {
    transform: scale(0.95);
    opacity: 0.8;
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

.history-ball.pl3-ball {
    color: #fc3c3c;
    border: 1px solid #ffcccc;
    background: #fff5f5;
    font-weight: 600;
}

.pl3-group {
    display: flex;
    gap: 6px;
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
