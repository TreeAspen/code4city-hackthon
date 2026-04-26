import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import districtsGeo from '../../asset/community-districts.geo.json';

interface MapSelectorProps {
  selectedDistricts: string[];
  onToggleDistrict: (code: string) => void;
}

// BoroCD numeric prefix → community-board prefix used in mock data
const BORO_PREFIX: Record<number, string> = {
  1: 'MN',
  2: 'BX',
  3: 'BK',
  4: 'QN',
  5: 'SI',
};

const cdCodeToBoard = (boroCD: number): string => {
  const boro = Math.floor(boroCD / 100);
  const cd = boroCD % 100;
  const prefix = BORO_PREFIX[boro] ?? 'XX';
  return `${prefix}-${String(cd).padStart(2, '0')}`;
};

const NYC_CENTER: [number, number] = [40.7128, -74.0060];

export const MapSelector = ({
  selectedDistricts,
  onToggleDistrict,
}: MapSelectorProps) => {
  const styleFn = (feature: any) => {
    const code = cdCodeToBoard(feature.properties.BoroCD);
    const active = selectedDistricts.includes(code);
    return {
      color: active ? '#000' : '#475569',
      weight: active ? 1.5 : 0.6,
      fillColor: active ? '#FFE300' : '#e2e8f0',
      fillOpacity: active ? 0.7 : 0.18,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const code = cdCodeToBoard(feature.properties.BoroCD);
    layer.on('click', () => onToggleDistrict(code));
    layer.bindTooltip(code, { sticky: true, direction: 'top' });
  };

  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <GeoJSON
        key={`districts-${selectedDistricts.join(',')}`}
        data={districtsGeo as any}
        style={styleFn}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
};
