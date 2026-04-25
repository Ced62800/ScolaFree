"use client";

import { supabase } from "@/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Profile = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  niveau: string;
  classe: string;
  role: string;
  created_at: string;
};

const CLASSES_PAR_NIVEAU: Record<string, string[]> = {
  primaire: ["cp", "ce1", "ce2", "cm1", "cm2"],
  college: ["6eme", "5eme", "4eme", "3eme"],
};

const CLASSE_LABELS: Record<string, string> = {
  cp: "CP",
  ce1: "CE1",
  ce2: "CE2",
  cm1: "CM1",
  cm2: "CM2",
  "6eme": "6ème",
  "5eme": "5ème",
  "4eme": "4ème",
  "3eme": "3ème",
};

export default function Admin() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/connexion");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/");
      return;
    }
    setAdminName(`${profile.prenom} ${profile.nom}`);

    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    setProfiles(allProfiles || []);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setProfiles(
      profiles.map((p) => (p.id === userId ? { ...p, role: newRole } : p)),
    );
  };

  const handleNiveauChange = async (userId: string, newNiveau: string) => {
    await supabase
      .from("profiles")
      .update({ niveau: newNiveau, classe: "" })
      .eq("id", userId);
    setProfiles(
      profiles.map((p) =>
        p.id === userId ? { ...p, niveau: newNiveau, classe: "" } : p,
      ),
    );
  };

  const handleClasseChange = async (userId: string, newClasse: string) => {
    await supabase
      .from("profiles")
      .update({ classe: newClasse })
      .eq("id", userId);
    setProfiles(
      profiles.map((p) => (p.id === userId ? { ...p, classe: newClasse } : p)),
    );
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await supabase.from("profiles").delete().eq("id", userId);
    setProfiles(profiles.filter((p) => p.id !== userId));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading)
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Chargement...</p>
      </div>
    );

  const stats = {
    total: profiles.length,
    primaire: profiles.filter((p) => p.niveau === "primaire").length,
    college: profiles.filter((p) => p.niveau === "college").length,
  };

  return (
    <div className="admin-page">
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <button
        className="admin-hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-brand">
          🎓 Scola<span>Free</span>
        </div>
        <div className="admin-profile">
          <div className="admin-avatar">👤</div>
          <div>
            <div className="admin-name">{adminName}</div>
            <div className="admin-role-badge">Administrateur</div>
          </div>
        </div>
        <nav className="admin-nav">
          <a
            href="#"
            className="admin-nav-item active"
            onClick={() => setSidebarOpen(false)}
          >
            👥 Utilisateurs
          </a>
          <a
            href="#"
            className="admin-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            📚 Cours
          </a>
          <a
            href="#"
            className="admin-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            📊 Statistiques
          </a>
          <a
            href="#"
            className="admin-nav-item"
            onClick={() => setSidebarOpen(false)}
          >
            ⚙️ Paramètres
          </a>
        </nav>
        <button className="admin-logout" onClick={handleLogout}>
          🚪 Déconnexion
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Tableau de bord</h1>
            <p>Bienvenue, {adminName} 👋</p>
          </div>
          <a href="/" className="back-home-btn">
            🏠 Accueil
          </a>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-num">{stats.total}</div>
            <div className="admin-stat-label">Utilisateurs</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-num">{stats.primaire}</div>
            <div className="admin-stat-label">Primaire</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-num">{stats.college}</div>
            <div className="admin-stat-label">Collège</div>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h2>👥 Tous les utilisateurs</h2>
            <span className="admin-count">{stats.total} inscrits</span>
          </div>

          {/* Cartes mobile */}
          <div className="admin-cards-mobile">
            {profiles.map((p) => (
              <div key={p.id} className="admin-user-card">
                <div className="admin-user-card-header">
                  <div className="admin-user-card-name">
                    {p.prenom} {p.nom}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(p.id)}
                  >
                    🗑️
                  </button>
                </div>
                <div className="admin-user-card-email">{p.email}</div>
                <div className="admin-user-card-row">
                  <label>Niveau</label>
                  <select
                    className="role-select"
                    value={p.niveau}
                    onChange={(e) => handleNiveauChange(p.id, e.target.value)}
                  >
                    <option value="primaire">Primaire</option>
                    <option value="college">Collège</option>
                  </select>
                </div>
                <div className="admin-user-card-row">
                  <label>Classe</label>
                  <select
                    className="role-select"
                    value={p.classe || ""}
                    onChange={(e) => handleClasseChange(p.id, e.target.value)}
                  >
                    <option value="">-- Classe --</option>
                    {(CLASSES_PAR_NIVEAU[p.niveau] || []).map((c) => (
                      <option key={c} value={c}>
                        {CLASSE_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-user-card-row">
                  <label>Rôle</label>
                  <select
                    className="role-select"
                    value={p.role}
                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="admin-user-card-date">
                  Inscrit le{" "}
                  {new Date(p.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            ))}
          </div>

          {/* Tableau desktop */}
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Niveau</th>
                <th>Classe</th>
                <th>Rôle</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.prenom} {p.nom}
                  </td>
                  <td>{p.email}</td>
                  <td>
                    <select
                      className="role-select"
                      value={p.niveau}
                      onChange={(e) => handleNiveauChange(p.id, e.target.value)}
                    >
                      <option value="primaire">Primaire</option>
                      <option value="college">Collège</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="role-select"
                      value={p.classe || ""}
                      onChange={(e) => handleClasseChange(p.id, e.target.value)}
                    >
                      <option value="">-- Classe --</option>
                      {(CLASSES_PAR_NIVEAU[p.niveau] || []).map((c) => (
                        <option key={c} value={c}>
                          {CLASSE_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="role-select"
                      value={p.role}
                      onChange={(e) => handleRoleChange(p.id, e.target.value)}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
