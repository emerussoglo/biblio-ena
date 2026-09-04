"use client";

import React, { useEffect, useState } from "react";

interface VisitRow {
  id: string;
  ticketNumber: string;
  motif: string;
  arrivalAt: string;
  departureAt: string | null;
  date: string;
  satisfactionRating: number | null;
  satisfactionReason: string | null;
  user: {
    fullName: string;
    sex: string;
    userType: string;
    school: string;
    phone: string | null;
    filiere: string;
  };
}

export default function AdminVisitsPage() {
  const [dataVisits, setDataVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtres
  const [filterUserType, setFilterUserType] = useState("all");
  const [filterMotif, setFilterMotif] = useState("all");

  const motifLabels: Record<string, string> = {
    etudes: "Études",
    recherche: "Travaux de recherche",
    stages: "Stages",
    depot: "Dépôt de mémoires",
    consultation_ouvrages: "Consultation d'ouvrages",
    consultation_revues: "Consultation de revues",
    internet: "Consultation Internet",
  };

  const userTypeLabels: Record<string, string> = {
    etudiant_enam: "Étudiant ENAM",
    etudiant_externe: "Étudiant Externe",
    professionnel: "Professionnel",
    chercheur: "Enseignant / Chercheur",
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/admin/visits");
      if (!response.ok) throw new Error("Impossible de récupérer les données.");
      const data = await response.json();
      setDataVisits(data);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  // --- FILTRAGE DYNAMIQUE ---
  const filteredVisits = dataVisits.filter((v) => {
    const matchType = filterUserType === "all" || v.user.userType === filterUserType;
    const matchMotif = filterMotif === "all" || v.motif === filterMotif;
    return matchType && matchMotif;
  });

  // --- RAPPORT PDF AVEC SATISFACTION & TROIS AXES ---
  const downloadDailyPDF = async (date: string, visitsOfTheDay: VisitRow[]) => {
    if (typeof window === "undefined") return;
    const html2pdf = (await import("html2pdf.js")).default;

    // 1. Stats par catégorie usager + genre
    const statsByUserType = visitsOfTheDay.reduce((acc, v) => {
      const type = userTypeLabels[v.user.userType] || v.user.userType || "Autre";
      const sex = v.user.sex === "F" ? "F" : "M";
      if (!acc[type]) acc[type] = { M: 0, F: 0 };
      acc[type][sex]++;
      return acc;
    }, {} as Record<string, { M: number; F: number }>);

    // 2. Stats par motif
    const statsByMotif = visitsOfTheDay.reduce((acc, v) => {
      const label = motifLabels[v.motif] || v.motif;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Stats satisfaction
    const ratedVisits = visitsOfTheDay.filter((v) => v.satisfactionRating !== null);
    const avgRating = ratedVisits.length
      ? (
          ratedVisits.reduce((acc, v) => acc + (v.satisfactionRating || 0), 0) /
          ratedVisits.length
        ).toFixed(1)
      : "N/A";

    const negativeReviews = visitsOfTheDay.filter(
      (v) => v.satisfactionRating && v.satisfactionRating <= 2
    );

    const reportContainer = document.createElement("div");
    reportContainer.style.padding = "20px";
    reportContainer.style.fontFamily = "'Segoe UI', Tahoma, sans-serif";
    reportContainer.style.color = "#1e293b";

    reportContainer.innerHTML = `
      <div style="text-align: center; border-bottom: 2px solid #0369a1; padding-bottom: 10px; margin-bottom: 15px;">
        <h2 style="margin: 0; font-size: 18px; color: #0f172a; text-transform: uppercase;">
          Rapport de Fréquentation & Satisfaction
        </h2>
        <p style="margin: 4px 0 0 0; color: #0284c7; font-size: 13px; font-weight: bold;">
          Journée du ${formatDate(date)}
        </p>
      </div>

      <!-- Synthèse -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; background-color: #f8fafc; padding: 10px; border-radius: 6px; font-size: 12px;">
        <div><strong>Total Usagers :</strong> ${visitsOfTheDay.length}</div>
        <div><strong>Note Moyenne Accueil :</strong> ${avgRating} / 5</div>
        <div><strong>Avis exprimés :</strong> ${ratedVisits.length}</div>
      </div>

      <!-- Axe 1: Catégories usagers -->
      <h4 style="margin: 10px 0 6px 0; font-size: 13px; color: #0369a1;">1. Répartition par Catégorie et Genre</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Catégorie d'usager</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 80px;">Hommes</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 80px;">Femmes</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(statsByUserType)
            .map((type) => {
              const row = statsByUserType[type];
              return `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px;">${type}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #0284c7; font-weight: bold;">${row.M}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; color: #ec4899; font-weight: bold;">${row.F}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">${row.M + row.F}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>

      <!-- Axe 2: Motifs -->
      <h4 style="margin: 10px 0 6px 0; font-size: 13px; color: #0369a1;">2. Répartition par Motif de Visite</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left;">Motif</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; width: 100px;">Nombre</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(statsByMotif)
            .map(
              (m) => `
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">${m}</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">${statsByMotif[m]}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <!-- Axe 3: Satisfaction / Points d'amélioration -->
      <h4 style="margin: 10px 0 6px 0; font-size: 13px; color: #0369a1;">3. Retours d'Insatisfaction & Remarques</h4>
      ${
        negativeReviews.length === 0
          ? `<p style="font-size: 11px; color: #16a34a; font-style: italic;">Aucune insatisfaction enregistrée pour cette journée.</p>`
          : `
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background-color: #fef2f2; color: #991b1b;">
              <th style="border: 1px solid #fecaca; padding: 6px; text-align: left;">Note</th>
              <th style="border: 1px solid #fecaca; padding: 6px; text-align: left;">Motif d'insatisfaction / Remarque</th>
            </tr>
          </thead>
          <tbody>
            ${negativeReviews
              .map(
                (r) => `
              <tr>
                <td style="border: 1px solid #fecaca; padding: 6px; font-weight: bold; color: #dc2626;">${r.satisfactionRating} / 5</td>
                <td style="border: 1px solid #fecaca; padding: 6px;">${r.satisfactionReason || "Aucun motif précisé"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `
      }
    `;

    const opt: any = {
      margin: 10,
      filename: `rapport-frequentation-${date}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(reportContainer).save();
  };

  // Groupement par jour sur les données filtrées
  const visitsByDay = filteredVisits.reduce((groups: Record<string, VisitRow[]>, visit) => {
    const date = visit.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(visit);
    return groups;
  }, {});

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p style={{ marginTop: "10px" }}>Chargement du module de statistiques...</p>
      </div>
    );
  }

  return (
    <div className="admin-view" style={{ padding: "20px" }}>
      {error && (
        <div style={{ color: "#e53e3e", backgroundColor: "#fff5f5", padding: "12px", borderRadius: "6px", border: "1px solid #fed7d7", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* FILTRES PAR AXES */}
      <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontWeight: "700", fontSize: "13px", color: "#334155" }}>Filtrer par :</span>

        <select
          value={filterUserType}
          onChange={(e) => setFilterUserType(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Toutes les catégories d'usagers</option>
          <option value="etudiant_enam">Étudiants ENAM</option>
          <option value="etudiant_externe">Étudiants Externes</option>
          <option value="professionnel">Professionnels</option>
          <option value="chercheur">Enseignants / Chercheurs</option>
        </select>

        <select
          value={filterMotif}
          onChange={(e) => setFilterMotif(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Tous les motifs</option>
          <option value="etudes">Études</option>
          <option value="recherche">Travaux de recherche</option>
          <option value="stages">Stages</option>
          <option value="depot">Dépôt de mémoires</option>
          <option value="consultation_ouvrages">Consultation d'ouvrages</option>
        </select>
      </div>

      {/* REGISTRES JOURNALIERS */}
      {Object.keys(visitsByDay).length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          Aucun enregistrement correspondant aux critères sélectionnés.
        </div>
      ) : (
        Object.keys(visitsByDay).map((date) => {
          const dayVisits = visitsByDay[date];
          return (
            <div key={date} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "15px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
                    Journée du {formatDate(date)}
                  </h4>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{dayVisits.length} usager(s) filtré(s)</span>
                </div>
                <button
                  onClick={() => downloadDailyPDF(date, dayVisits)}
                  style={{ padding: "8px 14px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <i className="fa-solid fa-file-pdf"></i> Imprimer Rapport
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                      <th style={thStyle}>Ticket</th>
                      <th style={thStyle}>Usager</th>
                      <th style={thStyle}>Catégorie</th>
                      <th style={thStyle}>Sexe</th>
                      <th style={thStyle}>Motif</th>
                      <th style={thStyle}>Arrivée / Sortie</th>
                      <th style={thStyle}>Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayVisits.map((visite) => (
                      <tr key={visite.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#0284c7" }}>{visite.ticketNumber}</td>
                        <td style={{ ...tdStyle, fontWeight: "600" }}>{visite.user.fullName}</td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: "11px", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontWeight: "600" }}>
                            {userTypeLabels[visite.user.userType] || visite.user.userType}
                          </span>
                        </td>
                        <td style={tdStyle}>{visite.user.sex}</td>
                        <td style={{ ...tdStyle, fontStyle: "italic" }}>{motifLabels[visite.motif] || visite.motif}</td>
                        <td style={tdStyle}>
                          <span style={{ color: "#16a34a", fontWeight: "600" }}>{visite.arrivalAt}</span> -{" "}
                          {visite.departureAt ? (
                            <span style={{ color: "#dc2626", fontWeight: "600" }}>{visite.departureAt}</span>
                          ) : (
                            <span style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "2px 6px", borderRadius: "10px", fontSize: "11px" }}>En salle</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {visite.satisfactionRating ? (
                            <div>
                              <span style={{ fontWeight: "bold", color: visite.satisfactionRating <= 2 ? "#dc2626" : "#16a34a" }}>
                                {visite.satisfactionRating}/5 ⭐
                              </span>
                              {visite.satisfactionReason && (
                                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                                  "{visite.satisfactionReason}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "11px" }}>Non renseigné</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  color: "#0f172a",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
  color: "#1e293b",
};