<script setup>
import { useRoute } from "vue-router";
import BottomMenu from "./components/BottomMenu.vue";

const route = useRoute();
const hideMenu = ["/home", "/expert", "/game", "/community", "/my"];
</script>

<template>
  <div class="app-shell">
    <div class="container">
      <router-view />
      <BottomMenu v-if="hideMenu.includes(route.path)" />
    </div>
  </div>
</template>

<style>
body {
  height: auto;
  margin: 0;
  padding: 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  background-color: #fff;
  /* 浅灰背景 */
}

:root:root {
  --van-tab-font-size: 0.9rem;
  --van-tab-active-text-color: #000;
  --van-tab-text-color: #bdbdbd;
  --van-toast-text-padding: 0.8rem 1.4rem;
  --van-toast-radius: 0.4rem;
  --van-toast-font-size: 0.86rem;
  --van-toast-background: rgba(0, 0, 0, 0.7);
  --van-notice-bar-icon-min-width: 62px;
  --van-tabbar-height: 3.6rem;
  --van-nav-bar-background: #e33212;
  --van-dialog-confirm-button-text-color: #e33212;
  --van-nav-bar-icon-color: #333;
  --van-nav-bar-arrow-size: 22px;
  --van-nav-bar-height: 52px;
  --van-loading-text-color: #a3a3a3;
  --van-tabs-bottom-bar-color: #e33212;
  --van-number-keyboard-z-index: 10000;
  --van-tabs-default-color: #fc3c3c;

  .van-cell {
    position: relative;
    display: flex;
    box-sizing: border-box;
    width: 100%;
    padding: var(--van-cell-vertical-padding) var(--van-cell-horizontal-padding);
    overflow: hidden;
    color: var(--van-cell-text-color);
    font-size: 0.8rem;
    line-height: var(--van-cell-line-height);
    background: var(--van-cell-background);
  }

  .van-notice-bar {
    position: relative;
    display: flex;
    align-items: center;
    height: 46px;
    padding: var(--van-notice-bar-padding);
    color: #000;
    font-size: 14px;
    line-height: var(--van-notice-bar-line-height);
    background: #fff;
    border-radius: 8px;
  }

  .van-tabbar {
    z-index: var(--van-tabbar-z-index);
    display: flex;
    box-sizing: border-box;
    width: 100%;
    max-width: 430px;
    height: var(--van-tabbar-height);
    background: var(--van-tabbar-background);
    margin-left: auto;
    margin-right: auto;
    left: 50%;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
  }

  .van-overlay {
    position: fixed;
    top: 0;
    left: 0;
    z-index: var(--van-overlay-z-index);
    width: 102%;
    height: 102%;
    background: var(--van-overlay-background);
  }

  .van-password-input__security li {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 90%;
    color: var(--van-password-input-text-color);
    font-size: var(--van-password-input-font-size);
    line-height: 1;
    background: #f2f3f5;
    border-radius: 4px;
  }

  .van-dialog__message {
    color: var(--van-text-color);
    flex: 1;
    max-height: var(--van-dialog-message-max-height);
    padding: 22px 18px;
    overflow-y: auto;
    font-size: 1rem;
    line-height: 1;
    white-space: pre-wrap;
    text-align: center;
    word-wrap: break-word;
    -webkit-overflow-scrolling: touch;
  }


  .van-toast {
    display: flex;
    flex-direction: column;
    white-space: pre-wrap;
    word-break: break-all;
    text-align: center;
    background: rgb(0 0 0 / 88%);
    border-radius: var(--van-toast-radius);
}
}
</style>
