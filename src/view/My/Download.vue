<template>
  <div class="page" role="main">
    <div class="nav-bar-center-wrap">
      <van-nav-bar title="下载APP" left-arrow @click-left="onClickLeft" class="nav-bar" />
    </div>
    <div style="height: 1px; background-color: #f5f5f5"></div>

    <div class="content-wrapper">
      <!-- 1. 顶部图片 -->
      <div class="download-top-img">
        <img src="/img/top.png" class="download-top" alt="下载顶部" />
      </div>
      
      <!-- 2. 二维码 -->
      <div class="qrcode-section">
        <qrcode-vue v-if="downloadLink" :value="downloadLink" :size="120" level="H" class="qrcode" />
        <div class="qrcode-tip">扫码下载APP</div>
      </div>

      <!-- 3. 下载按钮图片 -->
      <div class="download-btn-wrap">
        <img src="/img/android.png" class="download-img" alt="Android下载" @click="downloadAndroid" />
        <img src="/img/ios.png" class="download-img" alt="iOS下载" @click="downloadIOS" />
      </div>

      <!-- 4. 底部图片 -->
      <div class="download-bottom-img">
        <img src="/img/bottom.png" class="download-bottom" alt="下载底部" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { showToast, showLoadingToast, closeToast } from "vant";
import QrcodeVue from "qrcode.vue";
import { API } from "../../request/api";

const router = useRouter();
const downloadLink = ref("");
const androidLink = ref("");
const iosLink = ref("");

onMounted(async () => {
  const loading = showLoadingToast({
    message: "加载中...",
    forbidClick: true,
    duration: 0,
  });

  try {
    // 调用 initConfig 接口获取配置
    const res = await API.initConfig();
    
    if (res.code === 1 && res.data) {
      const config = res.data;
      
      // 获取 Android 下载链接（使用 user_apk_url）
      if (config.user_apk_url) {
        androidLink.value = config.user_apk_url;
        console.log("Android下载链接:", androidLink.value);
      } else {
        androidLink.value = "https://www.baidu.com/";
        console.warn("未配置 Android 下载链接，使用默认链接");
      }
      
      // 获取 iOS 下载链接（使用 user_ios_url）
      if (config.user_ios_url) {
        iosLink.value = config.user_ios_url;
        console.log("iOS下载链接:", iosLink.value);
      } else {
        iosLink.value = "https://www.baidu.com/";
        console.warn("未配置 iOS 下载链接，使用默认链接");
      }
      
      // 二维码使用 Android 链接
      downloadLink.value = androidLink.value;
      
      // 保存配置到 localStorage（可选）
      localStorage.setItem("config", JSON.stringify(config));
    } else {
      throw new Error(res.msg || "获取配置失败");
    }
    
    closeToast();
  } catch (e) {
    console.error("获取下载链接失败:", e);
    closeToast();
    showToast(e.message || "获取下载链接失败");
    
    // 使用默认链接
    downloadLink.value = "https://www.baidu.com/";
    androidLink.value = "https://www.baidu.com/";
    iosLink.value = "https://www.baidu.com/";
  }
});

function downloadAndroid() {
  if (!androidLink.value) {
    showToast("下载链接为空");
    return;
  }
  console.log("打开 Android 下载链接:", androidLink.value);
  window.open(androidLink.value, "_blank");
}

function downloadIOS() {
  if (!iosLink.value) {
    showToast("下载链接为空");
    return;
  }
  console.log("打开 iOS 下载链接:", iosLink.value);
  window.open(iosLink.value, "_blank");
}

function onClickLeft() {
  router.back();
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #0f172a;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  max-width: 430px;
  min-height: 100vh;
  margin: 0 auto;
  position: relative;
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

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.download-top-img {
  width: 66%;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 12px auto;
}

.download-top {
  width: 100%;
  height: auto;
  display: block;
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 12px auto;
}

.qrcode {
  display: block;
  margin-bottom: 10px;
  padding: 6px;
  background-color: #fff;
  border-radius: 8px;
}

.qrcode-tip {
  font-size: 13px;
  color: #666;
  font-weight: 500;
  text-align: center;
}

.download-btn-wrap {
  width: 50%;
  box-sizing: border-box;
  margin: 10px auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.download-img {
  width: 80%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.download-img:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.download-img:active {
  transform: scale(0.98);
}

.download-bottom-img {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px auto 0px;
}

.download-bottom {
  width: 80%;
  height: auto;
  display: block;
  margin: 0 auto;
}
/* 响应式适配 */
@media (max-width: 375px) {
  .download-top-img {
    width: 70%;
    margin: 15px auto;
  }

  .download-bottom-img {
    width: 60%;
    margin: 12px auto 15px;
  }

  .qrcode-section {
    padding: 14px;
    margin: 15px auto;
  }

  .qrcode {
    padding: 5px;
  }

  .qrcode-tip {
    font-size: 12px;
  }

  .download-btn-wrap {
    width: 70%;
    margin: 15px auto;
    gap: 12px;
  }
}
</style>
