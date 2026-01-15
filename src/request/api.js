import axios from "axios";
import router from "../router/index.js";

// axios 实例
//  https://atc.lxwdlz.cn 测试
//  https://atc.lxwdlz.cn 正式

const instance = axios.create({
  baseURL: "https://atc.lxwdlz.cn/api",
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

  gameScore(type, params = {}) {
    return instance.get("/lottery/gameScore", { 
      params: { 
        type,
        ...params
      } 
    });
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
    return instance.get("/betting_order/get_order_list", { params: payload });
  },

  lottery_pailie(payload) {
    return instance.get(`/lottery/pailie/type/${payload}`);
  },

  lottoHistory() {
    return instance.get("/lottery/lottoHistory");
  },

  // 乐透数字详情
  lotoInfo(payload) {
    return instance.get("/lottery/lotoInfo", { params: payload });
  },

  order_detail(payload) {
    return instance.get("/betting_order/order_detail", { params: { id: payload } });
  },

  analysisData(payload) {
    return instance.get("/lottery/analysisData", { params: { id: payload } });
  },

  gendan_list(payload) {
    return instance.get("/gendan/getList", { params: payload });
  },

  getgendanInfo(payload) {
    return instance.get(`gendan/getInfo/id/${payload}`);
  },

  // 获取跟单用户详情
  getUseridInfo(userId) {
    return instance.get(`/gendan/userInfo/id/${userId}`);
  },

  // 获取列表用户详情
  getlistUserInfo(userId) {
    return instance.get(`/gendan/user/id/${userId}`);
  },

  // 搜索用户
  searchUser(name) {
    return instance.post("/gendan/search", { name });
  },

  // 获取跟单排行榜
  getRank() {
    return instance.get("/gendan/getRank");
  },

  getToast() {
    return instance.get("user/getToast");
  },

  gendanuserInfo() {
    return instance.get("/gendan/userInfo");
  },

  gendanadd_order(id, payload) {
    return instance.post(`/gendan/add_order/id/${id}`, payload);
  },

  // 用户关注/取关
  addFollow(userId) {
    return instance.get(`/user/addFollow/id/${userId}`);
  },

  // 获取用户粉丝/关注列表
  getFollowList(userId, params) {
    return instance.get(`/user/followList/id/${userId}`, { params });
  },

  // 获取登录用户个人信息
  getUserInfo() {
    return instance.get("/user/info");
  },

  // 修改用户名称/头像
  modifyUserInfo(payload) {
    return instance.post("/user/modify", payload);
  },

  // 上传文件
  uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    return instance.post("/common/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getAccountDetail(payload) {
    return instance.get("/user/zblists", { params: payload });
  },

  toBalance(payload) {
    return instance.get("/pay/toBalance", { params: payload });
  },

  // 设置提现密码
  setWPass(payload) {
    return instance.post("/user/setWPass", payload);
  },

  // 添加账户
  addAccount(payload) {
    return instance.post("/user/addAccount", payload);
  },

  accountList() {
    return instance.get("/user/accountList");
  },

  balanceof() {
    return instance.get("/user/balanceof");
  },

  // 提现
  withdraw(payload) {
    return instance.post("/user/withdraw", payload);
  },

  // 实名认证
  userAudit(payload) {
    return instance.post("/user/userAudit", payload);
  },

  // 获取支付方式列表
  getMethods() {
    return instance.get("/user/getMethods");
  },

  // 查询支付结果
  payNotify() {
    return instance.get("/pay/toNotify");
  },

  //  今日竟彩开奖
  jclottery() {
    return instance.get("/lottery/jc");
  },

  //  邀请好友记录
  getUserInvited() {
    return instance.get("/user/getUserInvited");
  },

  //  邀请店铺记录
  getStoreInvited() {
    return instance.get("/user/getStoreInvited");
  },

  // 设置消息已读
  markMessageRead(messageId) {
    return instance.get(`/user/isRead/id/${messageId}`);
  },

  // 在线充值
  toPay(id, payload) {
    return instance.post(`/pay/toPay/id/${id}`, payload);
  },
};

export default API;
