import React, { useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import boroughsGeo from '../../asset/boroughs.geo.json';
import districtsGeo from '../../asset/community-districts.geo.json';

interface MapSelectorProps {
  level: 'borough' | 'district';
  selectedBoroughs: string[];
  selectedDistricts: string[];
  onToggleBorough: (name: string) => void;
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
  level,
  selectedBoroughs,
  selectedDistricts,
  onToggleBorough,
  onToggleDistrict,
}: MapSelectorProps) => {
  const data = useMemo(
    () => (level === 'borough' ? boroughsGeo : districtsGeo) as any,
    [level]
  );

  const styleFn = (feature: any) => {
    let active = false;
    if (level === 'borough') {
      active = selectedBoroughs.includes(feature.properties.boroname);
    } else {
      const code = cdCodeToBoard(feature.properties.BoroCD);
      active = selectedDistricts.includes(code);
    }
    return {
      color: '#000',
      weight: active ? 2 : 1,
      fillColor: active ? '#FFE300' : '#cbd5e1',
      fillOpacity: active ? 0.7 : 0.25,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    let label = '';
    if (level === 'borough') {
      label = feature.properties.boroname;
      layer.on('click', () => onToggleBorough(feature.properties.boroname));
    } else {
      const code = cdCodeToBoard(feature.properties.BoroCD);
      label = code;
      layer.on('click', () => onToggleDistrict(code));
    }
    layer.bindTooltip(label, { sticky: true, direction: 'top' });
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
        key={`${level}-${selectedBoroughs.join(',')}-${selectedDistricts.join(',')}`}
        data={data}
        style={styleFn}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
};
