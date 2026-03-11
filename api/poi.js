// 10个预设景点与高德LBS

export default async function handler(request) {
  const data = {
    success: true,
    message: "Edge Config 景点知识库已预加载",
    data: {
      total_presets: 10,
      nearby_locations: [
        {
          id: "poi_01",
          name: "狮子林",
          coordinates: { lat: 31.3155, lng: 120.6322 },
          has_ar_content: true,
          description: "苏州四大名园之一，以湖石假山闻名，被誉为'假山王国'。园内曲径通幽，是平江路必游景点。"
        },
        {
          id: "poi_02",
          name: "耦园",
          coordinates: { lat: 31.3121, lng: 120.6289 },
          has_ar_content: false,
          description: "世界文化遗产，苏州古典园林代表作。因布局'耦'（偶）合东西而得名，是研究清代宅园的活标本。"
        }
      ]
    }
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // 允许跨域
    }
  });
}