<template>
  <div class="page">
    <!-- 自定义导航栏 - 白色背景，黑色文字 -->
    <div class="custom-navbar">
      <div class="navbar-left" @click="goBack">
        <van-icon name="arrow-left" size="20" />
      </div>
      <div class="navbar-title">跟单详情</div>
      <div class="navbar-right"></div>
    </div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" type="spinner" size="24px" vertical class="loading-container">
      加载中...
    </van-loading>

    <!-- 内容区域 -->
    <div v-else-if="gendanInfo" class="content">
      <!-- 发单人信息区域 -->
      <div class="user-section">
        <!-- 头像 -->
        <div class="user-avatar">
          <img :src="getUserAvatar()" :alt="getUserNickname()" />
        </div>

        <!-- 名字和关注按钮 -->
        <div class="user-name-row">
          <span class="user-name">{{ getUserNickname() }}</span>
          <button :class="['follow-btn', { 'followed': isFollowed }]" @click="toggleFollow">
            {{ getFollowButtonText() }}
          </button>
        </div>

        <!-- 粉丝数 -->
        <div class="user-fans">粉丝：{{ getUserFans() }}</div>

        <!-- 数据统计 -->
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ getUserPrize() }}</div>
            <div class="stat-label">带红人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ get7DayProfit() }}</div>
            <div class="stat-label">跟单盈利率</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ getHitRate() }}</div>
            <div class="stat-label">近5期命中</div>
          </div>
        </div>

        <!-- 最近走势 -->
        <div class="trend-section">
          <div class="trend-label">最近走势</div>
          <div class="trend-list">
            <span v-for="(item, index) in getTrendList()" :key="index" :class="['trend-dot', item.status]">
              {{ item.status === 'win' ? '中' : '未' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 下注卡片 -->
      <div class="bet-card">
        <!-- 标题行 -->
        <div class="bet-header">
          <span class="bet-title">{{ gendanInfo.cate_name || '竞彩足球' }}（{{ gendanInfo.rules || '2串1' }}）</span>
          <span class="bet-deadline">{{ formattedShortTime }} 截止</span>
        </div>

        <!-- 发单描述 -->
        <div class="bet-description">
          {{ gendanInfo.content || '暂无说明' }}
        </div>

        <!-- 金额信息 -->
        <div class="bet-info-row">
          <div class="bet-info-item">
            <span class="bet-info-label">自购金额</span>
            <span class="bet-info-value">{{ gendanInfo.amount || '0' }}元</span>
          </div>
          <div class="bet-info-item">
            <span class="bet-info-label">单倍金额</span>
            <span class="bet-info-value">{{ singleBetAmount }}元</span>
          </div>
          <div class="bet-info-item">
            <span class="bet-info-label">佣金</span>
            <span class="bet-info-value">{{ gendanInfo.commission || '0' }}%</span>
          </div>
          <div class="bet-info-item">
            <span class="bet-info-label">预估回报率</span>
            <span class="bet-info-value highlight">{{ gendanInfo.multi || '0' }}倍</span>
          </div>
        </div>

      </div>

      <!-- 投注信息卡片 -->
      <div class="bet-info-card">
        <div class="card-title">投注信息</div>
        <div v-if="isPlanVisible" class="bet-content">
          <!-- 比赛信息 (足球/篮球) -->
          <div v-if="gendanInfo.order?.games && gendanInfo.order.games.length > 0" class="games-list">
            <div v-for="game in gendanInfo.order.games" :key="game.id" class="game-item">
              <div class="game-header">
                <span class="game-number">{{ game.xuhao }}</span>
                <span class="game-league">{{ game.match?.name || '联赛' }}</span>
                <span class="game-time">{{ game.date }}</span>
              </div>
              <div class="game-teams">
                <span class="team-name">{{ game.home_team_name }}</span>
                <span class="vs">VS</span>
                <span class="team-name">{{ game.guest_team_name }}</span>
              </div>
              
              <!-- 投注选项 -->
              <div class="bet-options">
                <div v-for="rate in game.rates" :key="rate.id" class="bet-option">
                  <div class="option-type">{{ getRateTypeName(rate.rate_type) }}{{ rate.rangqiu === 1 ? '(让球)' : '' }}</div>
                  <div class="option-items">
                    <div
                      v-for="(option, key) in getFilteredOptions(rate)"
                      :key="key"
                      :class="['option-item', { 'selected': isOptionSelected(game.id, rate.id, key) }]"
                    >
                      <span class="option-name">{{ option.name }}</span>
                      <span class="option-value">{{ option.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 数字彩票内容 -->
          <div v-else-if="gendanInfo.order?.odds" class="lottery-content">
            <!-- 大乐透 -->
            <div v-if="gendanInfo.cate_id === 5" class="lottery-list">
              <div v-for="(item, index) in gendanInfo.order.odds" :key="index" class="lottery-item">
                <div class="ball-zone">
                  <span class="zone-label">前区</span>
                  <div class="number-list">
                    <span v-for="num in item.front" :key="'front-' + num" class="number-ball red-ball">
                      {{ String(num).padStart(2, '0') }}
                    </span>
                  </div>
                </div>
                <div class="ball-zone">
                  <span class="zone-label">后区</span>
                  <div class="number-list">
                    <span v-for="num in item.back" :key="'back-' + num" class="number-ball blue-ball">
                      {{ String(num).padStart(2, '0') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 排列三/五/七星彩 等其他数字彩票 -->
            <div v-else class="lottery-list">
              <div class="bet-placeholder">
                <p>{{ gendanInfo.cate_name || '彩票' }}投注内容</p>
              </div>
            </div>
          </div>

          <!-- 无数据 -->
          <div v-else class="bet-placeholder">
            <p>暂无投注内容</p>
          </div>
        </div>
        <div v-else class="bet-locked">
          <van-icon name="lock" size="20" color="#969799" />
          <span>保密</span>
        </div>
      </div>

      <!-- 跟单用户卡片 -->
      <div class="followers-card">
        <div class="card-title">跟单用户</div>
        <div v-if="hasFollowers" class="followers-list">
          <div class="follower-item" v-for="(follower, index) in getFollowersList()" :key="index">
            <img :src="follower.avatar" class="follower-avatar" />
            <span class="follower-name">{{ encryptName(follower.name) }}</span>
            <span class="follower-amount">{{ follower.amount }}元</span>
          </div>
        </div>
        <div v-else class="no-followers">
          <span>暂无跟单用户</span>
        </div>
      </div>
    </div>

    <!-- 底部固定区域 -->
    <div v-if="!loading && gendanInfo" class="bottom-bar">
      <!-- 温馨提示 -->
      <div class="warm-tips">
        购彩有节制，请理性投注避免沉迷过度购彩
      </div>

      <!-- 选择倍数 -->
      <div class="multiple-section">
        <span class="multiple-label">选择倍数</span>
        <div class="multiple-control">
          <button class="multiple-btn" @click="decreaseMultiple" :disabled="selectedMultiple <= 1">-</button>
          <input
            type="number"
            v-model.number="selectedMultiple"
            class="multiple-input"
            min="1"
            max="99999"
            @input="onMultipleInput"
            @blur="validateMultiple"
          />
          <button class="multiple-btn" @click="increaseMultiple" :disabled="selectedMultiple >= 99999">+</button>
        </div>
      </div>

      <!-- 总金额和跟单按钮 -->
      <div class="bottom-action">
        <div class="total-amount">
          <span class="total-label">共</span>
          <span class="total-value">{{ totalAmount }}</span>
          <span class="total-unit">元</span>
        </div>
        <button class="gendan-btn" @click="confirmGendan">跟单</button>
      </div>
    </div>

    <!-- 空状态 -->
    <van-empty v-if="!loading && !gendanInfo" description="暂无数据" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showConfirmDialog, showDialog } from 'vant';
import API from '../../request/api';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const gendanInfo = ref(null);
const isFollowed = ref(false);
const selectedMultiple = ref(1); // 选择的倍数
const userBalance = ref(0); // 用户余额

// 获取用户头像
const getUserAvatar = () => {
  if (gendanInfo.value?.user?.avatar) {
    return gendanInfo.value.user.avatar;
  }
  return gendanInfo.value?.avatar || '/icons/avatar.png';
};

// 获取用户昵称
const getUserNickname = () => {
  if (gendanInfo.value?.user?.nickname) {
    return gendanInfo.value.user.nickname;
  }
  return gendanInfo.value?.nickname || '未知用户';
};

// 获取粉丝数
const getUserFans = () => {
  if (gendanInfo.value?.user?.fans !== undefined) {
    return gendanInfo.value.user.fans;
  }
  return gendanInfo.value?.fans_count || 0;
};

// 获取关注按钮文字
const getFollowButtonText = () => {
  const followStatus = gendanInfo.value?.user?.is_follow;
  if (followStatus === 2) {
    return '互相关注';
  } else if (followStatus === 1) {
    return '已关注';
  } else {
    return '+ 关注';
  }
};

// 获取带红人数（累计中奖金额改为带红人数）
const getUserPrize = () => {
  // 使用 user.hong 带红人数
  if (gendanInfo.value?.user?.hong !== undefined) {
    return gendanInfo.value.user.hong;
  }
  return '0';
};

// 获取跟单人数
const getFollowerCount = () => {
  return gendanInfo.value?.mood || 0;
};

// 计算单倍金额
const singleBetAmount = computed(() => {
  const amount = parseFloat(gendanInfo.value?.amount || 0);
  const multi = parseFloat(gendanInfo.value?.order?.multi || 1);
  if (multi === 0) return '0.00';
  return (amount / multi).toFixed(2);
});

// 是否有跟单用户
const hasFollowers = computed(() => {
  const followers = gendanInfo.value?.log || [];
  return followers.length > 0;
});

// 获取跟单用户列表
const getFollowersList = () => {
  const followers = gendanInfo.value?.log || [];
  // 如果后端返回的数据结构不同，需要适配
  return followers.map(item => ({
    avatar: item.avatar || '/icons/avatar.png',
    name: item.name || item.nickname || item.username || '用户',
    amount: item.amount || item.gendan_amount || '0'
  }));
};

// 方案是否可见（判断是否到公开时间）
const isPlanVisible = computed(() => {
  if (!gendanInfo.value) return false;

  // 如果 is_publish = 1，立即公开
  if (gendanInfo.value.is_publish === 1) {
    return true;
  }

  // 如果 is_publish = 0，截止后公开
  // 判断当前时间是否已过截止时间
  if (gendanInfo.value.deal_time) {
    const now = Math.floor(Date.now() / 1000);
    return now >= gendanInfo.value.deal_time;
  }

  return false;
});

// 格式化截止时间（短格式：MM-DD HH:mm）
const formattedShortTime = computed(() => {
  if (!gendanInfo.value || !gendanInfo.value.deal_time) {
    return '';
  }
  const date = new Date(gendanInfo.value.deal_time * 1000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
});

// 获取跟单盈利率
const get7DayProfit = () => {
  // 使用 user.gd_yl 跟单盈利率
  if (gendanInfo.value?.user?.gd_yl !== undefined) {
    return gendanInfo.value.user.gd_yl + '%';
  }
  return '0%';
};

// 获取近5期命中数
const getHitRate = () => {
  // jw_zj 是近5期战绩数组，统计命中数量
  if (gendanInfo.value?.jw_zj && Array.isArray(gendanInfo.value.jw_zj)) {
    const hitCount = gendanInfo.value.jw_zj.filter(item => item === 1).length;
    const totalCount = gendanInfo.value.jw_zj.length;
    return `${hitCount}/${totalCount}`;
  }
  return '0/5';
};

// 获取最近走势（近5期战绩）
const getTrendList = () => {
  // jw_zj 数组：0=未中，1=中
  if (gendanInfo.value?.jw_zj && Array.isArray(gendanInfo.value.jw_zj)) {
    // 只取最新的 5 条数据
    const recentData = gendanInfo.value.jw_zj.slice(-5);
    return recentData.map(item => ({
      status: item === 1 ? 'win' : 'lose'
    }));
  }

  return Array(5).fill({ status: 'lose' });
};

// 计算总金额（单倍金额 × 选择倍数）
const totalAmount = computed(() => {
  const singleAmount = parseFloat(singleBetAmount.value || 0);
  return (singleAmount * selectedMultiple.value).toFixed(2);
});

// 增加倍数
const increaseMultiple = () => {
  if (selectedMultiple.value < 99999) {
    selectedMultiple.value++;
  }
};

// 减少倍数
const decreaseMultiple = () => {
  if (selectedMultiple.value > 1) {
    selectedMultiple.value--;
  }
};

// 倍数输入验证
const onMultipleInput = (e) => {
  let value = e.target.value;
  // 移除非数字字符
  value = value.replace(/[^\d]/g, "");
  // 限制范围
  if (value === "") {
    selectedMultiple.value = "";
  } else {
    let num = parseInt(value);
    if (num < 1) num = 1;
    if (num > 99999) num = 99999;
    selectedMultiple.value = num;
  }
};

// 失去焦点时验证
const validateMultiple = () => {
  if (!selectedMultiple.value || selectedMultiple.value < 1) {
    selectedMultiple.value = 1;
  } else if (selectedMultiple.value > 99999) {
    selectedMultiple.value = 99999;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 切换关注状态
const toggleFollow = async () => {
  try {
    const userId = gendanInfo.value?.user?.id;
    if (!userId) {
      showToast('用户信息错误');
      return;
    }

    console.log('关注/取关用户，ID:', userId);
    const res = await API.addFollow(userId);
    console.log('关注/取关结果:', res);

    if (res.code === 1) {
      // 切换关注状态
      isFollowed.value = !isFollowed.value;
      showToast(isFollowed.value ? '关注成功' : '取消关注');

      // 更新用户数据中的关注状态
      if (gendanInfo.value?.user) {
        gendanInfo.value.user.is_follow = isFollowed.value ? 1 : 0;
      }
    } else {
      showToast(res.msg || '操作失败，请稍后重试');
    }
  } catch (error) {
    console.error('关注/取关失败:', error);
    showToast('操作失败，请稍后重试');
  }
};

// 确认跟单
const confirmGendan = async () => {
  try {
    // 弹窗二次确认
    await showConfirmDialog({
      title: '确认跟单',
      message: `确认跟单金额：${totalAmount.value}元？`,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    });

    // 调用跟单下单接口
    const gendanId = route.query.id;
    const payload = {
      multi: selectedMultiple.value, // 使用用户选择的倍数
      upload_bill: 1, // 是否传票：0=不传票，1=传票
    };

    // 如果是足球彩票，需要传递 games 参数
    if (gendanInfo.value?.order?.game_ids) {
      const gameIds = gendanInfo.value.order.game_ids;
      // 将字符串 "829,830" 转换为数组 [829, 830]
      if (typeof gameIds === 'string') {
        payload.games = gameIds.split(',').map(id => id.trim());
      } else if (Array.isArray(gameIds)) {
        payload.games = gameIds;
      }
    }

    console.log('跟单下单参数:', { id: gendanId, payload });
    const res = await API.gendanadd_order(gendanId, payload);
    console.log('跟单下单结果:', res);

    if (res.code === 1) {
      // 下单成功后，调用支付接口
      const orderId = res.data?.id || res.data?.order_id || '';
      
      if (orderId) {
        try {
          // 调用余额支付接口
          const payRes = await API.toBalance({ id: orderId });
          
          if (payRes.code === 1) {
            // 支付成功
            showToast('跟单成功');
            setTimeout(() => {
              // 跳转到下单成功页面
              router.replace({
                path: '/bet_success',
                query: { orderId }
              });
            }, 1500);
          } else {
            // 支付失败
            if (payRes.msg === '资金不足') {
              // 获取最新余额
              try {
                const balanceRes = await API.balanceof();
                if (balanceRes.code === 1 && balanceRes.data) {
                  userBalance.value = parseFloat(balanceRes.data.all_amount);
                }
              } catch (error) {
                console.error('获取余额失败:', error);
              }

              // 显示余额不足对话框
              showDialog({
                message: `资金不足,去充值<br/><div style="font-size: 14px; color: #999;padding-top: 20px;">当前余额：¥${userBalance.value.toFixed(2)}</div>`,
                messageAlign: 'center',
                title: '温馨提示',
                showCancelButton: true,
                confirmButtonText: '去充值',
                cancelButtonText: '取消',
                allowHtml: true,
              })
                .then(() => {
                  router.push('/recharge');
                })
                .catch(() => {
                  console.log('用户取消充值');
                });
            } else {
              showToast(payRes.msg || '支付失败');
            }
          }
        } catch (error) {
          console.error('余额支付失败:', error);
          showToast('支付失败');
        }
      } else {
        showToast('订单ID获取失败');
      }
    } else {
      showToast(res.msg || '跟单失败，请稍后重试');
    }
  } catch (error) {
    // 用户取消跟单
    if (error === 'cancel') {
      return;
    }
    console.error('跟单下单失败:', error);
    showToast('跟单失败，请稍后重试');
  }
};

// 获取跟单详情
const getGendanDetail = async () => {
  try {
    loading.value = true;
    const id = route.query.id;
    
    if (!id) {
      showToast('缺少跟单ID');
      router.back();
      return;
    }

    console.log('获取跟单详情，ID:', id);
    const res = await API.getgendanInfo(id);
    console.log('跟单详情数据:', res);

    if (res.code === 1 && res.data) {
      gendanInfo.value = res.data;

      // 初始化关注状态：0=未关注，1=关注，2=互关
      if (res.data.user?.is_follow !== undefined) {
        isFollowed.value = res.data.user.is_follow >= 1;
      }
    } else {
      showToast(res.msg || '获取详情失败');
    }
  } catch (error) {
    console.error('获取跟单详情失败:', error);
    showToast('获取详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取用户余额
const getUserBalance = async () => {
  try {
    const balanceRes = await API.balanceof();
    if (balanceRes.code === 1 && balanceRes.data) {
      userBalance.value = parseFloat(balanceRes.data.all_amount);
    }
  } catch (error) {
    console.error('获取用户余额失败:', error);
  }
};

// 获取投注类型名称
const getRateTypeName = (rateType) => {
  const typeNames = {
    1: '胜平负',
    2: '让球胜平负',
    3: '比分',
    4: '总进球',
    5: '半全场',
    6: '胜负',
    7: '让分胜负',
    8: '大小分',
    9: '胜分差'
  };
  return typeNames[rateType] || '未知';
};

// 过滤掉隐藏的选项（value为-1的选项）
const getFilteredOptions = (rate) => {
  if (!rate.options) return {};
  const filtered = {};
  Object.keys(rate.options).forEach(key => {
    if (rate.options[key].value !== '-1' && rate.options[key].value !== -1) {
      filtered[key] = rate.options[key];
    }
  });
  return filtered;
};

// 判断选项是否被选中
const isOptionSelected = (gameId, rateId, optionKey) => {
  if (!gendanInfo.value?.order?.odds) return false;
  
  // odds 是一个数组，每个元素包含选中的投注信息
  const selectedOdds = gendanInfo.value.order.odds;
  
  // 查找是否有匹配的选项
  return selectedOdds.some(odd => {
    // 检查是否匹配游戏ID和选项
    return odd.game_id === gameId && 
           odd.rate_id === rateId && 
           odd.option === optionKey;
  });
};

// 加密用户名（后4位显示****，不足4位只显示首位）
const encryptName = (name) => {
  if (!name) return '****';
  
  const nameStr = String(name);
  const len = nameStr.length;
  
  if (len <= 1) {
    // 只有1个字符，直接返回
    return nameStr;
  } else if (len <= 4) {
    // 2-4个字符，只显示首位，其余用*代替
    return nameStr.charAt(0) + '*'.repeat(len - 1);
  } else {
    // 5个字符以上，显示前面部分，后4位用****代替
    return nameStr.substring(0, len - 4) + '****';
  }
};

onMounted(() => {
  getGendanDetail();
  getUserBalance(); // 页面加载时获取用户余额
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  max-width: 430px;
  margin: 0 auto;
}

/* 自定义导航栏 */
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  max-width: 430px;
  margin: 0 auto;
  height: 46px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 999;
}

.navbar-left {
  width: 40px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.navbar-left .van-icon {
  color: #323233;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.navbar-right {
  width: 40px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
  margin-top: 46px;
}

.content {
  padding-top: 46px;
  padding-bottom: 140px;
}

/* 发单人信息区域 */
.user-section {
  background: #ffffff;
  padding: 14px 16px;
  margin: 12px;
  border-radius: 8px;
  text-align: center;
}

.user-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 6px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 6px;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #323233;
}

.follow-btn {
  padding: 4px 12px;
  background: #fc3c3c;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
}

.follow-btn.followed {
  background: #969799;
}

.user-fans {
  font-size: 14px;
  color: #969799;
  margin-bottom: 4px;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
  border-top: 1px solid #f5f5f5;
  border-bottom: 1px solid #f5f5f5;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}

.trend-section {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-label {
  font-size: 13px;
  color: #646566;
}

.trend-list {
  display: flex;
  gap: 8px;
  align-items: center;
}

.trend-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.trend-dot.win {
  background: #fc3c3c;
  color: #ffffff;
}

.trend-dot.lose {
  background: #dcdee0;
  color: #ffffff;
}

/* 下注卡片 */
.bet-card {
  background: #ffffff;
  margin: 12px;
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
}

.bet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #ffffff;
  margin-bottom: 0;
  border-bottom: 1px solid #e5e5e5;
}

.bet-title {
  font-size: 13px;
  font-weight: 600;
  color: #323233;
}

.bet-deadline {
  font-size: 13px;
  color: #333;
}

.bet-description {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.6;
  padding: 12px 16px;
  background: #ffffff;
}

.bet-info-row {
  display: flex;
  justify-content: space-between;
  padding: 14px;
  border-top: 1px solid #f5f5f5;
}

.bet-info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bet-info-label {
  font-size: 12px;
  color: #969799;
}

.bet-info-value {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.bet-info-value.highlight {
  color: #fc3c3c;
}

/* 投注信息卡片 */
.bet-info-card {
  background: #ffffff;
  margin: 12px;
  padding: 16px;
  border-radius: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 12px;
}

.bet-content {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

/* 比赛列表 */
.games-list {
  padding: 12px;
}

.game-item {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.game-item:last-child {
  margin-bottom: 0;
}

.game-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
}

.game-number {
  background: #fc3c3c;
  color: white;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 600;
}

.game-league {
  color: #646566;
  flex: 1;
}

.game-time {
  color: #969799;
  font-size: 11px;
}

.game-teams {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 0;
  font-size: 14px;
  font-weight: 500;
}

.team-name {
  color: #323233;
}

.vs {
  color: #969799;
  font-size: 12px;
}

.bet-options {
  margin-top: 12px;
}

.bet-option {
  margin-bottom: 10px;
}

.bet-option:last-child {
  margin-bottom: 0;
}

.option-type {
  font-size: 12px;
  color: #646566;
  margin-bottom: 6px;
  font-weight: 500;
}

.option-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.option-item {
  flex: 1;
  min-width: 70px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.option-item.selected {
  background: #fff5f5;
  border-color: #fc3c3c;
}

.option-name {
  font-size: 13px;
  color: #323233;
  font-weight: 500;
}

.option-item.selected .option-name {
  color: #fc3c3c;
}

.option-value {
  font-size: 14px;
  color: #fc3c3c;
  font-weight: 600;
}

/* 数字彩票内容 */
.lottery-content {
  padding: 12px;
}

.lottery-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lottery-item {
  background: #fff;
  border-radius: 6px;
  padding: 12px;
}

.ball-zone {
  margin-bottom: 10px;
}

.ball-zone:last-child {
  margin-bottom: 0;
}

.zone-label {
  font-size: 12px;
  color: #646566;
  margin-right: 8px;
  font-weight: 500;
}

.number-list {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 6px;
}

.number-ball {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.red-ball {
  background: linear-gradient(135deg, #fc3c3c 0%, #e63535 100%);
}

.blue-ball {
  background: linear-gradient(135deg, #1989fa 0%, #0969da 100%);
}

.bet-placeholder {
  text-align: center;
  color: #969799;
  font-size: 13px;
  padding: 20px 0;
}

.bet-locked {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 20px 0;
  color: #969799;
  font-size: 13px;
}

/* 跟单用户卡片 */
.followers-card {
  background: #ffffff;
  margin: 12px;
  padding: 16px;
  margin-bottom: 160px;
  border-radius: 8px;
}

.followers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.follower-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 2px;
}

.follower-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.follower-name {
  flex: 1;
  font-size: 14px;
  color: #323233;
}

.follower-amount {
  font-size: 13px;
  color: #fc3c3c;
  font-weight: 600;
}

.no-followers {
  text-align: center;
  padding: 20px 0;
  color: #969799;
  font-size: 13px;
}

/* 底部固定区域 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 430px;
  margin: 0 auto;
  background: #ffffff;
  border-top: 1px solid #f5f5f5;
  padding: 0;
  z-index: 100;
}

.warm-tips {
  background: #fd6d6d;
  color: #ffffff;
  font-size: 12px;
  text-align: center;
  padding: 8px 16px;
  line-height: 1.4;
}

.multiple-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 8px;
}

.multiple-label {
  font-size: 14px;
  color: #323233;
}

.multiple-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.multiple-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dcdee0;
  background: #ffffff;
  color: #323233;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.multiple-btn:active {
  background: #f5f5f5;
}

.multiple-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  border-color: #f0f0f0;
  cursor: not-allowed;
}

.multiple-input {
  width: 66px;
  height: 32px;
  text-align: center;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 700;
  color: #fc3c3c;
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

.bottom-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px 8px;
}

.total-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.total-label {
  font-size: 13px;
  color: #646566;
}

.total-value {
  font-size: 24px;
  font-weight: 600;
  color: #fc3c3c;
}

.total-unit {
  font-size: 13px;
  color: #646566;
}

.gendan-btn {
  padding: 10px 32px;
  background: #fc3c3c;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.gendan-btn:active {
  background: #e63535;
}

</style>

