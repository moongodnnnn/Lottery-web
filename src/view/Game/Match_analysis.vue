<template>
  <div class="analysis-page">
    <!-- Loading 状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading size="40px" vertical color="#fc3c3c">加载中...</van-loading>
    </div>

    <div v-else-if="matchData" class="analysis-content">
      <!-- 比赛基本信息 (固定在顶部) -->
      <div class="match-info-card sticky-header" ref="headerRef">
        <div class="league-info">
          <van-icon name="arrow-left" class="back-icon" @click="goBack" />
          <div class="league-name">{{ matchData?.match?.name || "未知联赛" }}</div>
          <div class="match-time">{{ formatMatchTime(matchData?.start_time) }}</div>
        </div>

        <div class="teams-section">
          <div class="team home">
            <img src="/icons/hometeam.png" alt="主队" class="team-icon" />
            <div class="team-name">{{ matchData?.home_team_name || "" }}</div>
            <div class="team-rank" v-if="matchData?.home_team_rank">排名: {{ matchData.home_team_rank }}</div>
          </div>

          <div class="score-area">
            <!-- 倒计时显示 -->

            <div class="match-status" :class="getStatusClass(matchData?.status)">
              {{ getStatusText(matchData?.status, matchData?.minutes) }}
            </div>
            <div v-if="countdown" class="countdown-display">
              <div>距离比赛开始</div>
              <div style="font-size: 14px; padding: 2px">{{ countdown }}</div>
            </div>

            <div class="score" v-if="matchData?.score && matchData?.score !== ':'">
              {{ matchData?.score }}
            </div>
            <!-- 半场比分 (仅在比赛结束时显示) -->
            <div class="halftime-score" v-if="matchData?.status === 'done' && matchData?.banchang">
              半场: {{ matchData?.banchang }}
            </div>
          </div>

          <div class="team away">
            <img src="/icons/awayteam.png" alt="客队" class="team-icon" />
            <div class="team-name">{{ matchData?.guest_team_name || "" }}</div>
            <div class="team-rank" v-if="matchData?.guest_team_rank">排名: {{ matchData.guest_team_rank }}</div>
          </div>
        </div>
      </div>

      <!-- 主Tab分类（仅内容区域可滚动） -->
      <div class="tabs-scroll-area">
        <van-tabs v-model:active="mainTabActive" animated sticky :offset-top="stickyOffsetTop" class="main-tabs">
          <!-- Tab 1: 推荐分析 -->
          <van-tab title="战绩">
            <!-- 积分数据 -->
            <div class="section-card" v-if="hasCoinData">
              <!-- 主队数据表格 -->
              <div
                class="team-stats-table"
                v-if="analysisData.coin_data.zhu?.all && Object.values(analysisData.coin_data.zhu.all).some((v) => v !== null)"
              >
                <div class="team-stats-header">
                  <img src="/icons/hometeam.png" alt="主队" class="team-stats-icon" />
                  <span class="team-name">{{ matchData.home_team_name }}</span>
                </div>
                <div class="stats-table">
                  <div class="stats-header">
                    <span class="col">总场次</span>
                    <span class="col">胜/平/负</span>
                    <span class="col">进/失</span>
                    <span class="col">净胜球</span>
                    <span class="col">胜率</span>
                  </div>
                  <div class="stats-data">
                    <span class="col">{{ analysisData.coin_data.zhu.all.games || "-" }}</span>
                    <span class="col">
                      <span class="win">{{ analysisData.coin_data.zhu.all.s || "0" }}</span
                      >/ <span class="draw">{{ analysisData.coin_data.zhu.all.p || "0" }}</span
                      >/
                      <span class="loss">{{ analysisData.coin_data.zhu.all.f || "0" }}</span>
                    </span>
                    <span class="col">{{ analysisData.coin_data.zhu.all.jin || "0" }}/{{ analysisData.coin_data.zhu.all.shi || "0" }}</span>
                    <span class="col">{{ analysisData.coin_data.zhu.all.jing || "0" }}</span>
                    <span class="col highlight">{{ analysisData.coin_data.zhu.all.rate || "-" }}</span>
                  </div>
                </div>
              </div>

              <!-- 客队数据表格 -->
              <div
                class="team-stats-table"
                v-if="analysisData.coin_data.ke?.all && Object.values(analysisData.coin_data.ke.all).some((v) => v !== null)"
              >
                <div class="team-stats-header away">
                  <img src="/icons/awayteam.png" alt="客队" class="team-stats-icon" />
                  <span class="team-name">{{ matchData.guest_team_name }}</span>
                </div>
                <div class="stats-table">
                  <div class="stats-header">
                    <span class="col">总场次</span>
                    <span class="col">胜/平/负</span>
                    <span class="col">进/失</span>
                    <span class="col">净胜球</span>
                    <span class="col">胜率</span>
                  </div>
                  <div class="stats-data">
                    <span class="col">{{ analysisData.coin_data.ke.all.games || "-" }}</span>
                    <span class="col">
                      <span class="win">{{ analysisData.coin_data.ke.all.s || "0" }}</span
                      >/ <span class="draw">{{ analysisData.coin_data.ke.all.p || "0" }}</span
                      >/
                      <span class="loss">{{ analysisData.coin_data.ke.all.f || "0" }}</span>
                    </span>
                    <span class="col">{{ analysisData.coin_data.ke.all.jin || "0" }}/{{ analysisData.coin_data.ke.all.shi || "0" }}</span>
                    <span class="col">{{ analysisData.coin_data.ke.all.jing || "0" }}</span>
                    <span class="col highlight">{{ analysisData.coin_data.ke.all.rate || "-" }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 技术统计（来自 sai_total_data） -->
            <!-- <div class="section-card" v-if="hasTotals">
              <div class="simple-compare-table">
                <div class="table-header">
                  <span class="col-label">技术统计</span>
                  <span class="col-home">{{ matchData.home_team_name }}</span>
                  <span class="col-away">{{ matchData.guest_team_name }}</span>
                </div>
                <div class="table-body">
                  <div class="table-row">
                    <span class="col-label">射门</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_shot_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_shot_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">射正</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_shotin_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_shotin_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">控球率</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_ballcontrol_rate || "0" }}%</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_ballcontrol_rate || "0" }}%</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">角球</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_corner_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_corner_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">危险进攻</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_danger_attack_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_danger_attack_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">进攻</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_attack_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_attack_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">犯规</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_foul_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_foul_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">黄牌</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_yellow_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_yellow_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">红牌</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_red_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_red_count || "0" }}</span>
                  </div>
                  <div class="table-row">
                    <span class="col-label">越位</span>
                    <span class="col-home">{{ analysisData.sai_total_data.h_offset_count || "0" }}</span>
                    <span class="col-away">{{ analysisData.sai_total_data.a_offset_count || "0" }}</span>
                  </div>
                </div>
              </div>
            </div> -->

            <!-- 历史交锋 -->
            <div class="section-card" v-if="analysisData?.history_data?.list?.length">
              <div class="history-summary" v-if="analysisData.history_data.memo">
                <span class="summary-label">历史交锋</span>
                <div class="summary-stats">
                  <div class="stat-box win">
                    <span class="stat-num">{{ analysisData.history_data.memo.s || 0 }}</span>
                  </div>
                  <div class="stat-box draw">
                    <span class="stat-num">{{ analysisData.history_data.memo.p || 0 }}</span>
                  </div>
                  <div class="stat-box loss">
                    <span class="stat-num">{{ analysisData.history_data.memo.f || 0 }}</span>
                  </div>
                </div>
              </div>
              <div class="history-table">
                <div class="table-header">
                  <span class="col-league">联赛名</span>
                  <span class="col-home" style="text-align: right">主队名</span>
                  <span class="col-score">比分</span>
                  <span class="col-away">客队名</span>
                  <span class="col-goals">进球数</span>
                  <span class="col-result">结果</span>
                </div>
                <div class="table-body">
                  <div class="table-row" v-for="(item, index) in analysisData.history_data.list" :key="index">
                    <span class="col-league">{{ item.match }}</span>
                    <span class="col-home" style="text-align: right">{{ item.zhu }}</span>
                    <span class="col-score">{{ item.bifen }}</span>
                    <span class="col-away">{{ item.ke }}</span>
                    <span class="col-goals">{{ getTotalGoals(item.bifen) }}</span>
                    <span class="col-result">
                      <span class="result-badge" :class="getResultClass(item.final)">{{ item.final }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 近期战绩 -->
            <div class="section-card" v-if="analysisData?.record_data">
              <!-- 主队近期 -->
              <div class="team-recent-section" v-if="analysisData.record_data.zhu_n?.length">
                <div class="team-recent-title home">
                  <img src="/icons/hometeam.png" alt="主队" class="team-title-icon" />
                  <span>{{ matchData.home_team_name }}-近期战绩</span>
                </div>
                <div class="record-table">
                  <div class="table-header">
                    <span class="col-league">联赛名</span>
                    <span class="col-home" style="text-align: right">主队名</span>
                    <span class="col-score">比分</span>
                    <span class="col-away">客队名</span>
                    <span class="col-goals">进球数</span>
                    <span class="col-result">结果</span>
                  </div>
                  <div class="table-body">
                    <div class="table-row" v-for="(item, index) in analysisData.record_data.zhu_n.slice(0, 8)" :key="index">
                      <span class="col-league">{{ item.match }}</span>
                      <span class="col-home" style="text-align: right">{{ item.zhu }}</span>
                      <span class="col-score">{{ item.bifen }}</span>
                      <span class="col-away">{{ item.ke }}</span>
                      <span class="col-goals">{{ getTotalGoals(item.bifen) }}</span>
                      <span class="col-result">
                        <span class="result-badge" :class="getResultClass(item.final)">{{ item.final }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 客队近期 -->
              <div class="team-recent-section" v-if="analysisData.record_data.ke_n?.length">
                <div class="team-recent-title away">
                  <img src="/icons/awayteam.png" alt="客队" class="team-title-icon" />
                  <span>{{ matchData.guest_team_name }}-近期战绩</span>
                </div>
                <div class="record-table">
                  <div class="table-header">
                    <span class="col-league">联赛名</span>
                    <span class="col-home" style="text-align: right">主队名</span>
                    <span class="col-score">比分</span>
                    <span class="col-away">客队名</span>
                    <span class="col-goals">进球数</span>
                    <span class="col-result">结果</span>
                  </div>
                  <div class="table-body">
                    <div class="table-row" v-for="(item, index) in analysisData.record_data.ke_n.slice(0, 8)" :key="index">
                      <span class="col-league">{{ item.match }}</span>
                      <span class="col-home" style="text-align: right">{{ item.zhu }}</span>
                      <span class="col-score">{{ item.bifen }}</span>
                      <span class="col-away">{{ item.ke }}</span>
                      <span class="col-goals">{{ getTotalGoals(item.bifen) }}</span>
                      <span class="col-result">
                        <span class="result-badge" :class="getResultClass(item.final)">{{ item.final }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </van-tab>

          <van-tab title="事件">
            <!-- 比赛事件时间线 -->
            <div class="section-card" v-if="hasEvents">
              <div class="event-timeline">
                <div
                  class="event-row"
                  v-for="(ev, idx) in analysisData.sai_event_data"
                  :key="idx"
                  :class="[getEventClass(ev.eventtype), getEventTeamClass(ev.is_team)]"
                >
                  <span class="event-minute">{{ formatMinute(ev.timing_point) }}</span>
                  <span class="event-type">{{ getEventTypeLabel(ev.eventtype) }}</span>
                  <span class="event-content">{{ ev.cdata }}</span>
                  <span class="event-score" v-if="ev.current_score">{{ ev.current_score }}</span>
                </div>
              </div>
            </div>
            <!-- 赛事分析 -->
            <div class="section-card" v-if="hasRecom">
              <div class="analysis-content">
                <!-- 分析详情 -->
                <div class="analysis-detail" v-if="analysisData.recom_data.recom1?.text">
                  <div class="detail-title">赛事分析</div>
                  <div class="detail-text">{{ analysisData.recom_data.recom1.text }}</div>
                </div>

                <div class="analysis-detail" v-if="analysisData.recom_data.recom2">
                  <div class="detail-title">深度解析</div>
                  <div class="detail-text">{{ analysisData.recom_data.recom2 }}</div>
                </div>

                <!-- 走势分析 -->
                <div class="trend-section">
                  <div class="trend-title">近期走势分析</div>

                  <div class="trend-row">
                    <div class="trend-team-name">{{ matchData.home_team_name }}</div>
                    <div class="trend-results">
                      <template v-if="analysisData.recom_data.zhu?.zoushi">
                        <span
                          v-for="(char, index) in analysisData.recom_data.zhu.zoushi.split('')"
                          :key="index"
                          class="trend-badge"
                          :class="getTrendClass(char)"
                        >
                          {{ getTrendText(char) }}
                        </span>
                      </template>
                    </div>
                  </div>

                  <div class="trend-row">
                    <div class="trend-team-name">{{ matchData.guest_team_name }}</div>
                    <div class="trend-results">
                      <template v-if="analysisData.recom_data.ke?.zoushi">
                        <span
                          v-for="(char, index) in analysisData.recom_data.ke.zoushi.split('')"
                          :key="index"
                          class="trend-badge"
                          :class="getTrendClass(char)"
                        >
                          {{ getTrendText(char) }}
                        </span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 情报分析 -->
            <div class="section-card" v-if="analysisData?.qb_data">
              <div class="intel-section" v-if="analysisData.qb_data.home?.length">
                <div class="intel-header home">{{ matchData.home_team_name }}</div>
                <div class="intel-list">
                  <div class="intel-item" v-for="(item, index) in analysisData.qb_data.home" :key="index">
                    <span>{{ item }}</span>
                  </div>
                </div>
              </div>

              <div class="intel-section" v-if="analysisData.qb_data.guest?.length">
                <div class="intel-header away">{{ matchData.guest_team_name }}</div>
                <div class="intel-list">
                  <div class="intel-item" v-for="(item, index) in analysisData.qb_data.guest" :key="index">
                    <span>{{ item }}</span>
                  </div>
                </div>
              </div>
            </div>
          </van-tab>

          <!-- Tab 2: 数据统计 -->

          <!-- Tab 3: 阵容信息 -->
          <van-tab title="首发阵容">
            <!-- 首发阵容 -->
            <div class="section-card" v-if="analysisData?.team_data">
              <van-tabs v-model:active="teamTabActive" animated>
                <van-tab :title="matchData.home_team_name">
                  <div class="lineup-content">
                    <div class="football-field" v-if="analysisData.team_data.zhu?.first?.length">
                      <div class="formation-line" v-for="(line, idx) in getFormationLines(analysisData.team_data.zhu.first)" :key="idx">
                        <div class="player-card" v-for="player in line" :key="player.num">
                          <div class="player-number home-team">{{ player.num }}</div>
                          <div class="player-name">{{ player.name }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="no-data-text">暂无阵容数据</div>
                  </div>
                </van-tab>

                <van-tab :title="matchData.guest_team_name">
                  <div class="lineup-content">
                    <div class="football-field" v-if="analysisData.team_data.ke?.first?.length">
                      <div class="formation-line" v-for="(line, idx) in getFormationLines(analysisData.team_data.ke.first)" :key="idx">
                        <div class="player-card" v-for="player in line" :key="player.num">
                          <div class="player-number away-team">{{ player.num }}</div>
                          <div class="player-name">{{ player.name }}</div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="no-data-text">暂无阵容数据</div>
                  </div>
                </van-tab>
              </van-tabs>
            </div>
          </van-tab>
        </van-tabs>
      </div>
    </div>
    <div v-if="!loading && !matchData" class="no-data-text">加载失败，请稍后重试</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import { API } from "../../request/api";

const router = useRouter();
const route = useRoute();

// 顶部区域高度测量，用于计算 Tabs 的粘性偏移
const headerRef = ref(null);
const headerHeight = ref(0);
const stickyOffsetTop = ref(160); // 兜底默认值，避免首屏未计算时位置错误

// 计算顶部粘性偏移（比赛信息卡高度）
const calcHeights = () => {
  headerHeight.value = headerRef.value?.offsetHeight || 160;
  stickyOffsetTop.value = headerHeight.value;
};

const loading = ref(false);
const matchData = ref(null);
const analysisData = ref(null);

const mainTabActive = ref(0);
const coinTabActive = ref(0);
const recordTabActive = ref(0);
const teamTabActive = ref(0);

// 数据存在性判断（适配空数组返回）
const hasRecom = computed(() => {
  const d = analysisData.value?.recom_data;
  if (!d) return false;
  return Array.isArray(d) ? d.length > 0 : Object.keys(d).length > 0;
});

const hasCoinData = computed(() => {
  const d = analysisData.value?.coin_data;
  if (!d) return false;
  if (Array.isArray(d)) return false; // 后端若返回 []，视为无数据

  // 检查主队和客队的 all 数据是否有有效值
  const zhuHasData = d.zhu?.all && Object.values(d.zhu.all).some((v) => v !== null && v !== undefined && v !== "");
  const keHasData = d.ke?.all && Object.values(d.ke.all).some((v) => v !== null && v !== undefined && v !== "");

  return !!(zhuHasData || keHasData);
});

const hasEvents = computed(() => Array.isArray(analysisData.value?.sai_event_data) && analysisData.value.sai_event_data.length > 0);
const hasTotals = computed(() => {
  const data = analysisData.value?.sai_total_data;
  if (!data) return false;
  if (Array.isArray(data) && data.length === 0) return false;
  // 检查是否有实际数据（非全 null/undefined）
  return Object.values(data).some((val) => val !== null && val !== undefined && val !== "");
});

// 倒计时相关
const countdown = ref("");
const countdownInterval = ref(null);

// 计算并更新倒计时
const updateCountdown = () => {
  if (!matchData.value?.start_time) {
    countdown.value = "";
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const startTime = matchData.value.start_time;
  const diff = startTime - now;

  if (diff <= 0) {
    countdown.value = "";
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
      countdownInterval.value = null;
    }
    return;
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  // 格式化为 HH:MM:SS
  const totalHours = days * 24 + hours;
  const hoursStr = totalHours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = seconds.toString().padStart(2, "0");

  countdown.value = `${hoursStr}:${minutesStr}:${secondsStr}`;
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 格式化时间
const formatMatchTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${month}月${day}日 ${hours}:${minutes}`;
};

// 获取状态样式
const getStatusClass = (status) => {
  if (status === "done") return "status-done";
  if (status === "ing") return "status-live";
  return "status-pending";
};

// 获取状态文本
const getStatusText = (status, minutes) => {
  if (status === "done") return "已完场";
  if (status === "ing") return minutes || "进行中";
  return "未开始";
};

// 获取结果样式
const getResultClass = (result) => {
  if (result === "胜") return "win";
  if (result === "负") return "loss";
  return "draw";
};

// 计算总进球数
const getTotalGoals = (score) => {
  if (!score || typeof score !== "string") return "-";
  const parts = score.split(":");
  if (parts.length !== 2) return "-";
  const home = parseInt(parts[0]) || 0;
  const away = parseInt(parts[1]) || 0;
  return home + away;
};

// 获取走势文本（W=胜, D=平, L=负）
const getTrendText = (char) => {
  if (char === "W") return "胜";
  if (char === "D") return "平";
  if (char === "L") return "负";
  return char;
};

// 获取走势样式
const getTrendClass = (char) => {
  if (char === "W") return "trend-win";
  if (char === "D") return "trend-draw";
  if (char === "L") return "trend-loss";
  return "";
};

// 比赛事件映射与格式化
const formatMinute = (m) => (m || m === 0 ? `${m}'` : "");
const getEventTypeLabel = (t) => {
  if (t === 1) return "进球";
  if (t === 4) return "黄牌";
  if (t === 5) return "红牌";
  if (t === 8) return "换人";
  return "事件";
};
const getEventClass = (t) => {
  if (t === 1) return "event-goal";
  if (t === 4) return "event-yellow";
  if (t === 5) return "event-red";
  if (t === 8) return "event-sub";
  return "event-other";
};
const getEventTeamClass = (isTeam) => (isTeam ? "home" : "away");

// 将球员阵容按足球位置分组（守门员、后卫、中场、前锋）
const getFormationLines = (players) => {
  if (!players || players.length === 0) return [];

  // 通常11人首发: 1守门员 + 后卫 + 中场 + 前锋
  const totalPlayers = players.length;

  // 常见阵型分配规则
  if (totalPlayers === 11) {
    // 4-4-2: 1守门员, 4后卫, 4中场, 2前锋
    if (players.length >= 11) {
      return [
        [players[0]], // 守门员 (1人)
        players.slice(1, 5), // 后卫 (4人)
        players.slice(5, 9), // 中场 (4人)
        players.slice(9, 11), // 前锋 (2人)
      ];
    }
  }

  // 动态分配: 按照比例分层
  const gk = [players[0]]; // 守门员
  const remaining = players.slice(1);
  const chunkSize = Math.ceil(remaining.length / 3);

  return [
    gk, // 守门员
    remaining.slice(0, chunkSize), // 后卫
    remaining.slice(chunkSize, chunkSize * 2), // 中场
    remaining.slice(chunkSize * 2), // 前锋
  ].filter((line) => line.length > 0);
};

// 加载比赛分析数据
const loadAnalysisData = async () => {
  const matchId = route.query.id;
  if (!matchId) {
    showToast("缺少比赛ID");
    router.back();
    return;
  }

  try {
    loading.value = true;
    console.log("=== 获取比赛分析数据 ===");
    console.log("比赛ID:", matchId);

    const res = await API.analysisData(matchId);
    console.log("分析数据返回:", res);

    if (res.code === 1 && res.data) {
      matchData.value = res.data.info;
      analysisData.value = res.data.info.analysis;
      console.log("比赛数据:", matchData.value);
      console.log("分析数据:", analysisData.value);

      // 如果是未开始状态，启动倒计时
      if (matchData.value.status === "no" && matchData.value.start_time) {
        updateCountdown();
        countdownInterval.value = setInterval(updateCountdown, 1000);
      }
    } else {
      showToast(res.msg || "获取数据失败");
    }
  } catch (error) {
    console.error("获取比赛分析数据失败:", error);
    showToast("获取数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  nextTick(() => {
    calcHeights();
  });
  // 资源加载和布局变化时，保持偏移计算准确
  window.addEventListener("load", calcHeights);

  if (typeof ResizeObserver !== "undefined") {
    try {
      const ro = new ResizeObserver(() => calcHeights());
      if (headerRef.value) ro.observe(headerRef.value);
      // @ts-ignore 暂存到 window 以便销毁
      window.__match_analysis_ro__ = ro;
    } catch {}
  }
  window.addEventListener("resize", calcHeights);
  loadAnalysisData();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calcHeights);
  window.removeEventListener("load", calcHeights);
  // 清除倒计时定时器
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
    countdownInterval.value = null;
  }
  // 销毁 ResizeObserver
  // @ts-ignore
  const ro = window.__match_analysis_ro__;
  if (ro && ro.disconnect) ro.disconnect();
  // @ts-ignore
  delete window.__match_analysis_ro__;
});
</script>

<style scoped>
.analysis-page {
  min-height: 100vh;
  background-color: #fff;
  max-width: 430px;
  margin: 0 auto;
  padding-bottom: 20px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.analysis-content {
  padding: 0px;
}

.main-tabs .van-tabs__wrap {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 998;
}

.main-tabs .van-tab {
  font-size: 14px;
  font-weight: 600;
}

.main-tabs .van-tab--active {
  color: #fc3c3c;
}

.main-tabs .van-tabs__line {
  background: #fc3c3c;
  height: 3px;
  border-radius: 2px;
}

/* 比赛信息卡片 */
.match-info-card {
  background: url("/img/match-info-cardbg.png") no-repeat center center;
  background-size: cover;
  padding: 20px;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 999;
}

.league-info {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  gap: 6px;
  position: relative;
}

.back-icon {
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
  flex-shrink: 0;
  position: absolute;
  left: 0;
}

.back-icon:active {
  opacity: 0.7;
}

.league-name {
  font-size: 14px;
  padding: 4px 6px;
  border-radius: 20px;
  flex-shrink: 0;
  text-align: center;
}

.match-time {
  font-size: 11px;
  opacity: 0.9;
  position: absolute;
  right: 0;
}

.teams-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.team {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.team-icon {
  width: 88px;
  height: 88px;
  object-fit: contain;
}

.team-name {
  font-size: 15px;
  font-weight: 400;
}

.team-rank {
  font-size: 11px;
  opacity: 0.8;
}

.score-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 100px;
}

.countdown-display {
  font-size: 12px;
  color: #fff;
  background: rgba(252, 60, 60, 0.9);
  padding: 8px 12px;
  border-radius: 4px;
  text-align: center;
  white-space: nowrap;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.match-status {
  font-size: 12px;
  padding: 8px 8px;
  border-radius: 4px;
}

.score {
  font-size: 36px;
  font-weight: 700;
}

.halftime-score {
  font-size: 12px;
  color: #fff;
  margin-top: 4px;
  font-weight: 500;
}

.vs {
  font-size: 18px;
  font-weight: 600;
}

.odds-info {
  display: flex;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.odds-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.odds-label {
  font-size: 11px;
  opacity: 0.8;
}

.odds-value {
  font-size: 16px;
  font-weight: 700;
}

/* 通用卡片样式 - 简约无卡片设计 */
.section-card {
  background: transparent;
  padding: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
  border-radius: 8px;
  border-left: 3px solid #fc3c3c;
}

.section-title .van-icon {
  font-size: 18px;
  color: #fc3c3c;
}

/* 赛事分析 */
.analysis-content {
  padding: 0;
}

.analysis-detail {
  padding: 12px 14px;
}

.analysis-detail:last-of-type {
  margin-bottom: 16px;
}

.detail-title {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-title::before {
  content: "";
  width: 4px;
  height: 14px;
  background: #fc3c3c;
  border-radius: 2px;
}

.detail-text {
  font-size: 12px;
  line-height: 1.7;
  color: #333;
  text-align: justify;
  word-break: break-word;
}

.trend-section {
  padding: 12px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin-top: 10px;
}

.trend-title {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.trend-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.trend-row:last-child {
  margin-bottom: 0;
}

.trend-team-name {
  font-size: 11px;
  font-weight: 600;
  color: #333;
  min-width: 60px;
  flex-shrink: 0;
}

.trend-results {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.trend-badge:active {
  transform: scale(0.95);
}

.trend-badge.trend-win {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
}

.trend-badge.trend-draw {
  background: linear-gradient(135deg, #ff9800 0%, #ffc107 100%);
}

.trend-badge.trend-loss {
  background: linear-gradient(135deg, #1989fa 0%, #42a5f5 100%);
}

/* 情报分析 */
/* 情报分析 - 新UI */
.intel-section {
  margin-bottom: 14px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.intel-section:last-child {
  margin-bottom: 0;
}

.intel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 800;
  color: #333;
  position: relative;
}

.intel-header::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 0 4px 4px 0;
}

.intel-header.home {
  background: linear-gradient(135deg, #fff5f5, #ffe5e5);
}
.intel-header.home::after {
  background: #fc3c3c;
}

.intel-header.away {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
}
.intel-header.away::after {
  background: #1989fa;
}

.intel-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 12px;
}

.intel-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #f8f9fa 0%, #eef1f5 100%);
  border: 1px solid #eef2f7;
  border-radius: 8px;
  padding: 10px 12px;
}

.intel-item .van-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* 文本正常从左到右排列，允许换行但不逐字断行 */
.intel-item span {
  white-space: normal;
  word-break: keep-all;
}

/* 积分数据 */
.coin-data-content {
  padding: 10px 0;
}

/* 队伍数据表格 */
.team-stats-table {
  margin-bottom: 12px;
}

.team-stats-table:last-child {
  margin-bottom: 0;
}

.team-stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;

  font-size: 13px;
  font-weight: 700;
  color: #333;
}

.team-stats-icon {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.team-stats-header .team-name {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.stats-table {
  background: white;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.stats-header {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr 1fr 1fr;
  gap: 6px;
  padding: 8px 10px;
  background: #f8f9fa;
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-align: center;
}

.stats-data {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr 1fr 1fr;
  gap: 6px;
  padding: 10px 10px;
  font-size: 13px;
  font-weight: 700;
  color: #333;
  text-align: center;
}

.stats-data .col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.stats-data .win {
  color: #fc3c3c;
}

.stats-data .draw {
  color: #ff9800;
}

.stats-data .loss {
  color: #1989fa;
}

.stats-data .highlight {
  color: #fc3c3c;
  font-size: 15px;
  font-weight: 800;
}

/* 简易三列表格：技术统计 */
.simple-compare-table {
  margin-top: 10px;
}

.simple-compare-table .table-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
  border-radius: 8px 8px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
}

.simple-compare-table .table-body {
  background: #fff;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.simple-compare-table .table-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  gap: 8px;
  padding: 12px;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}

.simple-compare-table .table-row:last-child {
  border-bottom: none;
}

.simple-compare-table .col-label {
  color: #666;
  font-weight: 600;
  font-size: 11px;
}

.simple-compare-table .col-home,
.simple-compare-table .col-away {
  text-align: center;
  font-weight: 700;
  color: #333;
  font-size: 14px;
}

/* 比赛事件时间线 */
.event-timeline {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-row {
  display: grid;
  grid-template-columns: 42px 44px 1fr auto;
  align-items: center;
  gap: 8px;
  background: #fff;
  padding: 8px 10px;
  border-radius: 8px;
  border-left: 3px solid #e5e7eb;
}

.event-row.home {
  border-left-color: #fc3c3c;
}
.event-row.away {
  border-left-color: #1989fa;
}

.event-minute {
  font-size: 11px;
  color: #666;
  font-weight: 600;
}

.event-type {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #fff;
  text-align: center;
  font-weight: 700;
}

.event-goal .event-type {
  background: linear-gradient(135deg, #22c55e, #4ade80);
}
.event-yellow .event-type {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.event-red .event-type {
  background: linear-gradient(135deg, #ef4444, #f87171);
}
.event-sub .event-type {
  background: linear-gradient(135deg, #64748b, #94a3b8);
}
.event-other .event-type {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
}

.event-content {
  font-size: 11px;
  color: #333;
}

.event-score {
  font-size: 11px;
  font-weight: 700;
  color: #333;
}

.coin-category {
  margin-bottom: 12px;
}

.category-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-item:active {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
}

.stat-label {
  font-size: 11px;
  color: #999;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.stat-value.win {
  color: #fc3c3c;
}

.stat-value.draw {
  color: #ff9800;
}

.stat-value.loss {
  color: #1989fa;
}
.stat-value.highlight {
  color: #fc3c3c;
  font-size: 18px;
}

/* 历史交锋 */
.history-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.summary-label {
  font-size: 12px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  flex-shrink: 0;
}

.summary-stats {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  flex: 1;
  justify-content: center;
}

.stat-box.win {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
}

.stat-box.draw {
  background: linear-gradient(135deg, #fffbf0 0%, #fff3e0 100%);
}

.stat-box.loss {
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
}

.stat-num {
  font-size: 14px;
  font-weight: 800;
}

.stat-box.win .stat-num {
  color: #fc3c3c;
}

.stat-box.draw .stat-num {
  color: #ff9800;
}

.stat-box.loss .stat-num {
  color: #1989fa;
}

.stat-text {
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.summary-title {
  padding: 10px 12px;
  background: #f8f9fa;
  font-size: 12px;
  font-weight: 700;
  color: #333;
  border-bottom: 1px solid #eee;
}

.summary-content {
  padding: 10px;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.record-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 6px;
  border-radius: 4px;
  transition: transform 0.2s;
}

.record-item:active {
  transform: scale(0.98);
}

.record-item.win {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
}

.record-item.draw {
  background: linear-gradient(135deg, #fffbf0 0%, #fff3e0 100%);
}

.record-item.loss {
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
}

.record-value {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 0;
}

.record-item.win .record-value {
  color: #fc3c3c;
}

.record-item.draw .record-value {
  color: #ff9800;
}

.record-item.loss .record-value {
  color: #1989fa;
}

.record-label {
  font-size: 9px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
}

.summary-desc {
  font-size: 11px;
  color: #666;
  text-align: center;
  padding: 8px 0 0 0;
  border-top: 1px dashed #eee;
}

.summary-text {
  line-height: 1.4;
}

.history-table {
  margin-top: 10px;
}

.history-table .table-header {
  display: grid;
  grid-template-columns: 60px 1fr 50px 1fr 45px 45px;
  gap: 6px;
  padding: 10px 12px;
  background: #f4f5f9;
  border-radius: 6px 6px 0 0;
  font-size: 11px;
  font-weight: 700;
  color: #333;
}

.history-table .table-body {
  background: white;
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.history-table .table-row {
  display: grid;
  grid-template-columns: 60px 1fr 50px 1fr 45px 45px;
  gap: 6px;
  padding: 12px;
  font-size: 11px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.history-table .table-row:last-child {
  border-bottom: none;
}

.history-table .table-row:active {
  background: #f8f9fa;
}

/* 近期战绩区块 */
.team-recent-section {
  margin-bottom: 16px;
}

.team-recent-section:last-child {
  margin-bottom: 0;
}

.team-recent-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #333;
  border-radius: 8px 8px 0 0;
  margin-bottom: 0;
}

.team-recent-title.home {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
  border-left: 4px solid #fc3c3c;
}

.team-recent-title.away {
  background: linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%);
  border-left: 4px solid #1989fa;
}

.team-title-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* 近期战绩表格 */
.record-table {
  margin-top: 0;
}

.record-table .table-header {
  display: grid;
  grid-template-columns: 60px 1fr 50px 1fr 45px 45px;
  gap: 6px;
  padding: 10px 12px;
  background: #f4f5f9;
  border-radius: 0;
  font-size: 11px;
  font-weight: 700;
  color: #333;
}

.record-table .table-body {
  background: white;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.record-table .table-row {
  display: grid;
  grid-template-columns: 60px 1fr 50px 1fr 45px 45px;
  gap: 6px;
  padding: 12px;
  font-size: 11px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.record-table .table-row:last-child {
  border-bottom: none;
}

.record-table .table-row:active {
  background: #f8f9fa;
}

.col-league {
  color: #333;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-home,
.col-away {
  color: #333;
  font-weight: 500;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-score {
  color: #fc3c3c;
  font-weight: 700;
  text-align: center;
  font-size: 11px;
}

.col-goals {
  color: #666;
  font-weight: 600;
  text-align: center;
  font-size: 11px;
}

.col-match {
  color: #333;
  font-weight: 500;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-result {
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
}

.result-badge.win {
  background: linear-gradient(135deg, #ffe5e5 0%, #ffcccc 100%);
  color: #fc3c3c;
}

.result-badge.loss {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1989fa;
}

.result-badge.draw {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #ff9800;
}

/* 首发阵容 - 足球场布局 */
.lineup-content {
  padding: 0;
}

.football-field {
  background: linear-gradient(to bottom, #2d5016 0%, #3d6b1f 50%, #2d5016 100%);
  border-radius: 10px;
  padding: 10px 10px;
  margin: 12px 0;
  position: relative;
  min-height: 240px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 15px;
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.2);
}

/* 球场线条装饰 */
.football-field::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%);
}

.football-field::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.formation-line {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 5px;
  padding: 0 5px;
  position: relative;
  z-index: 1;
}

.player-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  max-width: 65px;
}

.player-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 13px;
  font-weight: 700;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  position: relative;
}

.player-number.home-team {
  background: linear-gradient(135deg, #fc3c3c 0%, #ff6b6b 100%);
}

.player-number.away-team {
  background: linear-gradient(135deg, #1989fa 0%, #42a5f5 100%);
}

.player-number::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent);
  z-index: -1;
}

.player-name {
  font-size: 10px;
  color: white;
  font-weight: 600;
  text-align: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 2px 6px;
  border-radius: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* 无数据文字提示 */
.no-data-text {
  text-align: center;
  color: #999;
  font-size: 11px;
  padding: 16px 0;
}
</style>
