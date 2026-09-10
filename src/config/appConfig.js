export const APP_CONFIG = {
  appName: "100名城・続100名城記録アプリ",
  appKey: "castle_record_app", // Googleドライブのフォルダ名に使用
  calendarPrefix: "[登城]", // Googleカレンダーに登録される際の接頭辞
  
  // GitHub上の初期マスターデータ（またはアプリ内蔵の初期データパス）
  githubMasterUrl: "https://raw.githubusercontent.com/your-username/castle-app/main/public/data/castles.json",
  
  // Google API スコープ
  scopes: [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email"
  ]
};
