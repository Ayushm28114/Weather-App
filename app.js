class WeatherApp {
  constructor() {
    // Using wttr.in - a free weather service that doesn't require API keys
    this.baseUrl = "https://wttr.in/";
    this.currentUnit = "metric"; // metric for Celsius, imperial for Fahrenheit
    this.currentCity = "Noida,India"; // Default city with country for better recognition

    this.initializeElements();
    this.attachEventListeners();
    this.getWeatherData(this.currentCity);
  }

  initializeElements() {
    this.searchInput = document.getElementById("searchInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.celsiusBtn = document.getElementById("celsiusBtn");
    this.fahrenheitBtn = document.getElementById("fahrenheitBtn");
    this.loading = document.getElementById("loading");
    this.errorMessage = document.getElementById("errorMessage");
    this.weatherContainer = document.getElementById("weatherContainer");
    this.currentTemp = document.getElementById("currentTemp");
    this.weatherIcon = document.getElementById("weatherIcon");
    this.cityName = document.getElementById("cityName");
    this.weatherDescription = document.getElementById("weatherDescription");
    this.currentDate = document.getElementById("currentDate");
    this.feelsLike = document.getElementById("feelsLike");
    this.humidity = document.getElementById("humidity");
    this.windSpeed = document.getElementById("windSpeed");
    this.pressure = document.getElementById("pressure");
    this.forecastGrid = document.getElementById("forecastGrid");
  }

  attachEventListeners() {
    this.searchBtn.addEventListener("click", () => this.handleSearch());
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });
    this.celsiusBtn.addEventListener("click", () => this.switchUnit("metric"));
    this.fahrenheitBtn.addEventListener("click", () =>
      this.switchUnit("imperial")
    );
  }

  handleSearch() {
    const city = this.searchInput.value.trim();
    if (!city) return;

    this.currentCity = city;
    this.getWeatherData(city);
  }

  switchUnit(unit) {
    if (this.currentUnit === unit) return;

    this.currentUnit = unit;
    this.updateUnitButtons();
    this.getWeatherData(this.currentCity);
  }

  updateUnitButtons() {
    if (this.currentUnit === "metric") {
      this.celsiusBtn.classList.add("active");
      this.fahrenheitBtn.classList.remove("active");
    } else {
      this.fahrenheitBtn.classList.add("active");
      this.celsiusBtn.classList.remove("active");
    }
  }

  updateCurrentWeather(data) {
    const unitSymbol = this.currentUnit === "metric" ? "°C" : "°F";
    const windUnit = this.currentUnit === "metric" ? "km/h" : "mph";

    this.currentTemp.textContent = Math.round(data.main.temp);
    document.querySelector(".unit").textContent = unitSymbol;
    this.cityName.textContent = data.name;
    this.weatherDescription.textContent = data.weather[0].description;
    this.currentDate.textContent = this.getCurrentDate();
    this.feelsLike.textContent = Math.round(data.main.feels_like) + unitSymbol;
    this.humidity.textContent = data.main.humidity + "%";
    this.windSpeed.textContent = Math.round(data.wind.speed) + " " + windUnit;
    this.pressure.textContent = data.main.pressure + " hPa";

    this.updateWeatherIcon(data.weather[0].main);

    this.updateBackground(data.weather[0].main);
  }

  updateWeatherIcon(weatherMain) {
    const iconMap = {
      Clear: "fas fa-sun",
      Clouds: "fas fa-cloud",
      Rain: "fas fa-cloud-rain",
      Drizzle: "fas fa-cloud-drizzle",
      Thunderstorm: "fas fa-bolt",
      Snow: "fas fa-snowflake",
      Mist: "fas fa-smog",
      Fog: "fas fa-smog",
    };

    this.weatherIcon.className = iconMap[weatherMain] || "fas fa-sun";
  }

  updateBackground(weatherMain) {
    const body = document.body;
    body.className = "";

    const backgroundMap = {
      Clear: "sunny",
      Clouds: "cloudy",
      Rain: "rainy",
      Thunderstorm: "stormy",
      Snow: "snowy",
      Mist: "misty",
      Fog: "misty",
    };

    const weatherClass = backgroundMap[weatherMain] || "sunny";
    body.classList.add(weatherClass);
  }

  updateForecastFromAPI(forecastData) {
    this.forecastGrid.innerHTML = "";

    // wttr.in typically provides 3-day forecast, so we'll use what's available
    const availableDays = Math.min(forecastData.length, 5);

    // Adjust grid columns based on available data
    this.forecastGrid.style.gridTemplateColumns = `repeat(${availableDays}, 1fr)`;

    for (let index = 0; index < availableDays; index++) {
      const dayData = forecastData[index];
      const forecastItem = document.createElement("div");
      forecastItem.className = "forecast-item";

      const unitSymbol = this.currentUnit === "metric" ? "°C" : "°F";

      let maxTemp = parseInt(dayData.maxtempC);
      let minTemp = parseInt(dayData.mintempC);

      if (this.currentUnit === "imperial") {
        maxTemp = Math.round((maxTemp * 9) / 5 + 32);
        minTemp = Math.round((minTemp * 9) / 5 + 32);
      }

      // Get weather description from hourly data (mid-day weather)
      const hourlyData =
        dayData.hourly && dayData.hourly.length > 0
          ? dayData.hourly[Math.floor(dayData.hourly.length / 2)]
          : dayData.hourly[0];
      const weatherDesc = hourlyData
        ? hourlyData.weatherDesc[0].value
        : "Clear";
      const weatherMain = this.getWeatherMain(weatherDesc);
      const iconClass = this.getIconClass(weatherMain);

      // Get actual date for better display
      const date = new Date(dayData.date);
      const dayName =
        index === 0
          ? "Today"
          : index === 1
          ? "Tomorrow"
          : date.toLocaleDateString("en-US", { weekday: "short" });

      forecastItem.innerHTML = `
                <div class="forecast-date">${dayName}</div>
                <div class="forecast-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="forecast-temps">
                    <span class="forecast-high">${maxTemp}${unitSymbol}</span>
                    <span class="forecast-low">${minTemp}${unitSymbol}</span>
                </div>
                <div class="forecast-desc">${weatherDesc}</div>
            `;

      this.forecastGrid.appendChild(forecastItem);
    }
  }

  getIconClass(weatherMain) {
    const iconMap = {
      Clear: "fas fa-sun",
      Clouds: "fas fa-cloud",
      Rain: "fas fa-cloud-rain",
      Drizzle: "fas fa-cloud-drizzle",
      Thunderstorm: "fas fa-bolt",
      Snow: "fas fa-snowflake",
      Mist: "fas fa-smog",
      Fog: "fas fa-smog",
    };

    return iconMap[weatherMain] || "fas fa-sun";
  }

  getCurrentDate() {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  }

  showLoading() {
    this.loading.style.display = "block";
    this.errorMessage.style.display = "none";
    this.weatherContainer.style.display = "none";
  }

  hideLoading() {
    this.loading.style.display = "none";
  }

  showError(message) {
    this.hideLoading();
    this.errorMessage.style.display = "block";
    this.weatherContainer.style.display = "none";
    document.getElementById("errorText").textContent = message;
  }

  showWeatherData() {
    this.hideLoading();
    this.errorMessage.style.display = "none";
    this.weatherContainer.style.display = "block";
  }

  async getWeatherData(city) {
    this.showLoading();

    try {
      // Using wttr.in free weather API - no API key required
      console.log(`Fetching weather data for: ${city}`);

      // Try with the city as provided first
      let url = `${this.baseUrl}${encodeURIComponent(city)}?format=j1`;
      console.log(`API URL: ${url}`);

      let response = await fetch(url);
      console.log(`Response status: ${response.status}`);

      // If the first attempt fails and it's just "Noida", try with country
      if (!response.ok && city.toLowerCase() === "noida") {
        console.log("Trying with Noida,India...");
        url = `${this.baseUrl}Noida,India?format=j1`;
        response = await fetch(url);
        console.log(`Second attempt status: ${response.status}`);
      }

      // If still failing, try Delhi as a fallback for Noida (since Noida is in NCR)
      if (!response.ok && city.toLowerCase().includes("noida")) {
        console.log("Trying Delhi as fallback...");
        url = `${this.baseUrl}Delhi,India?format=j1`;
        response = await fetch(url);
        city = "Delhi (NCR region)"; // Update display name
        console.log(`Fallback attempt status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(`Weather data not found. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Weather data received:", data);
      this.processWeatherData(data, city);
      this.showWeatherData();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      this.showError(
        "Unable to fetch weather data. Please check the city name and try again. Try using format 'City,Country' for better results."
      );
    }
  }

  processWeatherData(data, city) {
    // Process wttr.in data format
    const current = data.current_condition[0];
    const today = data.weather[0];

    // Convert temperature based on current unit
    let temp = parseInt(current.temp_C);
    let feelsLike = parseInt(current.FeelsLikeC);

    if (this.currentUnit === "imperial") {
      temp = Math.round((temp * 9) / 5 + 32);
      feelsLike = Math.round((feelsLike * 9) / 5 + 32);
    }

    const weatherData = {
      name: city,
      main: {
        temp: temp,
        feels_like: feelsLike,
        humidity: parseInt(current.humidity),
        pressure: parseInt(current.pressure),
      },
      weather: [
        {
          main: this.getWeatherMain(current.weatherDesc[0].value),
          description: current.weatherDesc[0].value.toLowerCase(),
          icon: current.weatherCode,
        },
      ],
      wind: {
        speed:
          this.currentUnit === "metric"
            ? parseInt(current.windspeedKmph)
            : Math.round(parseInt(current.windspeedKmph) * 0.621371),
      },
      forecast: data.weather || [], // Use available forecast data
    };

    this.updateCurrentWeather(weatherData);
    this.updateForecastFromAPI(weatherData.forecast);
  }

  getWeatherMain(description) {
    const desc = description.toLowerCase();
    if (desc.includes("sunny") || desc.includes("clear")) return "Clear";
    if (desc.includes("cloud")) return "Clouds";
    if (desc.includes("rain") || desc.includes("drizzle")) return "Rain";
    if (desc.includes("thunderstorm") || desc.includes("thunder"))
      return "Thunderstorm";
    if (desc.includes("snow")) return "Snow";
    if (desc.includes("mist") || desc.includes("fog")) return "Mist";
    return "Clear";
  }
}

// CSS for weather-based backgrounds with images
const weatherStyles = `
    body {
        transition: background 0.5s ease-in-out;
    }
    
    .sunny {
        background-image: url('https://images.unsplash.com/photo-1601297183305-6df142704ea2?w=1200&auto=format&fit=crop&q=80');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }
    
    .cloudy {
        background-image: url('https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=1200&auto=format&fit=crop&q=80');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }
    
    .rainy {
        background-image: url('https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&auto=format&fit=crop&q=80');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }
    
    .stormy {
        background-image: url('https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1200&auto=format&fit=crop&q=80');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }
    
    .snowy {
        background-image: url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&auto=format&fit=crop&q=80');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }
    
    .misty {
        background-image: url('https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1200&auto=format&fit=crop&q=80');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }
    
    /* Add overlay for better text readability */
    body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
        z-index: -1;
        pointer-events: none;
    }
`;

// Add weather styles to head
const style = document.createElement("style");
style.textContent = weatherStyles;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp();
});
