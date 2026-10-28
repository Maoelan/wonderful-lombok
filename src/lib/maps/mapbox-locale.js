const controls = {
  id: ['Tampilkan atribusi peta', 'Situs Mapbox', 'Peta', 'Gunakan Ctrl + gulir untuk memperbesar peta', 'Gunakan ⌘ + gulir untuk memperbesar peta', 'Gunakan dua jari untuk menggeser peta'],
  en: ['Toggle map attribution', 'Mapbox website', 'Map', 'Use Ctrl + scroll to zoom the map', 'Use ⌘ + scroll to zoom the map', 'Use two fingers to move the map'],
  'zh-cn': ['显示地图来源', 'Mapbox 网站', '地图', '按住 Ctrl 并滚动以缩放地图', '按住 ⌘ 并滚动以缩放地图', '使用双指移动地图'],
  'zh-tw': ['顯示地圖來源', 'Mapbox 網站', '地圖', '按住 Ctrl 並捲動以縮放地圖', '按住 ⌘ 並捲動以縮放地圖', '使用雙指移動地圖'],
  nl: ['Kaartvermelding tonen', 'Mapbox-website', 'Kaart', 'Gebruik Ctrl + scrollen om de kaart te zoomen', 'Gebruik ⌘ + scrollen om de kaart te zoomen', 'Gebruik twee vingers om de kaart te verplaatsen'],
  fr: ['Afficher les crédits de la carte', 'Site Mapbox', 'Carte', 'Utilisez Ctrl + défilement pour zoomer sur la carte', 'Utilisez ⌘ + défilement pour zoomer sur la carte', 'Utilisez deux doigts pour déplacer la carte'],
  de: ['Kartennachweise anzeigen', 'Mapbox-Website', 'Karte', 'Mit Strg + Scrollen die Karte zoomen', 'Mit ⌘ + Scrollen die Karte zoomen', 'Mit zwei Fingern die Karte verschieben'],
  ms: ['Paparkan atribusi peta', 'Laman Mapbox', 'Peta', 'Gunakan Ctrl + tatal untuk zum peta', 'Gunakan ⌘ + tatal untuk zum peta', 'Gunakan dua jari untuk menggerakkan peta']
};

const keys = ['AttributionControl.ToggleAttribution', 'LogoControl.Title', 'Map.Title', 'ScrollZoomBlocker.CtrlMessage', 'ScrollZoomBlocker.CmdMessage', 'TouchPanBlocker.Message'];

export function getMapboxLocale(locale) {
  const values = controls[locale] || controls.en;
  return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}
