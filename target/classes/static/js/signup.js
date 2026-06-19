let miniMap = null, miniMarker = null;

function onAreaChange(area) {
  const coords = PUNE_AREAS[area];
  if (!coords) return;
  const wrap = document.getElementById('areaMapWrap');
  wrap.style.display = 'block';
  if (!miniMap) {
    miniMap = L.map('areaMap', { zoomControl:false, attributionControl:false, dragging:false, scrollWheelZoom:false })
      .setView([coords.lat, coords.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(miniMap);
    const icon = L.divIcon({ className:'', html:'<div class="map-pin-rest"></div>', iconSize:[14,14], iconAnchor:[7,7] });
    miniMarker = L.marker([coords.lat, coords.lng], { icon }).addTo(miniMap);
  } else {
    miniMap.setView([coords.lat, coords.lng], 14);
    miniMarker.setLatLng([coords.lat, coords.lng]);
  }
  document.getElementById('areaMapLabel').textContent = `📍 Delivery pin set to ${area}, Pune`;
  setTimeout(() => miniMap.invalidateSize(), 60);
}
