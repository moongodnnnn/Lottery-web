# 游戏类别 ID (cate_id) 统一参考

本项目中所有游戏类别的 `cate_id` 定义如下：

## 完整映射表

| cate_id | 游戏类型 | 说明 |
|---------|---------|------|
| **1** | 竞彩足球 | Football Lottery |
| **2** | 竞彩篮球 | Basketball Lottery |
| **5** | 大乐透 | Da Le Tou (Super Lotto) |
| **6** | 排列三 | Pai Lie San (Pick 3) |
| **7** | 排列五 | Pai Lie Wu (Pick 5) |
| **8** | 七星彩 | Qi Xing Cai (Seven Stars) |

## 使用示例

### Vue 文件中的定义

```javascript
// 数字彩票类型映射
const lotteryTypeMap = {
  'pl3': 6,         // 排列3
  'pl5': 7,         // 排列5
  'seven_stars': 8, // 七星彩
  'daletou': 5      // 大乐透
};

// 体育彩票
cate_id: 1  // 足球
cate_id: 2  // 篮球
```

### API 请求参数

```javascript
{
  cate_id: 1,  // 足球彩票
  // ... 其他参数
}
```

## 相关文件

以下文件包含 `cate_id` 定义：

- `src/view/Game/Lottery_bet.vue` - 足球彩票下单 (cate_id: 1)
- `src/view/Game/Basketball_confirm_bet.vue` - 篮球彩票下单 (cate_id: 2)
- `src/view/Game/Confirm_bet.vue` - 足球彩票确认 (cate_id: 1)
- `src/view/Game/Prize_optimize.vue` - 足球彩票优化 (cate_id: 1)
- `src/view/Game/Publish_order.vue` - 发单页面 (支持所有类型)
- `src/view/My/Order_detail.vue` - 订单详情显示 (支持所有类型)
- `src/view/Home/Expert.vue` - 专家推荐 (cate_id: 1, 6)

## 注意事项

⚠️ **重要**：修改 `cate_id` 定义时，请确保：
1. 所有相关文件保持一致
2. 后端 API 接口使用相同的 ID 定义
3. 更新本文档以保持同步

---
最后更新：2025年12月8日
