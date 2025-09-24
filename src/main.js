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
  .use(Overlay)
  .use(Button)
  .use(Tabbar)
  .use(Icon)
  .use(TabbarItem)
  .use(NavBar)
  .mount("#app");
