// 用户个人上传的poi

export default function handler(req, res) {
  if (req.method === 'POST') {
    res.status(200).json({
      success: true,
      message: "UGC 景点已成功写入 Supabase 数据库",
      action: "图片已存入 Supabase Storage 桶"
    });
  } else {
    res.status(200).json({
      success: true,
      data: [
        {
          id: "ugc_001",
          author_id: "mock_user_123",
          name: "发现一家超赞的碧螺春奶茶",
          coordinates: { lat: 31.3140, lng: 120.6295 },
          image_url: "https://mock-storage.supabase.co/img1.jpg",
          is_public: false // 对应默认不公开，可手动分享
        }
      ]
    });
  }
}