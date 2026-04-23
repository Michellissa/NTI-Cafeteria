import { useState, useEffect } from "react";
import "./App.css";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const TRANSPORT_API_KEY = import.meta.env.VITE_TRANSPORT_API_KEY;

const DAY_NAMES = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"];

function App() {
  const [currentTime, setCurrentTime] = useState("");

  const [weatherData, setWeatherData] = useState({
    current: { temp: null, humidity: null, windSpeed: null },
    forecast: [],
  });

  const [newsData, setNewsData] = useState([]);

  const [mealData, setMealData] = useState({
    monday: { main: "", side: "", dessert: "", vegetarian: "" },
    tuesday: { main: "", side: "", dessert: "", vegetarian: "" },
    wednesday: { main: "", side: "", dessert: "", vegetarian: "" },
    thursday: { main: "", side: "", dessert: "", vegetarian: "" },
    friday: { main: "", side: "", dessert: "", vegetarian: "" },
  });

  const [selectedMealDay, setSelectedMealDay] = useState(() => {
    const today = new Date().getDay();
    const weekdayIndex = today === 0 ? 0 : today - 1;
    return weekdayIndex < 5 ? weekdayIndex : 0;
  });

  const [transportData, setTransportData] = useState({
    selectedStop: "9522",
    stops: [{ id: "9522", name: "Huddinge Sjukhus" }],
    busDepartures: [
      {
        lineNumber: "172",
        destination: "Skarpnäck",
        plannedTime: "5 min",
        status: "On-Time",
      },
      {
        lineNumber: "172",
        destination: "Norsborg",
        plannedTime: "12 min",
        status: "On-Time",
      },
      {
        lineNumber: "703",
        destination: "Sörskogen",
        plannedTime: "8 min",
        status: "On-Time",
      },
      {
        lineNumber: "704",
        destination: "Flemingsberg station",
        plannedTime: "6 min",
        status: "On-Time",
      },
      {
        lineNumber: "705",
        destination: "Solgård",
        plannedTime: "10 min",
        status: "On-Time",
      },
      {
        lineNumber: "713",
        destination: "Tumba station",
        plannedTime: "15 min",
        status: "On-Time",
      },
      {
        lineNumber: "726",
        destination: "Fridhemsplan",
        plannedTime: "18 min",
        status: "On-Time",
      },
      {
        lineNumber: "740",
        destination: "Skärholmen",
        plannedTime: "4 min",
        status: "On-Time",
      },
      {
        lineNumber: "740",
        destination: "Huddinge station",
        plannedTime: "7 min",
        status: "On-Time",
      },
      {
        lineNumber: "742",
        destination: "Huddinge station",
        plannedTime: "3 min",
        status: "On-Time",
      },
      {
        lineNumber: "742",
        destination: "Östra Skogås",
        plannedTime: "14 min",
        status: "On-Time",
      },
      {
        lineNumber: "865",
        destination: "Handen (Haninge)",
        plannedTime: "10 min",
        status: "On-Time",
      },
      {
        lineNumber: "865",
        destination: "Skärholmen",
        plannedTime: "16 min",
        status: "On-Time",
      },
    ],
    trainDepartures: [
      {
        lineNumber: "J38",
        destination: "Södertälje C",
        plannedTime: "4 min",
        status: "On-Time",
      },
      {
        lineNumber: "J35",
        destination: "Nyköping",
        plannedTime: "12 min",
        status: "On-Time",
      },
    ],
    lastUpdated: new Date().toISOString(),
    error: null,
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(time);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Huddinge,SE&units=metric&appid=${WEATHER_API_KEY}`,
        );
        const currentData = await currentResponse.json();
        
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=Huddinge,SE&units=metric&cnt=40&appid=${WEATHER_API_KEY}`,
        );
        const forecastData = await forecastResponse.json();
        
        const hourlyList = forecastData.list?.slice(0, 9).map(item => ({
          time: item.dt_txt.substring(11, 16),
          temp: Math.round(item.main.temp),
          condition: item.weather[0]?.description || 'Unknown'
        })) || [];
        
        setWeatherData({
          current: {
            temp: Math.round(currentData.main?.temp) || null,
            humidity: currentData.main?.humidity || null,
            windSpeed: currentData.wind?.speed || null,
            condition: currentData.weather[0]?.description || null,
          },
          forecast: hourlyList,
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
      }
    };
    fetchWeatherData();
  }, []);

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const mockNews = [
          {
            id: 1,
            headline: "NTI Gymnasiet vinner pedagogiska priset",
            ingress:
              "Årets pedagogenpris går till NTI Gymnasiet för innovativ undervisningsmetod.",
            source: "Skolnytt",
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            headline: "Nya studiemiljöer klara",
            ingress: "Biblioteket har renoverats och fått nya grupprum.",
            source: "NTI News",
            timestamp: new Date().toISOString(),
          },
          {
            id: 3,
            headline: "Praktikplatser våren 2026",
            ingress: "Ansökan öppnar nu för terminspraktik på lokala företag.",
            source: "Karriär",
            timestamp: new Date().toISOString(),
          },
        ];
        setNewsData(mockNews);
      } catch (error) {
        console.error("News fetch error:", error);
      }
    };
    fetchNewsData();
  }, []);

  useEffect(() => {
    const fetchMealData = async () => {
      try {
        const mockMenu = {
          monday: {
            main: "Köttbullar med potatis",
            side: "Brunsås",
            dessert: "Lingonsylt",
            vegetarian: "Veggkötbullar",
          },
          tuesday: {
            main: "Fish & Chips",
            side: "Remouladsås",
            dessert: "Ärter",
            vegetarian: "Tofu fish",
          },
          wednesday: {
            main: "Pasta Bolognese",
            side: "Parmesan",
            dessert: "Vitlöksbröd",
            vegetarian: "Vegansk pasta",
          },
          thursday: {
            main: "Kycklinggryta",
            side: "Ris",
            dessert: "Sallad",
            vegetarian: "Gröncurry",
          },
          friday: {
            main: "Tacos",
            side: "Nachos",
            dessert: "Gräddfil",
            vegetarian: "Quorn tacos",
          },
        };
        setMealData(mockMenu);
      } catch (error) {
        console.error("Meal fetch error:", error);
      }
    };
    fetchMealData();
  }, []);

  useEffect(() => {
    const fetchTransportData = async () => {
      let data = null;

      try {
        const siteId = "9522";
        const response = await fetch(
          `https://api.sl.se/api2/realtimedeparturesV4.json?key=${TRANSPORT_API_KEY}&siteid=${siteId}&timewindow=60`,
        );

        if (response.ok) {
          data = await response.json();
        }
      } catch {
        console.log("API fetch failed, using mock data");
      }

      const importantLines = [
        "172",
        "703",
        "704",
        "705",
        "713",
        "726",
        "740",
        "742",
        "865",
      ];

      if (data?.ResponseData?.Buses?.length > 0) {
        const allBuses = data.ResponseData.Buses;
        const trainData = data.ResponseData.Trains || [];

        const filteredBuses = allBuses.filter((bus) =>
          importantLines.includes(bus.LineNumber),
        );

        setTransportData((prev) => ({
          ...prev,
          selectedStop: "9522",
          stops: [{ id: "9522", name: "Huddinge Sjukhus" }],
          busDepartures: filteredBuses.slice(0, 20).map((bus) => ({
            lineNumber: bus.LineNumber,
            destination: bus.Destination,
            plannedTime: bus.DisplayTime,
            status: bus.RealTimeHasBeenAnnounced ? "On-Time" : "Expected",
          })),
          trainDepartures: trainData.slice(0, 10).map((train) => ({
            lineNumber: train.LineNumber,
            destination: train.Destination,
            plannedTime: train.DisplayTime,
            status: train.RealTimeHasBeenAnnounced ? "On-Time" : "Expected",
          })),
          lastUpdated: new Date().toISOString(),
          error: null,
        }));
      }
    };

    fetchTransportData();

    const interval = setInterval(fetchTransportData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="header-title">NTI Cafeteria</h1>
        <div className="header-clock">{currentTime}</div>
      </header>

      <main className="dashboard-grid">
        <section className="column column-weather">
          <WeatherModule data={weatherData} />
        </section>

        <section className="column column-news">
          <NewsModule data={newsData} />
        </section>

        <section className="column column-meals">
          <SchoolMealsModule
            data={mealData}
            selectedDay={selectedMealDay}
            onDayChange={setSelectedMealDay}
          />
        </section>

        <section className="column column-transport">
          <TransportModule
            data={transportData}
            onStopChange={(stopId) => {
              setTransportData((prev) => ({ ...prev, selectedStop: stopId }));
            }}
          />
        </section>
      </main>
    </div>
  );
}

function WeatherModule({ data }) {
  const { current, forecast } = data;

  const hourlyForecast = forecast.length > 0 ? forecast : [];

  const getWeatherDescription = (condition) => {
    const descriptions = {
      'clear sky': 'Klart',
      'few clouds': 'Delvis molnigt',
      'scattered clouds': 'Molnigt',
      'broken clouds': 'Molnigt',
      'overcast clouds': 'Mulet',
      'light rain': 'Lätt regn',
      'moderate rain': 'Regn',
      'heavy rain': 'Heavy rain',
      'light snow': 'Lätt snö',
      'snow': 'Snö',
      'mist': 'Dimma',
      'fog': 'Dimma',
      'haze': 'Disigt'
    };
    return descriptions[condition?.toLowerCase()] || condition || 'Okänt';
  };

  return (
    <div className="module">
      <h2 className="module-title">Väder</h2>
      <h3 className="forecast-title">Huddinge</h3>
      <div className="weather-current">
        <div className="weather-main">
          <span className="weather-temp">
            {current.temp !== null ? `${current.temp}°C` : "--"}
          </span>
          <span className="weather-condition">
            {current.condition ? getWeatherDescription(current.condition) : ""}
          </span>
        </div>
        <div className="weather-details">
          <div className="weather-detail">
            <span className="detail-label">Luftfuktighet</span>
            <span className="detail-value">
              {current.humidity !== null ? `${current.humidity}%` : "--"}
            </span>
          </div>
          <div className="weather-detail">
            <span className="detail-label">Vind</span>
            <span className="detail-value">
              {current.windSpeed !== null ? `${current.windSpeed} m/s` : "--"}
            </span>
          </div>
        </div>
      </div>
      <div className="weather-forecast">
        <h3 className="forecast-title">Hela dagen</h3>
        <ul className="forecast-list hourly">
          {hourlyForecast.map((hour, index) => (
            <li key={index} className="forecast-item hourly">
              <span className="forecast-time">{hour.time.substring(0, 5)}</span>
              <span className="forecast-temp">{hour.temp}°</span>
              <span className="forecast-condition">{getWeatherDescription(hour.condition)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NewsModule({ data }) {
  return (
    <div className="module">
      <h2 className="module-title">Senaste Nytt</h2>
      <ul className="news-list">
        {data.map((news) => (
          <li key={news.id} className="news-item">
            <h3 className="news-headline">{news.headline}</h3>
            <p className="news-ingress">{news.ingress}</p>
            <div className="news-meta">
              <span className="news-source">{news.source}</span>
              <span className="news-timestamp">
                {new Date(news.timestamp).toLocaleTimeString("sv-SE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <a href="#" className="news-view-all">
        View all
      </a>
    </div>
  );
}

function SchoolMealsModule({ data, selectedDay, onDayChange }) {
  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const currentDayKey = dayKeys[selectedDay];
  const currentMenu = data[currentDayKey];

  return (
    <div className="module">
      <h2 className="module-title">Skolmåltider</h2>
      <div className="meal-day-selector">
        {DAY_NAMES.map((day, index) => (
          <button
            key={day}
            className={`day-button ${index === selectedDay ? "active" : ""}`}
            onClick={() => onDayChange(index)}
          >
            {day}
          </button>
        ))}
      </div>
      <div className="meal-content">
        <div className="meal-category">
          <span className="category-label">Main</span>
          <span className="category-value">{currentMenu.main}</span>
        </div>
        <div className="meal-category">
          <span className="category-label">Side</span>
          <span className="category-value">{currentMenu.side}</span>
        </div>
        <div className="meal-category">
          <span className="category-label">Dessert</span>
          <span className="category-value">{currentMenu.dessert}</span>
        </div>
        <div className="meal-category">
          <span className="category-label">Vegetarian Option</span>
          <span className="category-value">{currentMenu.vegetarian}</span>
        </div>
      </div>
    </div>
  );
}

function TransportModule({ data, onStopChange }) {
  const {
    selectedStop,
    stops,
    busDepartures,
    trainDepartures,
    lastUpdated,
    error,
  } = data;

  return (
    <div className="module">
      <h2 className="module-title">Avgående bussar</h2>
      <div className="transport-stop-selector">
        <select
          value={selectedStop}
          onChange={(e) => onStopChange(e.target.value)}
          className="stop-dropdown"
        >
          {stops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="transport-error">{error}</div>}

      <div className="transport-section">
        <ul className="transport-list">
          {busDepartures.length > 0 ? (
            busDepartures.map((bus, index) => (
              <li key={index} className="transport-item">
                <span className="transport-line">{bus.lineNumber}</span>
                <span className="transport-destination">{bus.destination}</span>
                <span className="transport-time">{bus.plannedTime}</span>
                <span
                  className={`transport-status status-${bus.status.toLowerCase().replace(" ", "-")}`}
                >
                  {bus.status}
                </span>
              </li>
            ))
          ) : (
            <li className="transport-item">Inga avgångar</li>
          )}
        </ul>
      </div>

      <div className="transport-section">
        <h3 className="transport-title">Tåg & Metro</h3>
        <ul className="transport-list">
          {trainDepartures.length > 0 ? (
            trainDepartures.map((train, index) => (
              <li key={index} className="transport-item">
                <span className="transport-line">{train.lineNumber}</span>
                <span className="transport-destination">
                  {train.destination}
                </span>
                <span className="transport-time">{train.plannedTime}</span>
                <span
                  className={`transport-status status-${train.status.toLowerCase().replace(" ", "-")}`}
                >
                  {train.status}
                </span>
              </li>
            ))
          ) : (
            <li className="transport-item">Inga avgångar</li>
          )}
        </ul>
      </div>

      <div className="transport-stop-info">
        Hållplats: Huddinge Sjukhus / Södertörns högskola
      </div>

      {lastUpdated && (
        <div className="transport-updated">
          Senast uppdaterad:{" "}
          {new Date(lastUpdated).toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}

export default App;
