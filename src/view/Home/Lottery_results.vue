<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="开奖公告" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="custom-tabs-container">
      <van-tabs
        v-model:active="active"
        class="custom-tabs"
        color="#fc3c3c"
        title-active-color="#fc3c3c"
        title-inactive-color="#999"
        line-width="20px"
        line-height="3px"
      >
        <van-tab title="竞技彩">
          <div class="banner-container">
            <img src="/img/0012.png" alt="开奖公告" class="banner-image" />
          </div>

          <div class="lottery-cards">
            <!-- 足球彩票卡片 -->
            <div class="lottery-card" @click="goToGame('football')">
              <div class="card-header">
                <div class="card-title">竞彩足球</div>
                <div class="card-date" v-if="jcResults.zq">{{ jcResults.zq.date }}</div>
              </div>
              <div class="card-content">
                <div>
                  <span class="stat-label">已开场</span>
                  <span class="stat-value">{{ jcResults.zq?.open || 0 }}场</span>
                </div>

                <div>
                  <span class="stat-value highlight">{{ jcResults.zq?.res?.s || 0 }}胜</span>
                  <span class="stat-value">{{ jcResults.zq?.res?.p || 0 }}平</span>
                  <span class="stat-value highlight">{{ jcResults.zq?.res?.f || 0 }}败</span>
                </div>
              </div>
              <div class="stat-item" v-if="jcResults.zq?.last">
                {{ jcResults.zq.last.xuhao }} {{ jcResults.zq.last.home }} VS {{ jcResults.zq.last.guest }}
              </div>
              <div class="stat-item" v-else>今日暂无开奖比赛</div>
            </div>

            <!-- 篮球彩票卡片 -->
            <div class="lottery-card" @click="goToGame('basketball')">
              <div class="card-header">
                <div class="card-title">竞彩篮球</div>
                <div class="card-date" v-if="jcResults.lq">{{ jcResults.lq.date }}</div>
              </div>
              <div class="card-content">
                <div>
                  <span class="stat-label">已开场</span>
                  <span class="stat-value">{{ jcResults.lq?.open || 0 }}场</span>
                </div>

                <div>
                  <span class="stat-value highlight">{{ jcResults.lq?.res?.s || 0 }}胜</span>
                  <span class="stat-value">{{ jcResults.lq?.res?.p || 0 }}平</span>
                  <span class="stat-value highlight">{{ jcResults.lq?.res?.f || 0 }}败</span>
                </div>
              </div>
              <div class="stat-item" v-if="jcResults.lq?.last">
                {{ jcResults.lq.last.xuhao }} {{ jcResults.lq.last.home }} VS {{ jcResults.lq.last.guest }}
              </div>
              <div class="stat-item" v-else>今日暂无开奖比赛</div>
            </div>
          </div>
        </van-tab>

        <van-tab title="数字彩">
          <div class="banner-container">
            <img src="/img/0012.png" alt="开奖公告" class="banner-image" />
          </div>

          <div class="lottery-cards">
            <!-- 超级大乐透 -->
            <div class="lottery-card" @click="goToDetail('loto')">
              <div class="card-header">
                <div class="card-title">超级大乐透</div>
                <div class="card-date" v-if="lotteryResults.loto">
                  第{{ lotteryResults.loto.phase }}期 {{ lotteryResults.loto.date }}
                </div>
              </div>
              <div class="number-result" v-if="lotteryResults.loto && Array.isArray(lotteryResults.loto.draw_numbers)">
                <div class="number-balls">
                  <span
                    v-for="(num, index) in lotteryResults.loto.draw_numbers.slice(0, 5)"
                    :key="`main-${index}`"
                    class="ball red-ball"
                    >{{ num }}</span
                  >
                  <span class="ball-divider">|</span>
                  <span
                    v-for="(num, index) in lotteryResults.loto.draw_numbers.slice(5)"
                    :key="`blue-${index}`"
                    class="ball blue-ball"
                    >{{ num }}</span
                  >
                </div>
              </div>
            </div>

            <!-- 排列三 -->
            <div class="lottery-card" @click="goToDetail('pl3')">
              <div class="card-header">
                <div class="card-title">排列三</div>
                <div class="card-date">第{{ lotteryResults.pl3.phase }}期 {{ lotteryResults.pl3.date }}</div>
              </div>
            
              <div class="number-result">
                <div class="number-balls">
                  <span v-for="(num, index) in lotteryResults.pl3.draw_numbers" :key="index" class="ball red-ball">{{ num }}</span>
                </div>
              </div>
            </div>

            <!-- 排列五 -->
            <div class="lottery-card" @click="goToDetail('pl5')">
              <div class="card-header">
                <div class="card-title">排列五</div>
                <div class="card-date">第{{ lotteryResults.pl5.phase }}期 {{ lotteryResults.pl5.date }}</div>
              </div>
              <div class="number-result">
                <div class="number-balls">
                  <span v-for="(num, index) in lotteryResults.pl5.draw_numbers" :key="index" class="ball red-ball">{{ num }}</span>
                </div>
              </div>
            </div>

            <!-- 七星彩 -->
            <div class="lottery-card" @click="goToDetail('qxc')">
              <div class="card-header">
                <div class="card-title">七星彩</div>
                <div class="card-date">第{{ lotteryResults.qxc.phase }}期 {{ lotteryResults.qxc.date }}</div>
              </div>
              <div class="number-result">
                <div class="number-balls">
                  <span v-for="(num, index) in lotteryResults.qxc.draw_numbers" :key="index" class="ball red-ball">{{ num }}</span>
                </div>
              </div>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { showToast } from "vant";
