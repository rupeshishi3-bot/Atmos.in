        // ========================================
        // ATMOS - Premium Weather Application
        // Vanilla JavaScript Implementation
        // ========================================

        // Configuration
        const CONFIG = {
            defaultCity: 'New Delhi',
            units: 'metric',
            lang: 'en',
            updateInterval: 300000, // 5 minutes
            animationInterval: 50
        };

        // Open-Meteo — free, keyless weather + geocoding APIs.
        // Real-time data loads immediately, no signup or API key needed.
        const API_ENDPOINTS = {
            geocode: 'https://geocoding-api.open-meteo.com/v1/search',
            forecast: 'https://api.open-meteo.com/v1/forecast'
        };

        // State
        const state = {
            currentWeather: null,
            forecast: null,
            hourlyForecast: null,
            location: null,
            loading: true,
            error: null,
            unit: 'celsius',
            favorites: JSON.parse(localStorage.getItem('atmosFavorites')) || [],
            currentCityIndex: 0,
            apiKeyConfigured: false
        };

        // DOM Elements
        const elements = {
            // Background
            weatherBg: document.getElementById('weatherBg'),
            stars: document.getElementById('stars'),
            sun: document.getElementById('sun'),
            sunRay: document.getElementById('sunRay'),
            clouds: document.getElementById('clouds'),
            rain: document.getElementById('rain'),
            storm: document.getElementById('storm'),
            fog: document.getElementById('fog'),
            aurora: document.getElementById('aurora'),
            
            // Hero
            location: document.getElementById('location'),
            date: document.getElementById('date'),
            temperature: document.getElementById('temperature'),
            weatherIcon: document.getElementById('weatherIcon'),
            condition: document.getElementById('condition'),
            feelsLike: document.getElementById('feelsLike'),
            tempHigh: document.getElementById('tempHigh'),
            tempLow: document.getElementById('tempLow'),
            currentTime: document.getElementById('currentTime'),
            
            // Forecasts
            hourlyForecast: document.getElementById('hourlyForecast'),
            dailyForecast: document.getElementById('dailyForecast'),
            chartLine: document.getElementById('chartLine'),
            chartLabels: document.getElementById('chartLabels'),
            
            // Intelligence
            weatherOverview: document.getElementById('weatherOverview'),
            keyInsights: document.getElementById('keyInsights'),
            weatherAlerts: document.getElementById('weatherAlerts'),
            
            // Best Time
            bestTimePeriod: document.getElementById('bestTimePeriod'),
            bestTimeDesc: document.getElementById('bestTimeDesc'),
            bestTimeVisual: document.getElementById('bestTimeVisual'),
            
            // Stats
            weatherStats: document.getElementById('weatherStats'),
            
            // News
            weatherNews: document.getElementById('weatherNews'),
            
            // Header
            citySearch: document.getElementById('citySearch'),
            clearSearch: document.getElementById('clearSearch'),
            unitToggle: document.getElementById('unitToggle'),
            settingsMenu: document.getElementById('settingsMenu'),
            userMenu: document.getElementById('userMenu'),
            prevHour: document.getElementById('prevHour'),
            nextHour: document.getElementById('nextHour'),
            
            // Modals
            modalOverlay: document.getElementById('modalOverlay'),
            modal: document.getElementById('modal'),
            modalTitle: document.getElementById('modalTitle'),
            modalBody: document.getElementById('modalBody'),
            modalActions: document.getElementById('modalActions'),
            modalClose: document.getElementById('modalClose'),
            
            // Toast
            toastContainer: document.getElementById('toastContainer')
        };

        // ========================================
        // INITIALIZATION
        // ========================================

        // Initialize the application
        function init() {
            setupEventListeners();
            startClock();
            updateDate();
            createBackgroundElements();
            loadFavorites();
            
            // Determine the visitor's country and show its capital by default.
            loadDefaultWeather();
        }

        // Show settings modal
        function showSettingsModal() {
            const content = `
                <div style="margin-bottom: 20px;">
                    <h3 style="margin-bottom: 15px;">Settings</h3>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Temperature Unit</label>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn ${state.unit === 'celsius' ? 'btn-primary' : 'btn-secondary'}" 
                                    onclick="setUnit('celsius')" style="flex: 1;">
                                Celsius (°C)
                            </button>
                            <button class="btn ${state.unit === 'fahrenheit' ? 'btn-primary' : 'btn-secondary'}" 
                                    onclick="setUnit('fahrenheit')" style="flex: 1;">
                                Fahrenheit (°F)
                            </button>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">Default Location</label>
                        <input type="text" id="defaultCity" 
                               placeholder="Enter default city"
                               style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text-primary); font-size: 14px;" 
                               value="${CONFIG.defaultCity}" />
                    </div>
                </div>
            `;
            
            showModal('Settings', content, [
                {
                    text: 'Save Settings',
                    type: 'primary',
                    handler: saveSettings
                },
                {
                    text: 'Close',
                    handler: closeModal
                }
            ]);
        }

        // Save settings
        function saveSettings() {
            const defaultCity = document.getElementById('defaultCity').value.trim();
            
            if (defaultCity) {
                CONFIG.defaultCity = defaultCity;
                loadWeatherData(defaultCity);
            }
            
            closeModal();
            showToast('Settings saved!', 'success');
        }

        // Set temperature unit
        function setUnit(unit) {
            state.unit = unit;
            CONFIG.units = unit === 'celsius' ? 'metric' : 'imperial';
            localStorage.setItem('atmosUnit', unit);
            
            // Update UI
            const units = document.querySelectorAll('#unitToggle span');
            units.forEach(u => {
                u.classList.remove('active');
                if (u.dataset.unit === unit) {
                    u.classList.add('active');
                }
            });
            
            // Reload data
            if (state.location) {
                loadWeatherData(state.location);
            }
            
            closeModal();
        }

        // Setup event listeners
        function setupEventListeners() {
            // Search
            setupLocationSearch();

            elements.citySearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                    searchCity(e.target.value.trim());
                }
            });

            elements.clearSearch.addEventListener('click', () => {
                elements.citySearch.value = '';
                elements.clearSearch.style.display = 'none';
            });

            // Unit toggle
            elements.unitToggle.addEventListener('click', () => {
                toggleUnit();
            });

            // User menu
            elements.userMenu.addEventListener('click', () => {
                showFavoritesModal();
            });

            // Settings menu
            elements.settingsMenu.addEventListener('click', () => {
                showSettingsModal();
            });

            // Navigation links scroll to real sections instead of being decorative.
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    const label = item.querySelector('span')?.textContent.trim().toLowerCase();
                    const targets = {
                        home: 'hero',
                        forecast: 'forecast',
                        intelligence: 'intelligence',
                        history: 'history'
                    };
                    const target = document.getElementById(targets[label]);
                    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            });

            // Hourly forecast navigation
            elements.prevHour.addEventListener('click', () => {
                scrollHourlyForecast('left');
            });

            elements.nextHour.addEventListener('click', () => {
                scrollHourlyForecast('right');
            });

            // Modal close
            elements.modalClose.addEventListener('click', closeModal);
            elements.modalOverlay.addEventListener('click', (e) => {
                if (e.target === elements.modalOverlay) {
                    closeModal();
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                }
                if (e.ctrlKey && e.key === 'k') {
                    e.preventDefault();
                    elements.citySearch.focus();
                }
            });
        }

        let locationSearchTimer = null;
        let locationSuggestions = [];
        let activeSuggestion = -1;

        function setupLocationSearch() {
            const box = elements.citySearch?.closest('.search-box');
            if (!box || !elements.citySearch) return;
            const dropdown = document.createElement('div');
            dropdown.id = 'locationSuggestions';
            dropdown.className = 'location-suggestions';
            box.appendChild(dropdown);

            elements.citySearch.addEventListener('input', e => {
                const value = e.target.value.trim();
                elements.clearSearch.style.display = value ? 'block' : 'none';
                clearTimeout(locationSearchTimer);
                activeSuggestion = -1;
                if (value.length < 2) { hideLocationSuggestions(); return; }
                locationSearchTimer = setTimeout(async () => {
                    try {
                        locationSuggestions = await geocodeLocation(value);
                        renderLocationSuggestions(locationSuggestions);
                    } catch (err) {
                        hideLocationSuggestions();
                    }
                }, 280);
            });

            elements.citySearch.addEventListener('keydown', e => {
                if (!locationSuggestions.length) return;
                if (e.key === 'ArrowDown') { e.preventDefault(); activeSuggestion = Math.min(activeSuggestion + 1, locationSuggestions.length - 1); renderLocationSuggestions(locationSuggestions); }
                if (e.key === 'ArrowUp') { e.preventDefault(); activeSuggestion = Math.max(activeSuggestion - 1, 0); renderLocationSuggestions(locationSuggestions); }
                if (e.key === 'Escape') hideLocationSuggestions();
                if (e.key === 'Enter' && activeSuggestion >= 0) { e.preventDefault(); const chosen = locationSuggestions[activeSuggestion]; hideLocationSuggestions(); loadWeatherData(chosen); }
            });

            document.addEventListener('click', e => {
                if (!box.contains(e.target)) hideLocationSuggestions();
            });
        }

        function renderLocationSuggestions(results) {
            const dropdown = document.getElementById('locationSuggestions');
            if (!dropdown) return;
            if (!results.length) { dropdown.innerHTML = '<div class="location-empty">No locations found</div>'; dropdown.classList.add('show'); return; }
            dropdown.innerHTML = results.map((item, index) => `
                <button type="button" class="location-suggestion ${index === activeSuggestion ? 'active' : ''}" data-index="${index}">
                    <span><i class="fas fa-location-dot"></i> ${escapeHtml(item.name)}</span>
                    <small>${escapeHtml([item.admin1, item.country].filter(Boolean).join(', '))}</small>
                </button>`).join('');
            dropdown.querySelectorAll('.location-suggestion').forEach(btn => btn.addEventListener('click', () => {
                const chosen = results[Number(btn.dataset.index)];
                hideLocationSuggestions();
                loadWeatherData(chosen);
            }));
            dropdown.classList.add('show');
        }

        function hideLocationSuggestions() {
            const dropdown = document.getElementById('locationSuggestions');
            if (dropdown) dropdown.classList.remove('show');
            locationSuggestions = [];
            activeSuggestion = -1;
        }

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
        }

        // ========================================
        // WEATHER DATA
        // ========================================

        // Load weather data from Open-Meteo (no API key required)
        async function loadWeatherData(locationInput = null) {
            state.loading = true;
            updateLoadingState();

            try {
                const location = await resolveLocation(locationInput || state.location || CONFIG.defaultCity);
                if (!location) throw new Error('Location not found.');

                const weather = await fetchOpenMeteoWeather(location);
                state.location = location;
                state.currentWeather = weather.current;
                state.forecast = weather.forecast;
                state.hourlyForecast = extractHourlyForecast(weather.forecast);
                state.loading = false;
                state.error = null;

                updateAllUI();
                updateBackground();
                elements.citySearch.value = location.name;
                elements.clearSearch.style.display = 'block';
            } catch (error) {
                state.loading = false;
                state.error = error.message || 'Unable to load weather.';
                updateErrorState();
                console.error('ATMOS weather error:', error);
                showToast(state.error, 'error');
            }
        }

        async function resolveLocation(input) {
            if (input && typeof input === 'object' && Number.isFinite(Number(input.lat)) && Number.isFinite(Number(input.lon))) {
                return {
                    name: input.name || 'Your Location',
                    country: input.country || '',
                    countryCode: input.countryCode || '',
                    lat: Number(input.lat),
                    lon: Number(input.lon),
                    timezone: input.timezone || 'auto'
                };
            }

            const query = String(input || '').trim();
            if (!query) return null;
            const results = await geocodeLocation(query);
            return results[0] || null;
        }

        async function geocodeLocation(query) {
            const url = `${API_ENDPOINTS.geocode}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Location search is temporarily unavailable.');
            const data = await response.json();
            return (data.results || []).map(item => ({
                name: item.name,
                country: item.country || '',
                countryCode: item.country_code || '',
                admin1: item.admin1 || '',
                lat: item.latitude,
                lon: item.longitude,
                timezone: item.timezone || 'auto'
            }));
        }

        async function fetchOpenMeteoWeather(location) {
            const params = new URLSearchParams({
                latitude: location.lat,
                longitude: location.lon,
                timezone: 'auto',
                forecast_days: '7',
                current: [
                    'temperature_2m','relative_humidity_2m','apparent_temperature','is_day',
                    'precipitation','weather_code','cloud_cover','pressure_msl','wind_speed_10m',
                    'wind_direction_10m','visibility','uv_index'
                ].join(','),
                hourly: [
                    'temperature_2m','relative_humidity_2m','apparent_temperature','precipitation_probability','is_day',
                    'precipitation','weather_code','cloud_cover','pressure_msl','wind_speed_10m',
                    'wind_direction_10m','visibility','uv_index'
                ].join(','),
                daily: [
                    'weather_code','temperature_2m_max','temperature_2m_min','sunrise','sunset',
                    'uv_index_max','precipitation_probability_max','precipitation_sum','wind_speed_10m_max'
                ].join(',')
            });

            const response = await fetch(`${API_ENDPOINTS.forecast}?${params}`);
            if (!response.ok) throw new Error('Live weather service is temporarily unavailable.');
            const data = await response.json();
            return adaptOpenMeteoData(data, location);
        }

        const OPEN_METEO_CODES = {
            0: [800, 'Clear sky'],
            1: [801, 'Mainly clear'],
            2: [802, 'Partly cloudy'],
            3: [804, 'Overcast'],
            45: [741, 'Fog'], 48: [741, 'Rime fog'],
            51: [300, 'Light drizzle'], 53: [301, 'Drizzle'], 55: [302, 'Heavy drizzle'],
            56: [311, 'Freezing drizzle'], 57: [312, 'Heavy freezing drizzle'],
            61: [500, 'Light rain'], 63: [501, 'Rain'], 65: [502, 'Heavy rain'],
            66: [611, 'Freezing rain'], 67: [612, 'Heavy freezing rain'],
            71: [600, 'Light snow'], 73: [601, 'Snow'], 75: [602, 'Heavy snow'],
            77: [600, 'Snow grains'],
            80: [520, 'Rain showers'], 81: [521, 'Heavy rain showers'], 82: [522, 'Violent rain showers'],
            85: [621, 'Snow showers'], 86: [622, 'Heavy snow showers'],
            95: [200, 'Thunderstorm'], 96: [201, 'Thunderstorm with hail'], 99: [202, 'Severe thunderstorm']
        };

        function weatherCodeInfo(code) {
            return OPEN_METEO_CODES[Number(code)] || [800, 'Clear sky'];
        }

        function makeWeatherEntry(data, i, location) {
            const time = new Date(data.hourly.time[i]);
            const code = Number(data.hourly.weather_code[i]);
            const [id, description] = weatherCodeInfo(code);
            const isDay = data.hourly.is_day ? Boolean(data.hourly.is_day[i]) : (time.getHours() >= 6 && time.getHours() < 19);
            const icon = id === 800 ? (isDay ? '01d' : '01n') : (isDay ? '10d' : '10n');
            return {
                dt: Math.floor(time.getTime() / 1000),
                main: {
                    temp: data.hourly.temperature_2m[i],
                    feels_like: data.hourly.apparent_temperature[i],
                    humidity: data.hourly.relative_humidity_2m[i],
                    pressure: data.hourly.pressure_msl[i]
                },
                weather: [{ id, description, icon }],
                wind: {
                    speed: (data.hourly.wind_speed_10m[i] || 0) / 3.6,
                    deg: data.hourly.wind_direction_10m[i] || 0
                },
                clouds: { all: data.hourly.cloud_cover[i] || 0 },
                visibility: data.hourly.visibility[i] || 0,
                pop: (data.hourly.precipitation_probability[i] || 0) / 100,
                uvi: data.hourly.uv_index[i] || 0
            };
        }

        function adaptOpenMeteoData(data, location) {
            const now = data.current;
            const [id, description] = weatherCodeInfo(now.weather_code);
            const isDay = Boolean(now.is_day);
            const current = {
                name: location.name,
                sys: {
                    country: location.countryCode || location.country || '',
                    sunrise: Math.floor(new Date(data.daily.sunrise[0]).getTime() / 1000),
                    sunset: Math.floor(new Date(data.daily.sunset[0]).getTime() / 1000)
                },
                coord: { lat: location.lat, lon: location.lon },
                dt: Math.floor(new Date(now.time).getTime() / 1000),
                main: {
                    temp: now.temperature_2m,
                    feels_like: now.apparent_temperature,
                    humidity: now.relative_humidity_2m,
                    pressure: now.pressure_msl,
                    temp_max: data.daily.temperature_2m_max[0],
                    temp_min: data.daily.temperature_2m_min[0]
                },
                weather: [{ id, description, icon: id === 800 ? (isDay ? '01d' : '01n') : (isDay ? '10d' : '10n') }],
                wind: { speed: (now.wind_speed_10m || 0) / 3.6, deg: now.wind_direction_10m || 0 },
                clouds: { all: now.cloud_cover || 0 },
                visibility: now.visibility || 0,
                uvi: now.uv_index || 0
            };

            const list = [];
            const max = Math.min(data.hourly.time.length, 72);
            for (let i = 0; i < max; i++) list.push(makeWeatherEntry(data, i, location));

            return {
                current,
                forecast: {
                    list,
                    city: { name: location.name, country: location.countryCode || location.country || '', coord: { lat: location.lat, lon: location.lon } },
                    daily: data.daily
                }
            };
        }

        function extractHourlyForecast(forecast) {
            return forecast && forecast.list ? forecast.list.slice(0, 24) : [];
        }

        // Search for any city/place worldwide.
        function searchCity(city) {
            if (!city) return;
            hideLocationSuggestions();
            showToast(`Finding ${city}...`, 'info');
            loadWeatherData(city);
        }

        // Browser location is an explicit user action; initial load uses country capital.
        function requestGeolocation() {
            if (!navigator.geolocation) {
                showToast('Location is not supported by this browser.', 'error');
                return;
            }
            navigator.geolocation.getCurrentPosition(
                position => {
                    loadWeatherData({ lat: position.coords.latitude, lon: position.coords.longitude, name: 'Your Location' });
                    showToast('Using your current location', 'success');
                },
                () => showToast('Location permission was not granted.', 'info'),
                { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
            );
        }

        async function getCountryCapital() {
            try {
                const ipResponse = await fetch('https://ipapi.co/json/');
                if (!ipResponse.ok) throw new Error('IP lookup failed');
                const ip = await ipResponse.json();
                const countryCode = (ip.country_code || '').toLowerCase();
                if (!countryCode) throw new Error('Country unavailable');

                const countryResponse = await fetch(`https://restcountries.com/v3.1/alpha/${encodeURIComponent(countryCode)}?fields=name,capital,cca2`);
                if (!countryResponse.ok) throw new Error('Country lookup failed');
                const country = await countryResponse.json();
                const capital = Array.isArray(country.capital) ? country.capital[0] : country.capital;
                if (!capital) throw new Error('Capital unavailable');
                return capital;
            } catch (e) {
                return CONFIG.defaultCity;
            }
        }

        async function loadDefaultWeather() {
            const capital = await getCountryCapital();
            CONFIG.defaultCity = capital;
            await loadWeatherData(capital);
        }

        // ========================================
        // UI UPDATES
        // ========================================

        // Update all UI elements
        function updateAllUI() {
            updateHero();
            updateHourlyForecast();
            updateDailyForecast();
            updateTemperatureChart();
            updateIntelligence();
            updateBestTime();
            updateWeatherStats();
            updateNews();
        }

        // Update loading state
        function updateLoadingState() {
            elements.location.textContent = 'Loading...';
            elements.temperature.textContent = '--°';
            elements.condition.textContent = 'Loading...';
            elements.weatherIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        // Update error state
        function updateErrorState() {
            elements.location.textContent = 'Error loading data';
            elements.temperature.textContent = '--°';
            elements.condition.textContent = state.error || 'Error';
            elements.weatherIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            
            // Show error modal
            showModal('Weather unavailable', `<p>${state.error}</p><p>Please try another location or check your internet connection.</p>`);
        }

        // Update hero section
        function updateHero() {
            if (!state.currentWeather) return;
            
            const { name, sys, main, weather, wind, visibility, dt } = state.currentWeather;
            const weatherData = weather[0];
            
            // Location
            elements.location.textContent = `${name}, ${sys.country}`;
            
            // Temperature
            const temp = convertTemp(main.temp);
            elements.temperature.textContent = `${Math.round(temp)}°`;
            
            // Condition
            elements.condition.textContent = weatherData.description;
            elements.weatherIcon.innerHTML = getWeatherIcon(weatherData.id, weatherData.icon);
            
            // Feels like
            elements.feelsLike.textContent = `${Math.round(convertTemp(main.feels_like))}°`;
            
            // High/Low (from daily forecast if available)
            if (state.forecast && state.forecast.list) {
                const todayForecast = state.forecast.list.filter(item => {
                    const date = new Date(item.dt * 1000);
                    const now = new Date();
                    return date.getDate() === now.getDate();
                });
                
                if (todayForecast.length > 0) {
                    const temps = todayForecast.map(item => item.main.temp);
                    elements.tempHigh.textContent = `${Math.round(convertTemp(Math.max(...temps)))}°`;
                    elements.tempLow.textContent = `${Math.round(convertTemp(Math.min(...temps)))}°`;
                } else {
                    elements.tempHigh.textContent = `${Math.round(convertTemp(main.temp_max))}°`;
                    elements.tempLow.textContent = `${Math.round(convertTemp(main.temp_min))}°`;
                }
            } else {
                elements.tempHigh.textContent = `${Math.round(convertTemp(main.temp_max))}°`;
                elements.tempLow.textContent = `${Math.round(convertTemp(main.temp_min))}°`;
            }
        }

        // Update hourly forecast
        function updateHourlyForecast() {
            if (!state.hourlyForecast || state.hourlyForecast.length === 0) return;
            
            elements.hourlyForecast.innerHTML = '';
            
            // Show next 12 hours
            const now = new Date();
            const currentHour = now.getHours();
            const hourlyToShow = state.hourlyForecast.slice(0, 12);
            
            hourlyToShow.forEach(hour => {
                const date = new Date(hour.dt * 1000);
                const hourNum = date.getHours();
                const temp = Math.round(convertTemp(hour.main.temp));
                const weatherId = hour.weather[0].id;
                const icon = hour.weather[0].icon;
                const pop = hour.pop ? Math.round(hour.pop * 100) : 0;
                
                const card = document.createElement('div');
                card.className = 'hourly-card';
                card.innerHTML = `
                    <div class="hourly-time">${formatTime(date)}</div>
                    <div class="hourly-icon">${getWeatherIcon(weatherId, icon)}</div>
                    <div class="hourly-temp">${temp}°</div>
                    <div class="hourly-pop">${pop}%</div>
                `;
                
                // Highlight current hour
                if (hourNum === currentHour) {
                    card.classList.add('active');
                }
                
                card.addEventListener('click', () => {
                    showHourlyDetail(hour);
                });
                
                elements.hourlyForecast.appendChild(card);
            });
        }

        // Update 7-day forecast using Open-Meteo daily data.
        function updateDailyForecast() {
            const daily = state.forecast?.daily;
            if (!daily || !elements.dailyForecast) return;
            elements.dailyForecast.innerHTML = '';

            for (let i = 0; i < Math.min(7, daily.time.length); i++) {
                const date = new Date(`${daily.time[i]}T12:00:00`);
                const [conditionId, description] = weatherCodeInfo(daily.weather_code[i]);
                const highTemp = daily.temperature_2m_max[i];
                const lowTemp = daily.temperature_2m_min[i];
                const rain = daily.precipitation_probability_max[i] || 0;
                const card = document.createElement('div');
                card.className = 'daily-card';
                const dayData = {
                    date,
                    items: [makeDailyDetailEntry(daily, i, date, conditionId, description)]
                };
                card.innerHTML = `
                    <div class="daily-header">
                        <div class="daily-day">${i === 0 ? 'Today' : formatDay(date)}</div>
                        <div class="daily-date">${formatDate(date)}</div>
                    </div>
                    <div class="daily-body">
                        <div class="daily-icon">${getWeatherIcon(conditionId, conditionId === 800 ? '01d' : '10d')}</div>
                        <div class="daily-temp-range">
                            <span class="daily-temp-high">${Math.round(convertTemp(highTemp))}°</span>
                            <span class="daily-temp-low">${Math.round(convertTemp(lowTemp))}°</span>
                        </div>
                    </div>
                    <div class="daily-condition">${escapeHtml(description)}</div>
                    <div class="daily-rain"><i class="fas fa-tint"></i><span>${Math.round(rain)}%</span></div>
                `;
                card.addEventListener('click', () => showDailyDetail(dayData));
                elements.dailyForecast.appendChild(card);
            }
        }

        function makeDailyDetailEntry(daily, i, date, conditionId, description) {
            return {
                dt: Math.floor(date.getTime() / 1000),
                main: {
                    temp: daily.temperature_2m_max[i],
                    feels_like: daily.temperature_2m_max[i],
                    humidity: 0,
                    pressure: 0,
                    temp_max: daily.temperature_2m_max[i],
                    temp_min: daily.temperature_2m_min[i]
                },
                weather: [{ id: conditionId, description, icon: conditionId === 800 ? '01d' : '10d' }],
                wind: { speed: (daily.wind_speed_10m_max[i] || 0) / 3.6, deg: 0 },
                clouds: { all: 0 },
                pop: (daily.precipitation_probability_max[i] || 0) / 100
            };
        }

        // Update temperature chart
        function updateTemperatureChart() {
            if (!state.hourlyForecast || state.hourlyForecast.length === 0) return;
            
            elements.chartLine.innerHTML = '';
            elements.chartLabels.innerHTML = '';
            
            const now = new Date();
            const currentHour = now.getHours();
            const hourlyToShow = state.hourlyForecast.slice(0, 12);
            
            // Find min and max temps for scaling
            const temps = hourlyToShow.map(hour => convertTemp(hour.main.temp));
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            const tempRange = maxTemp - minTemp || 1;
            
            hourlyToShow.forEach((hour, index) => {
                const date = new Date(hour.dt * 1000);
                const temp = convertTemp(hour.main.temp);
                const normalizedTemp = (temp - minTemp) / tempRange;
                const height = 100 * normalizedTemp;
                
                // Create bar
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.style.height = `${height}%`;
                
                // Add point for current hour
                if (index === 0) {
                    const point = document.createElement('div');
                    point.className = 'chart-point';
                    bar.appendChild(point);
                }
                
                elements.chartLine.appendChild(bar);
                
                // Add label
                const label = document.createElement('div');
                label.className = 'chart-label';
                label.textContent = formatTime(date);
                elements.chartLabels.appendChild(label);
            });
        }

        // Update intelligence section
        function updateIntelligence() {
            if (!state.currentWeather || !state.forecast) return;
            
            const { weather, main, wind, visibility, clouds } = state.currentWeather;
            const weatherData = weather[0];
            
            // Weather overview
            const overview = getWeatherOverview(weatherData.id, main.temp, main.humidity, wind.speed);
            elements.weatherOverview.innerHTML = `<p>${overview}</p>`;
            
            // Key insights
            const insights = getKeyInsights(state.currentWeather, state.forecast);
            elements.keyInsights.innerHTML = insights.map(insight => `<p>${insight}</p>`).join('');
            
            // Weather alerts
            const alerts = getWeatherAlerts(state.currentWeather);
            elements.weatherAlerts.innerHTML = alerts.length > 0 
                ? alerts.map(alert => `<p><strong>${alert.title}:</strong> ${alert.message}</p>`).join('')
                : '<p>No active weather alerts for your area.</p>';
        }

        // Update best time
        function updateBestTime() {
            if (!state.hourlyForecast || state.hourlyForecast.length === 0) return;
            
            const now = new Date();
            const currentHour = now.getHours();
            
            // Find the best hour based on multiple factors
            let bestHour = null;
            let bestScore = -Infinity;
            
            state.hourlyForecast.forEach(hour => {
                const date = new Date(hour.dt * 1000);
                const hourNum = date.getHours();
                
                // Skip past hours
                if (hourNum < currentHour) return;
                
                // Calculate score based on multiple factors
                const temp = convertTemp(hour.main.temp);
                const humidity = hour.main.humidity;
                const windSpeed = hour.wind.speed;
                const pop = hour.pop || 0;
                const clouds = hour.clouds.all || 0;
                
                // Score calculation (higher is better)
                // Ideal: 20-25°C, low humidity, low wind, no rain, clear skies
                let score = 0;
                
                // Temperature score (optimal around 22°C)
                const tempDiff = Math.abs(temp - 22);
                score += Math.max(0, 100 - tempDiff * 5);
                
                // Humidity score (lower is better)
                score += Math.max(0, 100 - humidity);
                
                // Wind score (lower is better)
                score += Math.max(0, 100 - windSpeed * 10);
                
                // Precipitation score (lower is better)
                score += Math.max(0, 100 - pop * 100);
                
                // Cloud cover score (lower is better)
                score += Math.max(0, 100 - clouds);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestHour = hour;
                }
            });
            
            if (bestHour) {
                const date = new Date(bestHour.dt * 1000);
                const hourNum = date.getHours();
                const period = getTimePeriod(hourNum);
                const temp = Math.round(convertTemp(bestHour.main.temp));
                const condition = bestHour.weather[0].description;
                
                elements.bestTimePeriod.textContent = `${formatTime(date)} - ${period}`;
                elements.bestTimeDesc.innerHTML = `
                    <strong>Temperature:</strong> ${temp}°C<br>
                    <strong>Condition:</strong> ${condition}<br>
                    <strong>Why?</strong> Optimal combination of temperature, humidity, and precipitation.
                `;
                elements.bestTimeVisual.innerHTML = getWeatherIcon(bestHour.weather[0].id, bestHour.weather[0].icon);
            }
        }

        // Update weather statistics
        function updateWeatherStats() {
            if (!state.currentWeather) return;
            
            const { main, wind, visibility, clouds, sys, coord } = state.currentWeather;
            
            elements.weatherStats.innerHTML = '';
            
            const stats = [
                {
                    icon: 'fa-tint',
                    label: 'Humidity',
                    value: `${main.humidity}%`,
                    progress: main.humidity
                },
                {
                    icon: 'fa-wind',
                    label: 'Wind Speed',
                    value: `${formatWindSpeed(wind.speed)} ${CONFIG.units === 'metric' ? 'km/h' : 'mph'}`,
                    unit: CONFIG.units === 'metric' ? 'km/h' : 'mph'
                },
                {
                    icon: 'fa-eye',
                    label: 'Visibility',
                    value: `${(visibility / 1000).toFixed(1)} km`,
                    unit: 'km'
                },
                {
                    icon: 'fa-cloud',
                    label: 'Cloud Cover',
                    value: `${clouds.all || 0}%`,
                    progress: clouds.all || 0
                },
                {
                    icon: 'fa-thermometer-half',
                    label: 'Pressure',
                    value: `${main.pressure} hPa`,
                    unit: 'hPa'
                },
                {
                    icon: 'fa-sun',
                    label: 'UV Index',
                    value: getUVIndexIndex(state.currentWeather),
                    progress: getUVIndexValue(state.currentWeather)
                },
                {
                    icon: 'fa-clock',
                    label: 'Sunrise',
                    value: formatTime(new Date(sys.sunrise * 1000)),
                    noProgress: true
                },
                {
                    icon: 'fa-moon',
                    label: 'Sunset',
                    value: formatTime(new Date(sys.sunset * 1000)),
                    noProgress: true
                }
            ];
            
            stats.forEach(stat => {
                const card = document.createElement('div');
                card.className = 'stat-card';
                
                let progressHtml = '';
                if (stat.progress !== undefined && !stat.noProgress) {
                    progressHtml = `
                        <div class="stat-progress">
                            <div class="stat-progress-fill" style="width: ${stat.progress}%"></div>
                        </div>
                    `;
                }
                
                card.innerHTML = `
                    <div class="stat-icon">
                        <i class="fas ${stat.icon}"></i>
                    </div>
                    <div class="stat-value">${stat.value}</div>
                    ${stat.unit ? `<div class="stat-unit">${stat.unit}</div>` : ''}
                    <div class="stat-label">${stat.label}</div>
                    ${progressHtml}
                `;
                
                elements.weatherStats.appendChild(card);
            });
        }

        // Update news (placeholder - would require news API)
        function updateNews() {
            // This would require a news API integration
            // For now, showing placeholder content
            elements.weatherNews.innerHTML = `
                <div class="news-card">
                    <div class="news-image" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <div class="news-content">
                        <span class="news-category">Weather</span>
                        <h3 class="news-title">Weather News API Required</h3>
                        <p class="news-excerpt">To display real weather news, please integrate with a news API like NewsAPI, GNews, or similar service. This would fetch current weather-related articles.</p>
                        <div class="news-meta">
                            <span class="news-source">ATMOS</span>
                            <span class="news-date">${formatDate(new Date())}</span>
                        </div>
                    </div>
                </div>
                <div class="news-card">
                    <div class="news-image" style="background: linear-gradient(135deg, #00d4ff, #0ea5e9);">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="news-content">
                        <span class="news-category">Info</span>
                        <h3 class="news-title">About News Integration</h3>
                        <p class="news-excerpt">This section is designed for real weather news. To enable, configure a news API endpoint and parse weather-related articles from reliable sources.</p>
                        <div class="news-meta">
                            <span class="news-source">ATMOS</span>
                            <span class="news-date">${formatDate(new Date())}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        // ========================================
        // BACKGROUND ANIMATIONS
        // ========================================

        // Create background elements
        function createBackgroundElements() {
            createStars();
            createClouds();
            createRaindrops();
        }

        // Create stars
        function createStars() {
            const count = 100;
            for (let i = 0; i < count; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                star.style.animationDelay = `${Math.random() * 3}s`;
                star.style.opacity = Math.random() * 0.7 + 0.3;
                elements.stars.appendChild(star);
            }
        }

        // Create clouds
        function createClouds() {
            const count = 8;
            for (let i = 0; i < count; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                cloud.style.left = `${Math.random() * 100}%`;
                cloud.style.top = `${20 + Math.random() * 60}%`;
                cloud.style.width = `${100 + Math.random() * 200}px`;
                cloud.style.height = `${40 + Math.random() * 60}px`;
                cloud.style.animationDuration = `${30 + Math.random() * 60}s`;
                cloud.style.animationDelay = `${Math.random() * 30}s`;
                
                // Create cloud shape
                const before = document.createElement('div');
                before.style.cssText = `
                    left: -50px;
                    top: -20px;
                    width: 100px;
                    height: 60px;
                `;
                
                const after = document.createElement('div');
                after.style.cssText = `
                    right: -50px;
                    top: -20px;
                    width: 100px;
                    height: 60px;
                `;
                
                cloud.appendChild(before);
                cloud.appendChild(after);
                elements.clouds.appendChild(cloud);
            }
        }

        // Create raindrops
        function createRaindrops() {
            const count = 150;
            for (let i = 0; i < count; i++) {
                const drop = document.createElement('div');
                drop.className = 'raindrop';
                drop.style.left = `${Math.random() * 100}%`;
                drop.style.top = `${Math.random() * -100}%`;
                drop.style.animationDelay = `${Math.random() * 2}s`;
                drop.style.animationDuration = `${0.5 + Math.random() * 1}s`;
                drop.style.transform = `scale(${0.5 + Math.random() * 1})`;
                elements.rain.appendChild(drop);
            }
        }

        // Update background based on weather
        function updateBackground() {
            if (!state.currentWeather) return;
            
            const weatherId = state.currentWeather.weather[0].id;
            const isDay = isDaytime(state.currentWeather);
            
            // Reset all backgrounds
            deactivateAllBackgrounds();
            
            // Determine weather type
            const weatherType = getWeatherType(weatherId, isDay);
            
            // Activate appropriate background
            switch (weatherType) {
                case 'sunny':
                case 'clear':
                    elements.sun.classList.add('active');
                    elements.sunRay.classList.add('active');
                    if (isDay) {
                        document.body.style.background = 'linear-gradient(180deg, #1a2a6c 0%, #2a4a8c 50%, #0a0a1a 100%)';
                    } else {
                        document.body.style.background = 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #000 100%)';
                    }
                    break;
                    
                case 'cloudy':
                case 'overcast':
                    elements.clouds.classList.add('active');
                    document.body.style.background = 'linear-gradient(180deg, #3a4a6c 0%, #4a5a7c 50%, #2a3a5c 100%)';
                    break;
                    
                case 'rainy':
                case 'drizzle':
                    elements.clouds.classList.add('active');
                    elements.rain.classList.add('active');
                    document.body.style.background = 'linear-gradient(180deg, #2a3a5c 0%, #3a4a6c 50%, #1a2a4c 100%)';
                    break;
                    
                case 'storm':
                case 'thunderstorm':
                    elements.clouds.classList.add('active');
                    elements.rain.classList.add('active');
                    elements.storm.classList.add('active');
                    document.body.style.background = 'linear-gradient(180deg, #1a1a3a 0%, #2a2a5c 50%, #0a0a1a 100%)';
                    break;
                    
                case 'snow':
                    // Would need snow animation
                    document.body.style.background = 'linear-gradient(180deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)';
                    break;
                    
                case 'fog':
                case 'mist':
                    elements.fog.classList.add('active');
                    document.body.style.background = 'linear-gradient(180deg, #4a5a7c 0%, #5a6a8c 50%, #3a4a6c 100%)';
                    break;
                    
                case 'night':
                    elements.stars.classList.add('active');
                    elements.aurora.classList.add('active');
                    document.body.style.background = 'linear-gradient(180deg, #000 0%, #0a0a1a 50%, #1a1a3a 100%)';
                    break;
                    
                default:
                    // Default gradient
                    document.body.style.background = 'linear-gradient(180deg, #0a0a1a 0%, #0f0f2a 50%, #151535 100%)';
            }
            
            // Add weather class to body for theming
            document.body.className = `weather-${weatherType}`;
        }

        // Deactivate all backgrounds
        function deactivateAllBackgrounds() {
            elements.stars.classList.remove('active');
            elements.sun.classList.remove('active');
            elements.sunRay.classList.remove('active');
            elements.clouds.classList.remove('active');
            elements.rain.classList.remove('active');
            elements.storm.classList.remove('active');
            elements.fog.classList.remove('active');
            elements.aurora.classList.remove('active');
        }

        // ========================================
        // UTILITY FUNCTIONS
        // ========================================

        // Format temperature based on unit
        function convertTemp(temp) {
            if (state.unit === 'fahrenheit') {
                return (temp * 9/5) + 32;
            }
            return temp;
        }

        // Toggle unit
        function toggleUnit() {
            const units = elements.unitToggle.querySelectorAll('span');
            units.forEach(unit => unit.classList.toggle('active'));
            
            state.unit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
            CONFIG.units = state.unit === 'celsius' ? 'metric' : 'imperial';
            
            // Reload data with new units
            if (state.location) {
                loadWeatherData(state.location);
            }
            
            showToast(`Switched to ${state.unit === 'celsius' ? 'Metric' : 'Imperial'} units`, 'info');
        }

        // Format time
        function formatTime(date) {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
            });
        }

        // Format day
        function formatDay(date) {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }

        // Format date
        function formatDate(date) {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }

        // Format wind speed
        function formatWindSpeed(speed) {
            if (CONFIG.units === 'metric') {
                return Math.round(speed * 3.6);
            }
            return Math.round(speed);
        }

        // Get weather icon
        function getWeatherIcon(weatherId, iconCode) {
            // Map OpenWeatherMap icons to Font Awesome
            const iconMap = {
                '01d': 'fa-sun',
                '01n': 'fa-moon',
                '02d': 'fa-cloud-sun',
                '02n': 'fa-cloud-moon',
                '03d': 'fa-cloud',
                '03n': 'fa-cloud',
                '04d': 'fa-cloud',
                '04n': 'fa-cloud',
                '09d': 'fa-cloud-rain',
                '09n': 'fa-cloud-rain',
                '10d': 'fa-cloud-sun-rain',
                '10n': 'fa-cloud-moon-rain',
                '11d': 'fa-bolt',
                '11n': 'fa-bolt',
                '13d': 'fa-snowflake',
                '13n': 'fa-snowflake',
                '50d': 'fa-smog',
                '50n': 'fa-smog'
            };
            
            // Fallback based on weather ID
            if (weatherId >= 200 && weatherId < 300) {
                return '<i class="fas fa-bolt"></i>';
            } else if (weatherId >= 300 && weatherId < 400) {
                return '<i class="fas fa-cloud-rain"></i>';
            } else if (weatherId >= 500 && weatherId < 600) {
                return '<i class="fas fa-cloud-showers-heavy"></i>';
            } else if (weatherId >= 600 && weatherId < 700) {
                return '<i class="fas fa-snowflake"></i>';
            } else if (weatherId >= 700 && weatherId < 800) {
                return '<i class="fas fa-smog"></i>';
            } else if (weatherId === 800) {
                return isDaytime(state.currentWeather) ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            } else if (weatherId > 800) {
                return '<i class="fas fa-cloud"></i>';
            }
            
            return iconMap[iconCode] ? `<i class="fas ${iconMap[iconCode]}"></i>` : '<i class="fas fa-question"></i>';
        }

        // Get weather type
        function getWeatherType(weatherId, isDay) {
            if (!isDay) {
                if (weatherId === 800) return 'night';
                if (weatherId > 800) return 'cloudy';
            }
            
            if (weatherId >= 200 && weatherId < 300) return 'storm';
            if (weatherId >= 300 && weatherId < 400) return 'drizzle';
            if (weatherId >= 500 && weatherId < 600) return 'rainy';
            if (weatherId >= 600 && weatherId < 700) return 'snow';
            if (weatherId >= 700 && weatherId < 800) return 'fog';
            if (weatherId === 800) return isDay ? 'sunny' : 'night';
            if (weatherId > 800) return 'cloudy';
            
            return 'clear';
        }

        // Check if it's daytime
        function isDaytime(weatherData) {
            if (!weatherData || !weatherData.sys) return true;
            
            const now = new Date();
            const sunrise = new Date(weatherData.sys.sunrise * 1000);
            const sunset = new Date(weatherData.sys.sunset * 1000);
            
            return now >= sunrise && now <= sunset;
        }

        // Get time period name
        function getTimePeriod(hour) {
            if (hour >= 5 && hour < 12) return 'Morning';
            if (hour >= 12 && hour < 17) return 'Afternoon';
            if (hour >= 17 && hour < 21) return 'Evening';
            return 'Night';
        }

        // Get UV index
        function getUVIndexIndex(weatherData) {
            // This would come from UV index API or calculation
            // For now, estimate based on cloud cover and time of day
            const hour = new Date().getHours();
            const cloudCover = weatherData.clouds ? weatherData.clouds.all : 0;
            
            // Simple estimation
            let uv = 0;
            if (hour >= 10 && hour <= 15) {
                uv = 8 - (cloudCover / 12.5);
            } else if (hour >= 7 && hour < 10) {
                uv = 5 - (cloudCover / 20);
            } else if (hour > 15 && hour <= 18) {
                uv = 5 - (cloudCover / 20);
            }
            
            uv = Math.max(0, Math.min(11, Math.round(uv)));
            
            return uv;
        }

        // Get UV index value for progress bar
        function getUVIndexValue(weatherData) {
            const uv = getUVIndexIndex(weatherData);
            return Math.min(100, uv * 10);
        }

        // Get weather overview
        function getWeatherOverview(weatherId, temp, humidity, windSpeed) {
            const weatherType = getWeatherType(weatherId, isDaytime(state.currentWeather));
            
            switch (weatherType) {
                case 'sunny':
                    return `It's a beautiful sunny day with temperatures around ${Math.round(temp)}°C. Perfect for outdoor activities!`;
                case 'clear':
                    return `Clear skies with temperatures at ${Math.round(temp)}°C. Enjoy the day!`;
                case 'cloudy':
                    return `Cloudy conditions with temperatures around ${Math.round(temp)}°C. It might feel a bit gloomy.`;
                case 'overcast':
                    return `Overcast skies with temperatures at ${Math.round(temp)}°C. Expect limited sunlight.`;
                case 'rainy':
                    return `Rainy weather with temperatures around ${Math.round(temp)}°C. Don't forget your umbrella!`;
                case 'drizzle':
                    return `Light drizzle with temperatures at ${Math.round(temp)}°C. A light jacket might be useful.`;
                case 'storm':
                    return `Stormy conditions with temperatures around ${Math.round(temp)}°C. Stay indoors and stay safe!`;
                case 'thunderstorm':
                    return `Thunderstorms expected with temperatures around ${Math.round(temp)}°C. Avoid outdoor activities.`;
                case 'snow':
                    return `Snowy weather with temperatures around ${Math.round(temp)}°C. Bundle up and drive carefully!`;
                case 'fog':
                    return `Foggy conditions with temperatures around ${Math.round(temp)}°C. Visibility may be reduced.`;
                case 'mist':
                    return `Misty weather with temperatures around ${Math.round(temp)}°C. Be cautious when driving.`;
                case 'night':
                    return `Clear night with temperatures around ${Math.round(temp)}°C. Perfect for stargazing!`;
                default:
                    return `Current weather conditions with temperatures around ${Math.round(temp)}°C.`;
            }
        }

        // Get key insights
        function getKeyInsights(currentWeather, forecast) {
            const insights = [];
            const { main, wind, visibility, clouds, weather } = currentWeather;
            const weatherData = weather[0];
            
            // Temperature insight
            if (main.temp > 30) {
                insights.push('⚠️ It\'s quite hot today. Stay hydrated and avoid prolonged sun exposure.');
            } else if (main.temp < 0) {
                insights.push('❄️ Freezing temperatures! Dress warmly and watch for ice on roads.');
            } else if (main.temp > 25) {
                insights.push('☀️ Warm day ahead. Great for outdoor activities!');
            } else if (main.temp < 10) {
                insights.push('🧣 Cool temperatures. A jacket or coat is recommended.');
            }
            
            // Humidity insight
            if (main.humidity > 80) {
                insights.push('💧 High humidity levels. It might feel muggy and uncomfortable.');
            } else if (main.humidity < 30) {
                insights.push('🌵 Low humidity. Your skin might feel dry - consider using moisturizer.');
            }
            
            // Wind insight
            if (wind.speed > 10) {
                insights.push(`💨 Windy conditions (${formatWindSpeed(wind.speed)} ${CONFIG.units === 'metric' ? 'km/h' : 'mph'}). Secure loose objects.`);
            } else if (wind.speed < 2) {
                insights.push('🌤️ Calm conditions with very little wind.');
            }
            
            // Visibility insight
            if (visibility && visibility < 1000) {
                insights.push('🌫️ Reduced visibility. Be extra cautious when driving.');
            }
            
            // Cloud cover insight
            if (clouds.all > 90) {
                insights.push('☁️ Heavy cloud cover. Expect very little sunlight today.');
            } else if (clouds.all < 10) {
                insights.push('☀️ Mostly clear skies. Perfect for solar panels and photography!');
            }
            
            // Weather condition insight
            if (weatherData.id >= 200 && weatherData.id < 300) {
                insights.push('⚡ Thunderstorms possible. Stay indoors during lightning.');
            } else if (weatherData.id >= 500 && weatherData.id < 600) {
                insights.push('🌧️ Rain expected. Carry an umbrella and waterproof gear.');
            } else if (weatherData.id >= 600 && weatherData.id < 700) {
                insights.push('❄️ Snow expected. Check road conditions before traveling.');
            }
            
            // Forecast insight
            if (forecast && forecast.list) {
                const rainForecast = forecast.list.filter(item => item.pop && item.pop > 0.5);
                if (rainForecast.length > 0) {
                    const nextRain = rainForecast[0];
                    const rainDate = new Date(nextRain.dt * 1000);
                    const hoursUntilRain = Math.round((rainDate - new Date()) / (1000 * 60 * 60));
                    if (hoursUntilRain > 0 && hoursUntilRain < 24) {
                        insights.push(`🌧️ Rain expected in approximately ${hoursUntilRain} hours.`);
                    }
                }
            }
            
            return insights.length > 0 ? insights : ['No specific insights for current conditions.'];
        }

        // Get weather alerts
        function getWeatherAlerts(currentWeather) {
            const alerts = [];
            const { main, wind, weather, visibility } = currentWeather;
            const weatherData = weather[0];
            
            // Extreme temperature alerts
            if (main.temp > 40) {
                alerts.push({
                    title: 'Extreme Heat Warning',
                    message: 'Dangerously hot conditions. Avoid outdoor activities and stay hydrated.'
                });
            } else if (main.temp < -10) {
                alerts.push({
                    title: 'Extreme Cold Warning',
                    message: 'Dangerously cold conditions. Risk of frostbite and hypothermia.'
                });
            }
            
            // Severe weather alerts
            if (weatherData.id >= 200 && weatherData.id < 300) {
                alerts.push({
                    title: 'Thunderstorm Alert',
                    message: 'Thunderstorms in the area. Seek shelter immediately during lightning.'
                });
            }
            
            if (weatherData.id >= 600 && weatherData.id < 700 && main.temp < 0) {
                alerts.push({
                    title: 'Blizzard Warning',
                    message: 'Heavy snow with strong winds. Travel is not recommended.'
                });
            }
            
            // Wind alerts
            if (wind.speed > 20) {
                alerts.push({
                    title: 'High Wind Warning',
                    message: `Very strong winds (${formatWindSpeed(wind.speed)} ${CONFIG.units === 'metric' ? 'km/h' : 'mph'}). Secure all outdoor objects.`
                });
            }
            
            // Visibility alerts
            if (visibility && visibility < 500) {
                alerts.push({
                    title: 'Dense Fog Advisory',
                    message: 'Very low visibility. Driving conditions are hazardous.'
                });
            }
            
            return alerts;
        }

        // ========================================
        // MODALS
        // ========================================

        // Show modal
        function showModal(title, content, actions = null) {
            elements.modalTitle.textContent = title;
            elements.modalBody.innerHTML = content;
            elements.modalActions.innerHTML = '';
            
            if (actions) {
                actions.forEach(action => {
                    const btn = document.createElement('button');
                    btn.className = `btn btn-${action.type || 'secondary'}`;
                    btn.textContent = action.text;
                    btn.addEventListener('click', () => {
                        action.handler();
                        if (action.close !== false) closeModal();
                    });
                    elements.modalActions.appendChild(btn);
                });
            } else {
                const btn = document.createElement('button');
                btn.className = 'btn btn-primary';
                btn.textContent = 'Close';
                btn.addEventListener('click', closeModal);
                elements.modalActions.appendChild(btn);
            }
            
            elements.modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        // Close modal
        function closeModal() {
            elements.modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Show favorites modal
        function showFavoritesModal() {
            let content = '<p>No favorite locations saved.</p>';
            
            if (state.favorites.length > 0) {
                content = `
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${state.favorites.map((fav, index) => `
                            <div style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); cursor: pointer; display: flex; justify-content: space-between; align-items: center;" 
                                 onclick="loadFavorite(${index})">
                                <span>${fav.name}, ${fav.country}</span>
                                <button class="btn btn-secondary" onclick="removeFavorite(event, ${index})" style="padding: 4px 8px; font-size: 10px;">Remove</button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            showModal('Favorite Locations', content, [
                {
                    text: 'Add Current',
                    type: 'primary',
                    handler: addCurrentToFavorites
                },
                {
                    text: 'Close',
                    handler: closeModal
                }
            ]);
        }

        // Add current location to favorites
        function addCurrentToFavorites() {
            if (!state.location) return;
            
            const exists = state.favorites.some(f => 
                f.name === state.location.name && f.country === state.location.country
            );
            
            if (!exists) {
                state.favorites.push({
                    name: state.location.name,
                    country: state.location.country,
                    lat: state.location.lat,
                    lon: state.location.lon
                });
                
                localStorage.setItem('atmosFavorites', JSON.stringify(state.favorites));
                showToast('Location added to favorites!', 'success');
            } else {
                showToast('Location already in favorites', 'info');
            }
        }

        // Load favorite
        function loadFavorite(index) {
            const fav = state.favorites[index];
            if (fav) {
                loadWeatherData(fav);
                closeModal();
            }
        }

        // Remove favorite
        function removeFavorite(event, index) {
            event.stopPropagation();
            state.favorites.splice(index, 1);
            localStorage.setItem('atmosFavorites', JSON.stringify(state.favorites));
            showFavoritesModal();
            showToast('Location removed from favorites', 'info');
        }

        // Load favorites
        function loadFavorites() {
            state.favorites = JSON.parse(localStorage.getItem('atmosFavorites')) || [];
        }

        // Show hourly detail modal
        function showHourlyDetail(hour) {
            const date = new Date(hour.dt * 1000);
            const temp = Math.round(convertTemp(hour.main.temp));
            const feelsLike = Math.round(convertTemp(hour.main.feels_like));
            const humidity = hour.main.humidity;
            const windSpeed = formatWindSpeed(hour.wind.speed);
            const pop = hour.pop ? Math.round(hour.pop * 100) : 0;
            const condition = hour.weather[0].description;
            const icon = hour.weather[0].icon;
            
            const content = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">${getWeatherIcon(hour.weather[0].id, icon)}</div>
                    <div style="font-size: 32px; font-weight: 800; margin-bottom: 10px;">${temp}°</div>
                    <div style="color: var(--text-secondary);">${condition}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Feels Like</div>
                        <div style="font-size: 18px; font-weight: 700;">${feelsLike}°</div>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Humidity</div>
                        <div style="font-size: 18px; font-weight: 700;">${humidity}%</div>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Wind</div>
                        <div style="font-size: 18px; font-weight: 700;">${windSpeed} ${CONFIG.units === 'metric' ? 'km/h' : 'mph'}</div>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Precipitation</div>
                        <div style="font-size: 18px; font-weight: 700;">${pop}%</div>
                    </div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px;">Time</div>
                    <div style="font-size: 16px;">${formatTime(date)} - ${formatDate(date)}</div>
                </div>
            `;
            
            showModal(formatTime(date), content);
        }

        // Show daily detail modal
        function showDailyDetail(day) {
            const date = day.date;
            const items = day.items;
            
            const temps = items.map(item => convertTemp(item.main.temp));
            const high = Math.round(Math.max(...temps));
            const low = Math.round(Math.min(...temps));
            const avg = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
            
            const pops = items.map(item => item.pop || 0);
            const avgPop = Math.round(pops.reduce((a, b) => a + b, 0) / pops.length * 100);
            
            const conditions = items.map(item => item.weather[0].description);
            const mostCommon = conditions.sort((a, b) => 
                conditions.filter(c => c === a).length - conditions.filter(c => c === b).length
            ).pop();
            
            const content = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 24px; margin-bottom: 10px;">${formatDay(date)}</div>
                    <div style="font-size: 32px; font-weight: 800; margin-bottom: 10px;">${high}° / ${low}°</div>
                    <div style="color: var(--text-secondary);">${mostCommon}</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Average Temp</div>
                        <div style="font-size: 18px; font-weight: 700;">${avg}°</div>
                    </div>
                    <div style="padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                        <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase;">Precipitation</div>
                        <div style="font-size: 18px; font-weight: 700;">${avgPop}%</div>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <div style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 10px;">Hourly Forecast</div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                        ${items.slice(0, 4).map(item => {
                            const time = new Date(item.dt * 1000);
                            const temp = Math.round(convertTemp(item.main.temp));
                            return `
                                <div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center;">
                                    <div style="font-size: 10px; color: var(--text-muted);">${formatTime(time)}</div>
                                    <div style="font-size: 16px; font-weight: 700;">${temp}°</div>
                                    <div style="font-size: 12px;">${getWeatherIcon(item.weather[0].id, item.weather[0].icon)}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            
            showModal(formatDay(date) + ', ' + formatDate(date), content);
        }

        // ========================================
        // TOAST NOTIFICATIONS
        // ========================================

        // Show toast notification
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle'
            };
            
            toast.innerHTML = `
                <i class="fas ${icons[type] || 'fa-info-circle'}"></i>
                <span>${message}</span>
            `;
            
            elements.toastContainer.appendChild(toast);
            
            // Trigger animation
            setTimeout(() => {
                toast.classList.add('active');
            }, 10);
            
            // Remove after delay
            setTimeout(() => {
                toast.classList.remove('active');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 4000);
        }

        // ========================================
        // TIME & DATE
        // ========================================

        // Start clock
        function startClock() {
            updateCurrentTime();
            setInterval(updateCurrentTime, 1000);
        }

        // Update current time
        function updateCurrentTime() {
            const now = new Date();
            elements.currentTime.textContent = formatTime(now);
        }

        // Update date
        function updateDate() {
            const now = new Date();
            elements.date.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Scroll hourly forecast
        function scrollHourlyForecast(direction) {
            const container = elements.hourlyForecast;
            const scrollAmount = container.clientWidth * 0.8;
            
            if (direction === 'left') {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }

        // ========================================
        // EXPOSE FUNCTIONS FOR ONCLICK HANDLERS
        // ========================================

        // These functions are called from HTML onclick attributes
        window.loadFavorite = loadFavorite;
        window.removeFavorite = removeFavorite;

        // ========================================
        // INITIALIZE
        // ========================================

        // Start the application when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);

        // Also run if the script is loaded after DOM
        if (document.readyState !== 'loading') {
            init();
        }
