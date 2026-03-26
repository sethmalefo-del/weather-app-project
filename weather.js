// Weather dashboard powered by Open-Meteo APIs.

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#search-form');
    const input = document.querySelector('#city-input');
    const statusDiv = document.querySelector('#status');
    const errorDiv = document.querySelector('#error-msg');
    const weatherCard = document.querySelector('#weather-card');
    const cityNameEl = document.querySelector('#city-name');
    const tempEl = document.querySelector('#temp');
    const windEl = document.querySelector('#wind');
    const conditionEl = document.querySelector('#condition');
    const windDirEl = document.querySelector('#winddir');
    const updatedEl = document.querySelector('#updated');
    const forecastEl = document.querySelector('#forecast');
    const unitToggle = document.querySelector('#unit-toggle');

    const required = [
        form,
        input,
        statusDiv,
        errorDiv,
        weatherCard,
        cityNameEl,
        tempEl,
        windEl,
        conditionEl,
        windDirEl,
        updatedEl,
        forecastEl,
        unitToggle
    ];

    if (required.includes(null)) {
        console.error('Weather UI is missing required elements — check the HTML IDs.');
        return;
    }

    let currentUnit = 'C';
    let currentWeatherData = null;
    let currentPlace = null;

    const formatCondition = (label, emoji) => `${emoji} ${label}`;

    const getCondition = (code) => {
        const conditions = [
            { max: 0, label: 'Clear sky', emoji: '☀️' },
            { max: 3, label: 'Partly cloudy', emoji: '⛅' },
            { max: 48, label: 'Fog', emoji: '🌫️' },
            { max: 55, label: 'Drizzle', emoji: '🌦️' },
            { max: 65, label: 'Rain', emoji: '🌧️' },
            { max: 75, label: 'Snow', emoji: '❄️' },
            { max: 82, label: 'Rain showers', emoji: '🌧️' },
            { max: 86, label: 'Snow showers', emoji: '🌨️' },
            { max: 95, label: 'Thunderstorm', emoji: '⛈️' },
            { max: 99, label: 'Thunderstorm with hail', emoji: '🌩️' }
        ];
        const match = conditions.find(c => code <= c.max);
        return match ? formatCondition(match.label, match.emoji) : formatCondition(`Code ${code}`, '❓');
    };

    const formatWindDirection = (deg) => {
        if (typeof deg !== 'number') return 'N/A';
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
        const idx = Math.round(((deg % 360) / 45)) % 8;
        return `${arrows[idx]} ${directions[idx]} (${deg.toFixed(0)}°)`;
    };

    const getCoordinates = async (city) => {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
        );

        if (!response.ok) {
            throw new Error(`Location lookup failed (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            throw new Error('City not found');
        }

        const { latitude, longitude, timezone, name, country } = data.results[0];
        return { latitude, longitude, timezone, name, country };
    };

    const getWeather = async ({ latitude, longitude, timezone }) => {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=${encodeURIComponent(
                timezone
            )}`
        );

        if (!response.ok) {
            throw new Error(`Weather lookup failed (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!data.current_weather) {
            throw new Error('Weather unavailable');
        }

        return data;
    };

    const formatNumber = (value, suffix) =>
        typeof value === 'number' ? `${value.toFixed(1)}${suffix}` : 'N/A';

    const convertTemp = (temp, unit) => {
        if (unit === 'F') return (temp * 9 / 5) + 32;
        return temp;
    };

    const displayWeather = (place, weather) => {
        errorDiv.textContent = '';
        cityNameEl.textContent = `${place.name}, ${place.country}`;
        
        const temp = convertTemp(weather.temperature, currentUnit);
        tempEl.textContent = formatNumber(temp, `\u00B0${currentUnit}`);
        
        windEl.textContent = formatNumber(weather.windspeed, ' km/h');
        conditionEl.textContent = getCondition(weather.weathercode);
        windDirEl.textContent = formatWindDirection(weather.winddirection);
        updatedEl.textContent = `Updated: ${new Date(weather.time).toLocaleString()}`;

        weatherCard.style.display = 'block';
        weatherCard.classList.add('is-visible');
    };

    const displayForecast = (daily) => {
        forecastEl.innerHTML = '';
        // Open-Meteo returns arrays for daily data. We'll show the next 5 days.
        for (let i = 0; i < 5; i++) {
            const date = new Date(daily.time[i]);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const icon = getCondition(daily.weathercode[i]).split(' ')[0]; // Just get the emoji
            
            const max = convertTemp(daily.temperature_2m_max[i], currentUnit);
            const min = convertTemp(daily.temperature_2m_min[i], currentUnit);

            const dayDiv = document.createElement('div');
            dayDiv.className = 'forecast-day';
            dayDiv.innerHTML = `
                <div class="day-name">${dayName}</div>
                <div class="day-icon">${icon}</div>
                <div class="day-temp">${Math.round(max)}° <span style="opacity:0.6">${Math.round(min)}°</span></div>
            `;
            forecastEl.appendChild(dayDiv);
        }
    };

    const showError = (message) => {
        errorDiv.textContent = message;
        weatherCard.classList.remove('is-visible');
        weatherCard.style.display = 'none';
    };

    const searchWeather = async (city) => {
        statusDiv.innerHTML = '<div class="loading-spinner"></div> Fetching latest weather...';
        errorDiv.textContent = '';
        weatherCard.classList.remove('is-visible');
        weatherCard.style.display = 'none';

        try {
            const place = await getCoordinates(city);
            const data = await getWeather(place);
            
            // Store data for toggling
            currentPlace = place;
            currentWeatherData = data;
            
            displayWeather(place, data.current_weather);
            displayForecast(data.daily);
        } catch (error) {
            showError(error.message || 'Something went wrong');
        } finally {
            statusDiv.textContent = '';
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = input.value.trim();
        if (!city) {
            showError('Please enter a city name');
            return;
        }
        searchWeather(city);
    });

    // Toggle Unit Listener
    unitToggle.addEventListener('click', () => {
        currentUnit = currentUnit === 'C' ? 'F' : 'C';
        unitToggle.textContent = `°${currentUnit}`;
        if (currentWeatherData && currentPlace) {
            displayWeather(currentPlace, currentWeatherData.current_weather);
            displayForecast(currentWeatherData.daily);
        }
    });

    // Populate with a default city on first load so the UI is not empty.
    searchWeather('Johannesburg');
});
