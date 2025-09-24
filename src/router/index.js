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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
