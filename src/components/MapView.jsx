import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RecordModal from './RecordModal';

// --- 動的なピンの色分け設定 ---
const createCustomIcon = (status) => {
  let color = '#9E9E9E'; // デフォルト: 未達成（グレー）
  if (status === 'visited') color = '#F44336'; // 制覇済（レッド）
  if (status === 'planned') color = '#2196F3'; // 予定あり（ブルー）

  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32px" height="32px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
  
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: svgIcon,
    iconSize: [32, 32],
    iconAnchor: [16, 32] // ピンの先端を座標に合わせる
  });
};

export default function MapView({ masterData = [], userData = {} }) {
  const [selectedCastle, setSelectedCastle] = useState(null);

  // 日本列島全体が見渡せる初期ズームと中心座標
  const centerPosition = [36.2048, 138.2529]; 
  const defaultZoom = 5;

  return (
    <>
      <MapContainer center={centerPosition} zoom={defaultZoom} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* マスターデータをもとにピンを配置 */}
        {masterData.map((castle) => {
          // ユーザーデータから現在のステータスを判定
          const castleData = userData[castle.id] || { plans: [], visits: [] };
          let status = 'unvisited';
          if (castleData.visits.length > 0) status = 'visited';
          else if (castleData.plans.length > 0) status = 'planned';

          return (
            <Marker 
              key={castle.id} 
              position={[castle.lat, castle.lng]} 
              icon={createCustomIcon(status)}
              eventHandlers={{
                click: () => setSelectedCastle({ ...castle, userData: castleData }),
              }}
            />
          );
        })}
      </MapContainer>

      {/* 城をクリックした際の詳細モーダル */}
      {selectedCastle && (
        <RecordModal 
          castle={selectedCastle} 
          onClose={() => setSelectedCastle(null)} 
        />
      )}
    </>
  );
}
