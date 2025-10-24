import axios from "axios";
import router from "../router/index.js";

// axios 实例
const instance = axios.create({
  baseURL: "https://lottery.hongxiu88.com/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截（可加 token）
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["TOKEN"] = token;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// 响应拦截：统一返回 data，出错时抛错
instance.interceptors.response.use(
  (res) => res.data ?? res,
  (err) => {
    if (err && (err.code === "ECONNABORTED" || /timeout/i.test(err.message || ""))) {
      return Promise.reject(new Error("网络连接超时，请稍后重试"));
    }
    if (err && !err.response) {
      return Promise.reject(new Error("网络异常，请检查您的网络连接"));
    }

    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");

      router.push("/login");
      return Promise.reject(new Error("登录已过期，请重新登录"));
    }

    const serverMsg = err?.response?.data?.message || err?.response?.data?.msg;
    const fallback = err?.message || "请求失败";
    return Promise.reject(new Error(serverMsg || fallback));
  }
);

export const API = {
  sendSms(payload) {
    return instance.post("/sms/send", payload);
  },

  register(payload) {
    return instance.post("/user/register", payload);
  },

  login(payload) {
    return instance.post("/user/login", payload);
  },

  forgetPassword(payload) {
    return instance.post("user/forgetPass", payload);
  },

  forgetUser(payload) {
    return instance.post("user/forgetUser", payload);
  },

  toast(payload) {
    return instance.get("/toast/index", { params: { mark: payload } });
  },

  toastDetail(id) {
    return instance.get(`/toast/detail/id/${id}`);
  },

  toastDraws(payload) {
    return instance.get("/toast/draws", payload);
  },

  getAdsByMark(payload) {
    return instance.get("/adszone/getAdsByMark", { params: { mark: payload } });
  },

  initConfig() {
    return instance.get("/common/initConfig");
  },

  category() {
    return instance.get("/lottery/category");
  },

  lotteryloto(payload) {
    return instance.get("/lottery/loto", { params: { type: payload } });
  },

  gameScore(payload) {
    return instance.get("/lottery/gameScore", { params: { type: payload } });
  },

  lsList() {
    return instance.get("/lottery/lsList");
  },

  Games(payload) {
    return instance.get("/lottery/games", { params: { type: payload } });
  },

  gamesRate(payload) {
    return instance.get("/lottery/get_games_rate", { params: { id: payload } });
  },

  add_order(payload) {
    return instance.post("/betting_order/add_order", payload);
  },

  get_order_list(payload) {
    return instance.get("/betting_order/get_order_list", payload);
  },

  lottery_pailie(payload) {
    return instance.get(`/lottery/pailie/type/${payload}`);
  },

  lottoHistory() {
    return instance.get("/lottery/lottoHistory");
  },

  order_detail(payload) {
    return instance.get("/betting_order/order_detail", { params: { id: payload } });
  },

  analysisData(payload) {
    return instance.get("/lottery/analysisData", { params: { id: payload } });
  },
};

export default API;
