import React, { useEffect, useState } from "react";
import "./styles.css";
import CurrentWeather from "./components/CurrentWeather";
import RealtimeMap from "./components/RealtimeMap";
import PressureChart from "./components/PressureChart";
import { fetchOpenMeteoWeather, fetchPressureSeries } from "./services/openMeteo";

function App() {
  const [now, setNow] = useState(null);
  const [days, setDays] = useState([]);
  const [pressure, setPressure] = useState({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState({ lat: 17.392109, lon: 78.319494 });

  useEffect(() => {
    const liveCoords = { lat: 17.392109, lon: 78.319494, label: "CBIT Hyderabad" };
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const { now, forecast } = await fetchOpenMeteoWeather({
          latitude: liveCoords.lat,
          longitude: liveCoords.lon,
          locationLabel: liveCoords.label,
        });
        setNow(now);
        setDays(forecast);
        const series = await fetchPressureSeries({ latitude: liveCoords.lat, longitude: liveCoords.lon, pastDays: 2 });
        setPressure(series);
      } catch (err) {
        setError(err?.message || "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    // Fix weather to CBIT coordinates
    setCoords({ lat: liveCoords.lat, lon: liveCoords.lon });
    run();

    // Auto-refresh every 5 minutes for dynamic updates
    const id = setInterval(run, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="container">
      {/* Watermark div */}
      <div className="watermark" />
      <header className="header glass-bg">
        <span className="logo">
          <img src="/Astra.png" alt="CBIT Logo" />
        </span>
        <div className="header-content">
          <h1>CBIT Weather Station</h1>
          <p>Real-time Weather Monitoring System</p>
        </div>
        <span className="logo right-logo">
          <img src="cbit_logo.png" alt="CBIT Logo" />
        </span>
      </header>

      <main className="main-content">
        {loading && (
          <div className="glass-bg" style={{ padding: 12, marginBottom: 12 }}>Loading live weather…</div>
        )}
        {error && (
          <div className="glass-bg" style={{ padding: 12, marginBottom: 12, color: "#ff6b6b" }}>
            {error}
          </div>
        )}
        {now && <CurrentWeather data={now} />}
        <section className="map-chart-grid glass-bg">
          <RealtimeMap latitude={coords.lat} longitude={coords.lon} />
          <PressureChart labels={pressure.labels} values={pressure.values} />
        </section>

        {/* Brand strip under maps */}
        <section className="brand-strip glass-bg">
          <img className="brand-logo" src="/Astra_White_Final_Plain_Logo.png" alt="Astra Logo" />
        </section>
      </main>

      <footer className="footer glass-bg">
        <span>Updated: {now?.updated ?? '-'}</span>
      </footer>
    </div>
  );
}

export default App;
