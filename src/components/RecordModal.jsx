import React from 'react';
import { MapPin, ExternalLink, Calendar, BookOpen, X } from 'lucide-react';

export default function RecordModal({ castle, onClose }) {
  // Googleマップへの検索リンクを生成
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(castle.name)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* ヘッダーセクション */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-start">
          <div>
            <span className="text-xs bg-blue-800 px-2 py-1 rounded mb-2 inline-block">
              {castle.type} / {castle.prefecture}
            </span>
            <h2 className="text-2xl font-bold">{castle.name}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
          {/* マスターデータ情報 */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed mb-3">{castle.description}</p>
            <div className="flex gap-2">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                <MapPin size={16} /> Google Maps
              </a>
              {castle.officialUrl && (
                <a href={castle.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline ml-4">
                  <ExternalLink size={16} /> 公式サイト
                </a>
              )}
            </div>
          </div>

          {/* 訪問予定 (Plans) セクション */}
          <div className="mb-6">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
              <Calendar size={20} className="text-blue-500" /> 訪問予定
            </h3>
            {castle.userData.plans.length === 0 ? (
              <p className="text-sm text-gray-500 italic">予定は登録されていません</p>
            ) : (
              <ul className="space-y-2">
                {castle.userData.plans.map(plan => (
                  <li key={plan.planId} className="bg-white p-3 rounded border border-blue-100 shadow-sm text-sm">
                    <div className="font-bold text-blue-700">{plan.scheduledDate}</div>
                    <div className="text-gray-600 mt-1">{plan.memo}</div>
                  </li>
                ))}
              </ul>
            )}
            <button className="mt-3 w-full bg-blue-50 text-blue-600 py-2 rounded font-medium hover:bg-blue-100 transition border border-blue-200">
              ＋ 新しい予定を追加
            </button>
          </div>

          {/* 訪問実績 (Visits) セクション */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3 border-b pb-2">
              <BookOpen size={20} className="text-green-600" /> 訪問実績
            </h3>
            {castle.userData.visits.length === 0 ? (
              <p className="text-sm text-gray-500 italic">実績はまだありません</p>
            ) : (
              <ul className="space-y-3">
                {castle.userData.visits.map(visit => (
                  <li key={visit.visitId} className="bg-white p-3 rounded border border-green-100 shadow-sm cursor-pointer hover:bg-green-50 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-700">{visit.displayDate}</span>
                      <span className="text-xs text-blue-500 hover:underline">HTMLメモを開く</span>
                    </div>
                    {visit.photos && visit.photos.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        画像 {visit.photos.length} 枚
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <button className="mt-3 w-full bg-green-500 text-white py-2 rounded font-bold hover:bg-green-600 transition shadow-sm">
              ＋ 登城実績を記録する
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
