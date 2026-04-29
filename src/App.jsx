import { useState, useEffect } from "react";
import "./App.css";

const TRANSPORT_API_KEY = "9c4ec98e1f5242f1be14e1b111e1ed77";
const TRANSPORT_SITE_ID = "9522";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const DAY_NAMES = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag"];

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("sv-SE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return <div className="header-clock">{time}</div>;
}

function MovingBackground() {
  return (
    <div className="moving-background">
      <div className="moving-circle"></div>
      <div className="moving-circle"></div>
      <div className="moving-circle"></div>
      <div className="moving-circle"></div>
      <div className="moving-circle"></div>
      <div className="moving-circle"></div>
      <div className="moving-circle"></div>
      <div className="moving-circle"></div>
    </div>
  );
}

function Bubbles() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 40 + 30,
        duration: Math.random() * 8 + 8,
        delay: Math.random() * 15,
      }));
      setBubbles(newBubbles);
    };
    generateBubbles();
  }, []);

  return (
    <div className="bubbles-container">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [weatherData, setWeatherData] = useState({
    current: { temp: null, humidity: null, windSpeed: null },
    forecast: [],
  });

  const [newsData, setNewsData] = useState([]);

  const [mealData, setMealData] = useState({
    monday: { main: "" },
    tuesday: { main: "" },
    wednesday: { main: "" },
    thursday: { main: "" },
    friday: { main: "" },
  });

  const [selectedMealDay, setSelectedMealDay] = useState(() => {
    const today = new Date().getDay();
    const weekdayIndex = today === 0 ? 0 : today - 1;
    return weekdayIndex < 5 ? weekdayIndex : 0;
  });

  const [transportData, setTransportData] = useState({
    busDepartures: [],
    trainDepartures: [],
    lastUpdated: null,
    error: null,
  });

  const [adminData, setAdminData] = useState({ news: [], teachers: [] });

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

        const hourlyList =
          forecastData.list?.slice(0, 9).map((item) => ({
            time: item.dt_txt.substring(11, 16),
            temp: Math.round(item.main.temp),
            condition: item.weather[0]?.description || "Unknown",
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
    const interval = setInterval(fetchWeatherData, 300000);
    return () => clearInterval(interval);
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
        const response = await fetch(
          "https://ntifoodpeople.vercel.app/api/food",
        );

        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const currentWeek =
              data.find((w) => w.weekNumber === getWeekNumber(new Date())) ||
              data[data.length - 1];
            const nextWeek = data.find(
              (w) => w.weekNumber === getWeekNumber(new Date()) + 1,
            );
            const formattedMenu = formatFoodAPI(nextWeek || currentWeek);
            setMealData(formattedMenu);
            return;
          }
        }
      } catch (e) {
        console.log("Food API error:", e);
      }

      const mockMenu = {
        monday: { main: "Köttbullar med potatis" },
        tuesday: { main: "Fish & Chips" },
        wednesday: { main: "Pasta Bolognese" },
        thursday: { main: "Kycklinggryta" },
        friday: { main: "Tacos" },
      };
      setMealData(mockMenu);
    };
    fetchMealData();
    const interval = setInterval(fetchMealData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkForReload = () => {
      const now = new Date();
      if (
        now.getHours() === 4 &&
        now.getMinutes() === 0 &&
        now.getSeconds() === 0
      ) {
        window.location.reload();
      }
    };
    const interval = setInterval(checkForReload, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchTransport = async () => {
      try {
        const response = await fetch("/api/sl");

        if (response.ok) {
          const data = await response.json();
          const deps = data?.departures || [];
          console.log("Total departures:", deps.length);

          if (deps.length > 0) {
            // Filter only buses
            const onlyBuses = deps.filter(
              (d) => d.line?.transport_mode === "BUS",
            );

            const onlyTrains = deps.filter(
              (d) => d.line?.transport_mode === "TRAIN",
            );

            // Important lines for Huddinge Sjukhus
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

            const filtered = onlyBuses
              .filter((d) => importantLines.includes(d.line?.designation))
              .slice(0, 15)
              .map((d) => ({
                lineNumber: d.line?.designation || "?",
                destination: d.destination || "?",
                plannedTime: d.display || "?",
                status: d.realtime ? "On-Time" : "Expected",
              }));

            const trainDeps = onlyTrains.slice(0, 10).map((d) => ({
              lineNumber: d.line?.designation || "?",
              destination: d.destination || "?",
              plannedTime: d.display || "?",
              status: d.realtime ? "On-Time" : "Expected",
            }));

            setTransportData({
              busDepartures: filtered,
              trainDepartures: trainDeps,
              lastUpdated: new Date().toISOString(),
              error: null,
            });
            console.log(
              "Flemingsberg buses:",
              filtered.length,
              "trains:",
              trainDeps.length,
            );
            return;
          }
        }
      } catch (e) {
        console.log("Error:", e.message);
      }

      setTransportData((prev) => ({
        ...prev,
        error: "Kunde inte hämta busstider",
      }));
    };

    fetchTransport();
    const interval = setInterval(fetchTransport, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/data");
        const data = await res.json();
        setAdminData(data);
      } catch (e) {
        console.log("Admin data error:", e);
      }
    };
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <MovingBackground />
      <Bubbles />
      <div className="dashboard">
        <header className="dashboard-header">
          <h1 className="header-title">NTI Södertörn</h1>
          <Clock />
        </header>

        <main className="dashboard-grid">
          <section className="column column-left">
            <div className="module-stack">
              <WeatherModule data={weatherData} />
            </div>
            <div className="module-stack">
              <SchoolMealsModule
                data={mealData}
                selectedDay={selectedMealDay}
              />
            </div>
          </section>

          <section className="column column-center">
            <AdminNewsModule data={adminData} />
          </section>

          <section className="column column-right">
            <TransportModule data={transportData} />
          </section>
        </main>
      </div>
    </>
  );
}

