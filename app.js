/**
 * Wethr — Vanilla JavaScript Weather Application
 * Connects Open-Meteo Geocoding API with Open-Meteo Weather Forecast API.
 * Follows strict modular separation: fetching, shaping, and DOM rendering.
 * All functions are small (<25 lines), well-named, and documented.
 */

/* ==========================================================================
   1. CONSTANTS & SVG ICON ASSETS
   ========================================================================== */

const GEO_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
const STORAGE_KEY = 'wethr_last_location';

/**
 * Inline SVG templates for crisp weather representation without external assets.
 */
const SVG_ICONS = {
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  partlyDay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41" stroke="#f59e0b"/><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#94a3b8" fill="rgba(148,163,184,0.15)"/></svg>',
  partlyNight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" stroke="#fbbf24"/><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#94a3b8" fill="rgba(148,163,184,0.15)"/></svg>',
  cloudy: '<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
  fog: '<svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h16M4 18h16M7 10h10"/></svg>',
  drizzle: '<svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#94a3b8"/><path d="M8 19v1M12 19v1M16 19v1"/></svg>',
  rain: '<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#94a3b8"/><path d="m9 18-2 3M13 18l-2 3M17 18l-2 3"/></svg>',
  heavyRain: '<svg viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 15H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#64748b"/><path d="m8 17-2 4M12 17l-2 4M16 17l-2 4M20 17l-2 4"/></svg>',
  snow: '<svg viewBox="0 0 24 24" fill="none" stroke="#67e8f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#94a3b8"/><path d="M8 19h.01M12 19h.01M16 19h.01M10 22h.01M14 22h.01"/></svg>',
  thunder: '<svg viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 14H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" stroke="#475569"/><path d="m13 13-3 5h4l-2 5"/></svg>'
};

/**
 * WMO Weather interpretation code lookup table.
 * Maps numeric API codes to labels, theme groups, and icon keys.
 */
const WEATHER_CODES = {
  0: { label: 'Clear Sky', group: 'clear', icon: 'clear' },
  1: { label: 'Mainly Clear', group: 'clear', icon: 'clear' },
  2: { label: 'Partly Cloudy', group: 'cloudy', icon: 'partlyCloudy' },
  3: { label: 'Overcast', group: 'cloudy', icon: 'cloudy' },
  45: { label: 'Fog', group: 'cloudy', icon: 'fog' },
  48: { label: 'Depositing Rime Fog', group: 'cloudy', icon: 'fog' },
  51: { label: 'Light Drizzle', group: 'rain', icon: 'drizzle' },
  53: { label: 'Moderate Drizzle', group: 'rain', icon: 'drizzle' },
  55: { label: 'Dense Drizzle', group: 'rain', icon: 'drizzle' },
  56: { label: 'Light Freezing Drizzle', group: 'rain', icon: 'drizzle' },
  57: { label: 'Dense Freezing Drizzle', group: 'rain', icon: 'drizzle' },
  61: { label: 'Slight Rain', group: 'rain', icon: 'rain' },
  63: { label: 'Moderate Rain', group: 'rain', icon: 'rain' },
  65: { label: 'Heavy Rain', group: 'rain', icon: 'heavyRain' },
  66: { label: 'Light Freezing Rain', group: 'rain', icon: 'rain' },
  67: { label: 'Heavy Freezing Rain', group: 'rain', icon: 'heavyRain' },
  71: { label: 'Slight Snow Fall', group: 'snow', icon: 'snow' },
  73: { label: 'Moderate Snow Fall', group: 'snow', icon: 'snow' },
  75: { label: 'Heavy Snow Fall', group: 'snow', icon: 'snow' },
  77: { label: 'Snow Grains', group: 'snow', icon: 'snow' },
  80: { label: 'Slight Rain Showers', group: 'rain', icon: 'rain' },
  81: { label: 'Moderate Rain Showers', group: 'rain', icon: 'rain' },
  82: { label: 'Violent Rain Showers', group: 'rain', icon: 'heavyRain' },
  85: { label: 'Slight Snow Showers', group: 'snow', icon: 'snow' },
  86: { label: 'Heavy Snow Showers', group: 'snow', icon: 'snow' },
  95: { label: 'Thunderstorm', group: 'thunder', icon: 'thunder' },
  96: { label: 'Thunderstorm with Hail', group: 'thunder', icon: 'thunder' },
  99: { label: 'Thunderstorm with Heavy Hail', group: 'thunder', icon: 'thunder' }
};

/* ==========================================================================
   2. APPLICATION STATE
   ========================================================================== */

const state = {
  unit: 'C',
  current: null,
  forecast: null,
  place: null
};

/* ==========================================================================
   3. ICON & FORMATTING HELPERS
   ========================================================================== */

