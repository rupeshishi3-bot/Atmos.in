/* ============================================================
   ATMOS — weather logic + living sky canvas
   API: Open-Meteo (no key required)
   ============================================================ */

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const LAST_PLACE_KEY = "atmos_last_place";
const UNIT_KEY = "atmos_unit";
const FAVORITES_KEY = "atmos_favorites";
const CACHE_PREFIX = "atmos_cache_";

const state = {
  unit: localStorage.getItem(UNIT_KEY) || "c", // "c" | "f"
  place: null,   // { name, admin1, country, latitude, longitude, timezone }
  data: null,    // last fetched forecast payload
  isCached: false,
  selectedHourIdx: null,
};

/* ---------------- WMO weather code interpretation ---------------- */
const WMO = {
  0:  { text: "Clear sky",            category: "clear" },
  1:  { text: "Mainly clear",         category: "clear" },
  2:  { text: "Partly cloudy",        category: "cloudy" },
  3:  { text: "Overcast",             category: "cloudy" },
  45: { text: "Fog",                  category: "fog" },
  48: { text: "Depositing rime fog",  category: "fog" },
  51: { text: "Light drizzle",        category: "rain" },
  53: { text: "Drizzle",              category: "rain" },
  55: { text: "Dense drizzle",        category: "rain" },
  56: { text: "Freezing drizzle",     category: "rain" },
  57: { text: "Dense freezing drizzle", category: "rain" },
  61: { text: "Light rain",           category: "rain" },
  63: { text: "Rain",                 category: "rain" },
  65: { text: "Heavy rain",           category: "rain" },
  66: { text: "Freezing rain",        category: "rain" },
  67: { text: "Heavy freezing rain",  category: "rain" },
  71: { text: "Light snow",           category: "snow" },
  73: { text: "Snow",                 category: "snow" },
  75: { text: "Heavy snow",           category: "snow" },
  77: { text: "Snow grains",          category: "snow" },
  80: { text: "Light rain showers",   category: "rain" },
  81: { text: "Rain showers",         category: "rain" },
  82: { text: "Violent rain showers", category: "rain" },
  85: { text: "Snow showers",         category: "snow" },
  86: { text: "Heavy snow showers",   category: "snow" },
  95: { text: "Thunderstorm",         category: "storm" },
  96: { text: "Thunderstorm, hail",   category: "storm" },
  99: { text: "Severe thunderstorm, hail", category: "storm" },
};
function weatherInfo(code){
  return WMO[code] || { text: "Unknown", category: "cloudy" };
}

/* ---------------- unit helpers ---------------- */
function cToF(c){ return c * 9 / 5 + 32; }
function displayTemp(celsius){
  const v = state.unit === "f" ? cToF(celsius) : celsius;
  return Math.round(v);
}
function unitSuffix(){ return state.unit === "f" ? "°F" : "°C"; }

/* ---------------- DOM refs ---------------- */
const $ = (id) => document.getElementById(id);
const loader = $("loader");
const loaderText = $("loaderText");
const errorBox = $("errorBox");
const errorText = $("errorText");
const weatherContent = $("weatherContent");
const cachedNotice = $("cachedNotice");

/* ============================================================
   GEOCODING + SEARCH
   ============================================================ */
const searchForm = $("searchForm");
const searchInput = $("searchInput");
const suggestions = $("suggestions");
let searchDebounce = null;
let activeSuggestionIndex = -1;
let currentSuggestions = [];

searchInput.addEventListener("input", () => {
  clearTimeout(searchDebounce);
  const q = searchInput.value.trim();
  if (q.length < 2){
    hideSuggestions();
    return;
  }
  searchDebounce = setTimeout(() => fetchSuggestions(q), 300);
});

searchInput.addEventListener("keydown", (e) => {
  if (suggestions.hidden) return;
  if (e.key === "ArrowDown"){
    e.preventDefault();
    activeSuggestionIndex = Math.min(activeSuggestionIndex + 1, currentSuggestions.length - 1);
    renderSuggestionActive();
  } else if (e.key === "ArrowUp"){
    e.preventDefault();
    activeSuggestionIndex = Math.max(activeSuggestionIndex - 1, 0);
    renderSuggestionActive();
  } else if (e.key === "Escape"){
    hideSuggestions();
  }
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (activeSuggestionIndex >= 0 && currentSuggestions[activeSuggestionIndex]){
    choosePlace(currentSuggestions[activeSuggestionIndex]);
  } else if (currentSuggestions[0]){
    choosePlace(currentSuggestions[0]);
  }
});

document.addEventListener("click", (e) => {
  if (!searchForm.contains(e.target)) hideSuggestions();
});

async function fetchSuggestions(query){
  try{
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    const res = await fetch(url);
    const json = await res.json();
    currentSuggestions = json.results || [];
    activeSuggestionIndex = -1;
    renderSuggestions();
  } catch(err){
    hideSuggestions();
  }
}

function renderSuggestions(){
  searchInput.setAttribute("aria-expanded", currentSuggestions.length > 0 ? "true" : "false");
  if (currentSuggestions.length === 0){
    suggestions.innerHTML = `<div class="suggestion-empty">No cities found</div>`;
    suggestions.hidden = false;
    return;
  }
  suggestions.innerHTML = "";
  currentSuggestions.forEach((place, i) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.setAttribute("role", "option");
    const region = [place.admin1, place.country].filter(Boolean).join(", ");
    item.innerHTML = `<span class="suggestion-name">${escapeHTML(place.name)}</span><span class="suggestion-region">${escapeHTML(region)}</span>`;
    item.addEventListener("click", () => choosePlace(place));
    item.addEventListener("mouseenter", () => { activeSuggestionIndex = i; renderSuggestionActive(); });
    suggestions.appendChild(item);
  });
  suggestions.hidden = false;
}

