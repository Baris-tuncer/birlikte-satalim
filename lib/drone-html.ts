// ─── 3D Drone Görünümü HTML ──────────────────────────────────────
// Google Maps 3D Tiles ile binanın etrafında orbit animasyonu.
// react-native-webview içinde çalıştırılır.

const GOOGLE_MAPS_API_KEY = 'AIzaSyBeYv6dJF-FYVuUB023jK67Jf5PRUR_ZyM';

export interface DroneParams {
  lat: number;
  lng: number;
  altitude?: number;  // kamera yüksekliği (m), default 100
  radius?: number;    // dönüş yarıçapı (m), default 150
  duration?: number;  // tam tur süresi (ms), default 20000
  tilt?: number;      // kamera eğimi (derece), default 65
}

export function getDroneHtml(params: DroneParams): string {
  const {
    lat,
    lng,
    altitude = 100,
    radius = 150,
    duration = 20000,
    tilt = 65,
  } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    #loading {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center;
      background: #1A1A2E; color: #fff; font-family: -apple-system, sans-serif;
      font-size: 16px; z-index: 10;
    }
    #loading.hidden { display: none; }
    #error {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: none; align-items: center; justify-content: center;
      background: #1A1A2E; color: #EF4444; font-family: -apple-system, sans-serif;
      font-size: 14px; padding: 24px; text-align: center; z-index: 10;
    }
  </style>
</head>
<body>
  <div id="loading">3D Görünüm Yükleniyor...</div>
  <div id="error"></div>
  <div id="map"></div>

  <script>
    const LAT = ${lat};
    const LNG = ${lng};
    const ALTITUDE = ${altitude};
    const RADIUS = ${radius};
    const DURATION = ${duration};
    const TILT = ${tilt};

    let map3D = null;
    let rafId = null;
    let isOrbiting = false;

    function postMessage(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
      }
    }

    async function initMap() {
      try {
        const { Map3DElement } = await google.maps.importLibrary("maps3d");

        map3D = new Map3DElement({
          center: { lat: LAT, lng: LNG, altitude: 0 },
          range: RADIUS,
          tilt: TILT,
          heading: 0,
        });

        document.getElementById('map').appendChild(map3D);
        document.getElementById('loading').classList.add('hidden');
        postMessage('ready');
      } catch (e) {
        document.getElementById('loading').classList.add('hidden');
        const errDiv = document.getElementById('error');
        errDiv.style.display = 'flex';
        errDiv.textContent = '3D görünüm yüklenemedi: ' + e.message;
        postMessage('error', { message: e.message });
      }
    }

    function startOrbit() {
      if (!map3D || isOrbiting) return;
      isOrbiting = true;
      const startTime = performance.now();
      postMessage('orbitStarted');

      function animate(now) {
        if (!isOrbiting) return;
        const elapsed = now - startTime;
        const progress = (elapsed % DURATION) / DURATION;
        const heading = progress * 360;

        map3D.center = { lat: LAT, lng: LNG, altitude: 0 };
        map3D.range = RADIUS;
        map3D.tilt = TILT;
        map3D.heading = heading;

        rafId = requestAnimationFrame(animate);
      }
      rafId = requestAnimationFrame(animate);
    }

    function stopOrbit() {
      isOrbiting = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      postMessage('orbitStopped');
    }

    function resetView() {
      stopOrbit();
      if (map3D) {
        map3D.center = { lat: LAT, lng: LNG, altitude: 0 };
        map3D.range = RADIUS;
        map3D.tilt = TILT;
        map3D.heading = 0;
      }
      postMessage('viewReset');
    }
  </script>
  <script async
    src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=alpha&libraries=maps3d"
    onload="initMap()"
    onerror="document.getElementById('loading').classList.add('hidden');document.getElementById('error').style.display='flex';document.getElementById('error').textContent='Google Maps yüklenemedi. İnternet bağlantınızı kontrol edin.'">
  </script>
</body>
</html>`;
}

/** TKGM GeoJSON polygon koordinatlarından centroid hesapla */
export function calculateCentroid(coordinates: number[][][]): { lat: number; lng: number } | null {
  try {
    // GeoJSON Polygon: coordinates[0] dış halka (ring)
    const ring = coordinates[0];
    if (!ring || ring.length === 0) return null;

    let sumLng = 0;
    let sumLat = 0;
    // Son nokta ilkle aynı olabilir, onu dahil etme
    const count = ring[ring.length - 1][0] === ring[0][0] ? ring.length - 1 : ring.length;

    for (let i = 0; i < count; i++) {
      sumLng += ring[i][0];
      sumLat += ring[i][1];
    }

    return { lat: sumLat / count, lng: sumLng / count };
  } catch {
    return null;
  }
}
