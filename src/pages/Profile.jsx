import { useEffect, useState } from "react";
import "./stub.css";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    company: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ======================
  // FETCH PROFILE
  // ======================
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://127.0.0.1:5000/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load profile");
        }

        setUser({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          role: data.user.role || "",
          company: data.user.company || "",
        });
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  // ======================
  // HANDLE INPUT CHANGE
  // ======================
  function handleChange(e) {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // ======================
  // UPDATE PROFILE
  // ======================
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/api/auth/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          company: user.company,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  // ======================
  // LOADING STATE
  // ======================
  if (loading) {
    return (
      <div className="stub-page">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  // ======================
  // UI
  // ======================
  return (
    <div className="profile-page">
      <div className="profile-card">
        <h2>My Profile</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Full Name"
          />

          <input
            type="email"
            value={user.email}
            disabled
            placeholder="Email"
          />

          <input
            type="tel"
            name="phone"
            value={user.phone}
            onChange={handleChange}
            placeholder="Phone Number"
          />

          <input
            type="text"
            name="company"
            value={user.company}
            onChange={handleChange}
            placeholder="Company"
          />

          <input
            type="text"
            value={user.role}
            disabled
            placeholder="Role"
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

       
      </div>
    </div>
  );
}