function renderSuggestionActive(){
  [...suggestions.children].forEach((el, i) => {
    el.classList.toggle("active", i === activeSuggestionIndex);
  });
}

function hideSuggestions(){
  suggestions.hidden = true;
  suggestions.innerHTML = "";
  currentSuggestions = [];
  activeSuggestionIndex = -1;
  searchInput.setAttribute("aria-expanded", "false");
}

function escapeHTML(str){
  const d = document.createElement("div");
  d.textContent = str == null ? "" : str;
  return d.innerHTML;
}

function choosePlace(place){
  hideSuggestions();
  searchInput.value = "";
  searchInput.blur();
  const normalized = {
    name: place.name,
    admin1: place.admin1 || "",
    country: place.country || "",
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  };
  localStorage.setItem(LAST_PLACE_KEY, JSON.stringify(normalized));
  setURLCity(normalized.name);
  loadWeather(normalized);
}

/* ============================================================
   GEOLOCATION
   ============================================================ */
const locateBtn = $("locateBtn");
locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation){
    showError("Geolocation isn't available in this browser.");
    return;
  }
  locateBtn.classList.add("spinning");
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      const place = await reverseLabel(latitude, longitude);
      locateBtn.classList.remove("spinning");
      localStorage.setItem(LAST_PLACE_KEY, JSON.stringify(place));
      setURLCity(null);
      loadWeather(place);
    },
    (err) => {
      locateBtn.classList.remove("spinning");
      if (err.code === 1) showError("Location access was denied. You can search for a city instead.");
      else if (err.code === 3) showError("Location request timed out. Try again or search for a city.");
      else showError("Couldn't get your location — check location permissions.");
    },
    { timeout: 8000 }
  );
});

async function reverseLabel(lat, lon){
  return {
    name: "Current location",
    admin1: "",
    country: "",
    latitude: lat,
    longitude: lon,
    timezone: "auto",
  };
}

/* ============================================================
   URL STATE
   ============================================================ */
function setURLCity(name){
  const url = new URL(window.location.href);
  if (name) url.searchParams.set("city", name);
  else url.searchParams.delete("city");
  window.history.replaceState({}, "", url);
}

async function placeFromURL(){
  const params = new URLSearchParams(window.location.search);
  const city = params.get("city");
  if (!city) return null;
  try{
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const json = await res.json();
    const place = json.results && json.results[0];
    if (!place) return null;
    return {
      name: place.name, admin1: place.admin1 || "", country: place.country || "",
      latitude: place.latitude, longitude: place.longitude, timezone: place.timezone,
    };
  } catch(e){ return null; }
}

/* ============================================================
   UNIT TOGGLE
   ============================================================ */
const unitToggle = $("unitToggle");
unitToggle.addEventListener("click", () => {
  state.unit = state.unit === "c" ? "f" : "c";
  localStorage.setItem(UNIT_KEY, state.unit);
  document.querySelector(".unit-c").classList.toggle("active", state.unit === "c");
  document.querySelector(".unit-f").classList.toggle("active", state.unit === "f");
  if (state.data) renderAll();
});

/* ============================================================
   SHARE
   ============================================================ */
const shareBtn = $("shareBtn");
shareBtn.addEventListener("click", async () => {
  if (!state.place || !state.data) return;
  const cur = state.data.current;
  const info = weatherInfo(cur.weather_code);
  const text = `${state.place.name}: ${displayTemp(cur.temperature_2m)}${unitSuffix()}, ${info.text.toLowerCase()} — via Atmos`;
  const url = new URL(window.location.href);
  url.searchParams.set("city", state.place.name);
  const shareUrl = url.toString();

  if (navigator.share){
    try{ await navigator.share({ title: "Atmos", text, url: shareUrl }); }
    catch(e){ /* user cancelled */ }
    return;
  }
  try{
    await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
    showToast("Copied forecast to clipboard");
  } catch(e){
    showToast("Couldn't copy — try manually");
  }
});

function showToast(msg){
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}

/* ============================================================
   FAVORITES
   ============================================================ */
