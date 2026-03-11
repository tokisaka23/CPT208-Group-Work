// 登录验证与游客模式

export default function handler(req, res) {
  res.status(200).json({
    success: true,
    status: "Mock API Active",
    message: "Supabase 鉴权接口已预留",
    data: {
      user_id: "mock_user_123",
      role: "guest", // 游客模式标记
      notice: "当前为游客模式，对话不记录数据库，刷新即销毁。"
    }
  });
}