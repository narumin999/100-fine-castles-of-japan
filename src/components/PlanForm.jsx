import React, { useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { createCalendarEvent } from '../services/googleCalendar';
// getUserData, saveUserData をインポートしている前提

export default function PlanForm({ castle, token, driveFolderId, onCancel, onSaved }) {
  const [date, setDate] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return alert("日付を入力してください");
    setIsSubmitting(true);

    try {
      // 1. Googleカレンダーに予定を登録 (終日イベントとして登録)
      const calendarEventData = {
        summary: `${APP_CONFIG.calendarPrefix} ${castle.name}`,
        start: { date: date }, // YYYY-MM-DD形式
        end: { date: date },
        description: memo,
        location: castle.name
      };
      const eventId = await createCalendarEvent(token, calendarEventData);

      // 2. ドライブの user_data.json を取得・更新
      const { fileId, records } = await getUserData(token, driveFolderId);
      
      const newPlan = {
        planId: `plan_${Date.now()}`,
        scheduledDate: date,
        calendarEventId: eventId,
        memo: memo
      };

      // 該当の城データがなければ初期化
      if (!records[castle.id]) {
        records[castle.id] = { plans: [], visits: [] };
      }
      records[castle.id].plans.push(newPlan);

      // 3. 更新したデータを保存
      await saveUserData(token, driveFolderId, fileId, records);
      
      alert("カレンダーへの登録と予定の保存が完了しました！");
      onSaved(); // モーダルを閉じて画面を更新
    } catch (error) {
      console.error("保存エラー:", error);
      alert("保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
      <h4 className="font-bold text-blue-800 mb-3">新しい予定を追加</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">予定日</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">メモ</label>
          <input 
            type="text" 
            value={memo} 
            onChange={e => setMemo(e.target.value)}
            placeholder="例：新潟遠征の際に立ち寄る"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">キャンセル</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? '保存中...' : '予定を保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
