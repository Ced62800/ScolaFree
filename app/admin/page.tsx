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
  role: string;
  created_at: string;
};

export default function Admin() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");

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
      .update({ niveau: newNiveau })
      .eq("id", userId);
    setProfiles(
      profiles.map((p) => (p.id === userId ? { ...p, niveau: newNiveau } : p)),
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
    lycee: profiles.filter((p) => p.niveau === "lycee").length,
  };

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
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
          <a href="#" className="admin-nav-item active">
            👥 Utilisateurs
          </a>
          <a href="#" className="admin-nav-item">
            📚 Cours
          </a>
          <a href="#" className="admin-nav-item">
            📊 Statistiques
          </a>
          <a href="#" className="admin-nav-item">
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
            🏠 Retour page d'accueil
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
          <div className="admin-stat-card">
            <div className="admin-stat-num">{stats.lycee}</div>
            <div className="admin-stat-label">Lycée</div>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <div className="admin-table-header">
            <h2>👥 Tous les utilisateurs</h2>
            <span className="admin-count">{stats.total} inscrits</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Niveau</th>
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
                      <option value="lycee">Lycée</option>
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
