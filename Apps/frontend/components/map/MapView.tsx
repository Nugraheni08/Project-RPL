'use client';

import { useEffect, useRef } from 'react';
import { useMapStore } from '../../store/mapStore';
import { waterStations, trashBins, stationStatuses, trashStatuses } from '../../lib/contstants';
import 'leaflet/dist/leaflet.css';

export default function MapView({ className, style }: { className?: string, style?: React.CSSProperties }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const waterLayerGroup = useRef<any>(null);
  const trashLayerGroup = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  
  const { 
    setMapInstance, 
    setUserLocation, 
    setUserElements,
    setActiveStation,
    showWaterLayer,
    showTrashLayer,
    mapInstance,
    routeTarget,
    routeMode,
    userLocation
  } = useMapStore();

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current) return;
    if (initialized.current) return;
    initialized.current = true;

    let map: any = null;
    let userMarker: any = null;
    let accuracyCircle: any = null;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Check if leaflet id already exists just in case
      if ((mapContainer.current as any)._leaflet_id) return;

      var container = mapContainer.current;
      if (!container) return;

      map = L.map(container, {
        zoomControl: false,
        doubleClickZoom: false, // Prevent zoom on double click which might be perceived as "getting big"
      }).setView([-6.5575, 106.7265], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      setMapInstance(map);

      // Fix icon bug
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Track location
      map.locate({ setView: false, maxZoom: 17, watch: true, enableHighAccuracy: true });

      map.on('locationfound', (e: any) => {
        const radius = e.accuracy / 2;
        setUserLocation(e.latlng.lat, e.latlng.lng);

        if (!userMarker) {
          userMarker = L.circleMarker(e.latlng, {
            radius: 8, fillColor: '#185FA5', color: '#fff', weight: 2, opacity: 1, fillOpacity: 1
          }).addTo(map);
          
          accuracyCircle = L.circle(e.latlng, {
            radius: radius, color: '#185FA5', fillOpacity: 0.15, weight: 1, dashArray: '4'
          }).addTo(map);
          
          setUserElements(userMarker, accuracyCircle);
          map.setView(e.latlng, 16, { animate: true });
        } else {
          userMarker.setLatLng(e.latlng);
          accuracyCircle.setLatLng(e.latlng);
          accuracyCircle.setRadius(radius);
        }
      });

      // Custom icons
      const makeWaterIcon = (status: string) => {
        const colors: any = { active: '#1D9E75', inactive: '#E24B4A', repair: '#C17B42' };
        const c = colors[status] || '#1D9E75';
        return L.divIcon({
          className: '',
          html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div style="background:white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:3px solid ${c};box-shadow:0 4px 14px rgba(0,0,0,0.2);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="${c}"><path d="M12 2C6 9 4 13 4 16a8 8 0 0016 0c0-3-2-7-8-14z"/></svg>
            </div>
            <div style="width:2px;height:10px;background:${c};margin-top:-1px;"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:${c};margin-top:-1px;"></div>
          </div>`,
          iconSize: [44, 64], iconAnchor: [22, 64], popupAnchor: [0, -64]
        });
      };

      const makeTrashIcon = (status: string) => {
        const colors: any = { active: '#1D9E75', inactive: '#E24B4A', repair: '#C17B42' };
        const c = colors[status] || '#1D9E75';
        return L.divIcon({
          className: '',
          html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div style="background:white;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:3px solid ${c};box-shadow:0 4px 14px rgba(0,0,0,0.2);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6m4-6v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div style="width:2px;height:10px;background:${c};margin-top:-1px;"></div>
            <div style="width:8px;height:8px;border-radius:50%;background:${c};margin-top:-1px;"></div>
          </div>`,
          iconSize: [44, 64], iconAnchor: [22, 64], popupAnchor: [0, -64]
        });
      };

      waterLayerGroup.current = L.featureGroup().addTo(map);
      trashLayerGroup.current = L.featureGroup().addTo(map);

      waterStations.forEach((s, i) => {
        const status = stationStatuses[i] || 'active';
        const m = L.marker([s.lat, s.lng], { icon: makeWaterIcon(status) });
        m.on('click', () => {
          if (status === 'inactive') {
            alert('⚠️ Refill air sedang tidak berfungsi');
            return;
          }
          setActiveStation({ ...s, id: i.toString(), status });
        });
        waterLayerGroup.current.addLayer(m);
      });

      trashBins.forEach((t, i) => {
        const status = trashStatuses[i] || 'active';
        const m = L.marker([t.lat, t.lng], { icon: makeTrashIcon(status) });
        m.on('click', () => {
          if (status === 'inactive') {
            alert('⚠️ Tempat sampah sedang tidak tersedia');
            return;
          }
          setActiveStation({ ...t, id: 'trash-'+i, status, type: 'trash' });
        });
        trashLayerGroup.current.addLayer(m);
      });
      
      if (!showWaterLayer) {
        map.removeLayer(waterLayerGroup.current);
      }
      if (!showTrashLayer) {
        map.removeLayer(trashLayerGroup.current);
      }

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);
    };

    initMap();

    // Cleanup: destroy Leaflet map on unmount to prevent DOM leak
    return () => {
      if (map) {
        map.off();
        map.remove();
        map = null;
      }
      initialized.current = false;
      setMapInstance(null);
    };
  }, [setMapInstance, setUserLocation, setUserElements, setActiveStation]); 

  // Toggle Layers
  useEffect(() => {
    if (!mapInstance || !waterLayerGroup.current || !trashLayerGroup.current) return;
    
    if (showWaterLayer) {
      if (!mapInstance.hasLayer(waterLayerGroup.current)) mapInstance.addLayer(waterLayerGroup.current);
    } else {
      if (mapInstance.hasLayer(waterLayerGroup.current)) mapInstance.removeLayer(waterLayerGroup.current);
    }

    if (showTrashLayer) {
      if (!mapInstance.hasLayer(trashLayerGroup.current)) mapInstance.addLayer(trashLayerGroup.current);
    } else {
      if (mapInstance.hasLayer(trashLayerGroup.current)) mapInstance.removeLayer(trashLayerGroup.current);
    }
  }, [showWaterLayer, showTrashLayer, mapInstance]);

  // Route Drawing
  useEffect(() => {
    if (!mapInstance || typeof window === 'undefined') return;
    const L = (window as any).L;
    if (!L) return;

    if (!routeTarget || !userLocation) {
      if (routeLayer.current) {
        mapInstance.removeLayer(routeLayer.current);
        routeLayer.current = null;
      }
      return;
    }

    const drawRoute = async () => {
      if (routeLayer.current) {
        mapInstance.removeLayer(routeLayer.current);
        routeLayer.current = null;
      }

      const OSRM_PROFILE: any = {
        'foot-walking': 'foot',
        'cycling-regular': 'bike',
        'driving-car': 'car'
      };
      
      const profile = OSRM_PROFILE[routeMode] || 'foot';
      const url = `https://router.project-osrm.org/route/v1/${profile}/${userLocation.lng},${userLocation.lat};${routeTarget.lng},${routeTarget.lat}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code !== 'Ok' || !data.routes.length) {
          console.warn('Rute tidak ditemukan');
          return;
        }

        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]: any) => [lat, lng]);

        routeLayer.current = L.polyline(coords, {
          color: '#185FA5', 
          weight: 5, 
          opacity: 0.85, 
          lineJoin: 'round',
          dashArray: routeMode === 'foot-walking' ? '8,6' : null
        }).addTo(mapInstance);

        mapInstance.fitBounds(routeLayer.current.getBounds(), { padding: [40, 40], animate: true });
      } catch (e) {
        console.error('Gagal mengambil rute:', e);
      }
    };

    drawRoute();

  }, [routeTarget, routeMode, userLocation, mapInstance]);

  return (
    <div 
      className={className || "map-card"} 
      style={style || { 
        zIndex: 0,
        width: 'calc(100% - 32px)',
        maxWidth: '380px',
        margin: '16px auto',
        aspectRatio: '1 / 1'
      }}
    >
      <div 
        id="map"
        ref={mapContainer} 
        style={{ width: '100%', height: '100%' }} 
      />
    </div>
  );
}