function getFavorites(){
  try{ return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
  catch(e){ return []; }
}
function saveFavorites(list){
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
}
function isFavorite(place){
  return getFavorites().some(f => f.name === place.name && f.admin1 === place.admin1 && f.country === place.country);
}

const favBtn = $("favBtn");
favBtn.addEventListener("click", () => {
  if (!state.place) return;
  const favs = getFavorites();
  const idx = favs.findIndex(f => f.name === state.place.name && f.admin1 === state.place.admin1 && f.country === state.place.country);
  if (idx >= 0){
    favs.splice(idx, 1);
    showToast(`Removed ${state.place.name} from favorites`);
  } else {
    favs.push({
      name: state.place.name, admin1: state.place.admin1, country: state.place.country,
      latitude: state.place.latitude, longitude: state.place.longitude, timezone: state.place.timezone,
    });
    showToast(`Saved ${state.place.name} to favorites`);
  }
  saveFavorites(favs);
  updateFavButton();
  renderFavorites();
});

function updateFavButton(){
  if (!state.place) return;
  favBtn.classList.toggle("active", isFavorite(state.place));
}

function renderFavorites(){
  const wrap = $("favoritesWrap");
  const list = $("favoritesList");
  const favs = getFavorites();
  wrap.hidden = false;
  if (favs.length === 0){
    list.innerHTML = `<p class="favorites-empty">No favorites yet — tap the star icon on any city to save it here.</p>`;
    return;
  }
  list.innerHTML = "";
  favs.forEach(f => {
    const chip = document.createElement("div");
    chip.className = "fav-chip";
    chip.innerHTML = `
      <span class="fav-chip-name">${escapeHTML(f.name)}</span>
      <span class="fav-chip-temp" data-fav="${escapeHTML(f.name)}">…</span>
      <button class="fav-chip-remove" aria-label="Remove ${escapeHTML(f.name)}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      </button>
    `;
    chip.addEventListener("click", (e) => {
      if (e.target.closest(".fav-chip-remove")) return;
      setURLCity(f.name);
      loadWeather(f);
    });
    chip.querySelector(".fav-chip-remove").addEventListener("click", (e) => {
      e.stopPropagation();
      const updated = getFavorites().filter(x => !(x.name === f.name && x.admin1 === f.admin1 && x.country === f.country));
      saveFavorites(updated);
      renderFavorites();
      updateFavButton();
    });
    list.appendChild(chip);
    fetchFavTemp(f, chip.querySelector(".fav-chip-temp"));
  });
}

async function fetchFavTemp(place, el){
  try{
    const params = new URLSearchParams({
      latitude: place.latitude, longitude: place.longitude,
      current: "temperature_2m", timezone: "auto",
    });
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
    const json = await res.json();
    el.textContent = `${displayTemp(json.current.temperature_2m)}${unitSuffix()}`;
  } catch(e){ el.textContent = "—"; }
}

/* ============================================================
   FETCH FORECAST
   ============================================================ */
async function loadWeather(place){
  state.place = place;
  state.selectedHourIdx = null;
  showLoading();
  try{
    const params = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,is_day,cloud_cover",
      hourly: "temperature_2m,weather_code,precipitation_probability,wind_speed_10m,uv_index",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max",
      timezone: "auto",
      forecast_days: "7",
    });
    const res = await fetch(`${FORECAST_URL}?${params.toString()}`);
    if (!res.ok) throw new Error("forecast fetch failed");
    const json = await res.json();
    state.data = json;
    state.isCached = false;
    if (place.timezone === "auto" || !place.timezone){
      state.place.timezone = json.timezone;
    }
    cacheWeather(place, json);
    renderAll();
  } catch(err){
    const cached = readCache(place);
    if (cached){
      state.data = cached;
      state.isCached = true;
      renderAll();
    } else {
      showError("Couldn't load the forecast. Check your connection and try again.");
    }
  }
}

function cacheKey(place){
  return CACHE_PREFIX + place.name.toLowerCase().replace(/\s+/g, "_");
}
function cacheWeather(place, data){
  try{
    localStorage.setItem(cacheKey(place), JSON.stringify({ data, savedAt: Date.now() }));
  } catch(e){ /* storage full — ignore */ }
}
function readCache(place){
  try{
    const raw = localStorage.getItem(cacheKey(place));
    if (!raw) return null;
    return JSON.parse(raw).data;
  } catch(e){ return null; }
}

/* ============================================================
   RENDER — top-level
   ============================================================ */
function showLoading(msg){
  loader.hidden = false;
  loaderText.textContent = msg || "Reading the sky…";
  errorBox.hidden = true;
  weatherContent.hidden = true;
}
function showError(msg){
  loader.hidden = true;
  errorBox.hidden = false;
  errorText.textContent = msg;
  weatherContent.hidden = true;
}

function renderAll(){
  loader.hidden = true;
  errorBox.hidden = true;
  weatherContent.hidden = false;
  cachedNotice.hidden = !state.isCached;

  renderHero();
  renderIntelligence();
  renderBestTime();
  renderHourly();
  renderAlmanac();
  renderStats();
  updateFavButton();
  renderFavorites();
  updateSky();
  document.title = `${state.place.name} Weather — ${displayTemp(state.data.current.temperature_2m)}${unitSuffix()} | Atmos`;
}

function renderHero(){
  const { place, data } = state;
  const cur = data.current;
  const info = weatherInfo(cur.weather_code);

  $("heroLocation").textContent = [place.name, place.admin1 || place.country].filter(Boolean).join(", ");
  $("heroDatetime").textContent = formatNow(data.timezone);
  $("heroTemp").innerHTML = `${displayTemp(cur.temperature_2m)}<span class="hero-deg">°</span>`;
  $("heroCondition").textContent = info.text;
  $("heroFeels").textContent = `${displayTemp(cur.apparent_temperature)}${unitSuffix()}`;

  const today = data.daily;
  $("heroHigh").textContent = `${displayTemp(today.temperature_2m_max[0])}${unitSuffix()}`;
  $("heroLow").textContent = `${displayTemp(today.temperature_2m_min[0])}${unitSuffix()}`;

  const chips = $("heroChips");
  const precipToday = today.precipitation_probability_max ? today.precipitation_probability_max[0] : null;
  const chipData = [
    { icon: "wind", label: `${Math.round(cur.wind_speed_10m)} km/h wind` },
    { icon: "drop", label: `${Math.round(cur.relative_humidity_2m)}% humidity` },
    precipToday != null ? { icon: "rain", label: `${Math.round(precipToday)}% rain chance` } : null,
    today.uv_index_max ? { icon: "sun", label: `UV ${Math.round(today.uv_index_max[0])}` } : null,
  ].filter(Boolean);

  chips.innerHTML = chipData.map(c => `<span class="hero-chip">${chipIcon(c.icon)}${c.label}</span>`).join("");
}

