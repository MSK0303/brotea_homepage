// 更新するのはこのファイルだけ。値が空文字 "" の項目は、サイト上で自動的に非表示・「準備中」になります。
window.SITE_DATA = {
  forms: {
    // TODO: 要確認
    trial: "",     // 体験会申込 Googleフォーム URL【要確認】
    // TODO: 要確認
    contact: ""    // お問い合わせ Googleフォーム URL【要確認】
  },
  email: { user: "infocfbrotea", domain: "gmail.com" }, // クラブ用Gmail（募集要項web.mdより）
  // TODO: 要確認
  instagram: { url: "", handle: "" },  // 既存アカウントを改名して使用。改名後のURLとハンドル名を入れる【要確認】
  venue: {
    name: "嬉野市吉田中学校グラウンド",
    mapUrl: "https://maps.app.goo.gl/FgtDMbBnY3f6j6fV8"
  },
  recruitment: {
    season: "2027",
    status: "open",            // "open" | "full"（定員到達）| "closed"（募集終了）
    firstDeadline: "2026-12-31"
  },
  trialSessions: [
    // { date: "2026-11-24", time: "19:00〜21:00", place: "嬉野市吉田中学校グラウンド", note: "" }
  ],
  news: [
    // TODO: 要確認
    { date: "2026-11-02", category: "CLUB", title: "公式サイトを公開しました", link: "" }  // 日付は公開日に合わせる【要確認】
  ]
};
