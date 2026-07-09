import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import districtsGeo from '../../asset/community-districts.geo.json';
import { cdCodeToBoard, isRealDistrict } from '../districts';

interface MapSelectorProps {
  selectedDistricts: string[];
  onToggleDistrict: (code: string) => void;
}

const NYC_CENTER: [number, number] = [40.7128, -74.0060];

export const MapSelector = ({
  selectedDistricts,
  onToggleDistrict,
}: MapSelectorProps) => {
  const styleFn = (feature: any) => {
    const boroCD = feature.properties.BoroCD;
    // Parks / airports / Rikers: drawn for context, but not selectable.
    if (!isRealDistrict(boroCD)) {
      return { color: '#94a3b8', weight: 0.4, fillColor: '#f1f5f9', fillOpacity: 0.35 };
    }
    const active = selectedDistricts.includes(cdCodeToBoard(boroCD));
    return {
      color: active ? '#000' : '#475569',
      weight: active ? 1.5 : 0.6,
      fillColor: active ? '#FFE300' : '#e2e8f0',
      fillOpacity: active ? 0.7 : 0.18,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const boroCD = feature.properties.BoroCD;
    if (!isRealDistrict(boroCD)) {
      layer.bindTooltip('Park / airport — no community district', { sticky: true, direction: 'top' });
      return;
    }
    const code = cdCodeToBoard(boroCD);
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