function chipIcon(kind){
  const icons = {
    wind: `<svg viewBox="0 0 16 16" fill="none"><path d="M2 6h8a2 2 0 1 0-2-2M2 10h10a2 2 0 1 1-2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
    drop: `<svg viewBox="0 0 16 16" fill="none"><path d="M8 2s5 5.2 5 8.5A5 5 0 0 1 3 10.5C3 7.2 8 2 8 2z" stroke="currentColor" stroke-width="1.3"/></svg>`,
    rain: `<svg viewBox="0 0 16 16" fill="none"><path d="M4 9.5h8.2a3 3 0 0 0 .3-6 4.3 4.3 0 0 0-8.2-1.2A3.3 3.3 0 0 0 4 9.5z" stroke="currentColor" stroke-width="1.2"/><path d="M6 12l-1 2M10 12l-1 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    sun: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  };
  return icons[kind] || "";
}

function formatNow(tz){
  try{
    return new Date().toLocaleString("en-US", {
      timeZone: tz, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit"
    });
  } catch(e){
    return "";
  }
}

/* ============================================================
   TODAY'S INTELLIGENCE
   ============================================================ */
function renderIntelligence(){
  const { data } = state;
  const wrap = $("intelWrap");
  const grid = $("intelGrid");

  const todayHours = todaysHourlySlice();
  if (todayHours.length < 3){
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;

  const temps = todayHours.map(h => h.temp);
  const hottest = todayHours[argmax(temps)];
  const coolest = todayHours[argmin(temps)];

  const precipVals = todayHours.map(h => h.precip ?? 0);
  const rainiest = todayHours[argmax(precipVals)];

  const windVals = todayHours.map(h => h.wind ?? 0);
  const windiest = todayHours[argmax(windVals)];

  const uvVals = todayHours.map(h => h.uv ?? 0);
  const uvPeak = todayHours[argmax(uvVals)];

  const firstTemp = temps[0];
  const lastTemp = temps[temps.length - 1];
  const trend = lastTemp - firstTemp > 1.5 ? "rising" : firstTemp - lastTemp > 1.5 ? "falling" : "steady";

  const cards = [];

  cards.push({
    label: "Temperature",
    text: trend === "rising"
      ? `Temperatures climb through the day, peaking near <b>${displayTemp(hottest.temp)}${unitSuffix()}</b> around ${fmtHour(hottest.time)}.`
      : trend === "falling"
      ? `Temperatures ease through the day, dropping to <b>${displayTemp(coolest.temp)}${unitSuffix()}</b> by ${fmtHour(coolest.time)}.`
      : `Conditions stay fairly steady, ranging <b>${displayTemp(coolest.temp)}°–${displayTemp(hottest.temp)}${unitSuffix()}</b>.`,
  });

  if (Math.max(...precipVals) >= 20){
    cards.push({
      label: "Rain",
      text: `Rain probability peaks at <b>${Math.round(rainiest.precip)}%</b> around ${fmtHour(rainiest.time)}.`,
    });
  } else {
    cards.push({
      label: "Rain",
      text: `Low rain probability all day — stays under <b>${Math.round(Math.max(...precipVals))}%</b>.`,
    });
  }

  cards.push({
    label: "Wind",
    text: `Wind is strongest around ${fmtHour(windiest.time)} at <b>${Math.round(windiest.wind)} km/h</b>.`,
  });

  if (Math.max(...uvVals) >= 3){
    cards.push({
      label: "UV",
      text: `UV peaks at <b>${Math.round(uvPeak.uv)}</b> near ${fmtHour(uvPeak.time)} — sun protection matters then.`,
    });
  }

  grid.innerHTML = cards.map(c => `
    <div class="intel-card">
      <p class="intel-card-label">${c.label}</p>
      <p class="intel-card-text">${c.text}</p>
    </div>
  `).join("");
}

function todaysHourlySlice(){
  const { data } = state;
  const nowISO = data.current.time;
  const todayDate = nowISO.slice(0, 10);
  const out = [];
  data.hourly.time.forEach((iso, idx) => {
    if (!iso.startsWith(todayDate)) return;
    if (iso < nowISO) return;
    out.push({
      time: iso,
      temp: data.hourly.temperature_2m[idx],
      precip: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[idx] : null,
      wind: data.hourly.wind_speed_10m ? data.hourly.wind_speed_10m[idx] : null,
      uv: data.hourly.uv_index ? data.hourly.uv_index[idx] : null,
      code: data.hourly.weather_code[idx],
    });
  });
  return out;
}

function argmax(arr){ return arr.reduce((best, v, i) => v > arr[best] ? i : best, 0); }
function argmin(arr){ return arr.reduce((best, v, i) => v < arr[best] ? i : best, 0); }
function fmtHour(iso){
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric" });
}

/* ============================================================
   BEST TIME TODAY
   ============================================================ */
function renderBestTime(){
  const wrap = $("bestTimeWrap");
  const card = $("bestTimeCard");
  const hours = todaysHourlySlice();

  if (hours.length < 4){
    wrap.hidden = true;
    return;
  }
  wrap.hidden = false;

  const temps = hours.map(h => h.temp);
  const midTemp = (Math.min(...temps) + Math.max(...temps)) / 2;

  const scored = hours.map(h => {
    const precip = h.precip ?? 0;
    const wind = h.wind ?? 0;
    const uv = h.uv ?? 0;
    const tempComfort = 10 - Math.min(10, Math.abs(h.temp - midTemp) * 0.6);
    const rainCode = weatherInfo(h.code).category === "rain" || weatherInfo(h.code).category === "storm";
    let score = tempComfort - precip * 0.12 - Math.max(0, wind - 15) * 0.15 - Math.max(0, uv - 6) * 1.2;
    if (rainCode) score -= 6;
    return { ...h, score };
  });

  // find best contiguous 2-hour window by average score
  let bestStart = 0, bestAvg = -Infinity;
  for (let i = 0; i < scored.length - 1; i++){
    const avg = (scored[i].score + scored[i + 1].score) / 2;
    if (avg > bestAvg){ bestAvg = avg; bestStart = i; }
  }
  const windowHours = scored.slice(bestStart, bestStart + 2);
  if (windowHours.length === 0){
    card.innerHTML = `<p class="bt-none">Not enough data to recommend a window today.</p>`;
    return;
  }

  const startLabel = fmtHour(windowHours[0].time);
  const endTime = new Date(windowHours[windowHours.length - 1].time);
  endTime.setHours(endTime.getHours() + 1);
  const endLabel = endTime.toLocaleTimeString("en-US", { hour: "numeric" });

  const avgTemp = Math.round(windowHours.reduce((s, h) => s + h.temp, 0) / windowHours.length);
  const avgPrecip = Math.round(windowHours.reduce((s, h) => s + (h.precip ?? 0), 0) / windowHours.length);
  const avgWind = Math.round(windowHours.reduce((s, h) => s + (h.wind ?? 0), 0) / windowHours.length);

  const reasons = [];
  if (avgPrecip < 20) reasons.push("low rain probability");
  if (avgWind < 15) reasons.push("calm wind");
  const allTemps = scored.map(h => h.temp);
  if (avgTemp <= (Math.max(...allTemps) + Math.min(...allTemps)) / 2) reasons.push("cooler temperatures");
  if (reasons.length === 0) reasons.push("the most balanced conditions available today");

  card.innerHTML = `
    <p class="bt-window">${startLabel} — ${endLabel}</p>
    <div class="bt-meta">
      <span><b>${displayTemp(avgTemp)}${unitSuffix()}</b></span>
      <span>${avgPrecip}% rain chance</span>
      <span>${avgWind} km/h wind</span>
    </div>
    <p class="bt-why"><b>Why:</b> ${reasons.join(" + ")}.</p>
  `;
}

/* ============================================================
   HOURLY FORECAST — ticker + SVG chart + tap detail
   ============================================================ */
function renderHourly(){
  const { data } = state;
  const wrap = $("tickerWrap");
  wrap.hidden = false;
  const ticker = $("ticker");
  ticker.innerHTML = "";
  $("hourDetail").hidden = true;

  const nowISO = data.current.time;
  const startIdx = data.hourly.time.findIndex(t => t >= nowISO);
  const from = startIdx === -1 ? 0 : startIdx;
  const slice = data.hourly.time.slice(from, from + 24);
  const temps = slice.map((_, i) => data.hourly.temperature_2m[from + i]);
  const minT = Math.min(...temps), maxT = Math.max(...temps);
  const span = Math.max(1, maxT - minT);

  slice.forEach((iso, i) => {
    const idx = from + i;
    const code = data.hourly.weather_code[idx];
    const temp = data.hourly.temperature_2m[idx];
    const precip = data.hourly.precipitation_probability ? data.hourly.precipitation_probability[idx] : null;
    const info = weatherInfo(code);
    const d = new Date(iso);
    const isNow = i === 0;

    const item = document.createElement("div");
    item.className = "ticker-item" + (isNow ? " now" : "");
    item.setAttribute("role", "option");
    item.tabIndex = 0;
    item.innerHTML = `
      <span class="ticker-time">${isNow ? "Now" : d.toLocaleTimeString("en-US", { hour: "numeric" })}</span>
      <span class="ticker-icon">${weatherIconSVG(info.category, isDaytimeAt(d))}</span>
      <span class="ticker-temp">${displayTemp(temp)}°</span>
      <span class="ticker-precip">${precip != null && precip >= 20 ? precip + "%" : ""}</span>
    `;
    const select = () => selectHour(idx, item);
    item.addEventListener("click", select);
    item.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); select(); } });
    ticker.appendChild(item);
  });

  drawHourlyChart(slice.map((iso, i) => ({ iso, temp: temps[i] })), minT, span);
}

