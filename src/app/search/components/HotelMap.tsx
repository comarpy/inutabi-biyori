'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dog, Heart, MapPin } from 'lucide-react';
import type { Hotel } from '../../context/FavoritesContext';

// Leafletのデフォルトアイコンの問題を修正
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// カスタムアイコンを作成
const createCustomIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #FF5A5F;
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          color: white;
          font-size: 16px;
          font-weight: bold;
        ">🐕</div>
      </div>
    `,
    className: 'custom-dog-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

interface HotelMapProps {
  hotels: Hotel[];
  onHotelSelect?: (hotel: Hotel) => void;
}

export default function HotelMap({ hotels, onHotelSelect }: HotelMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  // 東京の中心座標
  const tokyoCenter: [number, number] = [35.6762, 139.6503];

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={tokyoCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hotels.map((hotel) => (
          <Marker
            key={hotel.id}
            position={hotel.coordinates}
            icon={createCustomIcon()}
            eventHandlers={{
              click: () => {
                if (onHotelSelect) {
                  onHotelSelect(hotel);
                }
              },
            }}
          >
            <Popup maxWidth={300} className="custom-popup">
              <div className="p-2">
                <div className="flex gap-3">
                  <img 
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-gray-800">{hotel.name}</h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      {hotel.location}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#FF5A5F] text-lg">
                        ¥{hotel.price.toLocaleString()}〜
                      </span>
                      <button 
                        className="bg-[#FF5A5F] text-white text-xs px-3 py-1 rounded-full hover:bg-[#FF385C] transition-colors flex items-center"
                        onClick={() => onHotelSelect?.(hotel)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        詳細
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* 地図の凡例 */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <div className="flex items-center text-sm">
          <div className="w-4 h-4 bg-[#FF5A5F] rounded-full flex items-center justify-center mr-2">
            <span className="text-xs">🐕</span>
          </div>
          <span className="text-gray-700">犬と泊まれる宿</span>
        </div>
      </div>
    </div>
  );
} 