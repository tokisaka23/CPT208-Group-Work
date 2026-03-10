// 成就系统

export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "用户成就状态读取成功",
    data: {
      progress: "2/10", // 10个景点打卡进度
      unlocked_achievements: [
        {
          id: "ach_001",
          name: "初入平江",
          icon: "🌟",
          shareable: true // 对应调用 Web Share API
        }
      ],
      locked_achievements: [
        {
          id: "ach_010",
          name: "十全十美",
          description: "游览完全部 10 个预设景点"
        }
      ]
    }
  });
}