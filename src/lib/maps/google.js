import { loadGoogleMaps, resetGoogleMapsLoader } from '../google-maps.js';

export async function createGoogleMap({ element, apiKey, locale = 'en', onPick, onAuthFailure }) {
  const googleMaps = await loadGoogleMaps({ apiKey, locale });
  if (onAuthFailure) window.gm_authFailure = onAuthFailure;
  const map = new googleMaps.Map(element, {
    center: { lat: -8.65, lng: 116.17 },
    zoom: 9,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    clickableIcons: false,
    gestureHandling: 'cooperative'
  });
  const markers = [];
  let routeLine = null;
  let gpsCircle = null;
  let gpsMarker = null;
  const clickListener = map.addListener('click', (event) => {
    onPick?.({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  });

  function clearMarkers() {
    markers.forEach((marker) => marker.setMap(null));
    markers.length = 0;
  }

  function setMarkers(origin, destination, labels = {}) {
    clearMarkers();
    if (origin) {
      markers.push(new googleMaps.Marker({
        map,
        position: { lat: origin.lat, lng: origin.lng },
        title: `${labels.pickup || 'Pick-up'}: ${origin.name}`,
        label: { text: '1', color: '#123f35', fontWeight: '700' }
      }));
    }
    if (destination) {
      markers.push(new googleMaps.Marker({
        map,
        position: { lat: destination.lat, lng: destination.lng },
        title: `${labels.destination || 'Destination'}: ${destination.name}`,
        label: { text: '2', color: '#123f35', fontWeight: '700' }
      }));
    }
  }

  function clearRoute() {
    routeLine?.setMap(null);
    routeLine = null;
  }

  function setRoute(points) {
    clearRoute();
    if (!Array.isArray(points) || points.length < 2) return;
    routeLine = new googleMaps.Polyline({
      map,
      path: points.map(([lat, lng]) => ({ lat, lng })),
      strokeColor: '#123f35',
      strokeWeight: 4
    });
  }

  function fitRoute(points) {
    if (!Array.isArray(points) || !points.length) return;
    const bounds = new googleMaps.LatLngBounds();
    points.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
    map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
  }

  function clearGpsPreview() {
    gpsCircle?.setMap(null);
    gpsMarker?.setMap(null);
    gpsCircle = null;
    gpsMarker = null;
  }

  function showGpsPreview(fix, title = 'Current location') {
    clearGpsPreview();
    if (!fix) return;
    gpsCircle = new googleMaps.Circle({
      map,
      center: { lat: fix.lat, lng: fix.lng },
      radius: fix.accuracy,
      strokeColor: '#08778c',
      fillColor: '#20a9bc',
      fillOpacity: 0.13,
      strokeWeight: 2
    });
    gpsMarker = new googleMaps.Marker({
      map,
      position: { lat: fix.lat, lng: fix.lng },
      title
    });
  }

  function panTo(lat, lng) {
    map.panTo({ lat, lng });
  }

  function setZoom(zoom) {
    map.setZoom(zoom);
  }

  function getZoom() {
    return map.getZoom() || 9;
  }

  function destroy() {
    clearMarkers();
    clearRoute();
    clearGpsPreview();
    googleMaps.event.removeListener(clickListener);
    if (window.gm_authFailure === onAuthFailure) delete window.gm_authFailure;
    resetGoogleMapsLoader();
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
