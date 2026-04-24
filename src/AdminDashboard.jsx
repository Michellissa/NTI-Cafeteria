import { useState, useEffect } from "react";

const API_URL = "http://localhost:3000";

export default function AdminDashboard() {
  const [newsTitle, setNewsTitle] = useState("");
  const [newsText, setNewsText] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data`);
      const data = await res.json();
      setTeachers(data.teachers || []);
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
      const res = await fetch(`${API_URL}/api/data`);
      const data = await res.json();
      const existingNews = data.news || [];
      
      await fetch(`${API_URL}/api/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          news: [...existingNews, { title: newsTitle, text: newsText, date: new Date().toISOString() }],
        }),
      });
      setNewsTitle("");
      setNewsText("");
      alert("Nyhet sparad!");
    } catch (e) {
      alert("Fel vid sparande");
    } finally {
      setSaving(false);
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
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h2>Skolnyheter</h2>
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
            <div className="teacher-list">
              {teachers.map((teacher) => (
                <div key={teacher.name} className="teacher-item">
                  <span className={teacher.isSick ? "sick" : ""}>
                    {teacher.name}
                  </span>
                  <button
                    onClick={() => toggleTeacher(teacher.name)}
                    className={`toggle-btn ${teacher.isSick ? "active" : ""}`}
                  >
                    {teacher.isSick ? "Sjuk" : "Frisk"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}