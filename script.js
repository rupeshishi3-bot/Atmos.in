// ========================================
// ATMOS - Premium Atmospheric Weather System
// Cinematic Backgrounds, Dynamic Particle Physics,
// Aerodynamic Wind Dynamics & Ambient Web Audio
// ========================================

// Configuration
const CONFIG = {
    defaultCity: 'New Delhi',
    units: 'metric', // 'metric' or 'imperial'
    lang: 'en',
    updateInterval: 300000, // 5 minutes
};

// Open-Meteo & Nominatim free endpoints
const API_ENDPOINTS = {
    geocode: 'https://geocoding-api.open-meteo.com/v1/search',
    forecast: 'https://api.open-meteo.com/v1/forecast',
    reverseGeocode: 'https://nominatim.openstreetmap.org/reverse'
};

// High-Definition Condition-Specific Photographic Backgrounds (Day & Night Aware)
const WEATHER_BACKGROUNDS = {
    sunny: 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=2000&q=85',
    clear: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    partly_cloudy: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=2000&q=85',
    cloudy: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?auto=format&fit=crop&w=2000&q=85',
    overcast: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=2000&q=85',
    windy: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    rainy: 'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=2000&q=85',
    drizzle: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=2000&q=85',
    storm: 'https://images.unsplash.com/photo-1514632595-4944383f2737?auto=format&fit=crop&w=2000&q=85',
    thunderstorm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2000&q=85',
    snow: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=2000&q=85',
    fog: 'https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=2000&q=85',
    mist: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=2000&q=85',
    night: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2000&q=85',
    night_clear: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=85',
    night_cloudy: 'https://images.unsplash.com/photo-1532978379173-523e16f371f2?auto=format&fit=crop&w=2000&q=85',
    night_rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2000&q=85',
    night_storm: 'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2000&q=85',
    night_snow: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=2000&q=85'
};

// Atmospheric Gradients for Instantaneous Seamless Background Transitions
const WEATHER_GRADIENTS = {
    sunny: 'linear-gradient(180deg, #1062a8 0%, #298cd4 45%, #60b6ec 100%)',
    clear: 'linear-gradient(180deg, #0e5491 0%, #2581c7 45%, #58ace0 100%)',
    partly_cloudy: 'linear-gradient(180deg, #164676 0%, #2f6ea6 45%, #659ec7 100%)',
    cloudy: 'linear-gradient(180deg, #233446 0%, #3d556e 45%, #6a829a 100%)',
    overcast: 'linear-gradient(180deg, #1d2630 0%, #33404c 45%, #52626e 100%)',
    windy: 'linear-gradient(180deg, #153255 0%, #1f4773 45%, #2a3a50 100%)',
    rainy: 'linear-gradient(180deg, #0e1b29 0%, #1a3245 45%, #27485f 100%)',
    drizzle: 'linear-gradient(180deg, #172430 0%, #263847 45%, #384e5f 100%)',
    storm: 'linear-gradient(180deg, #0a0e16 0%, #161e2b 45%, #0f1520 100%)',
    thunderstorm: 'linear-gradient(180deg, #080b12 0%, #131924 45%, #0b0e16 100%)',
    snow: 'linear-gradient(180deg, #243342 0%, #3e5f77 50%, #8eaec5 100%)',
    fog: 'linear-gradient(180deg, #232d36 0%, #3a4855 50%, #5d6e7d 100%)',
    mist: 'linear-gradient(180deg, #202b34 0%, #374653 50%, #556775 100%)',
    night: 'linear-gradient(180deg, #04060f 0%, #070c24 50%, #101639 100%)',
    night_clear: 'linear-gradient(180deg, #03050c 0%, #060b20 50%, #0e1333 100%)',
    night_cloudy: 'linear-gradient(180deg, #050814 0%, #0b1122 50%, #141c33 100%)',
    night_rain: 'linear-gradient(180deg, #040812 0%, #0a1322 50%, #111e32 100%)',
    night_storm: 'linear-gradient(180deg, #020306 0%, #060a14 45%, #03050a 100%)',
    night_snow: 'linear-gradient(180deg, #060a16 0%, #0e172a 50%, #182640 100%)'
};

// Global Reactive State
const state = {
    currentWeather: null,
    forecast: null,
    hourlyForecast: null,
    location: null,
    loading: true,
    error: null,
    unit: 'celsius', // 'celsius' or 'fahrenheit'
    favorites: JSON.parse(localStorage.getItem('atmosFavorites')) || [],
    currentConditionType: 'sunny',
    activeBgLayer: 'A',
    windSpeedOverride: null, // For interactive slider simulation
    soundEnabled: false,
    audioCtx: null,
    audioNodes: null
};

// DOM Elements Cache
const elements = {
    // Background Layers
    weatherBg: document.getElementById('weatherBg'),
    bgLayerA: document.getElementById('bgImageA') || document.getElementById('bgLayerA'),
    bgLayerB: document.getElementById('bgImageB') || document.getElementById('bgLayerB'),
    weatherCanvas: document.getElementById('weatherCanvas'),
    lightningFlash: document.getElementById('lightningFlash'),

    // Hero
    location: document.getElementById('location'),
    date: document.getElementById('date'),
    temperature: document.getElementById('temperature'),
    weatherIcon: document.getElementById('weatherIcon'),
    condition: document.getElementById('condition'),
    feelsLike: document.getElementById('feelsLike'),
    tempHigh: document.getElementById('tempHigh'),
    tempLow: document.getElementById('tempLow'),
    heroWind: document.getElementById('heroWind'),
    currentTime: document.getElementById('currentTime'),

    // Forecasts & Charts
    hourlyForecast: document.getElementById('hourlyForecast'),
    dailyForecast: document.getElementById('dailyForecast'),
    hourlyChartCanvas: document.getElementById('hourlyCanvasChart') || document.getElementById('hourlyChartCanvas'),
    chartLabels: document.getElementById('chartLabels'),
    prevHour: document.getElementById('prevHour'),
    nextHour: document.getElementById('nextHour'),

    // Wind Dynamics
    compassNeedle: document.getElementById('compassNeedle'),
    compassDegrees: document.getElementById('compassDegrees'),
    compassBearing: document.getElementById('compassBearing'),
    flowSpeedNumber: document.getElementById('flowSpeedNum') || document.getElementById('flowSpeedNumber'),
    flowSpeedUnit: document.getElementById('flowSpeedUnit'),
    beaufortVal: document.getElementById('beaufortVal'),
    beaufortBarFill: document.getElementById('beaufortFill') || document.getElementById('beaufortBarFill'),
    beaufortDesc: document.getElementById('beaufortDesc'),
    windSpeedSlider: document.getElementById('windSpeedSlider'),
    sliderValDisplay: document.getElementById('sliderValDisplay'),
    sunPositionDot: document.getElementById('celestialBody') || document.getElementById('sunPositionDot'),
    sunriseTime: document.getElementById('sunriseTime'),
    sunsetTime: document.getElementById('sunsetTime'),
    solarNoonTime: document.getElementById('daylightDuration') || document.getElementById('solarNoonTime'),

    // Intelligence & Best Time
    weatherOverview: document.getElementById('weatherOverview'),
    keyInsights: document.getElementById('keyInsights'),
    weatherAlerts: document.getElementById('weatherAlerts'),
    bestTimePeriod: document.getElementById('bestTimePeriod'),
    bestTimeDesc: document.getElementById('bestTimeDesc'),
    bestTimeVisual: document.getElementById('bestTimeVisual'),

    // Stats & News
    weatherStats: document.getElementById('weatherStats'),
    weatherNews: document.getElementById('weatherNews'),

    // Header Controls
    citySearch: document.getElementById('citySearch'),
    clearSearch: document.getElementById('clearSearch'),
    geoBtn: document.getElementById('geoBtn'),
    unitToggle: document.getElementById('unitToggle'),
    soundToggle: document.getElementById('soundToggle'),
    settingsMenu: document.getElementById('settingsMenu'),
    userMenu: document.getElementById('userMenu'),

    // Modals & Toast
    modalOverlay: document.getElementById('modalOverlay'),
    modal: document.getElementById('modal'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    modalActions: document.getElementById('modalActions'),
    modalClose: document.getElementById('modalClose'),
    toastContainer: document.getElementById('toastContainer')
};

// ========================================
// INITIALIZATION
// ========================================

function init() {
    // Default to crystal clear background transparency
    document.body.classList.add('glass-crystal');
    
    setupEventListeners();
    startClock();
    updateDate();
    initParticleEngine();
    loadFavorites();
    setupQuickControls();
    
    // Initial weather load
    loadDefaultWeather();
}

// Setup Event Listeners
function setupEventListeners() {
    // Search Box & Suggestions
    setupLocationSearch();

    if (elements.citySearch) {
        elements.citySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                searchCity(e.target.value.trim());
            }
        });
    }

    if (elements.clearSearch) {
        elements.clearSearch.addEventListener('click', () => {
            elements.citySearch.value = '';
            elements.clearSearch.style.display = 'none';
        });
    }

    // Geolocation Button
    if (elements.geoBtn) {
        elements.geoBtn.addEventListener('click', requestUserGeolocation);
    }

    // Unit Toggle
    if (elements.unitToggle) {
        elements.unitToggle.addEventListener('click', toggleUnit);
    }

    // Sound Toggle
    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('click', toggleAmbientSound);
    }

    // Menus
    if (elements.userMenu) elements.userMenu.addEventListener('click', showFavoritesModal);
    if (elements.settingsMenu) elements.settingsMenu.addEventListener('click', showSettingsModal);

    // Nav smooth scrolling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const label = item.querySelector('span')?.textContent.trim().toLowerCase();
            const targets = {
                home: 'hero',
                forecast: 'forecast',
                wind: 'windDynamics',
                intelligence: 'intelligence',
                history: 'history'
            };
            const target = document.getElementById(targets[label]);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Hourly Navigation
    if (elements.prevHour) elements.prevHour.addEventListener('click', () => scrollHourlyForecast('left'));
    if (elements.nextHour) elements.nextHour.addEventListener('click', () => scrollHourlyForecast('right'));

    // Modals
    if (elements.modalClose) elements.modalClose.addEventListener('click', closeModal);
    if (elements.modalOverlay) {
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) closeModal();
        });
    }

    // Wind Speed Slider
    if (elements.windSpeedSlider) {
        elements.windSpeedSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            state.windSpeedOverride = val;
            if (elements.sliderValDisplay) {
                elements.sliderValDisplay.textContent = `${val} km/h`;
            }
            updateWindDisplays(val);
        });
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            if (elements.citySearch) elements.citySearch.focus();
        }
    });

    // Window Resize Handling
    window.addEventListener('resize', debounce(() => {
        resizeCanvas();
        renderHourlyCanvasChart();
    }, 150));
}

