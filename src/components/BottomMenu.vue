<template>
  <van-tabbar route fixed :safe-area-inset-bottom="true" active-color="#fc3c3c" inactive-color="#b7b7b7" placeholder>
    <van-tabbar-item to="/home">
      <span style="font-weight: 500">首页</span>
      <template #icon="props">
        <img style="width: 1.8rem; height: 1.8rem" :src="props.active ? icon1.active : icon1.inactive" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item to="/game">
      <span style="font-weight: 500">赛事</span>
      <template #icon="props">
        <img style="width: 1.8rem; height: 1.8rem" :src="props.active ? iconlive.active : iconlive.inactive" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item to="/expert">
      <template #icon="props">
        <img style="width: 3.2rem; height: 3.2rem; margin-top: -1.2rem" :src="props.active ? icon2.active : icon2.inactive" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item to="/community">
      <span style="font-weight: 500">社区</span>
      <template #icon="props">
        <img style="width: 1.8rem; height: 1.8rem" :src="props.active ? icon3.active : icon3.inactive" />
      </template>
    </van-tabbar-item>
    <van-tabbar-item to="/my">
      <span style="font-weight: 500">我的</span>
      <template #icon="props">
        <img style="width: 2rem; height: 2rem" :src="props.active ? icon4.active : icon4.inactive" />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<script>
export default {
  name: "BottomMenu",
  setup() {
    const icon1 = {
      active: "/tabicon/icon1.png",
      inactive: "/tabicon/icon11.png",
    };
    const iconlive = {
      active: "/tabicon/icon3.png",
      inactive: "/tabicon/icon33.png",
    };
    const icon2 = {
      active: "/tabicon/icon22.png",
      inactive: "/tabicon/icon2.png",
    };
    const icon3 = {
      active: "/tabicon/icon4.png",
      inactive: "/tabicon/icon44.png",
    };
    const icon4 = {
      active: "/tabicon/icon5.png",
      inactive: "/tabicon/icon55.png",
    };
    return {
      icon1,
      icon2,
      icon3,
      icon4,
      iconlive,
    };
  },
};
</script>

<style scoped></style>
