const fs = require('fs');

const tsFilePath = 'c:\\Users\\LENOVO\\Desktop\\PJBK\\Punjabi_kitchen27june-master\\Punjabi_kitchen27june-master\\src\\data\\iconBase64.ts';
const htmlOutputPath = 'C:\\Users\\LENOVO\\.gemini\\antigravity-ide\\brain\\84bcbbcd-dd54-47b4-96d4-b5da31f3ae79\\scratch\\test_map.html';

try {
  const tsContent = fs.readFileSync(tsFilePath, 'utf8');
  // Extract base64 string between the double quotes
  const match = tsContent.match(/"(data:image\/png;base64,[^"]+)"/);
  if (!match) {
    throw new Error('Base64 string not found in TS file');
  }
  const iconUri = match[1];

  const htmlContent = `
<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
  .leaflet-control-attribution { display: none !important; }
  .leaflet-control-zoom { display: none !important; }
  
  .restaurant-pin {
    width: 52px; height: 52px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .restaurant-pin .pin-ring {
    position: absolute; width: 52px; height: 52px; border-radius: 50%;
    border: 2px solid rgba(201,168,76,0.4);
    animation: pinPulse 2s ease-in-out infinite;
  }
  .restaurant-pin .pin-core {
    width: 38px; height: 38px; border-radius: 50%;
    background-image: url('${iconUri}');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    border: 1.5px solid rgba(201,168,76,0.85);
    box-shadow: 0 2px 8px rgba(201,168,76,0.3);
    z-index: 2;
  }
  @keyframes pinPulse {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.35); opacity: 0; }
  }
</style>
</head><body>
<div id="map" style="width: 100vw; height: 100vh;"></div>
<script>
  var map = L.map('map', {
    center: [23.3569, 85.3340],
    zoom: 16,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(map);

  var pinIcon = L.divIcon({
    className: '',
    html: '<div class="restaurant-pin"><div class="pin-ring"></div><div class="pin-core"></div></div>',
    iconSize: [52, 52],
    iconAnchor: [26, 26]
  });
  L.marker([23.3569, 85.3340], { icon: pinIcon }).addTo(map);
</script>
</body></html>
  `;

  fs.writeFileSync(htmlOutputPath, htmlContent, 'utf8');
  console.log('HTML test file generated successfully!');
} catch (error) {
  console.error('Error generating HTML:', error);
}