// Quick City & Weather Scene Controls
function setupQuickControls() {
    // Quick City Chips
    document.querySelectorAll('#cityChips .city-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const city = chip.dataset.city;
            if (city) loadWeatherData(city);
        });
    });

    // Scene Simulator Chips
    document.querySelectorAll('.scene-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.scene-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const scene = chip.dataset.scene;
            simulateWeatherScene(scene);
        });
    });

    // Glass Clarity Mode Chips
    document.querySelectorAll('#clarityChips .city-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#clarityChips .city-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const clarity = chip.dataset.clarity;
            document.body.classList.remove('glass-crystal', 'glass-frosted', 'glass-deep');
            if (clarity === 'crystal') {
                document.body.classList.add('glass-crystal');
                showToast('Crystal Clear 100% Background View enabled', 'info');
            } else if (clarity === 'frosted') {
                document.body.classList.add('glass-frosted');
                showToast('Frosted Glass Mode enabled', 'info');
            } else if (clarity === 'deep') {
                document.body.classList.add('glass-deep');
                showToast('Shaded Glass Mode enabled', 'info');
            }
        });
    });
}

// Manual Weather Scene Simulator
function simulateWeatherScene(scene) {
    state.currentConditionType = scene;
    
    // Map scene to condition metadata
    const sceneConfigs = {
        sunny: { name: 'Radiant Sunshine', id: 800, isDay: true, wind: 8, temp: 26 },
        clear: { name: 'Crisp Clear Sky', id: 800, isDay: true, wind: 6, temp: 23 },
        partly_cloudy: { name: 'Partly Cloudy', id: 802, isDay: true, wind: 14, temp: 21 },
        cloudy: { name: 'Cloud Covered', id: 803, isDay: true, wind: 16, temp: 18 },
        overcast: { name: 'Overcast Horizon', id: 804, isDay: true, wind: 18, temp: 15 },
        windy: { name: 'High Wind Velocity', id: 801, isDay: true, wind: 48, temp: 17 },
        rainy: { name: 'Atmospheric Rain', id: 501, isDay: true, wind: 22, temp: 16 },
        drizzle: { name: 'Misting Drizzle', id: 301, isDay: true, wind: 10, temp: 14 },
        storm: { name: 'Severe Thunderstorm', id: 211, isDay: false, wind: 60, temp: 18 },
        snow: { name: 'Winter Snowfall', id: 601, isDay: true, wind: 15, temp: -2 },
        fog: { name: 'Dense Atmospheric Fog', id: 741, isDay: true, wind: 5, temp: 12 },
        night: { name: 'Cosmic Starlight', id: 800, isDay: false, wind: 8, temp: 14 },
        night_clear: { name: 'Celestial Clear Night', id: 800, isDay: false, wind: 7, temp: 13 },
        night_cloudy: { name: 'Moonlit Cloudy Night', id: 803, isDay: false, wind: 12, temp: 15 },
        night_rain: { name: 'Nocturnal Rainstorm', id: 501, isDay: false, wind: 24, temp: 13 }
    };

    const cfg = sceneConfigs[scene] || sceneConfigs.sunny;

    // Transition background and particles
    setCinematicBackground(scene);
    setParticleCondition(scene, cfg.wind);

    // Update hero badges
    if (elements.condition) elements.condition.textContent = cfg.name;
    if (elements.weatherIcon) elements.weatherIcon.innerHTML = getWeatherIcon(cfg.id, cfg.isDay ? '01d' : '01n');
    
    // Update Wind displays
    updateWindDisplays(cfg.wind);

    // Play ambient sound if active
    if (state.soundEnabled) {
        playSceneAmbientSound(scene);
    }

    showToast(`Simulating ${cfg.name} environment`, 'info');
}

