<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="邀请店主" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="invite-top-img">
      <img src="/img/storebgtop.jpg" class="invite-top" alt="邀请顶部" />
    </div>
    <div class="invite-bottom-img">
      <img src="/img/storebgbottom.jpg" class="invite-bottom" alt="邀请底部" />
      <div class="qrcode-absolute">
        <qrcode-vue v-if="inviteLink" :value="inviteLink" :size="150" level="H" class="qrcode" />
      </div>
    </div>

    <div class="copy-btn-wrap">
      <div class="btn-row">
        <button class="copy-btn" @click="copy">分享链接</button>
        <button class="download-btn" @click="downloadImage">分享图片</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast, showLoadingToast, closeToast } from "vant";
import QrcodeVue from "qrcode.vue";
import QRCode from "qrcode";

const router = useRouter();
const code = ref("");
const inviteLink = ref("");

onMounted(async () => {
  try {
    const configStr = localStorage.getItem("config");
    if (configStr) {
      const config = JSON.parse(configStr);
      const storeUrl = config.store_url || "";
      
      if (!storeUrl) {
        showToast("店主邀请链接未配置");
        return;
      }
      
      // 直接使用后端提供的 store_url，不添加任何参数
      inviteLink.value = storeUrl;
      
      // 获取用户信息用于下载文件命名
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        code.value = user.recomno || "";
      }
    } else {
      showToast("配置信息未找到");
    }
  } catch (e) {
    console.error("获取配置失败:", e);
    showToast("获取邀请链接失败");
  }
});

function copy() {
  if (!inviteLink.value) {
    showToast("邀请链接为空");
    return;
  }
  navigator.clipboard
    .writeText(inviteLink.value)
    .then(() => {
      showToast("复制成功");
    })
    .catch(() => {
      showToast("复制失败");
    });
}

async function downloadImage() {
  if (!inviteLink.value) {
    showToast("邀请链接为空");
    return;
  }

  const loadingToast = showLoadingToast({
    message: "生成中...",
    forbidClick: true,
    duration: 0,
  });

  try {
    // 加载顶部图片
    const topImg = new Image();
    topImg.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      topImg.onload = resolve;
      topImg.onerror = reject;
      topImg.src = "/img/storebgtop.jpg";
    });

    // 加载底部图片
    const bottomImg = new Image();
    bottomImg.crossOrigin = "anonymous";
    await new Promise((resolve, reject) => {
      bottomImg.onload = resolve;
      bottomImg.onerror = reject;
      bottomImg.src = "/img/storebgbottom.jpg";
    });

    // 根据实际图片尺寸计算 canvas 大小
    const canvasWidth = Math.max(topImg.width, bottomImg.width);
    const topHeight = topImg.height;
    const bottomHeight = bottomImg.height;
    const canvasHeight = topHeight + bottomHeight;

    // 创建 canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 填充白色背景，避免透明区域
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制顶部图片 (使用实际尺寸，居中)
    const topX = (canvasWidth - topImg.width) / 2;
    ctx.drawImage(topImg, topX, 0, topImg.width, topImg.height);

    // 绘制底部图片 (紧贴顶部图片，无缝拼接)
    const bottomX = (canvasWidth - bottomImg.width) / 2;
    ctx.drawImage(bottomImg, bottomX, topHeight, bottomImg.width, bottomImg.height);

    // 生成二维码 (根据图片宽度自适应大小)
    const qrSize = Math.min(canvasWidth * 0.35, 400); // 二维码占图片宽度的35%，最大400px
    const qrCodeDataUrl = await QRCode.toDataURL(inviteLink.value, {
      width: qrSize * 2, // 生成高清二维码
      margin: 1,
      errorCorrectionLevel: "H",
    });

    // 加载二维码图片
    const qrImg = new Image();
    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
      qrImg.src = qrCodeDataUrl;
    });

    // 在底部图片上绘制二维码 (居中，靠近顶部)
    const qrX = (canvasWidth - qrSize) / 2;
    const qrY = topHeight + bottomHeight * 0.24; // 距离底部图片顶部20%的位置

    // 绘制二维码背景（白色圆角矩形）
    const padding = qrSize * 0.08; // 内边距为二维码尺寸的8%
    const bgX = qrX - padding;
    const bgY = qrY - padding;
    const bgSize = qrSize + padding * 2;
    const radius = qrSize * 0.06; // 圆角为二维码尺寸的6%

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(bgX + radius, bgY);
    ctx.lineTo(bgX + bgSize - radius, bgY);
    ctx.quadraticCurveTo(bgX + bgSize, bgY, bgX + bgSize, bgY + radius);
    ctx.lineTo(bgX + bgSize, bgY + bgSize - radius);
    ctx.quadraticCurveTo(bgX + bgSize, bgY + bgSize, bgX + bgSize - radius, bgY + bgSize);
    ctx.lineTo(bgX + radius, bgY + bgSize);
    ctx.quadraticCurveTo(bgX, bgY + bgSize, bgX, bgY + bgSize - radius);
    ctx.lineTo(bgX, bgY + radius);
    ctx.quadraticCurveTo(bgX, bgY, bgX + radius, bgY);
    ctx.closePath();
    ctx.fill();

    // 绘制二维码
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // 转换为 blob 并下载
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `邀请店主-${code.value}.png`;
      a.click();
      URL.revokeObjectURL(url);
      closeToast();
      showToast("下载成功");
    }, "image/png");
  } catch (error) {
    closeToast();
    console.error("下载失败:", error);
    showToast("生成图片失败，请重试");
  }
}

function onClickLeft() {
  router.back();
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #c0ffa1;
  color: #0f172a;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
}
.nav-bar-center-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
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

.invite-top-img {
  width: 100%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.invite-top {
  width: 100%;
  height: auto;
  display: block;
}
.invite-bottom-img {
  width: 100%;
  flex-shrink: 0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.invite-bottom {
  width: 100%;
  height: auto;
  display: block;
}
.qrcode-absolute {
  position: absolute;
  left: 50%;
  top: 22%;
  transform: translate(-50%, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px;
  background-color: #fff;
  border-radius: 12px;
}
.qrcode {
  display: block;
  margin-bottom: 24px;
  padding: 10px;
  background-color: #fff;
  border-radius: 12px;
}
.copy-btn-wrap {
  width: 100%;
  max-width: 340px;
  box-sizing: border-box;
  margin: 0 auto;
  flex-shrink: 0;
  margin: -100px 20px 20px 20px;
  z-index: 1000;
}
.btn-row {
  display: flex;
  gap: 12px;
  width: 100%;
}
.copy-btn {
  flex: 1;
  height: 48px;
  background: #d32121;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(255, 39, 46, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 0;
  
}
.copy-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(255, 39, 46, 0.3);
}
.download-btn {
  flex: 1;
  height: 48px;
  background: linear-gradient(90deg, #4caf50, #45a049);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}
.download-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}
</style>
