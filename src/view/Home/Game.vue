<template>
  <div class="page" role="main">
    <!-- 顶部tab+筛选 -->

    <van-popup
      v-model:show="showTop"
      position="top"
      :style="{
        height: 'auto',
        maxHeight: '70%',
        maxWidth: '430px',
        width: '100%',
        borderRadius: '0 0 20px 20px',
        padding: '0',
        left: '50%',
        transform: 'translateX(-50%)',
      }"
    >
      <div class="popup-content">
        <div class="popup-title">赛事筛选</div>

        <div class="filter-leagues">
          <div
            v-for="item in allLeagues"
            :key="item"
            class="league-item"
            :class="{ active: checkedLeagues.includes(item) }"
            @click="toggleLeague(item)"
          >
            {{ item }}
          </div>
        </div>

        <div class="popup-btn-group">
          <div class="action-btn all-btn" @click="toggleSelectAll">全选</div>
          <div class="action-btn clear-btn" @click="clearSelection">清空</div>
          <div class="action-btn confirm-btn" @click="onConfirmFilter">确认</div>
        </div>
      </div>
    </van-popup>

    <div class="top-bar">
      <div class="tab-wrap">
        <van-tabs v-model:active="active" @change="onTabChange" animated>
          <van-tab>
            <template #title>
              <span v-if="active !== 0">足球</span>
              <span v-else>
                <img src="/icons/football.png" style="width: 40px; height: 22px" />
              </span>
            </template>
          </van-tab>
          <van-tab>
            <template #title>
              <span v-if="active !== 1">篮球</span>
              <span v-else>
                <img src="/icons/lanqiu.png" style="width: 40px; height: 22px" />
              </span>
            </template>
          </van-tab>
        </van-tabs>
      </div>
  
    </div>

    <div style="padding: 8px 12px; background-color: #fff; font-size: 0.75rem; color: #fc3c3c">*页面数据仅供查看，不能作为开奖凭证</div>
    <!-- 日期选择 -->
    <div class="date-bar">
      <div
        v-for="(item, idx) in dateList"
        :key="item.date"
        class="date-item"
        :class="{ active: idx === dateActive }"
        @click="onDateClick(idx)"
      >
        <div class="date">{{ item.date }}</div>
        <div class="week">{{ item.week }}</div>
      </div>
    </div>

    <!-- 比赛列表  f38630  2c7df7-->
    <div class="match-list" v-if="active === 0">
      <!-- Loading 状态 -->
      <div v-if="loading" class="match-list-loading">
        <van-loading size="30px" vertical color="#999">加载中...</van-loading>
      </div>

      <!-- 足球比赛内容 -->
      <div v-else-if="footballMatchesOneday && footballMatchesOneday.length">
        <div v-for="match in footballMatchesOneday" :key="match.id" class="match-card" @click="getAnalysisData(match.id)">
          <div class="match-header">
            <div class="match-left">
              <div class="match-round">
                <span style="padding-right: 8px"
                  >{{ match.xuhao || match.draw?.xuhao || "未知序号" }} <span style="padding-left: 10px"> {{ formatTime(match.start_time) }}</span></span
                >
              </div>
            </div>
            <div class="match-status">
              <div v-if="match.status == 'done'" class="status-done">完</div>
              <div v-else-if="match.status == 'ing'" class="status-live">{{ match.minutes || "进行中" }}</div>
              <div v-else class="status-pending">未开始</div>
            </div>
            <div class="match-rang" v-if="match.match?.name" :style="getLeagueStyle(match.match.name)">{{ match.match.name }}</div>
          </div>

          <div class="match-teams">
            <div class="team home-team">
              <span class="team-name">{{ match.home_team_name || match.draw?.home || "主队未知" }}</span>
              <span class="team-score" v-if="match.score">{{ match.score.split(":")[0] }}</span>
            </div>
            <div class="vs" v-if="match.status == 'done'">-</div>
            <div class="vs" v-else>VS</div>
            <div class="team away-team">
              <span class="team-score" v-if="match.score">{{ match.score.split(":")[1] }}</span>
              <span class="team-name">{{ match.guest_team_name || match.draw?.guest || "客队未知" }}</span>
            </div>
          </div>

          <!-- 进行中的比赛显示半场比分 -->
          <div class="match-halftime" v-if="match.status == 'ing' && match.banchang">
            <span class="halftime-label">半场：</span>
            <span class="halftime-score">{{ match.banchang }}</span>
          </div>

          <!-- 竞猜信息区域 - 只有已完成的比赛才显示 -->
          <div class="match-betting-info" v-if="match.draw && match.status == 'done'">
            <div class="betting-item" v-if="match.draw.spf">
              <span class="betting-value">{{ match.draw.spf }}</span>
            </div>
            <div class="betting-item" v-if="match.draw.rspf">
              <span class="betting-value"> {{ match.draw.rang }} {{ match.draw.rspf }}</span>
            </div>

            <div class="betting-item" v-if="match.draw.bf">
              <span class="betting-value">{{ match.draw.bf }}</span>
            </div>
            <div class="betting-item">
              <span class="betting-value">{{ match.draw.jq }}球</span>
            </div>
            <div class="betting-item" v-if="match.draw.bspf">
              <span class="betting-value">{{ match.draw.bspf }}</span>
            </div>
          </div>
        </div>
      </div>
      <van-empty v-else description="暂无比赛数据" />
    </div>

    <div class="match-list" v-if="active === 1">
      <!-- Loading 状态 -->
      <div v-if="loading" class="match-list-loading">
        <van-loading size="30px" vertical color="#999">加载中...</van-loading>
      </div>

      <!-- 篮球比赛内容 -->
      <div v-else-if="basketballMatches && basketballMatches.length">
      <div v-for="match in basketballMatches" :key="match.id" class="basketball-card">
        <!-- 左侧内容区 -->
        <div class="b-card-left">
          <!-- 联赛和时间信息 -->
          <div class="b-league-info">
            <span class="b-league-name">{{ match.league }}</span>
            <span class="b-match-time">{{ match.dateTime }}</span>
          </div>

          <!-- 球队信息 -->
          <div class="b-teams-container">
            <!-- 主队 -->
            <div class="b-team home">
              <div class="b-team-name">{{ match.homeTeam }}</div>
              <div class="b-team-badge">主</div>
            </div>

            <!-- 客队 -->
            <div class="b-team away">
              <div class="b-team-name">{{ match.awayTeam }}</div>
            </div>
          </div>
        </div>

        <!-- 右侧得分区 -->
        <div class="b-card-right">
          <!-- 比赛状态 -->
          <div class="b-match-status" :class="{ 'b-live': match.status.includes('第') && !match.status.includes('完') }">
            {{ match.status }}
            <span>
              分差: <span :class="getDiffClass(match.homeScore, match.awayScore)">{{ Math.abs(match.homeScore - match.awayScore) }}</span>
            </span>
          </div>

          <!-- 得分详情 -->
          <div class="b-score-details">
            <!-- 得分表头 -->
            <div class="b-score-header">
              <div class="b-team-indicator"></div>
              <div class="b-quarter">1</div>
              <div class="b-quarter">2</div>
              <div class="b-quarter">3</div>
              <div class="b-quarter">4</div>
              <div class="b-total">总分</div>
            </div>

            <!-- 主队得分 -->
            <div class="b-score-row">
              <div class="b-team-indicator home">主</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.home[0] : "-" }}</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.home[1] : "-" }}</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.home[2] : "-" }}</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.home[3] : "-" }}</div>
              <div class="b-total highlight">{{ match.homeScore || "-" }}</div>
            </div>

            <!-- 客队得分 -->
            <div class="b-score-row">
              <div class="b-team-indicator away">客</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.away[0] : "-" }}</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.away[1] : "-" }}</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.away[2] : "-" }}</div>
              <div class="b-quarter">{{ match.quarters ? match.quarters.away[3] : "-" }}</div>
              <div class="b-total highlight">{{ match.awayScore || "-" }}</div>
            </div>
          </div>

          <!-- 分差 -->
          <div class="b-score-diff" v-if="match.homeScore !== null && match.awayScore !== null"></div>
        </div>
      </div>
      </div>
      <van-empty v-else description="暂无比赛数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import "../../styles/basketball.css";