// Geolocation Handler
function requestUserGeolocation() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'error');
        return;
    }

    showToast('Locating your coordinates...', 'info');
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Reverse geocode
                const res = await fetch(`${API_ENDPOINTS.reverseGeocode}?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                const cityName = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Current Location';
                const country = data.address?.country || '';
                
                loadWeatherData({
                    name: cityName,
                    country: country,
                    lat: latitude,
                    lon: longitude
                });
                showToast(`Located in ${cityName}`, 'success');
            } catch (e) {
                loadWeatherData({
                    name: 'Current Location',
                    lat: latitude,
                    lon: longitude
                });
            }
        },
        (error) => {
            console.warn('Geolocation error:', error);
            showToast('Unable to retrieve location. Using default city.', 'error');
            loadWeatherData(CONFIG.defaultCity);
        },
        { timeout: 10000, enableHighAccuracy: true }
    );
}

// Default weather loader
async function loadDefaultWeather() {
    try {
        await loadWeatherData(CONFIG.defaultCity);
    } catch (e) {
        console.error('Failed to load initial city, trying fallback:', e);
        await loadWeatherData('London');
    }
}

// ========================================
// CINEMATIC BACKGROUND IMAGE ENGINE
// ========================================

function setCinematicBackground(conditionType) {
    const imageUrl = WEATHER_BACKGROUNDS[conditionType] || 
                     WEATHER_BACKGROUNDS[conditionType.startsWith('night') ? 'night' : 'sunny'] || 
                     WEATHER_BACKGROUNDS.sunny;
    
    // Dual layer cross-fade
    const incomingLayer = state.activeBgLayer === 'A' ? elements.bgLayerB : elements.bgLayerA;
    const currentLayer = state.activeBgLayer === 'A' ? elements.bgLayerA : elements.bgLayerB;

    if (!incomingLayer || !currentLayer) return;

    // Apply atmospheric gradient immediately to ensure instantaneous visual feedback
    if (WEATHER_GRADIENTS[conditionType]) {
        incomingLayer.style.background = WEATHER_GRADIENTS[conditionType];
    }

    // Preload image for butter-smooth transition
    const img = new Image();
    img.src = imageUrl;

    const activateLayer = (url) => {
        incomingLayer.style.backgroundImage = `url('${url}')`;
        incomingLayer.style.backgroundSize = 'cover';
        incomingLayer.style.backgroundPosition = 'center center';
        incomingLayer.classList.add('active');
        currentLayer.classList.remove('active');
        state.activeBgLayer = state.activeBgLayer === 'A' ? 'B' : 'A';
    };

    img.onload = () => activateLayer(imageUrl);
    img.onerror = () => {
        // Fallback to primary condition image if external link has issues
        const fallbackUrl = conditionType.startsWith('night') ? WEATHER_BACKGROUNDS.night : WEATHER_BACKGROUNDS.sunny;
        activateLayer(fallbackUrl);
    };

    // Body class for condition-specific contextual styling without removing non-weather classes
    const classList = document.body.classList;
    Array.from(classList).forEach(cls => {
        if (cls.startsWith('weather-')) classList.remove(cls);
    });
    classList.add(`weather-${conditionType}`);
}

// ========================================
// ADVANCED DYNAMIC PARTICLE ENGINE (CANVAS)
// ========================================

let canvasCtx = null;
let particles = [];
let animFrameId = null;
let currentParticleMode = 'sunny';
let currentWindVelocity = 15;
let currentWindAngleRad = Math.PI * 0.15; // Flowing from left to right

function initParticleEngine() {
    if (!elements.weatherCanvas) return;
    canvasCtx = elements.weatherCanvas.getContext('2d');
    resizeCanvas();
    startParticleLoop();
}

function resizeCanvas() {
    if (!elements.weatherCanvas) return;
    elements.weatherCanvas.width = window.innerWidth;
    elements.weatherCanvas.height = window.innerHeight;
    createParticlesForMode(currentParticleMode);
}

function setParticleCondition(mode, windKmh = 15) {
    currentParticleMode = mode;
    currentWindVelocity = Math.max(2, windKmh);
    createParticlesForMode(mode);
}

function createParticlesForMode(mode) {
    particles = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    switch (mode) {
        case 'sunny':
        case 'clear':
            // Golden warm solar dust motes & gentle bokeh
            for (let i = 0; i < 70; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 3 + 1,
                    alpha: Math.random() * 0.6 + 0.2,
                    speedY: -Math.random() * 0.4 - 0.1,
                    speedX: (Math.random() - 0.5) * 0.3,
                    hue: Math.random() * 20 + 40, // Gold to light yellow
                    pulseSpeed: Math.random() * 0.03 + 0.01,
                    pulseVal: Math.random() * Math.PI
                });
            }
            break;

        case 'partly_cloudy':
            // Solar dust motes + light flowing air streams
            for (let i = 0; i < 40; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2.5 + 1,
                    alpha: Math.random() * 0.5 + 0.2,
                    speedY: -Math.random() * 0.3 - 0.05,
                    speedX: (Math.random() - 0.5) * 0.4,
                    hue: Math.random() * 25 + 35,
                    pulseSpeed: Math.random() * 0.02 + 0.01,
                    pulseVal: Math.random() * Math.PI
                });
            }
            for (let i = 0; i < 15; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 80 + 50,
                    speedX: Math.random() * 0.3 + 0.1,
                    alpha: Math.random() * 0.05 + 0.02,
                    pulse: Math.random() * Math.PI,
                    isPuff: true
                });
            }
            break;

        case 'cloudy':
        case 'overcast':
        case 'fog':
        case 'mist':
            // Drifting volumetric atmospheric fog puff circles
            for (let i = 0; i < 35; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 120 + 80,
                    speedX: Math.random() * 0.4 + 0.1,
                    alpha: Math.random() * 0.08 + 0.03,
                    pulse: Math.random() * Math.PI
                });
            }
            break;

        case 'windy':
            // High-speed flowing aerodynamic streaks
            const count = Math.min(180, Math.floor(currentWindVelocity * 2.5 + 40));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * (width + 400) - 200,
                    y: Math.random() * height,
                    length: Math.random() * 60 + 20,
                    speed: (Math.random() * 0.8 + 0.8) * (currentWindVelocity * 0.45 + 5),
                    thickness: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.5 + 0.15,
                    waviness: Math.random() * 3 + 1
                });
            }
            break;

        case 'rainy':
        case 'drizzle':
        case 'night_rain':
            // Raindrop velocity streaks with wind slant
            const rainCount = mode === 'drizzle' ? 120 : 300;
            for (let i = 0; i < rainCount; i++) {
                particles.push({
                    x: Math.random() * (width + 300) - 150,
                    y: Math.random() * height,
                    length: Math.random() * 24 + 14,
                    speed: Math.random() * 12 + 18,
                    windDrift: (currentWindVelocity / 20) * 4,
                    alpha: Math.random() * 0.4 + 0.2,
                    thickness: Math.random() * 1.2 + 0.8
                });
            }
            break;

        case 'storm':
        case 'thunderstorm':
        case 'night_storm':
            // Heavy rain + Lightning flashes
            for (let i = 0; i < 450; i++) {
                particles.push({
                    x: Math.random() * (width + 400) - 200,
                    y: Math.random() * height,
                    length: Math.random() * 35 + 20,
                    speed: Math.random() * 18 + 26,
                    windDrift: (currentWindVelocity / 20) * 7 + 5,
                    alpha: Math.random() * 0.6 + 0.3,
                    thickness: Math.random() * 1.5 + 1.0
                });
            }
            break;

        case 'snow':
        case 'night_snow':
            // 3D falling snowflakes with soft sway
            for (let i = 0; i < 160; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 3.5 + 1.2,
                    speedY: Math.random() * 1.5 + 0.8,
                    swaySpeed: Math.random() * 0.03 + 0.01,
                    swayDistance: Math.random() * 3 + 1,
                    swayOffset: Math.random() * Math.PI * 2,
                    alpha: Math.random() * 0.7 + 0.3
                });
            }
            break;

        case 'night':
        case 'night_clear':
            // Twinkling stars and celestial starlight
            for (let i = 0; i < 150; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.85,
                    radius: Math.random() * 1.8 + 0.6,
                    alpha: Math.random() * 0.8 + 0.2,
                    twinkleSpeed: Math.random() * 0.05 + 0.01,
                    twinkleVal: Math.random() * Math.PI
                });
            }
            break;

        case 'night_cloudy':
            // Stars peaking through ethereal night wisps
            for (let i = 0; i < 70; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.75,
                    radius: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.6 + 0.2,
                    twinkleSpeed: Math.random() * 0.04 + 0.01,
                    twinkleVal: Math.random() * Math.PI
                });
            }
            for (let i = 0; i < 20; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 100 + 60,
                    speedX: Math.random() * 0.3 + 0.1,
                    alpha: Math.random() * 0.05 + 0.02,
                    pulse: Math.random() * Math.PI,
                    isPuff: true
                });
            }
            break;
    }
}

let lastLightningTime = Date.now();

function startParticleLoop() {
    function loop() {
        if (canvasCtx && elements.weatherCanvas) {
            const width = elements.weatherCanvas.width;
            const height = elements.weatherCanvas.height;

            canvasCtx.clearRect(0, 0, width, height);

            // Render current mode
            switch (currentParticleMode) {
                case 'sunny':
                case 'clear':
                    particles.forEach(p => {
                        p.pulseVal += p.pulseSpeed;
                        const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.2;
                        p.y += p.speedY;
                        p.x += p.speedX;
                        if (p.y < 0) p.y = height;
                        if (p.x < 0) p.x = width;
                        if (p.x > width) p.x = 0;

                        canvasCtx.beginPath();
                        canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        canvasCtx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${Math.max(0.1, currentAlpha)})`;
                        canvasCtx.shadowBlur = 10;
                        canvasCtx.shadowColor = `hsla(${p.hue}, 100%, 75%, 0.8)`;
                        canvasCtx.fill();
                    });
                    canvasCtx.shadowBlur = 0;
                    break;

                case 'partly_cloudy':
                    particles.forEach(p => {
                        if (p.isPuff) {
                            p.pulse += 0.005;
                            p.x += p.speedX;
                            if (p.x - p.radius > width) p.x = -p.radius;

                            const radGrad = canvasCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                            radGrad.addColorStop(0, `rgba(230, 240, 255, ${p.alpha + Math.sin(p.pulse) * 0.015})`);
                            radGrad.addColorStop(1, 'rgba(230, 240, 255, 0)');

                            canvasCtx.fillStyle = radGrad;
                            canvasCtx.beginPath();
                            canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                            canvasCtx.fill();
                        } else {
                            p.pulseVal += p.pulseSpeed;
                            const currentAlpha = p.alpha + Math.sin(p.pulseVal) * 0.2;
                            p.y += p.speedY;
                            p.x += p.speedX;
                            if (p.y < 0) p.y = height;
                            if (p.x < 0) p.x = width;
                            if (p.x > width) p.x = 0;

                            canvasCtx.beginPath();
                            canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                            canvasCtx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${Math.max(0.1, currentAlpha)})`;
                            canvasCtx.shadowBlur = 8;
                            canvasCtx.shadowColor = `hsla(${p.hue}, 100%, 75%, 0.7)`;
                            canvasCtx.fill();
                            canvasCtx.shadowBlur = 0;
                        }
                    });
                    break;

                case 'windy':
                    particles.forEach(p => {
                        p.x += p.speed;
                        p.y += Math.sin(p.x * 0.01) * p.waviness;

                        if (p.x > width + 200) {
                            p.x = -200;
                            p.y = Math.random() * height;
                        }

                        canvasCtx.beginPath();
                        canvasCtx.moveTo(p.x, p.y);
                        canvasCtx.lineTo(p.x + p.length, p.y + Math.sin((p.x + p.length) * 0.01) * p.waviness);
                        canvasCtx.strokeStyle = `rgba(200, 240, 255, ${p.alpha})`;
                        canvasCtx.lineWidth = p.thickness;
                        canvasCtx.lineCap = 'round';
                        canvasCtx.stroke();
                    });
                    break;

                case 'rainy':
                case 'drizzle':
                case 'night_rain':
                case 'storm':
                case 'thunderstorm':
                case 'night_storm':
                    particles.forEach(p => {
                        p.y += p.speed;
                        p.x += p.windDrift;

                        if (p.y > height) {
                            p.y = -p.length;
                            p.x = Math.random() * (width + 300) - 150;
                        }

                        canvasCtx.beginPath();
                        canvasCtx.moveTo(p.x, p.y);
                        canvasCtx.lineTo(p.x + p.windDrift * 0.6, p.y + p.length);
                        canvasCtx.strokeStyle = currentParticleMode.includes('storm') 
                            ? `rgba(180, 220, 255, ${p.alpha})`
                            : `rgba(160, 210, 255, ${p.alpha})`;
                        canvasCtx.lineWidth = p.thickness;
                        canvasCtx.stroke();
                    });

                    // Random Lightning flash for storms
                    if (currentParticleMode.includes('storm')) {
                        const now = Date.now();
                        if (now - lastLightningTime > 4000 + Math.random() * 8000) {
                            triggerLightningFlash();
                            lastLightningTime = now;
                        }
                    }
                    break;

                case 'snow':
                case 'night_snow':
                    particles.forEach(p => {
                        p.swayOffset += p.swaySpeed;
                        p.y += p.speedY;
                        p.x += Math.sin(p.swayOffset) * p.swayDistance + (currentWindVelocity / 30);

                        if (p.y > height) {
                            p.y = -10;
                            p.x = Math.random() * width;
                        }
                        if (p.x > width) p.x = 0;
                        if (p.x < 0) p.x = width;

                        canvasCtx.beginPath();
                        canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        canvasCtx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                        canvasCtx.fill();
                    });
                    break;

                case 'cloudy':
                case 'overcast':
                case 'fog':
                case 'mist':
                    particles.forEach(p => {
                        p.pulse += 0.005;
                        p.x += p.speedX;
                        if (p.x - p.radius > width) p.x = -p.radius;

                        const radGrad = canvasCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                        radGrad.addColorStop(0, `rgba(220, 230, 245, ${p.alpha + Math.sin(p.pulse) * 0.02})`);
                        radGrad.addColorStop(1, 'rgba(220, 230, 245, 0)');

                        canvasCtx.fillStyle = radGrad;
                        canvasCtx.beginPath();
                        canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        canvasCtx.fill();
                    });
                    break;

                case 'night':
                case 'night_clear':
                    particles.forEach(p => {
                        p.twinkleVal += p.twinkleSpeed;
                        const alpha = p.alpha + Math.sin(p.twinkleVal) * 0.3;

                        canvasCtx.beginPath();
                        canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        canvasCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
                        canvasCtx.shadowBlur = 6;
                        canvasCtx.shadowColor = '#ffffff';
                        canvasCtx.fill();
                    });
                    canvasCtx.shadowBlur = 0;
                    break;

                case 'night_cloudy':
                    particles.forEach(p => {
                        if (p.isPuff) {
                            p.pulse += 0.005;
                            p.x += p.speedX;
                            if (p.x - p.radius > width) p.x = -p.radius;

                            const radGrad = canvasCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
                            radGrad.addColorStop(0, `rgba(40, 60, 100, ${p.alpha + Math.sin(p.pulse) * 0.015})`);
                            radGrad.addColorStop(1, 'rgba(40, 60, 100, 0)');

                            canvasCtx.fillStyle = radGrad;
                            canvasCtx.beginPath();
                            canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                            canvasCtx.fill();
                        } else {
                            p.twinkleVal += p.twinkleSpeed;
                            const alpha = p.alpha + Math.sin(p.twinkleVal) * 0.3;

                            canvasCtx.beginPath();
                            canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                            canvasCtx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
                            canvasCtx.shadowBlur = 5;
                            canvasCtx.shadowColor = '#ffffff';
                            canvasCtx.fill();
                            canvasCtx.shadowBlur = 0;
                        }
                    });
                    break;
            }
        }
        animFrameId = requestAnimationFrame(loop);
    }
    loop();
}

function triggerLightningFlash() {
    if (!elements.lightningFlash) return;
    elements.lightningFlash.style.opacity = '0.9';
    setTimeout(() => {
        elements.lightningFlash.style.opacity = '0';
        setTimeout(() => {
            elements.lightningFlash.style.opacity = '0.7';
            setTimeout(() => {
                elements.lightningFlash.style.opacity = '0';
            }, 60);
        }, 100);
    }, 80);
}

// ========================================
// AMBIENT WEB AUDIO SYNTHESIZER
// ========================================

function toggleAmbientSound() {
    state.soundEnabled = !state.soundEnabled;
    if (elements.soundToggle) {
        elements.soundToggle.classList.toggle('playing', state.soundEnabled);
        elements.soundToggle.innerHTML = state.soundEnabled 
            ? '<i class="fas fa-volume-high"></i>' 
            : '<i class="fas fa-volume-xmark"></i>';
    }

    if (state.soundEnabled) {
        initWebAudio();
        playSceneAmbientSound(state.currentConditionType);
        showToast('Atmospheric ambient audio enabled', 'info');
    } else {
        stopWebAudio();
        showToast('Ambient audio muted', 'info');
    }
}

function initWebAudio() {
    if (!state.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioCtx = new AudioContext();
    }
    if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
    }
}

function stopWebAudio() {
    if (state.audioNodes) {
        try {
            state.audioNodes.gainNode.gain.linearRampToValueAtTime(0.001, state.audioCtx.currentTime + 0.5);
            setTimeout(() => {
                state.audioNodes.source.stop();
                state.audioNodes = null;
            }, 600);
        } catch (e) {}
    }
}

function playSceneAmbientSound(conditionType) {
    if (!state.soundEnabled || !state.audioCtx) return;
    stopWebAudio();

    const ctx = state.audioCtx;
    // Generate pink noise for organic rain/wind
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter adapted to weather condition
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    if (conditionType.includes('rain') || conditionType.includes('storm')) {
        filter.type = 'lowpass';
        filter.frequency.value = 1400;
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    } else if (conditionType.includes('wind')) {
        filter.type = 'bandpass';
        filter.frequency.value = 450;
        filter.Q.value = 2.5;
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
    } else {
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
    }

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    noise.start();

    state.audioNodes = { source: noise, gainNode: gainNode };
}

// ========================================
// WEATHER DATA FETCHER & ADAPTER
// ========================================

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

        // Determine condition accurately based on real-time satellite & telemetry data
        const conditionType = determineWeatherCondition(state.currentWeather);
        state.currentConditionType = conditionType;

        // Apply cinematic background & particles
        setCinematicBackground(conditionType);
        setParticleCondition(conditionType, state.currentWeather.wind.speed * 3.6);

        // Update all UI Components
        updateAllUI();
        
        if (elements.citySearch) {
            elements.citySearch.value = location.name;
            if (elements.clearSearch) elements.clearSearch.style.display = 'block';
        }
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
            name: input.name || 'Custom Location',
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

// Open-Meteo WMO weather code mapping
const OPEN_METEO_CODES = {
    0: [800, 'Clear sky'],
    1: [801, 'Mainly clear'],
    2: [802, 'Partly cloudy'],
    3: [804, 'Overcast'],
    45: [741, 'Fog'], 48: [741, 'Rime fog'],
    51: [300, 'Light drizzle'], 53: [301, 'Drizzle'], 55: [302, 'Heavy drizzle'],
    56: [311, 'Freezing drizzle'], 57: [312, 'Heavy freezing drizzle'],
    61: [500, 'Light rain'], 63: [501, 'Moderate rain'], 65: [502, 'Heavy rain'],
    66: [611, 'Freezing rain'], 67: [612, 'Heavy freezing rain'],
    71: [600, 'Light snow'], 73: [601, 'Snow'], 75: [602, 'Heavy snow'],
    77: [600, 'Snow grains'],
    80: [520, 'Rain showers'], 81: [521, 'Heavy rain showers'], 82: [522, 'Violent rain showers'],
    85: [620, 'Snow showers'], 86: [622, 'Heavy snow showers'],
    95: [200, 'Thunderstorm'], 96: [201, 'Thunderstorm with hail'], 99: [202, 'Severe thunderstorm']
};

function weatherCodeInfo(code) {
    return OPEN_METEO_CODES[code] || [800, 'Clear sky'];
}

function adaptOpenMeteoData(data, location) {
    if (data.timezone && location) {
        location.timezone = data.timezone;
    }

    const cur = data.current || {};
    const [weatherId, weatherDesc] = weatherCodeInfo(cur.weather_code);
    const isDay = cur.is_day !== undefined ? cur.is_day === 1 : true;
    const nowIso = cur.time || new Date().toISOString();
    const dt = Math.floor(new Date(nowIso).getTime() / 1000);

    const sunriseStr = data.daily?.sunrise?.[0];
    const sunsetStr = data.daily?.sunset?.[0];
    const sunrise = sunriseStr ? Math.floor(new Date(sunriseStr).getTime() / 1000) : dt - 21600;
    const sunset = sunsetStr ? Math.floor(new Date(sunsetStr).getTime() / 1000) : dt + 21600;

    const current = {
        name: location.name,
        coord: { lat: location.lat, lon: location.lon },
        sys: {
            country: location.country || location.countryCode || '',
            sunrise,
            sunset
        },
        dt,
        timezone: data.timezone || location.timezone || 'auto',
        is_day: cur.is_day !== undefined ? cur.is_day : (isDay ? 1 : 0),
        weather_code: cur.weather_code !== undefined ? cur.weather_code : 0,
        cloud_cover: Math.round(cur.cloud_cover ?? 0),
        precipitation: cur.precipitation ?? 0,
        main: {
            temp: cur.temperature_2m ?? 20,
            feels_like: cur.apparent_temperature ?? cur.temperature_2m ?? 20,
            temp_min: data.daily?.temperature_2m_min?.[0] ?? (cur.temperature_2m - 4),
            temp_max: data.daily?.temperature_2m_max?.[0] ?? (cur.temperature_2m + 4),
            pressure: Math.round(cur.pressure_msl ?? 1013),
            humidity: Math.round(cur.relative_humidity_2m ?? 50)
        },
        weather: [{
            id: weatherId,
            main: weatherDesc,
            description: weatherDesc,
            icon: isDay ? (weatherId === 800 ? '01d' : '02d') : (weatherId === 800 ? '01n' : '02n')
        }],
        wind: {
            speed: (cur.wind_speed_10m ?? 0) / 3.6, // m/s
            deg: cur.wind_direction_10m ?? 0
        },
        clouds: { all: Math.round(cur.cloud_cover ?? 0) },
        visibility: Math.round(cur.visibility ?? 10000),
        uv: cur.uv_index ?? data.daily?.uv_index_max?.[0] ?? 3
    };

    const hourly = data.hourly || {};
    const forecastList = [];
    const hourlyTimes = hourly.time || [];
    const maxHours = Math.min(72, hourlyTimes.length);

    for (let i = 0; i < maxHours; i++) {
        const itemTime = new Date(hourlyTimes[i]);
        const [hId, hDesc] = weatherCodeInfo(hourly.weather_code?.[i]);
        const hIsDay = hourly.is_day?.[i] === 1;

        forecastList.push({
            dt: Math.floor(itemTime.getTime() / 1000),
            main: {
                temp: hourly.temperature_2m?.[i] ?? 0,
                feels_like: hourly.apparent_temperature?.[i] ?? 0,
                humidity: Math.round(hourly.relative_humidity_2m?.[i] ?? 0),
                pressure: Math.round(hourly.pressure_msl?.[i] ?? 1013),
                temp_min: hourly.temperature_2m?.[i] ?? 0,
                temp_max: hourly.temperature_2m?.[i] ?? 0
            },
            weather: [{
                id: hId,
                main: hDesc,
                description: hDesc,
                icon: hIsDay ? (hId === 800 ? '01d' : '02d') : (hId === 800 ? '01n' : '02n')
            }],
            wind: {
                speed: (hourly.wind_speed_10m?.[i] ?? 0) / 3.6,
                deg: hourly.wind_direction_10m?.[i] ?? 0
            },
            clouds: { all: Math.round(hourly.cloud_cover?.[i] ?? 0) },
            pop: (hourly.precipitation_probability?.[i] ?? 0) / 100
        });
    }

    return {
        current,
        forecast: {
            city: { name: location.name, country: location.country },
            list: forecastList,
            daily: data.daily
        }
    };
}

function extractHourlyForecast(forecast) {
    if (!forecast || !forecast.list) return [];
    return forecast.list.slice(0, 24);
}

// ========================================
// UI UPDATERS
// ========================================

function updateAllUI() {
    updateDate();
    updateCurrentTime();
    updateHero();
    updateHourlyForecast();
    renderHourlyCanvasChart();
    updateDailyForecast();
    updateWindDynamics();
    updateIntelligence();
    updateBestTime();
    updateWeatherStats();
    updateNews();
}

function updateLoadingState() {
    if (elements.condition) elements.condition.textContent = 'Loading weather...';
    if (elements.weatherIcon) elements.weatherIcon.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
}

function updateErrorState() {
    if (elements.location) elements.location.textContent = 'Location Unavailable';
    if (elements.temperature) elements.temperature.textContent = '--°';
    if (elements.condition) elements.condition.textContent = state.error || 'Error';
    if (elements.weatherIcon) elements.weatherIcon.innerHTML = '<i class="fas fa-triangle-exclamation"></i>';
}

// Hero Section
function updateHero() {
    if (!state.currentWeather) return;

    const { name, sys, main, weather } = state.currentWeather;
    const weatherData = weather[0];

    if (elements.location) elements.location.textContent = `${name}${sys.country ? ', ' + sys.country : ''}`;
    
    const temp = convertTemp(main.temp);
    if (elements.temperature) elements.temperature.textContent = `${Math.round(temp)}°`;

    if (elements.condition) elements.condition.textContent = weatherData.description;
    if (elements.weatherIcon) elements.weatherIcon.innerHTML = getWeatherIcon(weatherData.id, weatherData.icon);

    if (elements.feelsLike) elements.feelsLike.textContent = `${Math.round(convertTemp(main.feels_like))}°`;
    if (elements.tempHigh) elements.tempHigh.textContent = `${Math.round(convertTemp(main.temp_max))}°`;
    if (elements.tempLow) elements.tempLow.textContent = `${Math.round(convertTemp(main.temp_min))}°`;
    if (elements.heroWind && state.currentWeather.wind) {
        const windKmh = Math.round(state.currentWeather.wind.speed * 3.6);
        elements.heroWind.textContent = `${CONFIG.units === 'metric' ? windKmh + ' km/h' : Math.round(windKmh * 0.621371) + ' mph'}`;
    }
}

// Hourly Forecast Cards
function updateHourlyForecast() {
    if (!state.hourlyForecast || state.hourlyForecast.length === 0 || !elements.hourlyForecast) return;

    elements.hourlyForecast.innerHTML = '';
    const now = new Date();
    const currentHour = now.getHours();
    const hourlyToShow = state.hourlyForecast.slice(0, 16);

    hourlyToShow.forEach(hour => {
        const date = new Date(hour.dt * 1000);
        const hourNum = date.getHours();
        const temp = Math.round(convertTemp(hour.main.temp));
        const weatherId = hour.weather[0].id;
        const icon = hour.weather[0].icon;
        const pop = hour.pop ? Math.round(hour.pop * 100) : 0;

        const card = document.createElement('div');
        card.className = `hourly-card ${hourNum === currentHour ? 'active' : ''}`;
        card.innerHTML = `
            <div class="hourly-time">${formatTime(date)}</div>
            <div class="hourly-icon">${getWeatherIcon(weatherId, icon)}</div>
            <div class="hourly-temp">${temp}°</div>
            <div class="hourly-pop"><i class="fas fa-tint"></i> ${pop}%</div>
        `;
        card.addEventListener('click', () => showHourlyDetail(hour));
        elements.hourlyForecast.appendChild(card);
    });
}

// Interactive 24-Hour Temperature Canvas Chart
function renderHourlyCanvasChart() {
    if (!elements.hourlyChartCanvas || !state.hourlyForecast || !state.hourlyForecast.length) return;
    
    const canvas = elements.hourlyChartCanvas;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set actual canvas resolution for HiDPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 800) * dpr;
    canvas.height = (rect.height || 180) * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width || 800;
    const h = rect.height || 180;

    const data = state.hourlyForecast.slice(0, 12);
    if (!data.length) return;

    const temps = data.map(item => Math.round(convertTemp(item.main.temp)));
    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;
    const tempSpan = maxTemp - minTemp || 1;

    const padding = { top: 25, bottom: 25, left: 30, right: 30 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const points = data.map((item, idx) => {
        const x = padding.left + (idx / (data.length - 1)) * chartW;
        const y = padding.top + chartH - ((temps[idx] - minTemp) / tempSpan) * chartH;
        return { x, y, temp: temps[idx], time: new Date(item.dt * 1000) };
    });

    ctx.clearRect(0, 0, w, h);

    // Draw Smooth Area Gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.45)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
    ctx.lineTo(points[0].x, h - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Stroke Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Point Markers & Labels
    points.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Temp Label above point
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${p.temp}°`, p.x, p.y - 10);
    });

    // Update bottom hour labels
    if (elements.chartLabels) {
        elements.chartLabels.innerHTML = points.map(p => `
            <span class="chart-label">${formatTime(p.time)}</span>
        `).join('');
    }
}

