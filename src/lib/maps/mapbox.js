import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxLanguage } from '../pickup.js';

const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] };

function adapterError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function markerElement(className, text, title) {
  const element = document.createElement('div');
  element.className = className;
  if (text) element.textContent = text;
  if (title) element.title = title;
  return element;
}

function circleFeature(center, radiusMeters, steps = 64) {
  const earthRadius = 6_371_000;
  const latitude = center.lat * Math.PI / 180;
  const longitude = center.lng * Math.PI / 180;
  const angular = radiusMeters / earthRadius;
  const coordinates = [];
  for (let index = 0; index <= steps; index += 1) {
    const bearing = (index / steps) * Math.PI * 2;
    const lat = Math.asin(
      Math.sin(latitude) * Math.cos(angular)
      + Math.cos(latitude) * Math.sin(angular) * Math.cos(bearing)
    );
    const lng = longitude + Math.atan2(
      Math.sin(bearing) * Math.sin(angular) * Math.cos(latitude),
      Math.cos(angular) - Math.sin(latitude) * Math.sin(lat)
    );
    coordinates.push([lng * 180 / Math.PI, lat * 180 / Math.PI]);
  }
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coordinates] }
  };
}

export async function createMapboxMap({ element, token, locale = 'en', onPick, onAuthFailure }) {
  if (!token) throw adapterError('not_configured');
  mapboxgl.accessToken = token;
  const map = new mapboxgl.Map({
    container: element,
    style: 'mapbox://styles/mapbox/outdoors-v12',
    center: [116.17, -8.65],
    zoom: 9,
    cooperativeGestures: true,
    attributionControl: false,
    logoPosition: 'bottom-left',
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false
  });
  map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

  await new Promise((resolve, reject) => {
    let settled = false;
    let timeout;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      map.off('load', handleLoad);
      map.off('error', handleLoadError);
      callback(value);
    };
    const handleLoad = () => finish(resolve);
    const handleLoadError = (event) => {
      const status = Number(event?.error?.status);
      if (status === 401 || status === 403) finish(reject, adapterError('permission_denied'));
    };
    timeout = setTimeout(() => finish(reject, adapterError('network')), 15_000);
    map.on('load', handleLoad);
    map.on('error', handleLoadError);
  });

  let authFailed = false;
  const handleRuntimeError = (event) => {
    const status = Number(event?.error?.status);
    if (!authFailed && (status === 401 || status === 403)) {
      authFailed = true;
      onAuthFailure?.();
    }
  };
  map.on('error', handleRuntimeError);

  if (typeof map.setLanguage === 'function') {
    try {
      map.setLanguage(mapboxLanguage(locale));
    } catch {
      // Some styles do not expose localized label fields.
    }
  }

  map.addSource('route', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#123f35', 'line-width': 4, 'line-opacity': 0.92 }
  });
  map.addSource('gps-accuracy', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
  map.addLayer({
    id: 'gps-accuracy-fill',
    type: 'fill',
    source: 'gps-accuracy',
    paint: { 'fill-color': '#20a9bc', 'fill-opacity': 0.13 }
  });
  map.addLayer({
    id: 'gps-accuracy-line',
    type: 'line',
    source: 'gps-accuracy',
    paint: { 'line-color': '#08778c', 'line-width': 2 }
  });

  let markers = [];
  let gpsMarker = null;

  function clearMarkers() {
    markers.forEach((marker) => marker.remove());
    markers = [];
  }

  function setMarkers(origin, destination, labels = {}) {
    clearMarkers();
    if (origin) {
      const title = `${labels.pickup || 'Pick-up'}: ${origin.name}`;
      markers.push(new mapboxgl.Marker({ element: markerElement('mapbox-marker', '1', title) })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map));
    }
    if (destination) {
      const title = `${labels.destination || 'Destination'}: ${destination.name}`;
      markers.push(new mapboxgl.Marker({ element: markerElement('mapbox-marker', '2', title) })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map));
    }
  }

  function routeData(points) {
    if (!Array.isArray(points) || points.length < 2) return EMPTY_FEATURE_COLLECTION;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: points.map(([lat, lng]) => [lng, lat])
      }
    };
  }

  function setRoute(points) {
    map.getSource('route')?.setData(routeData(points));
  }

  function clearRoute() {
    map.getSource('route')?.setData(EMPTY_FEATURE_COLLECTION);
  }

  function fitRoute(points) {
    if (!Array.isArray(points) || !points.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    points.forEach(([lat, lng]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
  }

  function clearGpsPreview() {
    map.getSource('gps-accuracy')?.setData(EMPTY_FEATURE_COLLECTION);
    gpsMarker?.remove();
    gpsMarker = null;
  }

  function showGpsPreview(fix, title = 'Current location') {
    clearGpsPreview();
    if (!fix) return;
    map.getSource('gps-accuracy')?.setData(circleFeature(fix, Math.max(1, Number(fix.accuracy) || 1)));
    gpsMarker = new mapboxgl.Marker({ element: markerElement('mapbox-gps-marker', '', title) })
      .setLngLat([fix.lng, fix.lat])
      .addTo(map);
  }

  function panTo(lat, lng) {
    map.easeTo({ center: [lng, lat], duration: 450 });
  }

  function setZoom(zoom) {
    map.setZoom(zoom);
  }

  function getZoom() {
    return map.getZoom() || 9;
  }

  const handleClick = (event) => {
    onPick?.({ lat: event.lngLat.lat, lng: event.lngLat.lng });
  };
  map.on('click', handleClick);

  function destroy() {
    clearMarkers();
    clearGpsPreview();
    map.off('click', handleClick);
    map.off('error', handleRuntimeError);
    map.remove();
  }

  return {
    setMarkers,
    clearMarkers,
    setRoute,
    clearRoute,
    fitRoute,
    showGpsPreview,
    clearGpsPreview,
    panTo,
    setZoom,
    getZoom,
    destroy
  };
}