/**
 * Returns the appropriate SVG string considering day vs night status.
 * Why it exists: Fulfills the requirement to differentiate day/night icons.
 */
function renderWeatherIconSvg(iconKey, isDay) {
  if (iconKey === 'clear') return isDay ? SVG_ICONS.sun : SVG_ICONS.moon;
  if (iconKey === 'partlyCloudy') return isDay ? SVG_ICONS.partlyDay : SVG_ICONS.partlyNight;
  return SVG_ICONS[iconKey] || SVG_ICONS.cloudy;
}

/**
 * Converts Celsius to Fahrenheit if unit is 'F' and appends unit symbol.
 * Why it exists: Enables instant unit conversion without re-fetching from API.
 */
function formatTemp(celsius, unit) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--°';
  const val = unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(val)}°${unit}`;
}

/**
 * Retrieves label, theme group, and icon key from WMO code table.
 * Why it exists: Safely maps weather codes with fallback protection.
 */
function getWeatherMeta(code) {
  return WEATHER_CODES[code] || { label: 'Partly Cloudy', group: 'cloudy', icon: 'partlyCloudy' };
}

/* ==========================================================================
   4. DATA FETCHING (PURE NETWORK I/O)
   ========================================================================== */

/**
 * Fetches candidate locations matching the city name from Open-Meteo.
 * Why it exists: Carries out pure HTTP communication for geocoding.
 */
async function fetchLocations(cityName) {
  const url = `${GEO_API_URL}?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Location search failed with status ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetches current weather and 7-day forecast from Open-Meteo API.
 * Why it exists: Carries out pure HTTP communication for weather forecasts.
 */