// 7-Day Forecast
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
            <div class="daily-spectrum-bar-wrap">
                <div class="daily-spectrum-track">
                    <div class="daily-spectrum-fill" style="width: ${Math.min(100, Math.max(20, (highTemp + 10) * 2))}%"></div>
                </div>
            </div>
            <div class="daily-condition">${escapeHtml(description)}</div>
            <div class="daily-rain"><i class="fas fa-tint"></i><span>${Math.round(rain)}% rain</span></div>
        `;
        elements.dailyForecast.appendChild(card);
    }
}

// Wind Dynamics & Compass Section
function updateWindDynamics() {
    if (!state.currentWeather) return;
    const windKmh = Math.round(state.currentWeather.wind.speed * 3.6);
    const deg = state.currentWeather.wind.deg || 0;
    
    updateWindDisplays(windKmh, deg);
    updateCelestialArc();
}

function updateWindDisplays(speedKmh, deg = null) {
    const activeDeg = deg !== null ? deg : (state.currentWeather?.wind.deg || 45);
    
    // Rotate Compass Needle
    if (elements.compassNeedle) {
        elements.compassNeedle.style.transform = `rotate(${activeDeg}deg)`;
    }
    if (elements.compassDegrees) {
        elements.compassDegrees.textContent = `${Math.round(activeDeg)}°`;
    }
    if (elements.compassBearing) {
        elements.compassBearing.textContent = getCompassDirection(activeDeg);
    }

    // Speed display
    const formattedSpeed = CONFIG.units === 'metric' ? speedKmh : Math.round(speedKmh * 0.621371);
    const speedUnit = CONFIG.units === 'metric' ? 'km/h' : 'mph';

    if (elements.flowSpeedNumber) elements.flowSpeedNumber.textContent = formattedSpeed;
    if (elements.flowSpeedUnit) elements.flowSpeedUnit.textContent = speedUnit;

    // Beaufort Scale Calculation
    const beaufort = getBeaufortScale(speedKmh);
    if (elements.beaufortVal) elements.beaufortVal.textContent = `F${beaufort.force} (${beaufort.name})`;
    if (elements.beaufortBarFill) elements.beaufortBarFill.style.width = `${(beaufort.force / 12) * 100}%`;
    if (elements.beaufortDesc) elements.beaufortDesc.textContent = beaufort.description;

    // Update Slider if not overridden
    if (elements.windSpeedSlider && state.windSpeedOverride === null) {
        elements.windSpeedSlider.value = speedKmh;
        if (elements.sliderValDisplay) elements.sliderValDisplay.textContent = `${speedKmh} km/h`;
    }

    // Sync particle engine wind speed
    currentWindVelocity = Math.max(2, speedKmh);
}

function getBeaufortScale(speedKmh) {
    if (speedKmh < 2) return { force: 0, name: 'Calm', description: 'Smoke rises vertically. Air is still.' };
    if (speedKmh <= 5) return { force: 1, name: 'Light Air', description: 'Direction shown by smoke drift but not by wind vanes.' };
    if (speedKmh <= 11) return { force: 2, name: 'Light Breeze', description: 'Wind felt on face; leaves rustle; vanes moved by wind.' };
    if (speedKmh <= 19) return { force: 3, name: 'Gentle Breeze', description: 'Leaves and small twigs in constant motion; light flags extended.' };
    if (speedKmh <= 28) return { force: 4, name: 'Moderate Breeze', description: 'Raises dust and loose paper; small branches moved.' };
    if (speedKmh <= 38) return { force: 5, name: 'Fresh Breeze', description: 'Small trees in leaf begin to sway; crested wavelets form on inland waters.' };
    if (speedKmh <= 49) return { force: 6, name: 'Strong Breeze', description: 'Large branches in motion; whistling heard in telegraph wires.' };
    if (speedKmh <= 61) return { force: 7, name: 'Near Gale', description: 'Whole trees in motion; inconvenience felt when walking against wind.' };
    if (speedKmh <= 74) return { force: 8, name: 'Gale', description: 'Twigs break off trees; generally impedes progress.' };
    if (speedKmh <= 88) return { force: 9, name: 'Strong Gale', description: 'Slight structural damage occurs (chimney-pots and slates removed).' };
    if (speedKmh <= 102) return { force: 10, name: 'Storm', description: 'Trees uprooted; considerable structural damage occurs.' };
    return { force: 11, name: 'Violent Storm', description: 'Widespread damage. Rarely experienced inland.' };
}

function getCompassDirection(deg) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return directions[idx];
}

// Celestial Arc Position (Sun/Moon Track)
function updateCelestialArc() {
    if (!state.currentWeather || !elements.sunPositionDot) return;
    const { sys, dt } = state.currentWeather;
    const sunrise = sys.sunrise;
    const sunset = sys.sunset;

    if (elements.sunriseTime) elements.sunriseTime.textContent = formatTime(new Date(sunrise * 1000));
    if (elements.sunsetTime) elements.sunsetTime.textContent = formatTime(new Date(sunset * 1000));

    const solarNoon = (sunrise + sunset) / 2;
    if (elements.solarNoonTime) elements.solarNoonTime.textContent = formatTime(new Date(solarNoon * 1000));

    const totalDay = sunset - sunrise;
    const elapsed = dt - sunrise;
    const progress = Math.max(0, Math.min(1, elapsed / totalDay));

    // Position on SVG Arc (M 20 80 A 100 100 0 0 1 260 80)
    // Arc centers at X: 140, Y: 80, Radius: 120
    const angle = Math.PI - progress * Math.PI;
    const cx = 140;
    const cy = 80;
    const r = 120;
    const dotX = cx + r * Math.cos(angle);
    const dotY = cy - r * Math.sin(angle);

    elements.sunPositionDot.setAttribute('cx', dotX);
    elements.sunPositionDot.setAttribute('cy', dotY);
}

// Intelligence & AI Insights
function updateIntelligence() {
    if (!state.currentWeather) return;
    const { weather, main, wind } = state.currentWeather;
    const weatherData = weather[0];

    const overview = getWeatherOverview(weatherData.id, main.temp, main.humidity, wind.speed);
    if (elements.weatherOverview) elements.weatherOverview.innerHTML = `<p>${overview}</p>`;

    const insights = getKeyInsights(state.currentWeather, state.forecast);
    if (elements.keyInsights) elements.keyInsights.innerHTML = insights.map(i => `<p>${i}</p>`).join('');

    const alerts = getWeatherAlerts(state.currentWeather);
    if (elements.weatherAlerts) {
        elements.weatherAlerts.innerHTML = alerts.length > 0
            ? alerts.map(a => `<p><strong>${a.title}:</strong> ${a.message}</p>`).join('')
            : '<p>No active severe weather alerts for your area.</p>';
    }
}

// Best Time Algorithm
function updateBestTime() {
    if (!state.hourlyForecast || state.hourlyForecast.length === 0) return;

    const now = new Date();
    const currentHour = now.getHours();
    let bestHour = null;
    let bestScore = -Infinity;

    state.hourlyForecast.forEach(hour => {
        const date = new Date(hour.dt * 1000);
        if (date.getHours() < currentHour) return;

        const temp = convertTemp(hour.main.temp);
        const humidity = hour.main.humidity;
        const windSpeed = hour.wind.speed;
        const pop = hour.pop || 0;

        let score = 0;
        score += Math.max(0, 100 - Math.abs(temp - 22) * 6);
        score += Math.max(0, 100 - humidity * 0.8);
        score += Math.max(0, 100 - windSpeed * 8);
        score += Math.max(0, 100 - pop * 100);

        if (score > bestScore) {
            bestScore = score;
            bestHour = hour;
        }
    });

    if (bestHour) {
        const date = new Date(bestHour.dt * 1000);
        const temp = Math.round(convertTemp(bestHour.main.temp));
        const condition = bestHour.weather[0].description;

        if (elements.bestTimePeriod) elements.bestTimePeriod.textContent = `${formatTime(date)} - ${getTimePeriod(date.getHours())}`;
        if (elements.bestTimeDesc) {
            elements.bestTimeDesc.innerHTML = `
                <strong>Forecast:</strong> ${temp}° - ${condition}<br>
                <strong>Atmosphere:</strong> Optimal thermal comfort & low precipitation risk.
            `;
        }
        if (elements.bestTimeVisual) {
            elements.bestTimeVisual.innerHTML = getWeatherIcon(bestHour.weather[0].id, bestHour.weather[0].icon);
        }
    }
}

// Weather Stats Grid
function updateWeatherStats() {
    if (!state.currentWeather || !elements.weatherStats) return;
    const { main, wind, visibility, clouds, sys } = state.currentWeather;

    const stats = [
        { icon: 'fa-droplet', label: 'Humidity', value: `${main.humidity}%`, progress: main.humidity },
        { icon: 'fa-wind', label: 'Wind Velocity', value: `${Math.round(wind.speed * 3.6)} km/h`, unit: 'km/h' },
        { icon: 'fa-eye', label: 'Visibility Range', value: `${(visibility / 1000).toFixed(1)} km`, unit: 'km' },
        { icon: 'fa-cloud', label: 'Cloud Cover', value: `${clouds.all || 0}%`, progress: clouds.all || 0 },
        { icon: 'fa-gauge-high', label: 'Atmospheric Pressure', value: `${main.pressure} hPa`, unit: 'hPa' },
        { icon: 'fa-sun', label: 'UV Radiation Index', value: getUVIndexIndex(state.currentWeather), progress: getUVIndexValue(state.currentWeather) },
        { icon: 'fa-sun-rising', label: 'Dawn Sunrise', value: formatTime(new Date(sys.sunrise * 1000)), noProgress: true },
        { icon: 'fa-sun-dust', label: 'Dusk Sunset', value: formatTime(new Date(sys.sunset * 1000)), noProgress: true }
    ];

    elements.weatherStats.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-icon"><i class="fas ${stat.icon}"></i></div>
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
            ${stat.progress !== undefined && !stat.noProgress ? `
                <div class="stat-progress">
                    <div class="stat-progress-fill" style="width: ${stat.progress}%"></div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Weather News & Insights