import { useRouter } from "vue-router";
import { API } from "../../request/api";

const router = useRouter();
const active = ref(0);
const jcResults = ref({
  zq: {
    date: '',
    open: 0,
    res: { s: 0, p: 0, f: 0 },
    last: null
  },
  lq: {
    date: '',
    open: 0,
    res: { s: 0, p: 0, f: 0 },
    last: null
  }
});
// 获取当前日期并格式化为 "YYYY-MM-DD 星期几" 的形式
const currentDate = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdays[now.getDay()];

  return `${year}-${month}-${day} 周${weekday}`;
});

// 模拟彩票开奖数据
const lotteryResults = ref({
  loto: {
    phase: "2025095",
    date: "2025-09-29 21:00",
    draw_numbers: [0, 0, 0, 0, 0, 0, 0],
  },
  pl3: {
    phase: "2025263",
    date: "2025-09-29 21:30",
    draw_numbers: ["0", "0", "0"],
  },
  pl5: {
    phase: "2025263",
    date: "2025-09-29 21:30",
    draw_numbers: [0, 0, 0, 0, 0],
  },
  qxc: {
    phase: "2025112",
    date: "2025-09-29 20:30",
    draw_numbers: [0, 0, 0, 0, 0, 0, 0],
  },
});

// 跳转到详情页面
const goToDetail = (type) => {
  const phase = lotteryResults.value[type]?.phase;
  if (!phase) {
    showToast('期数信息缺失');
    return;
  }
  
  router.push({
    path: '/lottery-detail',
    query: {
      type: type,
      phase: phase
    }
  });
};

// 跳转到游戏页面
const goToGame = (type) => {
  router.push({
    path: '/game',
    query: {
      type: type
    }
  });
};

onMounted(async () => {
  try {

    const jcRes = await API.jclottery();
    if (jcRes.code === 1) {
      jcResults.value = jcRes.data; 
    } else {
      showToast(jcRes.msg || "获取竞彩信息失败"); 
    }



    const lotRes = await API.lotteryloto("all"); 
    if (lotRes.code === 1) {
      const data = lotRes.data;
      
      // 处理双色球数据：将 front_n1-5 和 back_n1-2 组合成 draw_numbers 数组
      if (data.loto) {
        data.loto.draw_numbers = [
          data.loto.front_n1,
          data.loto.front_n2,
          data.loto.front_n3,
          data.loto.front_n4,
          data.loto.front_n5,
          data.loto.back_n1,
          data.loto.back_n2
        ];
      }
      
      // 确保其他彩种的 draw_numbers 也是数组
      if (data.pl3 && !Array.isArray(data.pl3.draw_numbers)) {
        data.pl3.draw_numbers = data.pl3.draw_numbers ? String(data.pl3.draw_numbers).split('') : ["0", "0", "0"];
      }
      if (data.pl5 && !Array.isArray(data.pl5.draw_numbers)) {
        data.pl5.draw_numbers = data.pl5.draw_numbers ? String(data.pl5.draw_numbers).split('') : [0, 0, 0, 0, 0];
      }
      if (data.qxc && !Array.isArray(data.qxc.draw_numbers)) {
        data.qxc.draw_numbers = data.qxc.draw_numbers ? String(data.qxc.draw_numbers).split('') : [0, 0, 0, 0, 0, 0, 0];
      }
      
      // 转换完成后再赋值
      lotteryResults.value = data;
    } else {
      showToast(lotRes.msg || "获取彩种信息失败"); 
    }
  } catch (e) {
    showToast(e.message || "获取彩种信息失败"); 
  }
});

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
  overflow: hidden;
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

/* 自定义选项卡样式 */
.custom-tabs-container {
  width: 100%;
}

.custom-tabs {
  max-width: 430px;
}

/* 覆盖Vant的默认样式 */
:deep(.van-tabs__wrap) {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

:deep(.van-tabs__nav) {
  width: 200px;
}

:deep(.van-tab) {
  font-size: 15px;
  font-weight: 500;
  position: relative;
}

:deep(.van-tab--active) {
  font-weight: 700;
  transform: scale(1.05);
  transition: transform 0.2s;
}

:deep(.van-tabs__line) {
  bottom: 18%;
  border-radius: 2px;
  transition: all 0.3s;
}

:deep(.van-tabs__nav) {
  background: linear-gradient(to right, #fff 60%, transparent);
}

/* Banner样式 */
.banner-container {
  padding: 10px 12px 8px 12px;
  text-align: center;
}

.banner-image {
  width: 100%;
  max-width: 430px;
  border-radius: 8px;
}

/* 彩票卡片样式 */
.lottery-cards {
  padding: 0px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lottery-card {
  background-color: #fff;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lottery-card:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f2f2f2;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
}

.card-date {
  font-size: 12px;
  color: #666;
}

.card-content {
  background-color: #f4f5f9;
  padding: 6px;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 10px;
  color: #666;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  padding-left: 6px;
}

/* 数字彩开奖结果样式 */
.number-result {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.draw-time {
  font-size: 12px;
  color: #666;
}

.number-balls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 5px 0;
}

.ball {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.red-ball {
  background: linear-gradient(135deg, #ff6b6b, #fc3c3c);
  box-shadow: 0 2px 4px rgba(252, 60, 60, 0.3);
}

.blue-ball {
  background: linear-gradient(135deg, #5c7cfa, #339af0);
  box-shadow: 0 2px 4px rgba(83, 124, 250, 0.3);
}

.ball-divider {
  color: #999;
  font-weight: normal;
}
</style>
