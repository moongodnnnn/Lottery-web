import { createRouter, createWebHistory } from "vue-router";
import Login from "../view/login.vue";
import Register from "../view/register.vue";
import Home from "../view/Home/home.vue";
import expert from "../view/Home/expert.vue";
import game from "../view/Home/game.vue";
import community from "../view/Home/community.vue";
import my from "../view/Home/my.vue";
import Forgetpassword from "../view/forgetpassword.vue";
import Forgotusername from "../view/Forgotusername.vue";
import setting from "../view/My/Setting.vue";
import Lottery_results from "../view/Home/Lottery_results.vue";
import daletou from "../view/Game/daletou.vue";
import Recharge from "../view/My/Recharge.vue";
import Withdraw from "../view/My/Withdraw.vue";
import Authentication from "../view/My/Authentication.vue";
import Football_lottery from "../view/Game/Football_lottery.vue";
import Basketball_lottery from "../view/Game/Basketball_lottery.vue";
import Basketball_confirm_bet from "../view/Game/Basketball_confirm_bet.vue";
import Confirm_bet from "../view/Game/Confirm_bet.vue";
import Pl3 from "../view/Game/Pl3.vue";
import Pl5 from "../view/Game/Pl5.vue";
import Seven_stars from "../view/Game/Seven_stars.vue";
import Lottery_bet from "../view/Game/Lottery_bet.vue";
import My_order from "../view/My/My_order.vue";
import Bet_success from "../view/Game/Bet_success.vue";
import Order_detail from "../view/My/Order_detail.vue";
import Publish_order from "../view/Game/Publish_order.vue";
import Gendan_detail from "../view/Home/Gendan_detail.vue";
import Account_detail from "../view/My/Account_detail.vue";
import Follow from "../view/My/Follow.vue";
import CardCenter from "../view/My/CardCenter.vue";
import AddBankCard from "../view/My/AddBankCard.vue";
import MessageCenter from "../view/My/MessageCenter.vue";
import WithdrawPassword from "../view/My/Withdraw_password.vue";
import Invite_friends from "../view/My/Invite_friends.vue";
import Invite_store from "../view/My/Invite_store.vue";
import Invite_records from "../view/My/Invite_records.vue";
import User_detail from "../view/My/User_detail.vue";
import Prize_optimize from "../view/Game/Prize_optimize.vue";
import Lottery_detail from "../view/Home/Lottery_detail.vue";
import Search from "../view/Home/Search.vue";
import Match_analysis from "../view/Game/Match_analysis.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  { path: "/home", name: "Home", component: Home },
  { path: "/expert", name: "Expert", component: expert },
  { path: "/game", name: "Game", component: game },
  { path: "/community", name: "Community", component: community },
  { path: "/my", name: "My", component: my },
  { path: "/forgetpassword", name: "Forgetpassword", component: Forgetpassword },
  { path: "/forgotusername", name: "Forgotusername", component: Forgotusername },
  { path: "/setting", name: "Setting", component: setting },
  { path: "/lottery_results", name: "Lottery_results", component: Lottery_results },
  { path: "/daletou", name: "Daletou", component: daletou },
  { path: "/recharge", name: "Recharge", component: Recharge },
  { path: "/withdraw", name: "Withdraw", component: Withdraw },
  { path: "/authentication", name: "Authentication", component: Authentication },
  { path: "/Football_lottery", name: "Football_lottery", component: Football_lottery },
  { path: "/Basketball_lottery", name: "Basketball_lottery", component: Basketball_lottery },
  { path: "/Confirm_bet", name: "Confirm_bet", component: Confirm_bet },
  { path: "/Basketball_confirm_bet", name: "Basketball_confirm_bet", component: Basketball_confirm_bet },
  { path: "/pl3", name: "Pl3", component: Pl3 },
  { path: "/pl5", name: "Pl5", component: Pl5 },
  { path: "/qxc", name: "Qxc", component: Seven_stars },
  { path: "/lottery_bet", name: "Lottery_bet", component: Lottery_bet },
  { path: "/My_order", name: "My_order", component: My_order },
  { path: "/bet_success", name: "Bet_success", component: Bet_success },
  { path: "/order_detail", name: "Order_detail", component: Order_detail },
  { path: "/publish_order", name: "Publish_order", component: Publish_order },
  { path: "/gendan_detail", name: "Gendan_detail", component: Gendan_detail },
  { path: "/account_detail", name: "Account_detail", component: Account_detail },
  { path: "/follow", name: "Follow", component: Follow },
  { path: "/card-center", name: "CardCenter", component: CardCenter },
  { path: "/add-bank-card", name: "AddBankCard", component: AddBankCard },
  { path: "/message-center", name: "MessageCenter", component: MessageCenter },
  { path: "/withdraw-password", name: "WithdrawPassword", component: WithdrawPassword },
  { path: "/invite-friends", name: "Invite_friends", component: Invite_friends },
  { path: "/invite-store", name: "Invite_store", component: Invite_store },
  { path: "/invite-records", name: "Invite_records", component: Invite_records },
  { path: "/user-detail", name: "User_detail", component: User_detail },
  { path: "/prize-optimize", name: "Prize_optimize", component: Prize_optimize },
  { path: "/lottery-detail", name: "Lottery_detail", component: Lottery_detail },
  { path: "/search", name: "Search", component: Search },
  { path: "/match-analysis", name: "Match_analysis", component: Match_analysis },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
