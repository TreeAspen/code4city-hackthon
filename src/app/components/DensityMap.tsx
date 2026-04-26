import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Tooltip as LeafletTooltip, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import districtsGeo from '../../asset/community-districts.geo.json';
import { Incident311 } from '../types';
import { BucketLetter, BUCKET_COLORS, TYPE_TO_BUCKET } from '../buckets';

interface DensityMapProps {
  data: Incident311[];
  viewType: 'total' | 'category';
  activeCategories: BucketLetter[];
}

const NYC_CENTER: [number, number] = [40.7128, -74.0060];

// 热力图层组件 (用于 Total 视图)
const HeatLayer = ({ data }: { data: Incident311[] }) => {
  const map = useMap();
  const layerRef = useRef<any>(null);

  const points = useMemo(() => {
    // 聚合有坐标的数据
    return data.filter(d => d.latitude && d.longitude).map(d => [d.latitude, d.longitude, 1] as [number, number, number]);
  }, [data]);

  useEffect(() => {
    if (layerRef.current) map.removeLayer(layerRef.current);
    if (points.length === 0) return;
    
    layerRef.current = (L as any).heatLayer(points, {
      radius: 20,
      blur: 15,
      maxZoom: 14,
      max: 2.0,
      gradient: { 0.2: '#fff7d6', 0.4: '#ffe58a', 0.6: '#f5b400', 0.8: '#d97706', 1.0: '#7c2d12' },
    }).addTo(map);

    return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
  }, [map, points]);

  return null;
}

export const DensityMap = ({ data, viewType, activeCategories }: DensityMapProps) => {
  // 分类视图的散点数据
  const categoryPoints = useMemo(() => {
    if (viewType === 'total') return [];
    return data.filter(d => {
      if (!d.latitude || !d.longitude) return false;
      const bucket = TYPE_TO_BUCKET[d.complaintType];
      return bucket && activeCategories.includes(bucket);
    });
  }, [data, viewType, activeCategories]);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={NYC_CENTER}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true} // 开启鼠标滚轮缩放
        zoomControl={false}    // 关闭默认位置的缩放控件，我们在下面自定义位置
        attributionControl={false}
      >
        <ZoomControl position="topleft" />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        
        <GeoJSON
          data={districtsGeo as any}
          style={{ color: '#475569', weight: 0.5, fillOpacity: 0, opacity: 0.6 }}
        />

        {/* 渲染热力图 */}
        {viewType === 'total' && <HeatLayer data={data} />}

        {/* 渲染分类彩色散点图层 */}
        {viewType === 'category' && categoryPoints.map(point => {
           const bucket = TYPE_TO_BUCKET[point.complaintType] as BucketLetter;
           return (
             <CircleMarker
               key={point.id}
               center={[point.latitude!, point.longitude!]}
               radius={4}
               pathOptions={{
                 color: BUCKET_COLORS[bucket],
                 fillColor: BUCKET_COLORS[bucket],
                 fillOpacity: 0.6,
                 weight: 1
               }}
             >
               <LeafletTooltip direction="top" opacity={1}>
                 <span className="text-[10px] font-bold">{point.complaintType}</span>
               </LeafletTooltip>
             </CircleMarker>
           );
        })}
      </MapContainer>

      {/* 热力图图例 (仅在 Total 下显示) */}
      {viewType === 'total' && (
        <div className="absolute bottom-1 right-1 z-[400] bg-white/90 border border-gray-200 rounded px-1.5 py-1 text-[8px] font-bold text-gray-700 uppercase shadow-sm">
          <div className="flex items-center gap-1">
            <span>Low</span>
            <span className="inline-block w-3 h-2" style={{ background: '#fff7d6' }} />
            <span className="inline-block w-3 h-2" style={{ background: '#ffe58a' }} />
            <span className="inline-block w-3 h-2" style={{ background: '#f5b400' }} />
            <span className="inline-block w-3 h-2" style={{ background: '#d97706' }} />
            <span className="inline-block w-3 h-2" style={{ background: '#7c2d12' }} />
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
};