function selectHour(idx, el){
  document.querySelectorAll(".ticker-item.selected").forEach(n => n.classList.remove("selected"));
  el.classList.add("selected");
  const { data } = state;
  const iso = data.hourly.time[idx];
  const temp = data.hourly.temperature_2m[idx];
  const precip = data.hourly.precipitation_probability ? data.hourly.precipitation_probability[idx] : null;
  const wind = data.hourly.wind_speed_10m ? data.hourly.wind_speed_10m[idx] : null;
  const uv = data.hourly.uv_index ? data.hourly.uv_index[idx] : null;
  const info = weatherInfo(data.hourly.weather_code[idx]);
  const d = new Date(iso);

  const detail = $("hourDetail");
  detail.hidden = false;
  detail.innerHTML = `
    <span><b>${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</b> · ${info.text}</span>
    <span>Temp <b>${displayTemp(temp)}${unitSuffix()}</b></span>
    ${precip != null ? `<span>Rain <b>${Math.round(precip)}%</b></span>` : ""}
    ${wind != null ? `<span>Wind <b>${Math.round(wind)} km/h</b></span>` : ""}
    ${uv != null ? `<span>UV <b>${Math.round(uv)}</b></span>` : ""}
  `;
}

function isDaytimeAt(date){
  const h = date.getHours();
  return h >= 6 && h < 18;
}

