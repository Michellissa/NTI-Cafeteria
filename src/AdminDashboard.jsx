import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

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

export default function AdminDashboard() {
  const [newsTitle, setNewsTitle] = useState("");
  const [newsText, setNewsText] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data`);
      const data = await res.json();
      setTeachers(data.teachers || []);
      setNewsList(data.news || []);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveNews = async () => {
    if (!newsTitle || !newsText) return;
    setSaving(true);
    try {
      const updated = [...newsList, { title: newsTitle, text: newsText, date: new Date().toISOString() }];
      await fetch(`${API_URL}/api/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: updated }),
      });
      setNewsList(updated);
      setNewsTitle("");
      setNewsText("");
      alert("Nyhet sparad!");
    } catch (e) {
      alert("Fel vid sparande");
    } finally {
      setSaving(false);
    }
  };

  const deleteNews = async (index) => {
    if (!confirm("Ta bort denna nyhet?")) return;
    const updated = [...newsList];
    updated.splice(index, 1);
    setNewsList(updated);
    try {
      await fetch(`${API_URL}/api/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ news: updated }),
      });
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const toggleTeacher = async (teacherName) => {
    const updated = teachers.map((t) =>
      t.name === teacherName ? { ...t, isSick: !t.isSick } : t
    );
    setTeachers(updated);
    try {
      await fetch(`${API_URL}/api/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teachers: updated }),
      });
    } catch (e) {
      console.error("Error:", e);
    }
  };

  return (
    <>
      <MovingBackground />
      <Bubbles />
      <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Skolnyheter</h2>
          {newsList.length > 0 && (
            <div className="news-list-admin">
              {[...newsList].reverse().map((news, idx) => (
                <div key={idx} className="news-item-admin">
                  <div>
                    <strong>{news.title}</strong>
                    <p>{news.text}</p>
                  </div>
                  <button onClick={() => deleteNews(newsList.length - 1 - idx)} className="delete-btn">
                    Ta bort
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="form-group">
            <label>Rubrik</label>
            <input
              type="text"
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              placeholder="Ange rubrik"
            />
          </div>
          <div className="form-group">
            <label>Text</label>
            <textarea
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              placeholder="Ange text"
              rows={4}
            />
          </div>
          <button onClick={saveNews} disabled={saving} className="save-btn">
            {saving ? "Sparar..." : "Spara nyhet"}
          </button>
        </div>

        <div className="admin-card">
          <h2>Sjukfrånvaro</h2>
          {loading ? (
            <p>Laddar...</p>
          ) : (
            <div className="teacher-grid">
              {teachers.map((teacher) => (
                <div key={teacher.name} className={`teacher-card ${teacher.isSick ? "sick" : ""}`}>
                  <span className="teacher-name">{teacher.name}</span>
                  <button
                    onClick={() => toggleTeacher(teacher.name)}
                    className={`checkbox-btn ${teacher.isSick ? "active" : ""}`}
                  >
                    {teacher.isSick ? "Frånvarande" : "Närvarande"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}