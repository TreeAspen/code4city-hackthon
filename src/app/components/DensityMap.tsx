import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import boroughsGeo from '../../asset/boroughs.geo.json';
import { Incident311 } from '../types';

interface DensityMapProps {
  data: Incident311[];
}

const NYC_CENTER: [number, number] = [40.7128, -74.0060];

// Sequential yellow scale (light → strong) — same hue as accent color #FFE300.
const colorFor = (count: number, max: number) => {
  if (count === 0) return '#f1f5f9';
  const t = max > 0 ? count / max : 0;
  if (t > 0.8) return '#b8860b';
  if (t > 0.6) return '#daa520';
  if (t > 0.4) return '#f0c419';
  if (t > 0.2) return '#ffd84d';
  return '#fff2a8';
};

export const DensityMap = ({ data }: DensityMapProps) => {
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(d => {
      map[d.borough] = (map[d.borough] || 0) + 1;
    });
    return map;
  }, [data]);

  const max = Math.max(0, ...Object.values(counts));

  const styleFn = (feature: any) => {
    const name = feature.properties.boroname;
    const c = counts[name] || 0;
    return {
      color: '#000',
      weight: 1,
      fillColor: colorFor(c, max),
      fillOpacity: 0.75,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties.boroname;
    const c = counts[name] || 0;
    layer.bindTooltip(`${name}: ${c}`, { sticky: true, direction: 'top' });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={NYC_CENTER}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <GeoJSON
          key={`density-${data.length}-${max}`}
          data={boroughsGeo as any}
          style={styleFn}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
      {/* Legend */}
      <div className="absolute bottom-1 right-1 z-[400] bg-white/90 border border-gray-200 rounded px-1.5 py-1 text-[8px] font-bold text-gray-700 uppercase">
        <div className="flex items-center gap-1">
          <span>Low</span>
          <span className="inline-block w-3 h-2" style={{ background: '#fff2a8' }} />
          <span className="inline-block w-3 h-2" style={{ background: '#ffd84d' }} />
          <span className="inline-block w-3 h-2" style={{ background: '#f0c419' }} />
          <span className="inline-block w-3 h-2" style={{ background: '#daa520' }} />
          <span className="inline-block w-3 h-2" style={{ background: '#b8860b' }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
};
