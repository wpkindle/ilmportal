import { pakistaniCityAreas, allPakistaniCities } from '../data/pakistanAreas';

// Pakistani Cities with Latitude & Longitude Coordinates
export const pakistanCityCoordinates = {
  'Islamabad': { lat: 33.6844, lon: 73.0479 },
  'Rawalpindi': { lat: 33.5651, lon: 73.0169 },
  'Lahore': { lat: 31.5204, lon: 74.3587 },
  'Karachi': { lat: 24.8607, lon: 67.0011 },
  'Faisalabad': { lat: 31.4504, lon: 73.1350 },
  'Multan': { lat: 30.1575, lon: 71.5249 },
  'Peshawar': { lat: 34.0151, lon: 71.5249 },
  'Quetta': { lat: 30.1798, lon: 66.9750 },
  'Sialkot': { lat: 32.4945, lon: 74.5229 },
  'Gujranwala': { lat: 32.1877, lon: 74.1945 },
  'Abbottabad': { lat: 34.1688, lon: 73.2215 },
  'Hyderabad': { lat: 25.3960, lon: 68.3578 },
  'Bahawalpur': { lat: 29.3544, lon: 71.6911 },
  'Sargodha': { lat: 32.0836, lon: 72.6711 },
  'Sukkur': { lat: 27.7052, lon: 68.8574 },
  'Larkana': { lat: 27.5590, lon: 68.2120 },
  'Gujrat': { lat: 32.5742, lon: 74.0754 },
  'Sahiwal': { lat: 30.6682, lon: 73.1114 },
  'Kasur': { lat: 31.1179, lon: 74.4460 },
  'Okara': { lat: 30.8080, lon: 73.4458 },
  'Sheikhupura': { lat: 31.7131, lon: 73.9783 },
  'Rahim Yar Khan': { lat: 28.4195, lon: 70.2989 },
  'Jhang': { lat: 31.2781, lon: 72.3317 },
  'Dera Ghazi Khan': { lat: 30.0489, lon: 70.6455 },
  'Mardan': { lat: 34.1989, lon: 72.0405 },
  'Mingora (Swat)': { lat: 34.7758, lon: 72.3625 },
  'Muzaffarabad': { lat: 34.3705, lon: 73.4711 },
  'Mirpur (AJK)': { lat: 33.1484, lon: 73.7519 },
  'Gilgit': { lat: 35.9208, lon: 74.3089 },
  'Skardu': { lat: 35.2974, lon: 75.6337 },
  'Wah Cantt': { lat: 33.7715, lon: 72.7511 },
  'Chiniot': { lat: 31.7200, lon: 72.9789 },
  'Jhelum': { lat: 32.9405, lon: 73.7276 },
  'Kamoke': { lat: 31.9744, lon: 74.2244 },
  'Mandi Bahauddin': { lat: 32.5870, lon: 73.4912 },
  'Attock': { lat: 33.7667, lon: 72.3667 },
  'Chakwal': { lat: 32.9333, lon: 72.8667 },
  'Taxila': { lat: 33.7463, lon: 72.8397 },
  'Murree': { lat: 33.9070, lon: 73.3903 },
  'Gwadar': { lat: 25.1216, lon: 62.3254 }
};

// Haversine Distance in Kilometers
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest Pakistani city based on GPS coordinates
export function findNearestPakistaniCity(lat, lon) {
  let nearestCity = 'Lahore';
  let minDistance = Infinity;

  for (const [cityName, coords] of Object.entries(pakistanCityCoordinates)) {
    const dist = haversineDistance(lat, lon, coords.lat, coords.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = cityName;
    }
  }

  return {
    city: nearestCity,
    distanceKm: minDistance
  };
}

// Match detected area/suburb string with our known areas in that city
export function matchAreaInCity(detectedAreaText, city) {
  if (!detectedAreaText || !city) return '';
  const areasList = pakistaniCityAreas[city] || [];
  if (!areasList.length) return '';

  const cleanDetect = detectedAreaText.toLowerCase().replace(/[^a-z0-9]/g, ' ');

  // 1. Direct partial match
  for (const area of areasList) {
    const cleanArea = area.toLowerCase().replace(/[^a-z0-9]/g, ' ');
    const areaTokens = cleanArea.split(/\s+/).filter(t => t.length > 2);
    for (const token of areaTokens) {
      if (cleanDetect.includes(token)) {
        return area;
      }
    }
  }

  return '';
}

/**
 * Request user's live GPS location and resolve to Pakistani City & Local Area
 */
export async function detectUserLiveLocation() {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          
          // 1. First find closest Pakistani city via offline mathematical haversine
          const nearest = findNearestPakistaniCity(latitude, longitude);
          let matchedCity = nearest.city;
          let matchedArea = '';
          let rawAreaName = '';

          // 2. Try online reverse geocoding via OpenStreetMap Nominatim (with 3.5s timeout)
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const osmRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
              {
                signal: controller.signal,
                headers: {
                  'Accept-Language': 'en'
                }
              }
            );
            clearTimeout(timeoutId);

            if (osmRes.ok) {
              const data = await osmRes.json();
              if (data && data.address) {
                const addr = data.address;
                const detectedCity = addr.city || addr.town || addr.municipality || addr.county || addr.state_district;
                
                // Match city with our Pakistani cities directory if possible
                if (detectedCity) {
                  const directMatch = allPakistaniCities.find(
                    (c) => c.toLowerCase() === detectedCity.toLowerCase()
                  );
                  if (directMatch) {
                    matchedCity = directMatch;
                  } else {
                    const partialMatch = allPakistaniCities.find(
                      (c) => detectedCity.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(detectedCity.toLowerCase())
                    );
                    if (partialMatch) matchedCity = partialMatch;
                  }
                }

                // Extract neighborhood / area
                rawAreaName = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.road || '';
                if (rawAreaName) {
                  const areaMatch = matchAreaInCity(rawAreaName, matchedCity);
                  if (areaMatch) {
                    matchedArea = areaMatch;
                  } else {
                    matchedArea = rawAreaName;
                  }
                }
              }
            }
          } catch (osmErr) {
            console.warn('Nominatim reverse geocoding fallback to Haversine:', osmErr);
          }

          const displayName = matchedArea
            ? `${matchedArea}, ${matchedCity}`
            : matchedCity;

          resolve({
            success: true,
            city: matchedCity,
            area: matchedArea,
            rawArea: rawAreaName,
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            distanceKm: Math.round(nearest.distanceKm),
            displayName
          });
        } catch (err) {
          reject(new Error(err.message || 'Error resolving location coordinates.'));
        }
      },
      (error) => {
        let msg = 'Unable to detect your location.';
        if (error.code === 1) {
          msg = 'Location permission was denied. Please select your Pakistani city & area below.';
        } else if (error.code === 2) {
          msg = 'GPS signal unavailable. Please select your city & area manually.';
        } else if (error.code === 3) {
          msg = 'GPS location request timed out. Please select your city & area manually.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000
      }
    );
  });
}