function drawHourlyChart(points, minT, span){
  const svg = $("hourlyChart");
  const w = 100, h = 40, pad = 6;
  const stepX = (w) / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = pad + (1 - (p.temp - minT) / span) * (h - pad * 2);
    return [x, y];
  });
  const path = coords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(2) + "," + c[1].toFixed(2)).join(" ");
  const areaPath = path + ` L${w},${h} L0,${h} Z`;

  const maxIdx = points.reduce((best, p, i) => (p.temp > points[best].temp ? i : best), 0);
  const minIdx = points.reduce((best, p, i) => (p.temp < points[best].temp ? i : best), 0);

  const dots = coords.map((c, i) => {
    if (i === 0){
      return `
        <circle cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="3.2" fill="none" stroke="#D6B36A" stroke-width="0.9" opacity="0.55"></circle>
        <circle cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="1.6" fill="#F0D9A0"></circle>
      `;
    }
    if (i === maxIdx || i === minIdx){
      return `<circle cx="${c[0].toFixed(2)}" cy="${c[1].toFixed(2)}" r="1.1" fill="#F4EFE4" opacity="0.85"></circle>`;
    }
    return "";
  }).join("");

  const labels = `
    <text x="${coords[maxIdx][0].toFixed(2)}" y="${Math.max(4, coords[maxIdx][1] - 3).toFixed(2)}"
      font-size="4.2" text-anchor="middle" fill="#F0D9A0" font-family="IBM Plex Mono, monospace">${Math.round(points[maxIdx].temp)}°</text>
    <text x="${coords[minIdx][0].toFixed(2)}" y="${Math.min(h - 1, coords[minIdx][1] + 7).toFixed(2)}"
      font-size="4.2" text-anchor="middle" fill="#B9AF9B" font-family="IBM Plex Mono, monospace">${Math.round(points[minIdx].temp)}°</text>
  `;

  svg.innerHTML = `
    <defs>
      <linearGradient id="hourlyFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D6B36A" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="#D6B36A" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${areaPath}" fill="url(#hourlyFill)" stroke="none"></path>
    <path d="${path}" fill="none" stroke="#D6B36A" stroke-width="1.3" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"></path>
    ${dots}
    ${labels}
  `;
}

/* ============================================================
   SEVEN-DAY ALMANAC
   ============================================================ */
function renderAlmanac(){
  const { data } = state;
  const almanac = $("almanac");
  almanac.innerHTML = "";

  const days = data.daily.time;
  const maxes = data.daily.temperature_2m_max;
  const mins = data.daily.temperature_2m_min;
  const codes = data.daily.weather_code;
  const precipMax = data.daily.precipitation_probability_max;
  const windMax = data.daily.wind_speed_10m_max;
  const uvMax = data.daily.uv_index_max;

  const globalMax = Math.max(...maxes);
  const globalMin = Math.min(...mins);
  const span = Math.max(1, globalMax - globalMin);

  days.forEach((iso, i) => {
    const d = new Date(iso + "T12:00:00");
    const info = weatherInfo(codes[i]);
    const dayLabel = i === 0 ? "Today" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dateSub = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const left = ((mins[i] - globalMin) / span) * 100;
    const width = ((maxes[i] - mins[i]) / span) * 100;

    const row = document.createElement("div");
    row.className = "almanac-row";
    row.setAttribute("role", "button");
    row.tabIndex = 0;
    row.innerHTML = `
      <div class="almanac-day">${dayLabel}<span class="almanac-day-sub">${dateSub}</span></div>
      <span class="almanac-icon">${weatherIconSVG(info.category, true)}</span>
      <span class="almanac-condition">${info.text}</span>
      <div class="almanac-range">
        <span class="almanac-low">${displayTemp(mins[i])}°</span>
        <span class="almanac-bar"><span class="almanac-bar-fill" style="left:${left}%; width:${Math.max(width, 6)}%"></span></span>
        <span class="almanac-high">${displayTemp(maxes[i])}°</span>
      </div>
    `;
    const toggle = () => {
      const already = row.nextElementSibling && row.nextElementSibling.classList.contains("almanac-extra-wrap");
      document.querySelectorAll(".almanac-extra-wrap").forEach(n => n.remove());
      if (already) return;
      const extra = document.createElement("div");
      extra.className = "almanac-extra-wrap";
      extra.innerHTML = `<div class="almanac-extra">
        ${precipMax ? `<span>Rain chance ${Math.round(precipMax[i])}%</span>` : ""}
        ${windMax ? `<span>Wind up to ${Math.round(windMax[i])} km/h</span>` : ""}
        ${uvMax ? `<span>UV max ${Math.round(uvMax[i])}</span>` : ""}
      </div>`;
      row.insertAdjacentElement("afterend", extra);
    };
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); toggle(); } });
    almanac.appendChild(row);
  });
}

/* ============================================================
   INSTRUMENT READOUT — mixed visualizations
   ============================================================ */