async function fetchWeatherData(lat, lon) {
  const currentParams = 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day';
  const dailyParams = 'weather_code,temperature_2m_max,temperature_2m_min';
  const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current=${currentParams}&daily=${dailyParams}&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather forecast request failed with status ${response.status}`);
  }
  return await response.json();
}

/* ==========================================================================
   5. DATA SHAPING (TRANSFORMATIONS)
   ========================================================================== */

/**
 * Sorts locations by population (highest first) and builds display subtitles.
 * Why it exists: Disambiguates identical city names like "Delhi".
 */
function shapeLocationResults(rawData) {
  if (!rawData || !Array.isArray(rawData.results) || rawData.results.length === 0) {
    return [];
  }
  const sorted = [...rawData.results].sort((a, b) => (b.population || 0) - (a.population || 0));
  return sorted.map((item) => ({
    name: item.name,
    subtitle: [item.admin1, item.country].filter(Boolean).join(', '),
    latitude: item.latitude,
    longitude: item.longitude,
    population: item.population || 0
  }));
}

/**
 * Normalizes current conditions payload with labels, theme group, and icon.
 * Why it exists: Decouples raw API property names from rendering logic.
 */
function shapeCurrentWeather(rawCurrent) {
  const meta = getWeatherMeta(rawCurrent.weather_code);
  const isDay = rawCurrent.is_day === 1;
  return {
    celsiusTemp: rawCurrent.temperature_2m,
    celsiusFeelsLike: rawCurrent.apparent_temperature,
    humidity: rawCurrent.relative_humidity_2m,
    windSpeed: rawCurrent.wind_speed_10m,
    isDay: isDay,
    label: meta.label,
    group: meta.group,
    iconSvg: renderWeatherIconSvg(meta.icon, isDay)
  };
}

/**
 * Shapes raw daily forecast arrays into 7 day objects with names and icons.
 * Why it exists: Converts parallel arrays into an iterable card dataset.
 */
function shapeForecast(rawDaily) {
  if (!rawDaily || !Array.isArray(rawDaily.time)) return [];
  return rawDaily.time.map((dateStr, index) => {
    const meta = getWeatherMeta(rawDaily.weather_code[index]);
    const dateObj = new Date(dateStr + 'T00:00:00');
    return {
      dayName: index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: index === 0,
      label: meta.label,
      iconSvg: renderWeatherIconSvg(meta.icon, true),
      celsiusMax: rawDaily.temperature_2m_max[index],
      celsiusMin: rawDaily.temperature_2m_min[index]
    };
  });
}

/* ==========================================================================
   6. DOM RENDERING (UI UPDATES)
   ========================================================================== */

/**
 * Displays or hides the loading state spinner with a descriptive message.
 * Why it exists: Provides clear visual feedback during network operations.
 */
function setLoading(isLoading, message = 'Fetching weather data...') {
  const loadingEl = document.getElementById('loading-state');
  const loadingText = document.getElementById('loading-text');
  if (isLoading) {
    loadingText.textContent = message;
    loadingEl.classList.remove('hidden');
  } else {
    loadingEl.classList.add('hidden');
  }
}

/**
 * Displays the error message card to the user.
 * Why it exists: Informs the user of network, geocoding, or GPS errors.
 */
function showError(message) {
  const errorEl = document.getElementById('error-state');
  document.getElementById('error-message').textContent = message;
  errorEl.classList.remove('hidden');
}

/**
 * Hides the error message card.
 * Why it exists: Resets error display on new searches or manual dismissal.
 */
function clearError() {
  document.getElementById('error-state').classList.add('hidden');
}

/**
 * Toggles visibility between the empty state card and weather cards.
 * Why it exists: Ensures clean presentation when no weather is loaded.
 */
function setWeatherDisplayVisible(isVisible) {
  document.getElementById('weather-content').classList.toggle('hidden', !isVisible);
  document.getElementById('empty-state').classList.toggle('hidden', isVisible);
}

/**
 * Updates the document body background gradient for condition and time.
 * Why it exists: Creates the dynamic atmosphere matching local weather.
 */
function updatePageTheme(group, isDay) {
  document.body.dataset.theme = group || 'clear';
  document.body.dataset.time = isDay ? 'day' : 'night';
}

/**
 * Builds a single search result list item element with population badge.
 * Why it exists: Breaks down result list creation into a small pure unit.
 */
function createSearchResultItem(place, onSelect) {
  const li = document.createElement('li');
  li.className = 'result-item';
  li.tabIndex = 0;
  li.role = 'option';

  const info = document.createElement('div');
  info.className = 'result-place-info';
  info.innerHTML = `<span class="result-name">${place.name}</span>${place.subtitle ? `<span class="result-sub">${place.subtitle}</span>` : ''}`;
  li.appendChild(info);

  if (place.population > 0) {
    const badge = document.createElement('span');
    badge.className = 'result-pop-badge';
    badge.textContent = `Pop: ${place.population.toLocaleString()}`;
    li.appendChild(badge);
  }

  const select = () => onSelect(place);
  li.addEventListener('click', select);
  li.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && select());
  return li;
}

/**
 * Populates and shows the search results dropdown list.
 * Why it exists: Allows the user to select from disambiguated city candidates.
 */
function renderSearchResults(places, onSelect) {
  const container = document.getElementById('search-results-container');
  const list = document.getElementById('search-results-list');
  list.innerHTML = '';
  if (!places || places.length === 0) {
    container.classList.add('hidden');
    return;
  }
  places.forEach((place) => {
    const item = createSearchResultItem(place, (selected) => {
      container.classList.add('hidden');
      onSelect(selected);
    });
    list.appendChild(item);
  });
  container.classList.remove('hidden');
}

/**
 * Renders current temperature, condition label, metrics, and location info.
 * Why it exists: Updates the main hero weather display.
 */
function renderCurrentCard(current, place, unit) {
  document.getElementById('current-city-name').textContent = place.name;
  document.getElementById('current-location-sub').textContent = place.subtitle || 'Current Location';
  document.getElementById('current-temp').textContent = formatTemp(current.celsiusTemp, unit);
  document.getElementById('current-condition-label').textContent = current.label;
  document.getElementById('current-feels').textContent = formatTemp(current.celsiusFeelsLike, unit);
  document.getElementById('current-humidity').textContent = `${current.humidity}%`;
  document.getElementById('current-wind').textContent = `${current.windSpeed} km/h`;
  document.getElementById('current-icon').innerHTML = current.iconSvg;
}

/**
 * Constructs a single forecast card DOM element.
 * Why it exists: Keeps forecast card template creation modular and concise.
 */
function createForecastCardElement(item, unit) {
  const card = document.createElement('div');
  card.className = `forecast-card${item.isToday ? ' is-today' : ''}`;
  card.innerHTML = `
    <span class="forecast-day">${item.dayName}</span>
    <div class="forecast-icon" title="${item.label}">${item.iconSvg}</div>
    <div class="forecast-temps">
      <span class="forecast-high">${formatTemp(item.celsiusMax, unit)}</span>
      <span class="forecast-low">${formatTemp(item.celsiusMin, unit)}</span>
    </div>
  `;
  return card;
}

/**
 * Renders the 7-day daily forecast cards row.
 * Why it exists: Displays the weekly weather outlook.
 */
function renderForecastCards(forecastList, unit) {
  const container = document.getElementById('forecast-cards');
  container.innerHTML = '';
  forecastList.forEach((item) => {
    container.appendChild(createForecastCardElement(item, unit));
  });
}

/**
 * Updates the °C / °F toggle button visual active state.
 * Why it exists: Reflects the currently selected temperature scale.
 */
function updateUnitToggleButtons(activeUnit) {
  const isF = activeUnit === 'F';
  document.getElementById('unit-c').classList.toggle('active', !isF);
  document.getElementById('unit-f').classList.toggle('active', isF);
}

/* ==========================================================================
   7. LOCAL STORAGE & PERSISTENCE
   ========================================================================== */

/**
 * Persists the selected location object to localStorage.
 * Why it exists: Allows restoring the last viewed city on next page load.
 */
function savePlaceToStorage(place) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(place));
  } catch (err) {
    // Fail silently if storage is disabled or quota exceeded
  }
}

/**
 * Retrieves the previously saved location object from localStorage.
 * Why it exists: Restores user state seamlessly upon page load.
 */
function loadPlaceFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/* ==========================================================================
   8. APPLICATION CONTROLLERS & EVENT HANDLERS
   ========================================================================== */

/**
 * Loads and renders complete weather data for a given place.
 * Why it exists: Core controller coordinating fetching, shaping, and rendering.
 */
async function loadWeatherForPlace(place) {
  clearError();
  setLoading(true, `Fetching weather for ${place.name}...`);
  try {
    const rawWeatherData = await fetchWeatherData(place.latitude, place.longitude);
    state.place = place;
    state.current = shapeCurrentWeather(rawWeatherData.current);
    state.forecast = shapeForecast(rawWeatherData.daily);

    renderCurrentCard(state.current, state.place, state.unit);
    renderForecastCards(state.forecast, state.unit);
    updatePageTheme(state.current.group, state.current.isDay);
    setWeatherDisplayVisible(true);
    savePlaceToStorage(place);
  } catch (err) {
    showError('Unable to load weather forecast. Please check your internet connection.');
  } finally {
    setLoading(false);
  }
}

/**
 * Handles city search form submission.
 * Why it exists: Processes search input and presents candidate locations.
 */
async function handleSearch(event) {
  event.preventDefault();
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();
  if (!query) return;

  clearError();
  setLoading(true, `Searching for "${query}"...`);
  try {
    const rawGeoData = await fetchLocations(query);
    const places = shapeLocationResults(rawGeoData);
    if (places.length === 0) {
      showError(`No places found matching "${query}". Please check your spelling and try again.`);
      renderSearchResults([], null);
      return;
    }
    renderSearchResults(places, (selected) => {
      loadWeatherForPlace(selected);
      searchInput.value = '';
    });
  } catch (err) {
    showError('Network error while searching for places. Please check your connection.');
  } finally {
    setLoading(false);
  }
}

/**
 * Maps Geolocation API error codes into friendly user messages.
 * Why it exists: Isolates geolocation error translation into a dedicated handler.
 */
function handleGeoError(geoError) {
  setLoading(false);
  if (geoError.code === geoError.PERMISSION_DENIED) {
    showError('Location access was denied. Please allow location permissions or search manually.');
  } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
    showError('Location information is currently unavailable. Please search for a city instead.');
  } else if (geoError.code === geoError.TIMEOUT) {
    showError('Location request timed out. Please try again or search manually.');
  } else {
    showError('Unable to retrieve your location. Please search for a city.');
  }
}

/**
 * Requests browser geolocation coordinates and fetches corresponding weather.
 * Why it exists: Powers the "Use my location" feature.
 */
function handleUseMyLocation() {
  clearError();
  if (!('geolocation' in navigator)) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  setLoading(true, 'Detecting your coordinates...');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      loadWeatherForPlace({
        name: 'Your Location',
        subtitle: `GPS: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
        latitude: lat,
        longitude: lon
      });
    },
    handleGeoError,
    { timeout: 10000, maximumAge: 60000 }
  );
}

/**
 * Toggles active temperature unit (°C / °F) and updates the UI without refetching.
 * Why it exists: Provides instant unit toggle with zero network overhead.
 */
function handleUnitToggle() {
  state.unit = state.unit === 'C' ? 'F' : 'C';
  updateUnitToggleButtons(state.unit);
  if (state.current && state.place) {
    renderCurrentCard(state.current, state.place, state.unit);
  }
  if (state.forecast) {
    renderForecastCards(state.forecast, state.unit);
  }
}

/**
 * Registers DOM event listeners and restores saved place from localStorage on launch.
 * Why it exists: Boots up the application lifecycle.
 */
function initApp() {
  document.getElementById('search-form').addEventListener('submit', handleSearch);
  document.getElementById('geo-button').addEventListener('click', handleUseMyLocation);
  document.getElementById('unit-toggle').addEventListener('click', handleUnitToggle);
  document.getElementById('dismiss-error').addEventListener('click', clearError);
  document.getElementById('close-results').addEventListener('click', () => {
    document.getElementById('search-results-container').classList.add('hidden');
  });

  const savedPlace = loadPlaceFromStorage();
  if (savedPlace && savedPlace.latitude && savedPlace.longitude) {
    loadWeatherForPlace(savedPlace);
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