function updateNews() {
    if (!elements.weatherNews) return;
    elements.weatherNews.innerHTML = `
        <div class="news-card">
            <div class="news-image" style="background: linear-gradient(135deg, #00d4ff, #0284c7);">
                <i class="fas fa-satellite"></i>
            </div>
            <div class="news-content">
                <span class="news-category">Atmospheric Science</span>
                <h3 class="news-title">Real-Time High-Resolution Satellite & Radar Models</h3>
                <p class="news-excerpt">Global numerical weather predictions calibrated dynamically with Open-Meteo atmospheric radar telemetry.</p>
                <div class="news-meta">
                    <span class="news-source">ATMOS Engine</span>
                    <span class="news-date">${formatDate(new Date())}</span>
                </div>
            </div>
        </div>
        <div class="news-card">
            <div class="news-image" style="background: linear-gradient(135deg, #a855f7, #7c3aed);">
                <i class="fas fa-compass-drafting"></i>
            </div>
            <div class="news-content">
                <span class="news-category">Aerodynamics</span>
                <h3 class="news-title">Dynamic Flow Particle Physics Simulation</h3>
                <p class="news-excerpt">Interactive particle flow engine responsive to live Beaufort scale readings and directional compass telemetry.</p>
                <div class="news-meta">
                    <span class="news-source">Physics Lab</span>
                    <span class="news-date">${formatDate(new Date())}</span>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// UTILITIES & HELPERS
// ========================================

function convertTemp(temp) {
    if (state.unit === 'fahrenheit') {
        return (temp * 9/5) + 32;
    }
    return temp;
}

function toggleUnit() {
    state.unit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
    CONFIG.units = state.unit === 'celsius' ? 'metric' : 'imperial';

    if (elements.unitToggle) {
        const spans = elements.unitToggle.querySelectorAll('span');
        spans.forEach(s => s.classList.toggle('active'));
    }

    if (state.location) {
        updateAllUI();
    }
    showToast(`Switched to ${state.unit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}`, 'info');
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDay(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getWeatherIcon(weatherId, iconCode) {
    const iconMap = {
        '01d': '<i class="fas fa-sun"></i>',
        '01n': '<i class="fas fa-moon"></i>',
        '02d': '<i class="fas fa-cloud-sun"></i>',
        '02n': '<i class="fas fa-cloud-moon"></i>',
        '03d': '<i class="fas fa-cloud"></i>',
        '03n': '<i class="fas fa-cloud"></i>',
        '04d': '<i class="fas fa-cloud-meatball"></i>',
        '09d': '<i class="fas fa-cloud-rain"></i>',
        '10d': '<i class="fas fa-cloud-sun-rain"></i>',
        '11d': '<i class="fas fa-cloud-bolt"></i>',
        '13d': '<i class="fas fa-snowflake"></i>',
        '50d': '<i class="fas fa-smog"></i>'
    };

    const isDay = isDaytime(state.currentWeather);
    if (weatherId >= 200 && weatherId < 300) return '<i class="fas fa-cloud-bolt"></i>';
    if (weatherId >= 300 && weatherId < 400) return '<i class="fas fa-cloud-rain"></i>';
    if (weatherId >= 500 && weatherId < 600) return '<i class="fas fa-cloud-showers-heavy"></i>';
    if (weatherId >= 600 && weatherId < 700) return '<i class="fas fa-snowflake"></i>';
    if (weatherId >= 700 && weatherId < 800) return '<i class="fas fa-smog"></i>';
    if (weatherId === 800) return isDay ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    if (weatherId === 801 || weatherId === 802) return isDay ? '<i class="fas fa-cloud-sun"></i>' : '<i class="fas fa-cloud-moon"></i>';
    if (weatherId > 802) return '<i class="fas fa-cloud"></i>';

    return iconMap[iconCode] || (isDay ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>');
}

// Master Meteorological Condition Resolver
function determineWeatherCondition(weatherData) {
    if (!weatherData) return 'sunny';

    const isDay = isDaytime(weatherData);
    const weatherItem = weatherData.weather?.[0] || {};
    const weatherId = weatherItem.id || 800;
    const weatherCode = weatherData.weather_code !== undefined ? Number(weatherData.weather_code) : -1;
    const cloudCover = weatherData.clouds?.all ?? weatherData.cloud_cover ?? 0;
    const windSpeedKmh = (weatherData.wind?.speed ?? 0) * 3.6;

    // Direct Open-Meteo WMO weather_code evaluation (highest precision)
    if (weatherCode >= 0) {
        // Severe convective storms & thunder
        if (weatherCode === 95 || weatherCode === 96 || weatherCode === 99) {
            return isDay ? 'storm' : 'night_storm';
        }
        // Snow / Sleet / Ice pellets / Snow showers
        if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
            return isDay ? 'snow' : 'night_snow';
        }
        // Rain / Heavy showers
        if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
            return isDay ? 'rainy' : 'night_rain';
        }
        // Drizzle
        if (weatherCode >= 51 && weatherCode <= 57) {
            return isDay ? 'drizzle' : 'night_rain';
        }
        // Fog & depositing rime fog
        if (weatherCode === 45 || weatherCode === 48) {
            return 'fog';
        }
        // Overcast (Code 3)
        if (weatherCode === 3) {
            return isDay ? 'overcast' : 'night_cloudy';
        }
        // Partly cloudy (Code 2)
        if (weatherCode === 2) {
            return isDay ? 'partly_cloudy' : 'night_cloudy';
        }
        // Mainly clear (Code 1)
        if (weatherCode === 1) {
            if (isDay) {
                return cloudCover > 35 ? 'partly_cloudy' : 'clear';
            } else {
                return cloudCover > 40 ? 'night_cloudy' : 'night_clear';
            }
        }
        // Clear sky (Code 0)
        if (weatherCode === 0) {
            return isDay ? 'sunny' : 'night_clear';
        }
    }

    // High Wind Velocity condition override if clear/cloudy but gale/windstorm
    if (windSpeedKmh >= 38 && (weatherId >= 800 || weatherCode <= 3)) {
        return 'windy';
    }

    // Fallback: Standard OpenWeatherMap/WMO weatherId ranges
    if (weatherId >= 200 && weatherId < 300) return isDay ? 'storm' : 'night_storm';
    if (weatherId >= 300 && weatherId < 400) return isDay ? 'drizzle' : 'night_rain';
    if (weatherId >= 500 && weatherId < 600) return isDay ? 'rainy' : 'night_rain';
    if (weatherId >= 600 && weatherId < 700) return isDay ? 'snow' : 'night_snow';
    if (weatherId >= 700 && weatherId < 800) return 'fog';

    if (weatherId === 800) {
        return isDay ? 'sunny' : 'night_clear';
    }
    if (weatherId === 801) {
        return isDay ? (cloudCover > 35 ? 'partly_cloudy' : 'clear') : (cloudCover > 40 ? 'night_cloudy' : 'night_clear');
    }
    if (weatherId === 802) {
        return isDay ? 'partly_cloudy' : 'night_cloudy';
    }
    if (weatherId === 803) {
        return isDay ? 'cloudy' : 'night_cloudy';
    }
    if (weatherId >= 804) {
        return isDay ? 'overcast' : 'night_cloudy';
    }

    return isDay ? 'sunny' : 'night_clear';
}

function getWeatherType(weatherId, isDay, weatherData = null) {
    if (weatherData) {
        return determineWeatherCondition(weatherData);
    }
    return determineWeatherCondition({
        is_day: isDay ? 1 : 0,
        weather: [{ id: weatherId }]
    });
}

function isDaytime(weatherData) {
    if (!weatherData) return true;
    if (weatherData.is_day !== undefined) {
        return weatherData.is_day === 1;
    }
    if (weatherData.sys && weatherData.sys.sunrise && weatherData.sys.sunset) {
        const nowSec = weatherData.dt || Math.floor(Date.now() / 1000);
        return nowSec >= weatherData.sys.sunrise && nowSec <= weatherData.sys.sunset;
    }
    return true;
}

function getTimePeriod(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}

function getUVIndexIndex(weatherData) {
    return weatherData.uv !== undefined ? Math.round(weatherData.uv) : 4;
}

function getUVIndexValue(weatherData) {
    const uv = getUVIndexIndex(weatherData);
    return Math.min(100, uv * 10);
}

function getWeatherOverview(weatherId, temp, humidity, windSpeed) {
    const condition = determineWeatherCondition(state.currentWeather);
    switch (condition) {
        case 'sunny':
        case 'clear': return `Radiant clear skies with ambient temperatures around ${Math.round(temp)}°C. Superb conditions for outdoor ventures.`;
        case 'partly_cloudy': return `Scattered drifting clouds with pleasant ambient warmth around ${Math.round(temp)}°C.`;
        case 'cloudy': return `Gentle cloud cover filtering sunlight with temperatures around ${Math.round(temp)}°C.`;
        case 'overcast': return `Uniform dense cloud layer across the horizon at ${Math.round(temp)}°C. Calm barometric pressure.`;
        case 'windy': return `High atmospheric kinetic energy with brisk winds gusting at ${Math.round(windSpeed * 3.6)} km/h.`;
        case 'rainy':
        case 'night_rain': return `Atmospheric precipitation with steady rain at ${Math.round(temp)}°C. Carry waterproof protection.`;
        case 'drizzle': return `Fine atmospheric misting precipitation and cool ambient breezes at ${Math.round(temp)}°C.`;
        case 'storm':
        case 'thunderstorm':
        case 'night_storm': return `Active electrical thunderstorm with convective precipitation. Indoor shelter advised.`;
        case 'snow':
        case 'night_snow': return `Crisp winter snowfall with ambient temperatures around ${Math.round(temp)}°C.`;
        case 'fog':
        case 'mist': return `Atmospheric condensation with reduced visibility. Drive with caution.`;
        case 'night':
        case 'night_clear': return `Starlit celestial night sky with calm planetary breezes at ${Math.round(temp)}°C.`;
        case 'night_cloudy': return `Moonlit sky with soft nocturnal clouds and calm winds at ${Math.round(temp)}°C.`;
        default: return `Current regional atmospheric conditions holding around ${Math.round(temp)}°C.`;
    }
}

function getKeyInsights(currentWeather) {
    const insights = [];
    const { main, wind, weather } = currentWeather;
    if (main.temp > 30) insights.push('🔥 Elevated temperatures: Stay hydrated and seek shade during peak hours.');
    else if (main.temp < 2) insights.push('❄️ Freezing threshold: Dress in insulated layers.');
    if (wind.speed > 8) insights.push(`💨 Active breezes: Wind velocity measuring ${Math.round(wind.speed * 3.6)} km/h.`);
    if (main.humidity > 80) insights.push('💧 High relative humidity: Atmospheric moisture is elevated.');
    if (weather[0].id >= 500 && weather[0].id < 600) insights.push('🌧️ Rain showers ongoing: Keep umbrellas ready.');
    if (!insights.length) insights.push('✨ Optimum atmospheric conditions for daily routines.');
    return insights;
}

function getWeatherAlerts(currentWeather) {
    const alerts = [];
    const { main, wind, weather } = currentWeather;
    if (main.temp > 38) alerts.push({ title: 'Heat Advisory', message: 'Elevated ambient heat index.' });
    if (wind.speed > 16) alerts.push({ title: 'Wind Alert', message: 'Gusts exceeding safe velocity thresholds.' });
    if (weather[0].id >= 200 && weather[0].id < 300) alerts.push({ title: 'Thunderstorm Warning', message: 'Active lightning strikes in proximity.' });
    return alerts;
}

// Location Search Suggestions
let locationSearchTimer = null;
let locationSuggestions = [];

function setupLocationSearch() {
    const box = elements.citySearch?.closest('.search-box');
    if (!box || !elements.citySearch) return;

    let dropdown = document.getElementById('locationSuggestions');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'locationSuggestions';
        dropdown.className = 'location-suggestions';
        box.appendChild(dropdown);
    }

    elements.citySearch.addEventListener('input', e => {
        const value = e.target.value.trim();
        if (elements.clearSearch) elements.clearSearch.style.display = value ? 'block' : 'none';
        clearTimeout(locationSearchTimer);

        if (value.length < 2) {
            dropdown.classList.remove('show');
            return;
        }

        locationSearchTimer = setTimeout(async () => {
            try {
                locationSuggestions = await geocodeLocation(value);
                renderLocationSuggestions(locationSuggestions);
            } catch (err) {
                dropdown.classList.remove('show');
            }
        }, 250);
    });

    document.addEventListener('click', e => {
        if (!box.contains(e.target)) dropdown.classList.remove('show');
    });
}

function renderLocationSuggestions(results) {
    const dropdown = document.getElementById('locationSuggestions');
    if (!dropdown) return;
    if (!results.length) {
        dropdown.innerHTML = '<div style="padding: 12px; color: var(--text-muted); font-size: 13px;">No matching cities found</div>';
        dropdown.classList.add('show');
        return;
    }

    dropdown.innerHTML = results.map((item, index) => `
        <button type="button" class="location-suggestion" data-index="${index}">
            <span><i class="fas fa-location-dot"></i> ${escapeHtml(item.name)}</span>
            <small>${escapeHtml([item.admin1, item.country].filter(Boolean).join(', '))}</small>
        </button>
    `).join('');

    dropdown.querySelectorAll('.location-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
            const chosen = results[Number(btn.dataset.index)];
            dropdown.classList.remove('show');
            loadWeatherData(chosen);
        });
    });

    dropdown.classList.add('show');
}

function searchCity(query) {
    loadWeatherData(query);
}

// Modal System
function showModal(title, content, actions = null) {
    if (!elements.modalTitle || !elements.modalBody || !elements.modalOverlay) return;
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

function closeModal() {
    if (elements.modalOverlay) elements.modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

function showFavoritesModal() {
    let content = '<p style="color: var(--text-muted);">No saved locations yet.</p>';
    if (state.favorites.length > 0) {
        content = `
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto;">
                ${state.favorites.map((fav, index) => `
                    <div style="padding: 12px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="loadFavorite(${index})">
                        <span><i class="fas fa-map-pin" style="color: var(--accent-cyan); margin-right: 8px;"></i>${escapeHtml(fav.name)}, ${escapeHtml(fav.country)}</span>
                        <button class="btn btn-secondary" onclick="removeFavorite(event, ${index})" style="padding: 4px 10px; font-size: 11px;">Remove</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showModal('Saved Favorite Locations', content, [
        { text: 'Add Current City', type: 'primary', handler: addCurrentToFavorites, close: false },
        { text: 'Close', handler: closeModal }
    ]);
}

function addCurrentToFavorites() {
    if (!state.location) return;
    const exists = state.favorites.some(f => f.name === state.location.name && f.country === state.location.country);
    if (!exists) {
        state.favorites.push({
            name: state.location.name,
            country: state.location.country,
            lat: state.location.lat,
            lon: state.location.lon
        });
        localStorage.setItem('atmosFavorites', JSON.stringify(state.favorites));
        showToast('City saved to favorites!', 'success');
        showFavoritesModal();
    } else {
        showToast('City already in favorites', 'info');
    }
}

function loadFavorite(index) {
    const fav = state.favorites[index];
    if (fav) {
        loadWeatherData(fav);
        closeModal();
    }
}

function removeFavorite(event, index) {
    event.stopPropagation();
    state.favorites.splice(index, 1);
    localStorage.setItem('atmosFavorites', JSON.stringify(state.favorites));
    showFavoritesModal();
    showToast('Removed from favorites', 'info');
}

function loadFavorites() {
    state.favorites = JSON.parse(localStorage.getItem('atmosFavorites')) || [];
}

function showHourlyDetail(hour) {
    const date = new Date(hour.dt * 1000);
    const temp = Math.round(convertTemp(hour.main.temp));
    const feelsLike = Math.round(convertTemp(hour.main.feels_like));
    const humidity = hour.main.humidity;
    const windSpeed = Math.round(hour.wind.speed * 3.6);
    const pop = hour.pop ? Math.round(hour.pop * 100) : 0;
    const condition = hour.weather[0].description;
    const icon = hour.weather[0].icon;

    const content = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 40px; margin-bottom: 8px; color: var(--accent-gold);">${getWeatherIcon(hour.weather[0].id, icon)}</div>
            <div style="font-size: 36px; font-weight: 800; margin-bottom: 4px;">${temp}°</div>
            <div style="color: var(--text-secondary); text-transform: capitalize;">${condition}</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            <div style="padding: 14px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Feels Like</div>
                <div style="font-size: 18px; font-weight: 700;">${feelsLike}°</div>
            </div>
            <div style="padding: 14px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Humidity</div>
                <div style="font-size: 18px; font-weight: 700;">${humidity}%</div>
            </div>
            <div style="padding: 14px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Wind Speed</div>
                <div style="font-size: 18px; font-weight: 700;">${windSpeed} km/h</div>
            </div>
            <div style="padding: 14px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Precipitation</div>
                <div style="font-size: 18px; font-weight: 700;">${pop}%</div>
            </div>
        </div>
    `;
    showModal(`Hourly Forecast (${formatTime(date)})`, content);
}

function showSettingsModal() {
    const scenes = [
        { id: 'sunny', label: '☀️ Sunny & Radiant' },
        { id: 'clear', label: '🌤️ Crisp Clear' },
        { id: 'partly_cloudy', label: '⛅ Partly Cloudy' },
        { id: 'cloudy', label: '☁️ Cloud Covered' },
        { id: 'overcast', label: '🌫️ Overcast Sky' },
        { id: 'windy', label: '💨 High Gales & Wind' },
        { id: 'rainy', label: '🌧️ Steady Rainfall' },
        { id: 'drizzle', label: '🌦️ Misting Drizzle' },
        { id: 'storm', label: '⚡ Severe Thunderstorm' },
        { id: 'snow', label: '❄️ Winter Snowfall' },
        { id: 'fog', label: '🌁 Dense Atmospheric Fog' },
        { id: 'night_clear', label: '✨ Celestial Clear Night' },
        { id: 'night_cloudy', label: '🌙 Moonlit Cloudy Night' },
        { id: 'night_rain', label: '🌧️ Nocturnal Rainstorm' }
    ];

    const content = `
        <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Temperature Unit</label>
                <div style="display: flex; gap: 10px;">
                    <button class="btn ${state.unit === 'celsius' ? 'btn-primary' : 'btn-secondary'}" onclick="setUnit('celsius')" style="flex: 1;">
                        Celsius (°C)
                    </button>
                    <button class="btn ${state.unit === 'fahrenheit' ? 'btn-primary' : 'btn-secondary'}" onclick="setUnit('fahrenheit')" style="flex: 1;">
                        Fahrenheit (°F)
                    </button>
                </div>
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Default Startup City</label>
                <input type="text" id="defaultCityInput" value="${CONFIG.defaultCity}" 
                    style="width: 100%; padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; color: #ffffff;" />
            </div>
            <div>
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Atmospheric Scene Simulator</label>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 10px;">Test any dynamic background scene, particle physics, and lighting instantly:</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; max-height: 180px; overflow-y: auto; padding-right: 4px;">
                    ${scenes.map(s => `
                        <button type="button" class="btn btn-secondary" onclick="simulateWeatherScene('${s.id}')" style="font-size: 11px; padding: 8px 10px; justify-content: flex-start; text-align: left;">
                            ${s.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    showModal('ATMOS Settings & Simulation', content, [
        {
            text: 'Save Preferences',
            type: 'primary',
            handler: () => {
                const input = document.getElementById('defaultCityInput');
                if (input && input.value.trim()) {
                    CONFIG.defaultCity = input.value.trim();
                    showToast('Settings saved successfully', 'success');
                }
            }
        },
        { text: 'Close', handler: closeModal }
    ]);
}

function setUnit(unit) {
    if (state.unit !== unit) toggleUnit();
}

function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
    toast.innerHTML = `<i class="fas ${icons[type] || 'fa-circle-info'}"></i><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => toast.classList.add('active'), 10);
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function startClock() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
}

function updateCurrentTime() {
    if (!elements.currentTime) return;
    try {
        const tz = state.location?.timezone;
        if (tz && tz !== 'auto') {
            elements.currentTime.textContent = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: tz
            }).format(new Date());
            return;
        }
    } catch (e) {}
    elements.currentTime.textContent = formatTime(new Date());
}

function updateDate() {
    if (!elements.date) return;
    try {
        const tz = state.location?.timezone;
        if (tz && tz !== 'auto') {
            elements.date.textContent = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: tz
            }).format(new Date());
            return;
        }
    } catch (e) {}
    elements.date.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function scrollHourlyForecast(direction) {
    if (!elements.hourlyForecast) return;
    const scrollAmount = elements.hourlyForecast.clientWidth * 0.75;
    elements.hourlyForecast.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
    });
}

function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Global scope bindings for inline modal triggers
window.loadFavorite = loadFavorite;
window.removeFavorite = removeFavorite;
window.setUnit = setUnit;
window.simulateWeatherScene = simulateWeatherScene;

// Initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
