import React, { useState } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import { saveHtmlFile, getUserData, saveUserData } from '../services/googleDrive';
import { createCalendarEvent } from '../services/googleCalendar';

export default function VisitForm({ castle, token, driveFolderId, htmlFolderId, onCancel, onSaved }) {
  const [date, setDate] = useState('');
  const [memo, setMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ※画像のアップロードID取得処理は長くなるためここでは簡略化しています

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return alert("日付を入力してください");
    setIsSubmitting(true);

    try {
      // 1. GoogleドライブにHTMLメモを生成して保存
      const htmlFileId = await saveHtmlFile(
        token, 
        htmlFolderId, 
        `${castle.name} 登城記録`, 
        date, 
        castle.name, 
        memo, 
        [] // imgIds (画像アップロード機能実装後に連携)
      );

      // 2. 実績もカレンダーに残す場合 (オプション)
      const eventId = await createCalendarEvent(token, {
        summary: `${APP_CONFIG.calendarPrefix} ${castle.name} (実績)`,
        start: { date: date },
        end: { date: date },
        description: `HTMLメモ: https://drive.google.com/file/d/${htmlFileId}/view`
      });

      // 3. user_data.json を取得・更新
      const { fileId, records } = await getUserData(token, driveFolderId);
      
      const newVisit = {
        visitId: `visit_${Date.now()}`,
        displayDate: date,
        htmlFileId: htmlFileId,
        calendarEventId: eventId,
        location: castle.name,
        photos: [] 
      };

      if (!records[castle.id]) records[castle.id] = { plans: [], visits: [] };
      records[castle.id].visits.push(newVisit);

      // 4. 保存
      await saveUserData(token, driveFolderId, fileId, records);
      
      alert("登城実績の記録が完了しました！");
      onSaved(); 
    } catch (error) {
      console.error("実績保存エラー:", error);
      alert("保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
      <h4 className="font-bold text-green-800 mb-3">登城実績を記録</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">登城日</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">登城メモ（感想など）</label>
          <textarea 
            value={memo} 
            onChange={e => setMemo(e.target.value)}
            rows="4"
            className="w-full p-2 border rounded resize-none"
            placeholder="スタンプの設置場所や、見どころなどの感想"
          />
        </div>
        {/* 画像アップロード用のinputタグ等を今後ここに追加 */}
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">キャンセル</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {isSubmitting ? '記録中...' : '実績を記録'}
          </button>
        </div>
      </form>
    </div>
  );
}
