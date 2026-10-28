export async function createMap(options) {
  const { createMapboxMap } = await import('./mapbox.js');
  return createMapboxMap(options);
}
