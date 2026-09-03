"use client";

import React, { useEffect, useState } from "react";

interface StatsData {
  kpis: {
    totalUsers: number;
    totalVisits: number;
    totalMemoires: number;
    totalQuitus: number;
  };
  usersBySex: { sex: string; count: number }[];
  usersByType: { userType: string; count: number }[];
  memoiresByStatus: { status: string; count: number }[];
  memoiresByMention: { mention: string; count: number }[];
  visitsByFiliere: { filiere: string | null; count: number }[];
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        console.error("Erreur de chargement des statistiques");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p style={{ marginTop: "10px" }}>Chargement des rapports statistiques...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "25px" }}>
      <div>
        <h1 style={{ fontSize: "24px", color: "#0f172a", margin: 0 }}>Rapports & Statistiques</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>
          Vue d'ensemble sur l'affluence, les usagers et l'activité de dépôt des mémoires.
        </p>
      </div>

      {/* CARTES KPI */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div style={cardStyle}>
          <div style={{ color: "#2563eb", fontSize: "20px" }}><i className="fa-solid fa-users"></i></div>
          <span style={kpiValueStyle}>{stats.kpis.totalUsers}</span>
          <span style={kpiLabelStyle}>Inscrits Totaux</span>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#16a34a", fontSize: "20px" }}><i className="fa-solid fa-person-walking"></i></div>
          <span style={kpiValueStyle}>{stats.kpis.totalVisits}</span>
          <span style={kpiLabelStyle}>Visites Enregistrées</span>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#d97706", fontSize: "20px" }}><i className="fa-solid fa-book"></i></div>
          <span style={kpiValueStyle}>{stats.kpis.totalMemoires}</span>
          <span style={kpiLabelStyle}>Mémoires Déposés</span>
        </div>

        <div style={cardStyle}>
          <div style={{ color: "#059669", fontSize: "20px" }}><i className="fa-solid fa-certificate"></i></div>
          <span style={kpiValueStyle}>{stats.kpis.totalQuitus}</span>
          <span style={kpiLabelStyle}>Quitus Validés</span>
        </div>
      </div>

      {/* GRILLE D'ANALYSES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}
      >
        {/* REPARTITION PAR GENRE & TYPE */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}><i className="fa-solid fa-user-group"></i> Profils des Usagers</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Genre :</label>
            {stats.usersBySex.map((item) => {
              const pct = stats.kpis.totalUsers ? Math.round((item.count / stats.kpis.totalUsers) * 100) : 0;
              return (
                <div key={item.sex}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span>{item.sex === "M" ? "Hommes (M)" : "Femmes (F)"}</span>
                    <strong>{item.count} ({pct}%)</strong>
                  </div>
                  <div style={progressBgStyle}>
                    <div style={{ ...progressFillStyle, width: `${pct}%`, backgroundColor: item.sex === "M" ? "#2563eb" : "#ec4899" }}></div>
                  </div>
                </div>
              );
            })}

            <hr style={{ border: "0.5px solid #f1f5f9", margin: "10px 0" }} />

            <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Type d'usager :</label>
            {stats.usersByType.map((item) => {
              const pct = stats.kpis.totalUsers ? Math.round((item.count / stats.kpis.totalUsers) * 100) : 0;
              return (
                <div key={item.userType}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span style={{ textTransform: "capitalize" }}>{item.userType}s</span>
                    <strong>{item.count} ({pct}%)</strong>
                  </div>
                  <div style={progressBgStyle}>
                    <div style={{ ...progressFillStyle, width: `${pct}%`, backgroundColor: "#0284c7" }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STATUT DES MÉMOIRES */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}><i className="fa-solid fa-file-contract"></i> Traitement des Mémoires</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
            {stats.memoiresByStatus.map((item) => {
              const labelMap: Record<string, { title: string; color: string }> = {
                approved: { title: "Approuvés (Quitus générés)", color: "#16a34a" },
                pending: { title: "En attente de validation", color: "#d97706" },
                rejected: { title: "Rejetés", color: "#dc2626" },
              };
              const config = labelMap[item.status] || { title: item.status, color: "#64748b" };
              const pct = stats.kpis.totalMemoires ? Math.round((item.count / stats.kpis.totalMemoires) * 100) : 0;

              return (
                <div key={item.status}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span>{config.title}</span>
                    <strong>{item.count} ({pct}%)</strong>
                  </div>
                  <div style={progressBgStyle}>
                    <div style={{ ...progressFillStyle, width: `${pct}%`, backgroundColor: config.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* REPARTITION DES MENTIONS */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}><i className="fa-solid fa-award"></i> Mentions Attribuées</h3>
          {stats.memoiresByMention.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "13px" }}>Aucune mention attribuée pour le moment.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
              {stats.memoiresByMention.map((item) => (
                <div key={item.mention} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                  <span style={{ fontWeight: "500" }}>{item.mention || "Non renseignée"}</span>
                  <span style={{ backgroundColor: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontWeight: "bold" }}>{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP FILIERES EN VISITE */}
        <div style={sectionBoxStyle}>
          <h3 style={sectionTitleStyle}><i className="fa-solid fa-graduation-cap"></i> Top Filières en Visite</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
            {stats.visitsByFiliere.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", padding: "6px 0" }}>
                <span style={{ color: "#334155" }}>{item.filiere || "Filière non renseignée"}</span>
                <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "2px 10px", borderRadius: "12px", fontWeight: "bold", fontSize: "12px" }}>
                  {item.count} visites
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// STYLES
const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#0f172a",
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#64748b",
  fontWeight: "500",
};

const sectionBoxStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "20px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#0f172a",
  margin: "0 0 10px 0",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const progressBgStyle: React.CSSProperties = {
  width: "100%",
  height: "8px",
  backgroundColor: "#f1f5f9",
  borderRadius: "4px",
  marginTop: "4px",
  overflow: "hidden",
};

const progressFillStyle: React.CSSProperties = {
  height: "100%",
  borderRadius: "4px",
  transition: "width 0.3s ease",
};