function renderStats(){
  const { data } = state;
  const cur = data.current;
  const today = data.daily;
  const grid = $("statsGrid");

  const sunriseD = new Date(today.sunrise[0]);
  const sunsetD = new Date(today.sunset[0]);
  const sunrise = sunriseD.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const sunset = sunsetD.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const daylightMs = sunsetD - sunriseD;
  const daylightH = Math.floor(daylightMs / 3600000);
  const daylightM = Math.round((daylightMs % 3600000) / 60000);

  const humidity = Math.round(cur.relative_humidity_2m);
  const uv = Math.round(today.uv_index_max[0]);
  const pressure = Math.round(cur.surface_pressure);
  const wind = Math.round(cur.wind_speed_10m);
  const windDir = cur.wind_direction_10m;

  grid.innerHTML = `
    <div class="stat-cell">
      <p class="stat-label">Humidity</p>
      <p class="stat-value">${humidity}<span> %</span></p>
      <div class="stat-visual stat-gauge">${gaugeSVG(humidity, 100, "#D6B36A")}</div>
    </div>

    <div class="stat-cell">
      <p class="stat-label">UV index</p>
      <p class="stat-value">${uv}<span> max</span></p>
      <div class="stat-visual stat-gauge">${gaugeSVG(uv, 11, "#F0C878")}</div>
    </div>

    <div class="stat-cell">
      <p class="stat-label">Wind</p>
      <p class="stat-value">${wind}<span> km/h</span></p>
      <div class="stat-visual stat-compass">${compassSVG(windDir)}</div>
    </div>

    <div class="stat-cell">
      <p class="stat-label">Pressure</p>
      <p class="stat-value">${pressure}<span> hPa</span></p>
      <div class="stat-visual"><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${pressureFill(pressure)}%"></div></div></div>
    </div>

    <div class="stat-cell wide">
      <p class="stat-label">Sun &amp; daylight</p>
      <p class="stat-value">${daylightH}<span> h</span> ${daylightM}<span> min</span></p>
      <div class="stat-visual sun-timeline">
        ${sunArcSVG(cur.is_day === 1)}
        <div class="sun-timeline-labels"><span>${sunrise}</span><span>${sunset}</span></div>
      </div>
    </div>

    <div class="stat-cell">
      <p class="stat-label">Cloud cover</p>
      <p class="stat-value">${cur.cloud_cover != null ? Math.round(cur.cloud_cover) : "—"}<span> %</span></p>
      <div class="stat-visual"><div class="stat-bar-track"><div class="stat-bar-fill" style="width:${cur.cloud_cover || 0}%"></div></div></div>
    </div>
  `;
}

function gaugeSVG(value, max, color){
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 26, c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  return `
    <svg viewBox="0 0 64 64">
      <circle class="stat-gauge-track" cx="32" cy="32" r="${r}" stroke-width="5"></circle>
      <circle class="stat-gauge-fill" cx="32" cy="32" r="${r}" stroke-width="5"
        stroke="${color}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
        transform="rotate(-90 32 32)"></circle>
    </svg>
  `;
}

function compassSVG(deg){
  const d = deg != null ? deg : 0;
  return `
    <svg viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="19" stroke="var(--hairline-strong)" stroke-width="1.3" fill="none"></circle>
      <g class="stat-compass-needle" style="transform: rotate(${d}deg)">
        <line x1="22" y1="8" x2="22" y2="22" stroke="#9C86E8" stroke-width="2" stroke-linecap="round"></line>
        <circle cx="22" cy="22" r="2" fill="#9C86E8"></circle>
      </g>
    </svg>
  `;
}

function pressureFill(hpa){
  // typical sea-level range ~980-1040 hPa
  const pct = ((hpa - 980) / (1040 - 980)) * 100;
  return Math.max(4, Math.min(100, pct));
}

function sunArcSVG(isDay){
  return `
    <svg viewBox="0 0 200 36" preserveAspectRatio="none">
      <path d="M4 30 Q100 -6 196 30" fill="none" stroke="var(--hairline-strong)" stroke-width="1.5"></path>
      <circle cx="${isDay ? 100 : 4}" cy="${isDay ? 8 : 30}" r="4" fill="#F0C878"></circle>
    </svg>
  `;
}

/* ---------------- weather icons (inline SVG, currentColor) ---------------- */
function weatherIconSVG(category, isDay){
  const stroke = 'stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"';
  switch(category){
    case "clear":
      return isDay
        ? `<svg viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>`
        : `<svg viewBox="0 0 24 24" ${stroke}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.4 6.4 0 1 0 10.5 10.5z"/></svg>`;
    case "cloudy":
      return `<svg viewBox="0 0 24 24" ${stroke}><path d="M7.5 18h9.2a3.8 3.8 0 0 0 .4-7.6 5.4 5.4 0 0 0-10.3-1.6A4.2 4.2 0 0 0 7.5 18z"/></svg>`;
    case "fog":
      return `<svg viewBox="0 0 24 24" ${stroke}><path d="M6 10.5h9.2a3.8 3.8 0 0 0 .3-7.5"/><line x1="3.5" y1="15" x2="20.5" y2="15"/><line x1="3.5" y1="19" x2="20.5" y2="19"/></svg>`;
    case "rain":
      return `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 14.5h9.2a3.8 3.8 0 0 0 .4-7.6 5.4 5.4 0 0 0-10.3-1.6A4.2 4.2 0 0 0 7 14.5z"/><line x1="8" y1="18" x2="7" y2="21"/><line x1="12" y1="18" x2="11" y2="21"/><line x1="16" y1="18" x2="15" y2="21"/></svg>`;
    case "snow":
      return `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 13h9.2a3.8 3.8 0 0 0 .4-7.6 5.4 5.4 0 0 0-10.3-1.6A4.2 4.2 0 0 0 7 13z"/><line x1="8" y1="17" x2="8" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="16" y1="17" x2="16" y2="21"/></svg>`;
    case "storm":
      return `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 12.5h9.2a3.8 3.8 0 0 0 .4-7.6 5.4 5.4 0 0 0-10.3-1.6A4.2 4.2 0 0 0 7 12.5z"/><path d="M13 15l-2.5 4h3L11 23"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="12" r="8"/></svg>`;
  }
}

/* ============================================================
   LIVING SKY CANVAS — the signature element
   ============================================================ */
