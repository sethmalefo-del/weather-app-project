# Weather Dashboard

This project is a simple weather dashboard built during Week 7 Async JavaScript practice. It lets users search for a city and view current weather details plus a short forecast using live API data.

## Project Overview

The app uses asynchronous JavaScript with `fetch`, `async`, and `await` to:

- search for a city
- get its coordinates
- fetch current weather data
- display a 5-day forecast
- switch between Celsius and Fahrenheit

The default city on page load is `Johannesburg`.

## Features

- Search weather by city name
- View current temperature
- View wind speed and wind direction
- See weather condition labels with icons
- Display a 5-day forecast
- Toggle between `C` and `F`
- Show loading and error messages

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Open-Meteo Geocoding API
- Open-Meteo Weather API

## Folder Structure

```text
week7-async/
|-- README.md
|-- async-practice.js
|-- index.html
|-- style.css
`-- week7-weather/
    |-- index.html
    |-- style.css
    |-- weather.js
    |-- README.md
    `-- weather.png.png
```

## Weather App Files

The main weather app is inside `week7-weather/`.

- `index.html` builds the app layout
- `style.css` handles the design and responsiveness
- `weather.js` fetches data and updates the page

## APIs Used

### 1. Geocoding API

Used to convert a city name into latitude and longitude.

`https://geocoding-api.open-meteo.com/v1/search`

### 2. Forecast API

Used to fetch current weather and forecast data.

`https://api.open-meteo.com/v1/forecast`

## How To Run

1. Open the `week7-weather` folder.
2. Open `index.html` in your browser.
3. Type in a city name.
4. Click `Get Weather`.

## Learning Focus

This project helped practise:

- asynchronous JavaScript
- working with APIs
- DOM manipulation
- error handling
- building interactive UI features

## Status

Completed as part of Week 7 async practice.