import API from "../../request/api.js";

const router = useRouter();
const route = useRoute();
const active = ref(0);
const loading = ref(false);

const showTop = ref(false);
const hotLeagues = ["英超", "西甲", "意甲", "德甲", "法甲", "欧冠"];
const euroLeagues = ["英冠", "欧联", "荷甲", "葡超", "俄超"];
const otherLeagues = ["中超", "美职", "日职"];
const allLeagues = [...hotLeagues, ...euroLeagues, ...otherLeagues];
const leagueOptions = [...allLeagues];

const today = ref("");
const prev1 = ref("");
const prev2 = ref("");
const prev3 = ref("");
const next1 = ref("");
const next2 = ref("");
const next3 = ref("");

const footballMatchesOneday = ref({});

// 足球比赛假数据
const footballMatches = ref({});

// 篮球比赛假数据
const basketballMatches = ref([]);

// 计算分差显示类
function getDiffClass(homeScore, awayScore) {
  if (homeScore === null || awayScore === null) return "";
  if (homeScore > awayScore) return "home-winning";
  if (homeScore < awayScore) return "away-winning";
  return "";
}

// 获取联赛背景色
function getLeagueStyle(leagueName) {
  if (!leagueName) return { background: '#d426dd' };

  // 五大联赛
  if (leagueName.includes('英超')) {
    return { background: '#3d195b' }; // 紫色
  } else if (leagueName.includes('西甲')) {
    return { background: '#ff4500' }; // 橙红色
  } else if (leagueName.includes('意甲')) {
    return { background: '#0066cc' }; // 意大利蓝
  } else if (leagueName.includes('德甲')) {
    return { background: '#d4021d' }; // 德国红
  } else if (leagueName.includes('法甲')) {
    return { background: '#0055a4' }; // 法国蓝
  }
  
  // 欧洲杯赛
  else if (leagueName.includes('欧冠') || leagueName.includes('欧洲冠军')) {
    return { background: '#00285e' }; // 深蓝色
  } else if (leagueName.includes('欧联') || leagueName.includes('欧罗巴')) {
    return { background: '#f68712' }; // 橙色
  } else if (leagueName.includes('欧协') || leagueName.includes('欧会杯')) {
    return { background: '#7fba00' }; // 绿色
  }
  
  // 国家杯赛
  else if (leagueName.includes('德国杯')) {
    return { background: '#c8102e' }; // 德国红
  } else if (leagueName.includes('意大利杯') || leagueName.includes('意杯')) {
    return { background: '#009246' }; // 意大利绿
  } else if (leagueName.includes('英格兰')) {
    return { background: '#012169' }; // 英格兰深蓝
  } else if (leagueName.includes('英锦')) {
    return { background: '#c8102e' }; // 红色
  } else if (leagueName.includes('足总杯') || leagueName.includes('英足总')) {
    return { background: '#00205b' }; // 深蓝
  } else if (leagueName.includes('法国杯')) {
    return { background: '#ed2939' }; // 法国红
  } else if (leagueName.includes('西班牙')) {
    return { background: '#aa151b' }; // 西班牙红
  }
  
  // 次级联赛
  else if (leagueName.includes('英冠')) {
    return { background: '#1e3a8a' }; // 深蓝
  } else if (leagueName.includes('德乙')) {
    return { background: '#800080' }; // 紫色
  } else if (leagueName.includes('法乙')) {
    return { background: '#008000' }; // 绿色
  } else if (leagueName.includes('西乙')) {
    return { background: '#d97706' }; // 琥珀色
  } else if (leagueName.includes('意乙')) {
    return { background: '#0e7490' }; // 青色
  }
  
  // 其他欧洲联赛
  else if (leagueName.includes('荷甲')) {
    return { background: '#ff6600' }; // 荷兰橙
  } else if (leagueName.includes('荷乙')) {
    return { background: '#d97706' }; // 深橙色
  } else if (leagueName.includes('葡超')) {
    return { background: '#006600' }; // 深绿色
  } else if (leagueName.includes('苏超')) {
    return { background: '#005eb8' }; // 苏格兰蓝
  } else if (leagueName.includes('比甲')) {
    return { background: '#ed2939' }; // 比利时红
  } else if (leagueName.includes('土超')) {
    return { background: '#e30a17' }; // 土耳其红
  }
  
  // 亚洲联赛
  else if (leagueName.includes('中超')) {
    return { background: '#de2910' }; // 中国红
  } else if (leagueName.includes('日职')) {
    return { background: '#bc002d' }; // 日本红
  } else if (leagueName.includes('韩职')) {
    return { background: '#003478' }; // 韩国蓝
  } else if (leagueName.includes('沙职')) {
    return { background: '#165b33' }; // 沙特绿
  } else if (leagueName.includes('澳超')) {
    return { background: '#ffc72c' }; // 澳大利亚金黄
  }
  
  // 美洲联赛
  else if (leagueName.includes('美职')) {
    return { background: '#002d72' }; // 美国蓝
  } else if (leagueName.includes('巴甲')) {
    return { background: '#009c3b' }; // 巴西绿
  } else if (leagueName.includes('阿甲')) {
    return { background: '#74acdf' }; // 阿根廷蓝
  } else if (leagueName.includes('墨西哥')) {
    return { background: '#006847' }; // 墨西哥绿
  }
  
  // 默认颜色
  else {
    return { background: '#6b7280' }; // 灰色
  }
}

