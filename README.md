# 🌤️ Wethr — Real-Time Weather & 7-Day Forecast

A modern, fast, responsive weather web application built using **pure vanilla HTML, CSS, and JavaScript**. Zero frameworks, zero bundlers, no npm, and no build step required.

Live GitHub Pages URL: **[https://deepak-root.github.io/w1/](https://deepak-root.github.io/w1/)**

---

## ✨ Features

- **City Search & Disambiguation**: Search any city worldwide. Returns up to 5 matching candidates with `name + admin1 + country` (e.g., distinguishing *Delhi, India* from *Delhi, California* or *Delhi, New York*), sorted by population with highest first.
- **Current Conditions**: Displays real-time temperature, feels-like temperature, relative humidity, wind speed, weather condition label, and condition icon.
- **7-Day Daily Forecast**: Displays a row of forecast cards showing weekday names, condition icons, and daily high/low temperatures.
- **"Use My Location" (GPS)**: One-click geolocation fetching via `navigator.geolocation` directly retrieving weather for your coordinates.
- **Instant Unit Toggle (°C / °F)**: Switch between Celsius and Fahrenheit instantly with zero re-fetching.
- **Dynamic Condition Backgrounds**: The page gradient dynamically responds to conditions (`clear`, `cloudy`, `rain`, `snow`, `thunder`) and adapts for day vs. night.
- **Accessible & Responsive**: Mobile-first design that adapts smoothly from 320px screens up to wide desktops with zero horizontal overflow.
- **Dark Mode Support**: Respects system `prefers-color-scheme` settings for light and dark modes.
- **Offline / Local Persistence**: Remembers your last-viewed location using `localStorage` and restores it on page reload.
- **Resilient Error States**: Clear, friendly banners for network failures, nonexistent cities, and geolocation permission denials.

---

## 🚀 How to Run Locally

Because this project uses vanilla web standards with no ES modules or build tools:

### Option 1: Double-Click (Direct File Opening)
Simply double-click `index.html` in your file manager (Finder / File Explorer). The application will open immediately in your web browser via `file://`.

### Option 2: Local HTTP Server
You can also run a simple local HTTP server using Python or Node:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node / npx
npx serve .
```

Then navigate to `http://localhost:8000` in your browser.

---

## 📡 APIs & Data Sources

This application uses the open-access **Open-Meteo API**, which requires **no API key or registration**.

### 1. City Geocoding API
- **Endpoint**:
  ```text
  https://geocoding-api.open-meteo.com/v1/search?name=CITY&count=5&language=en&format=json
  ```
- **Purpose**: Converts city search terms into latitude and longitude coordinates, along with region (`admin1`), country, and population.

### 2. Weather Forecast API
- **Endpoint**:
  ```text
  https://api.open-meteo.com/v1/forecast?latitude=LAT&longitude=LON&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
  ```
- **Purpose**: Returns real-time measurements and a 7-day daily forecast for the specified coordinates.

### WMO Weather Code Mapping
Open-Meteo provides condition data as numeric WMO weather codes. `app.js` maps each code to a human label, theme group, and day/night SVG icon:

| Weather Code(s) | Condition Label | Group | Day/Night Icon |
| :--- | :--- | :--- | :--- |
| `0` | Clear Sky | `clear` | Sun ☀️ / Moon 🌙 |
| `1` | Mainly Clear | `clear` | Sun ☀️ / Moon 🌙 |
| `2` | Partly Cloudy | `cloudy` | Sun & Cloud ⛅ / Moon & Cloud ☁️ |
| `3` | Overcast | `cloudy` | Overcast Cloud ☁️ |
| `45`, `48` | Fog / Depositing Rime Fog | `cloudy` | Fog 🌫️ |
| `51`, `53`, `55` | Light / Moderate / Dense Drizzle | `rain` | Drizzle 🌦️ |
| `56`, `57` | Freezing Drizzle | `rain` | Freezing Rain 🌧️ |
| `61`, `63`, `65` | Slight / Moderate / Heavy Rain | `rain` | Rain 🌧️ |
| `66`, `67` | Freezing Rain | `rain` | Freezing Rain 🌧️ |
| `71`, `73`, `75`, `77` | Snow Fall / Grains | `snow` | Snow 🌨️ |
| `80`, `81`, `82` | Rain Showers | `rain` | Showers 🌧️ |
| `85`, `86` | Snow Showers | `snow` | Snow Showers 🌨️ |
| `95`, `96`, `99` | Thunderstorm / Thunderstorm with Hail | `thunder` | Thunderstorm ⛈️ |

---

## 🔗 How the Two Fetch Calls Connect Together

The architecture separates network fetching, data shaping, and DOM rendering:

```text
[ User Types "Delhi" & Submits ]
               │
               ▼
   fetchLocations("Delhi")
  (Open-Meteo Geocoding API)
               │
               ▼
   shapeLocationResults()
   - Sorts results by population descending
   - Delhi (India, 11M) > Delhi (CA, 10K) > Delhi (NY, 3K)
               │
               ▼
   renderSearchResults()
   - Displays selectable candidate list
               │
               ▼
[ User Clicks Selected Place (or "Use My Location") ]
   Extracts latitude & longitude
               │
               ▼
   fetchWeatherData(latitude, longitude)
  (Open-Meteo Forecast API)
               │
               ▼
   shapeCurrentWeather() & shapeForecast()
   - Translates WMO codes to labels & SVGs
   - Calculates "Today" and 7-day weekday names
   - Caches Celsius data in `state` object
               │
               ▼
   renderCurrentCard() & renderForecastCards()
   updatePageTheme()
   savePlaceToStorage()
```

When the user clicks the **°C / °F** toggle, the app modifies `state.unit` and invokes `renderCurrentCard()` and `renderForecastCards()` directly using mathematical conversion (`(C * 9/5) + 32`), **without making any network requests**.

---

## 📁 Repository Structure

```text
wethr/
├── .gitignore     # Ignores .DS_Store and .vscode/
├── index.html     # Semantic HTML5 layout, accessible controls, SVG favicon
├── style.css      # Vanilla CSS design system, responsive card UI, theme gradients
├── app.js         # Modular JavaScript (fetching, data shaping, DOM rendering)
└── README.md      # Documentation and deployment walkthrough
```

---

## 🚢 Deployment to GitHub Pages

All asset paths in this project are strictly relative (`./style.css`, `app.js` with no leading slashes), ensuring it functions correctly when hosted at sub-paths such as `https://USERNAME.github.io/REPO/`.

### Deployment Steps

1. **Initialize Git and Commit** (already staged locally):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: vanilla weather web app for GitHub Pages"
   ```

2. **Add Remote Origin**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/Deepak-root/w1.git
   ```

3. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub: `https://github.com/Deepak-root/w1`
   - Click **Settings** (top tab)
   - In the left sidebar, click **Pages**
   - Under **Build and deployment** → **Source**, select:
     - Source: `Deploy from a branch`
     - Branch: `main`
     - Folder: `/ (root)`
   - Click **Save**

5. **Access Your Live Site**:
   - URL: **`https://deepak-root.github.io/w1/`**
   - *Note: The initial GitHub Pages deployment usually takes 1 to 2 minutes to complete.*
