import axios from "axios";

// axios 实例
const instance = axios.create({
  baseURL: "http://47.100.34.99/api",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// 请求拦截（可加 token）
instance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
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
    const serverMsg = err?.response?.data?.message || err?.response?.data?.msg;
    const fallback = err?.message || "请求失败";
    return Promise.reject(new Error(serverMsg || fallback));
  }
);

// 导出可复用方法
export const API = {
  // 发送短信验证码：POST /sms/send
  // 示例参数：{ phone: '13800000000', event: 'register', imgCode: '1234' }
  sendSms(payload) {
    return instance.post("/sms/send", payload);
  },

  register(payload) {
    return instance.post("/user/register", payload);
  },

};

export default API;