// 时间戳转换为时分秒
function formatTime(timestamp) {
  if (!timestamp) return "未知时间";
  const date = new Date(timestamp * 1000);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 跳转到比赛分析页面
function getAnalysisData(id) {
  router.push({
    path: '/match-analysis',
    query: { id }
  });
}

// 默认全选所有联赛
const checkedLeagues = ref([...leagueOptions]);
const isAllSelected = ref(true);

function toggleLeague(item) {
  const index = checkedLeagues.value.indexOf(item);
  if (index > -1) {
    // 已选中，则移除
    checkedLeagues.value.splice(index, 1);
  } else {
    // 未选中，则添加
    checkedLeagues.value.push(item);
  }
  // 更新全选状态
  isAllSelected.value = checkedLeagues.value.length === leagueOptions.length;
}

function toggleSelectAll() {
  // 全选
  checkedLeagues.value = [...allLeagues];
  isAllSelected.value = true;
}

function clearSelection() {
  // 清空选择
  checkedLeagues.value = [];
  isAllSelected.value = false;
}

function onConfirmFilter() {
  showTop.value = false;
  console.log("已选择赛事:", checkedLeagues.value);
  // 这里可以根据checkedLeagues.value进行比赛筛选逻辑
}

function getWeekStr(date) {
  const weekArr = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return weekArr[date.getDay()];
}
function getDateList() {
  const res = [];
  const now = new Date();

  const t = new Date(now);
  const p1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const p2 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const p3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const n1 = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const n2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const n3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  function format(d) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}-${dd}`;
  }

  today.value = format(t);
  prev1.value = format(p1);
  prev2.value = format(p2);
  prev3.value = format(p3);
  next1.value = format(n1);
  next2.value = format(n2);
  next3.value = format(n3);

  // 前3天
  for (let i = 3; i > 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    res.push({ date: `${mm}-${dd}`, week: getWeekStr(d) });
  }
  // 当天
  res.push({ date: `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`, week: getWeekStr(now) });
  // 后3天
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    res.push({ date: `${mm}-${dd}`, week: getWeekStr(d) });
  }
  return res;
}
const dateList = ref(getDateList());
// 默认选中当天（索引为3）
const dateActive = ref(3);
const displayedMatches = ref([]);

function onDateClick(idx) {
  dateActive.value = idx;
  let key = "";
  if (idx === 0) key = prev3.value;
  if (idx === 1) key = prev2.value;
  if (idx === 2) key = prev1.value;
  if (idx === 3) key = today.value;
  if (idx === 4) key = next1.value;
  if (idx === 5) key = next2.value;
  if (idx === 6) key = next3.value;
  footballMatchesOneday.value = footballMatches.value[key] || [];
}

const onTabChange = (index) => {
  // 如果切换到篮球tab且还没有数据，加载篮球数据
  if (index === 1 && basketballMatches.value.length === 0) {
    loading.value = true;

    API.gameScore("basketball")
      .then((res) => {
        if (res.code === 1) {
          // 将篮球数据转换为数组格式
          const allMatches = [];
          Object.keys(res.data).forEach(date => {
            if (res.data[date] && res.data[date].length > 0) {
              res.data[date].forEach(match => {
                allMatches.push({
                  id: match.id,
                  league: match.match?.name || '未知联赛',
                  dateTime: formatMatchTime(match.start_time),
                  homeTeam: match.home_team_name,
                  awayTeam: match.guest_team_name,
                  homeScore: match.basketball?.home_total ? parseInt(match.basketball.home_total) : null,
                  awayScore: match.basketball?.guest_total ? parseInt(match.basketball.guest_total) : null,
                  status: match.basketball?.current_jie_f || '未开始',
                  quarters: match.basketball ? {
                    home: [
                      match.basketball.home_t1 || 0,
                      match.basketball.home_t2 || 0,
                      match.basketball.home_t3 || 0,
                      match.basketball.home_t4 || 0
                    ],
                    away: [
                      match.basketball.guest_t1 || 0,
                      match.basketball.guest_t2 || 0,
                      match.basketball.guest_t3 || 0,
                      match.basketball.guest_t4 || 0
                    ]
                  } : null
                });
              });
            }
          });
          basketballMatches.value = allMatches;
        } else {
          showToast(res.msg || "获取篮球数据失败");
        }
      })
      .catch((err) => {
        console.error('获取篮球数据失败:', err);
        showToast(err.msg || "获取篮球数据失败");
      })
      .finally(() => {
        loading.value = false;
      });
  }
};

// 格式化比赛时间
const formatMatchTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
};

onMounted(() => {
  // 根据 query 参数设置初始标签页
  const type = route.query.type;
  if (type === 'basketball') {
    active.value = 1; // 切换到篮球标签页
  } else {
    active.value = 0; // 默认足球标签页
  }

  loading.value = true;

  // 根据类型加载对应的数据
  const apiType = type === 'basketball' ? 'basketball' : 'football';

  API.gameScore(apiType)
    .then((res) => {
      if (res.code === 1) {
        if (apiType === 'football') {
          footballMatches.value = res.data;
          // 默认展示当天的数据
          footballMatchesOneday.value = footballMatches.value[today.value] || [];
        } else {
          // 篮球数据处理 - 将数据转换为数组格式
          const allMatches = [];
          Object.keys(res.data).forEach(date => {
            if (res.data[date] && res.data[date].length > 0) {
              res.data[date].forEach(match => {
                allMatches.push({
                  id: match.id,
                  league: match.match?.name || '未知联赛',
                  dateTime: formatMatchTime(match.start_time),
                  homeTeam: match.home_team_name,
                  awayTeam: match.guest_team_name,
                  homeScore: match.basketball?.home_total ? parseInt(match.basketball.home_total) : null,
                  awayScore: match.basketball?.guest_total ? parseInt(match.basketball.guest_total) : null,
                  status: match.basketball?.current_jie_f || '未开始',
                  quarters: match.basketball ? {
                    home: [
                      match.basketball.home_t1 || 0,
                      match.basketball.home_t2 || 0,
                      match.basketball.home_t3 || 0,
                      match.basketball.home_t4 || 0
                    ],
                    away: [
                      match.basketball.guest_t1 || 0,
                      match.basketball.guest_t2 || 0,
                      match.basketball.guest_t3 || 0,
                      match.basketball.guest_t4 || 0
                    ]
                  } : null
                });
              });
            }
          });
          basketballMatches.value = allMatches;
        }
      } else {
        showToast(res.msg || `获取${apiType === 'football' ? '足球' : '篮球'}数据失败`);
      }
    })
    .catch((err) => {
      showToast(err.msg || `获取${apiType === 'football' ? '足球' : '篮球'}数据失败`);
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<style scoped>
.popup-content {
  background: #fff;
  border-radius: 0 0 18px 18px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  padding: 0 0 12px 0;
}

.popup-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #000;
  padding: 12px 0 10px 22px;
  letter-spacing: 1px;
}

.league-group {
  margin-bottom: 10px;
  padding: 0 18px;
}

.group-title {
  font-size: 0.95rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
}

.league-checkbox {
  background: #fff;
  border-radius: 16px;
  margin: 8px 12px 8px 0;
  padding: 0 18px;
  min-width: 72px;
  font-size: 1rem;
  color: #222;
  border: 1.5px solid #222;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  height: 38px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.league-checkbox .van-checkbox__icon {
  display: none;
}

.league-checkbox .van-checkbox__label {
  width: 100%;
  text-align: center;
}

.league-checkbox.van-checkbox--checked {
  background: linear-gradient(90deg, #fc3c3c, #c8391c);
  color: #fff;
  border-color: #fc3c3c;
}

.league-checkbox.van-checkbox--checked .van-checkbox__label {
  color: #fff;
}

.popup-btn-row {
  padding: 18px 18px 0 18px;
  display: flex;
  justify-content: center;
}

.popup-btn-row .van-button {
  font-size: 1.08rem;
  font-weight: 700;
  color: #fff;
  border: none;
  border-radius: 24px;
  box-shadow: 0 2px 8px rgba(252, 60, 60, 0.12);
  padding: 0 38px;
  height: 42px;
  letter-spacing: 2px;
  transition: box-shadow 0.2s;
}

.popup-btn-row .van-button:active {
  opacity: 0.92;
  box-shadow: 0 1px 4px rgba(252, 60, 60, 0.18);
}

.page {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  color: #0f172a;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  min-height: (100vh - 88px);
  max-width: 430px;
  margin: 0 auto;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 4px 12px 0 2px;
}

.tab-wrap {
  flex: 1;
  max-width: 140px;
}

.filter-wrap {
  margin-left: 12px;
}

.date-bar {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 4px 0 8px 0;
  border-bottom: 1px solid #f0f0f0;
  overflow-x: auto;
  scrollbar-width: none;
  /* Firefox */
}

.date-bar::-webkit-scrollbar {
  display: none;
  /* Chrome/Safari */
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding: 4px;
  margin: 3px;
  cursor: pointer;
  border-radius: 4px;
  min-width: 52px;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.date-item .date {
  font-size: 0.8rem;
  color: #333;
}

.date-item .week {
  font-size: 0.7rem;
  color: #999;
}

.date-item.active {
  background: #fc3c3c;
  color: #fff;
}

.date-item.active .date {
  color: #fff;
  font-weight: 600;
}

.date-item.active .week {
  color: #fff;
}

/* tabs样式优化 */
:deep(.van-tabs__nav .van-tab) {
  font-size: 0.9rem;
  color: #bcbcbc;
  transition: font-size 0.2s, color 0.2s;
}

:deep(.van-tabs__nav .van-tab.van-tab--active) {
  font-size: 1.2rem;
  color: #333;
}

:deep(.van-tabs--line .van-tabs__wrap) {
  height: 48px;
}

:deep(.van-tabs__line) {
  background: #fff;
}

/* match-list 容器内的 Loading 样式 */
.match-list-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}
</style>
<style scoped>
/* 优化赛事筛选弹窗UI */
.popup-content {
  background: #fff;
  border-radius: 0 0 18px 18px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  padding: 0 0 12px 0;
  margin: 0 auto;
  width: 100%;
  max-width: 430px;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 22px 10px;
  border-bottom: 1px solid #f0f0f0;
}

/* 已删除旧的 select-all-btn 样式，使用新的 action-btn 样式代替 */

.filter-leagues {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 8px 12px;
}

.league-item {
  width: calc(25% - 12px);
  height: 32px;
  margin: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f5f5f5;
  color: #222;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.league-item.active {
  background-color: #fc3c3c;
  color: #fff;
  box-shadow: 0 2px 4px rgba(252, 60, 60, 0.2);
}

.popup-btn-group {
  display: flex;
  justify-content: space-between;
  padding: 16px 16px 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 10px;
}

.action-btn {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 6px;
}

.all-btn {
  background-color: #f0f0f0;
  color: #333;
}

.clear-btn {
  background-color: #f0f0f0;
  color: #333;
}

.confirm-btn {
  background-color: #fc3c3c;
  color: #fff;
}

.popup-btn-row .van-button:active {
  opacity: 0.92;
  box-shadow: 0 1px 4px rgba(252, 60, 60, 0.18);
}

/* 比赛列表样式 */
.match-list {
  padding: 8px 12px;
  min-height: 90vh;
}

.match-card {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 8px;
}

.match-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
}

.match-header .match-status {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.match-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 100px;
  min-width: 100px;
}

.match-round {
  font-size: 0.7rem;
  color: #666;
  font-weight: 500;
}

.match-time {
  font-size: 0.75rem;
  color: #666;
  margin-top: 2px;
  font-weight: 500;
}

.match-status {
  font-size: 0.8rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.status-done {
  font-size: 0.7rem;
  color: #ff3c1e;
}

.status-pending {
  background: #ff9800;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.status-live {
  background: #fa3c3c;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.6rem;
  font-weight: 600;
}

.match-status.live {
  background: rgba(252, 60, 60, 0.1);
  color: #fc3c3c;
  font-weight: 500;
}

.match-rang {
  font-size: 0.7rem;
  color: #ffffff;
  text-align: center;
  padding: 2px 4px;
  border-radius: 4px;
}




/* 竞猜信息样式 */
.match-betting-info {
  padding-top: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.betting-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.betting-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0 -1px;
}

.betting-label {
  font-size: 0.7rem;
  color: #666;
  margin-right: 4px;
  white-space: nowrap;
}

.betting-value {
  font-size: 0.75rem;
  padding: 5px 6px;
  border-radius: 4px;
  text-align: center;
  min-width: 3rem;
  min-height: 1rem;
  background-color: #f3f3f3;
  display: flex;
  justify-content: center;
  align-items: center;
}

.match-teams {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.team {
  display: flex;
  align-items: center;
  flex: 1;
}

.home-team {
  justify-content: flex-end;
}

.away-team {
  justify-content: flex-start;
}

.team-name {
  font-size: 0.85rem;
  color: #222;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  padding: 0 8px;
}

.team-score {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fc3c3c;
  margin: 0 4px;
}

.vs {
  color: #999;
}

.match-footer {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.match-btn {
  font-size: 0.8rem;
  color: #2962ff;
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(41, 98, 255, 0.08);
  cursor: pointer;
}

.match-halftime {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 0;
  margin-top: 2px;
  font-size: 0.75rem;
}

.halftime-label {
  color: #666;
  margin-right: 4px;
}

.halftime-score {
  color: #666;
}
</style>