const canvas = $("sky");
const ctx = canvas.getContext("2d");
let W, H, DPR;
let particles = [];
let skyState = { category: "clear", isDay: true };
let rafId = null;
let pageHidden = false;

function resizeCanvas(){
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  seedParticles();
}
window.addEventListener("resize", resizeCanvas);

document.addEventListener("visibilitychange", () => {
  pageHidden = document.hidden;
  if (pageHidden && rafId){
    cancelAnimationFrame(rafId);
    rafId = null;
  } else if (!pageHidden && !rafId){
    rafId = requestAnimationFrame(animate);
  }
});

function updateSky(){
  const cur = state.data.current;
  const info = weatherInfo(cur.weather_code);
  skyState.category = info.category;
  skyState.isDay = cur.is_day === 1;
  seedParticles();
}

// low-power devices: fewer particles (heuristic: low core count or small screen)
const lowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || window.innerWidth < 420;
const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function seedParticles(){
  particles = [];
  if (reducedMotion){ return; }
  const scale = lowPower ? 0.5 : 1;
  const count = Math.round((skyState.category === "rain" ? 140
    : skyState.category === "snow" ? 90
    : skyState.category === "storm" ? 160
    : skyState.category === "cloudy" ? 6
    : skyState.category === "fog" ? 5
    : skyState.isDay ? 0 : 70) * scale);

  for (let i = 0; i < count; i++){
    if (skyState.category === "rain" || skyState.category === "storm"){
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        len: 10 + Math.random() * 14,
        speed: 6 + Math.random() * 6,
        drift: 1.2,
        opacity: 0.25 + Math.random() * 0.35,
      });
    } else if (skyState.category === "snow"){
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 1.2 + Math.random() * 2.2,
        speed: 0.6 + Math.random() * 1.2,
        drift: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.4 + Math.random() * 0.5,
      });
    } else if (skyState.category === "cloudy" || skyState.category === "fog"){
      particles.push({
        x: Math.random() * W, y: H * (0.1 + Math.random() * 0.35),
        r: 60 + Math.random() * 90,
        speed: 0.08 + Math.random() * 0.1,
        opacity: 0.05 + Math.random() * 0.06,
      });
    } else if (!skyState.isDay){
      particles.push({
        x: Math.random() * W, y: Math.random() * H * 0.75,
        r: 0.5 + Math.random() * 1.4,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }
}

function skyGradientColors(){
  const { category, isDay } = skyState;
  if (!isDay){
    if (category === "storm") return ["#05070C", "#12101E"];
    return ["#070A14", "#141A2B"];
  }
  switch(category){
    case "clear":  return ["#1C3A5E", "#4A8FC7"];
    case "cloudy": return ["#2B3648", "#5B6B82"];
    case "fog":    return ["#3A4150", "#6B7484"];
    case "rain":   return ["#1B2536", "#334259"];
    case "snow":   return ["#3B4658", "#7C8AA0"];
    case "storm":  return ["#12141D", "#1F2433"];
    default:       return ["#1C3A5E", "#4A8FC7"];
  }
}

function drawSky(t){
  ctx.clearRect(0, 0, W, H);

  const [c1, c2] = skyGradientColors();
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  if (skyState.category === "clear" && skyState.isDay){
    ctx.save();
    ctx.globalAlpha = 0.14;
    const cx = W * 0.82, cy = H * 0.18;
    for (let i = 0; i < 3; i++){
      ctx.beginPath();
      ctx.arc(cx, cy, 60 + i * 34 + Math.sin(t / 1400 + i) * 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#FFE7B3";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  if (skyState.category === "clear" && !skyState.isDay){
    // subtle moon glow
    ctx.save();
    ctx.globalAlpha = 0.1;
    const cx = W * 0.8, cy = H * 0.16;
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fillStyle = "#DCE6FF";
    ctx.fill();
    ctx.restore();
  }

  particles.forEach(p => {
    if (skyState.category === "rain" || skyState.category === "storm"){
      p.y += p.speed; p.x += p.drift;
      if (p.y > H){ p.y = -20; p.x = Math.random() * W; }
      ctx.strokeStyle = `rgba(190,215,255,${p.opacity})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.len * 0.15, p.y + p.len);
      ctx.stroke();
    } else if (skyState.category === "snow"){
      p.y += p.speed; p.x += Math.sin(t / 1000 + p.phase) * 0.4 + p.drift;
      if (p.y > H){ p.y = -10; p.x = Math.random() * W; }
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (skyState.category === "cloudy" || skyState.category === "fog"){
      p.x += p.speed;
      if (p.x - p.r > W) p.x = -p.r;
      ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (!skyState.isDay){
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t / 900 * p.twinkleSpeed + p.phase));
      ctx.fillStyle = `rgba(255,255,255,${tw})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  if (skyState.category === "storm" && Math.random() < 0.008){
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(0, 0, W, H);
  }
}

function animate(t){
  drawSky(t);
  rafId = requestAnimationFrame(animate);
}

/* ============================================================
   BOOT
   ============================================================ */
async function boot(){
  resizeCanvas();
  rafId = requestAnimationFrame(animate);

  const urlPlace = await placeFromURL();
  if (urlPlace){
    loadWeather(urlPlace);
    return;
  }

  const savedRaw = localStorage.getItem(LAST_PLACE_KEY);
  if (savedRaw){
    try{
      const saved = JSON.parse(savedRaw);
      loadWeather(saved);
      return;
    } catch(e){ /* fall through */ }
  }

  loadWeather({
    name: "Mumbai", admin1: "Maharashtra", country: "India",
    latitude: 19.076, longitude: 72.8777, timezone: "auto",
  });
}

boot();