function WeatherModule({ data }) {
  const { current, forecast } = data;

  const hourlyForecast = forecast.length > 0 ? forecast : [];

  const getWeatherDescription = (condition) => {
    const descriptions = {
      "clear sky": "Klart",
      "few clouds": "Delvis molnigt",
      "scattered clouds": "Molnigt",
      "broken clouds": "Molnigt",
      "overcast clouds": "Mulet",
      "light rain": "Lätt regn",
      "moderate rain": "Regn",
      "heavy rain": "Heavy rain",
      "light snow": "Lätt snö",
      snow: "Snö",
      mist: "Dimma",
      fog: "Dimma",
      haze: "Disigt",
    };
    return descriptions[condition?.toLowerCase()] || condition || "Okänt";
  };

  return (
    <div className="module">
      <h2 className="module-title">Väder</h2>
      <h3 className="forecast-title">Huddinge</h3>
      <div className="weather-current">
        <div className="weather-main">
          <span className="weather-temp">
            {current.temp !== null ? `${Math.round(current.temp)}°C` : ""}
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
              <span className="forecast-condition">
                {getWeatherDescription(hour.condition)}
              </span>
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
    </div>
  );
}

function SchoolMealsModule({ data, selectedDay }) {
  const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const currentDayKey = dayKeys[selectedDay];
  const currentMenu = data[currentDayKey];

  return (
    <div className="module">
      <h2 className="module-title">Skolmåltider</h2>
      <div className="meal-day-selector">
        {DAY_NAMES.map((day, index) => (
          <div
            key={day}
            className={`day-button ${index === selectedDay ? "active" : ""}`}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="meal-content">
        <div className="meal-category">
          <span className="category-label">Main</span>
          <span className="category-value">{currentMenu.main}</span>
        </div>
      </div>
    </div>
  );
}

function TransportModule({ data }) {
  const { busDepartures, trainDepartures, lastUpdated, error } = data;
  const trains = trainDepartures || [];
  const buses = busDepartures || [];

  return (
    <div className="module">
      <h2 className="module-title">Trafik</h2>

      {error && <div className="transport-error">{error}</div>}

      <div className="transport-section">
        {trains.length > 0 && (
          <>
            <div className="transport-group-title">Tåg</div>
            <ul className="transport-list">
              {trains.map((item, index) => (
                <li
                  key={`train-${index}`}
                  className="transport-item train-item"
                >
                  <span className="transport-line">{item.lineNumber}</span>
                  <span className="transport-destination">
                    {item.destination}
                  </span>
                  <span className="transport-time">{item.plannedTime}</span>
                  <span
                    className={`transport-status status-${item.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {buses.length > 0 && (
          <>
            <div className="transport-group-title">Buss</div>
            <ul className="transport-list">
              {buses.map((item, index) => (
                <li key={`bus-${index}`} className="transport-item">
                  <span className="transport-line">{item.lineNumber}</span>
                  <span className="transport-destination">
                    {item.destination}
                  </span>
                  <span className="transport-time">{item.plannedTime}</span>
                  <span
                    className={`transport-status status-${item.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {buses.length === 0 && trains.length === 0 && (
          <ul className="transport-list">
            <li className="transport-item">Inga avgångar</li>
          </ul>
        )}
      </div>

      <div className="transport-stop-info">Huddinge Sjukhus & Flemingsberg</div>

      {lastUpdated && (
        <div className="transport-updated">
          Uppdaterad:{" "}
          {new Date(lastUpdated).toLocaleTimeString("sv-SE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}

function WeatherMealsModule({ weatherData, mealData, selectedMealDay }) {
  const { current, forecast } = weatherData;
  const hourlyForecast = forecast.length > 0 ? forecast : [];

  const getWeatherDescription = (condition) => {
    const descriptions = {
      "clear sky": "Klart",
      "few clouds": "Delvis molnigt",
      "scattered clouds": "Molnigt",
      "broken clouds": "Molnigt",
      "overcast clouds": "Mulet",
      "light rain": "Lätt regn",
      "moderate rain": "Regn",
      "heavy rain": "Heavy rain",
      "light snow": "Lätt snö",
      snow: "Snö",
      mist: "Dimma",
      fog: "Dimma",
      haze: "Disigt",
    };
    return descriptions[condition?.toLowerCase()] || condition || "Okänt";
  };

  const weekDays = [
    "Måndag",
    "Tisdag",
    "Onsdag",
    "Torsdag",
    "Fredag",
    "Lördag",
    "Söndag",
  ];
  const meals = mealData?.meals || {};
  const selectedMeals = meals[selectedMealDay] || [];

  return (
    <div className="module">
      <h2 className="module-title">Väder & Matsedel</h2>

      <div className="weather-current">
        <h3 className="forecast-title">Huddinge</h3>
        <div className="weather-main">
          <span className="weather-temp">
            {current.temp !== null ? `${current.temp}°` : "--"}
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

      <div className="meal-day-info">
        <div className="meal-day-title">{weekDays[selectedMealDay]}</div>
        <div className="meal-content">
          {selectedMeals.length > 0 ? (
            selectedMeals.map((meal, index) => (
              <div key={index} className="meal-category">
                <span className="category-label">{meal.category}</span>
                <span className="category-value">{meal.dish}</span>
              </div>
            ))
          ) : (
            <div className="meal-category">
              <span className="category-value">Ingen matsedel</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminNewsModule({ data }) {
  const allNews = data?.news || [];
  const sickTeachers = data?.teachers?.filter((t) => t.isSick) || [];

  return (
    <div className="module admin-module">
      <h2 className="module-title">Skolnyheter</h2>
      {allNews.length > 0 ? (
        <div className="news-list">
          {[...allNews].reverse().map((news, index) => (
            <div key={index} className="news-item-admin">
              <h3 className="news-item-title">{news.title}</h3>
              <p className="news-item-text">{news.text}</p>
              <span className="news-item-date">
                {new Date(news.date).toLocaleDateString("sv-SE")}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-news-content">
          <h3 className="admin-news-title">Välkommen till NTI Södertörn</h3>
          <p className="admin-news-text">
            Här visas skolnyheter från administratörer.
          </p>
        </div>
      )}
      <div className="sick-leave-section">
        <h4 className="sick-leave-title">FRÅNVARANDE PERSONAL</h4>
        {sickTeachers.length > 0 ? (
          <ul className="sick-leave-list">
            {sickTeachers.map((teacher) => (
              <li key={teacher.name} className="sick-leave-item">
                {teacher.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="sick-leave-empty">Ingen rapporterad frånvaro idag</p>
        )}
      </div>
    </div>
  );
}

export default App;

function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function formatFoodAPI(data) {
  const dayMap = {
    Monday: "monday",
    Tuesday: "tuesday",
    Wednesday: "wednesday",
    Thursday: "thursday",
    Friday: "friday",
  };
  const formatted = {
    monday: { main: "" },
    tuesday: { main: "" },
    wednesday: { main: "" },
    thursday: { main: "" },
    friday: { main: "" },
  };

  data.days?.forEach((day) => {
    const dayKey = dayMap[day.weekDay];
    if (dayKey && day.meals) {
      const mainMeal = day.meals.find(
        (m) => m.type === "Meat" || m.type === "Chicken" || m.type === "Fish",
      );

      formatted[dayKey] = {
        main: mainMeal?.description || "",
      };
    }
  });

  return formatted;
}
