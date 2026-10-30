import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mapboxLanguage } from '../pickup.js';
import { getMapboxLocale } from './mapbox-locale.js';

// Streets shows the richest set of places and POIs, which keeps the pick-up
// planner useful at neighbourhood zoom. Swap this for another Mapbox style
// (for example outdoors-v12) if the map should emphasize terrain instead.
const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';
const LOMBOK_CENTER = [116.17, -8.65];
const EMPTY_FEATURE_COLLECTION = { type: 'FeatureCollection', features: [] };

function adapterError(code) {
  const error = new Error(code);
  error.code = code;
  return error;
}

function markerElement(className, text, title) {
  const element = document.createElement('div');
  element.className = className;
  if (title) {
    element.title = title;
    element.setAttribute('aria-label', title);
    element.setAttribute('role', 'img');
  }
  if (text) element.textContent = text;
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

function errorCode(event) {
  const status = Number(event?.error?.status);
  if (status === 401 || status === 403) return 'permission_denied';
  if (status === 429) return 'quota_exceeded';
  return 'network';
}

function waitForStyle(map) {
  // `style.load` means the style JSON is parsed and sources/layers can be
  // added. Waiting for `isStyleLoaded()` instead is too strict: it can remain
  // false while tiles and glyphs finish loading, and the extra `styledata`
  // events that would re-check it may never arrive. `load` is a fallback for
  // the rare case where `style.load` fired before the listeners attached.
  if (map.isStyleLoaded()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false;
    let timeout;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      map.off('style.load', handleStyleReady);
      map.off('load', handleLoad);
      map.off('styledata', handleStyleData);
      map.off('error', handleError);
      callback(value);
    };
    const handleStyleReady = () => finish(resolve);
    const handleLoad = () => finish(resolve);
    const handleStyleData = () => {
      if (map.isStyleLoaded()) finish(resolve);
    };
    const handleError = (event) => {
      const code = errorCode(event);
      // A single transient tile or sprite error must not discard a map whose
      // style can still finish loading. Only credential and quota failures are
      // fatal here; a style that never loads hits the timeout below.
      if (code === 'permission_denied' || code === 'quota_exceeded') {
        finish(reject, adapterError(code));
      }
    };
    timeout = setTimeout(() => finish(reject, adapterError('network')), 20_000);
    map.on('style.load', handleStyleReady);
    map.on('load', handleLoad);
    map.on('styledata', handleStyleData);
    map.on('error', handleError);
  });
}

export async function createMapboxMap({ element, token, locale = 'en', onPick, onAuthFailure }) {
  if (!element) throw adapterError('not_configured');
  if (!token) throw adapterError('not_configured');

  mapboxgl.accessToken = token;
  const map = new mapboxgl.Map({
    container: element,
    locale: getMapboxLocale(locale),
    style: MAPBOX_STYLE,
    center: LOMBOK_CENTER,
    zoom: 9,
    renderWorldCopies: false,
    cooperativeGestures: true,
    attributionControl: false,
    logoPosition: 'bottom-left',
    dragRotate: false,
    pitchWithRotate: false,
    touchPitch: false
  });
  map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

  try {
    await waitForStyle(map);
  } catch (error) {
    map.remove();
    throw error;
  }

  if (typeof map.setLanguage === 'function') {
    try {
      map.setLanguage(mapboxLanguage(locale));
    } catch {
      // Some styles do not expose localized label fields.
    }
  }

  let authFailed = false;
  const handleRuntimeError = (event) => {
    const code = errorCode(event);
    if (authFailed || code === 'network') return;
    authFailed = true;
    onAuthFailure?.(code);
  };
  map.on('error', handleRuntimeError);

  map.addSource('planner-route', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
  map.addLayer({
    id: 'planner-route-casing',
    type: 'line',
    source: 'planner-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#fffdf8', 'line-width': 7, 'line-opacity': 0.9 }
  });
  map.addLayer({
    id: 'planner-route-line',
    type: 'line',
    source: 'planner-route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#123f35', 'line-width': 4, 'line-opacity': 0.92 }
  });
  map.addSource('planner-gps-accuracy', { type: 'geojson', data: EMPTY_FEATURE_COLLECTION });
  map.addLayer({
    id: 'planner-gps-accuracy-fill',
    type: 'fill',
    source: 'planner-gps-accuracy',
    paint: { 'fill-color': '#20a9bc', 'fill-opacity': 0.13 }
  });
  map.addLayer({
    id: 'planner-gps-accuracy-line',
    type: 'line',
    source: 'planner-gps-accuracy',
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
      markers.push(new mapboxgl.Marker({ element: markerElement('mapbox-marker', '1', title), anchor: 'center' })
        .setLngLat([origin.lng, origin.lat])
        .addTo(map));
    }
    if (destination) {
      const title = `${labels.destination || 'Destination'}: ${destination.name}`;
      markers.push(new mapboxgl.Marker({ element: markerElement('mapbox-marker', '2', title), anchor: 'center' })
        .setLngLat([destination.lng, destination.lat])
        .addTo(map));
    }
  }

  function setRoute(points) {
    map.getSource('planner-route')?.setData(routeData(points));
  }

  function clearRoute() {
    map.getSource('planner-route')?.setData(EMPTY_FEATURE_COLLECTION);
  }

  function fitRoute(points) {
    if (!Array.isArray(points) || !points.length) return;
    const bounds = new mapboxgl.LngLatBounds();
    points.forEach(([lat, lng]) => bounds.extend([lng, lat]));
    map.fitBounds(bounds, { padding: 56, maxZoom: 14, duration: 0 });
  }

  function clearGpsPreview() {
    map.getSource('planner-gps-accuracy')?.setData(EMPTY_FEATURE_COLLECTION);
    gpsMarker?.remove();
    gpsMarker = null;
  }

  function showGpsPreview(fix, title = 'Current location') {
    clearGpsPreview();
    if (!fix) return;
    map.getSource('planner-gps-accuracy')?.setData(circleFeature(fix, Math.max(1, Number(fix.accuracy) || 1)));
    gpsMarker = new mapboxgl.Marker({ element: markerElement('mapbox-gps-marker', '', title), anchor: 'center' })
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
