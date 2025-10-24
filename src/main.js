import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import {
  Tab,
  Tabs,
  Toast,
  Checkbox,
  CheckboxGroup,
  Cascader,
  Field,
  CellGroup,
  Popup,
  Swipe,
  SwipeItem,
  NoticeBar,
  Tabbar,
  TabbarItem,
  NavBar,
  Button,
  Overlay,
  Icon,
  Dialog,
  Loading,
  PasswordInput,
  NumberKeyboard,
  Empty,
  Skeleton,
  SkeletonTitle,
  SkeletonImage,
  SkeletonAvatar,
  SkeletonParagraph,
  List,
  Step,
  Steps,
} from "vant";

import "vant/lib/index.css";

createApp(App)
  .use(router)
  .use(Tab)
  .use(Tabs)
  .use(Toast)
  .use(Checkbox)
  .use(CheckboxGroup)
  .use(Cascader)
  .use(Field)
  .use(CellGroup)
  .use(Popup)
  .use(Swipe)
  .use(SwipeItem)
  .use(NoticeBar)
  .use(PasswordInput)
  .use(NumberKeyboard)
  .use(Dialog)
  .use(Loading)
  .use(Overlay)
  .use(Skeleton)
  .use(SkeletonTitle)
  .use(SkeletonImage)
  .use(SkeletonAvatar)
  .use(SkeletonParagraph)
  .use(Button)
  .use(Tabbar)
  .use(Icon)
  .use(TabbarItem)
  .use(NavBar)
  .use(Empty)
  .use(List)
  .use(Step)
  .use(Steps)
  .mount("#app");
