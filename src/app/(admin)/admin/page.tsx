"use client";

import React, { useEffect, useState } from "react";

interface VisitRow {
  id: string;
  ticketNumber: string;
  motif: string;
  arrivalAt: string;
  departureAt: string | null;
  date: string;
  user: {
    fullName: string;
    sex: string;
    school: string;
    phone: string | null;
    filiere: string;
  };
}

export default function AdminVisitsPage() {
  const [dataVisits, setDataVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const motifLabels: Record<string, string> = {
    consultation_ouvrages: "Consultation d'ouvrages",
    consultation_revues: "Consultation de revues",
    internet: "Consultation internet",
    depot: "Dépôt de mémoires",
    etudes: "Études",
    lecture: "Lecture",
    recherche: "Recherche documentaire",
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/admin/visits");
      if (!response.ok)
        throw new Error("Impossible de récupérer les enregistrements.");
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

  // --- GENERATION DU RAPPORT PDF COMPLET AVEC html2pdf.js ---
  const downloadDailyPDF = async (date: string, visitsOfTheDay: VisitRow[]) => {
    if (typeof window === "undefined") return;
    const html2pdf = (await import("html2pdf.js")).default;

    const formattedDate = formatDate(date);
    const fileName = `rapport-visites-${date}.pdf`;

    // Aggregations des données par Établissement -> Filière
    const statsBySchool = visitsOfTheDay.reduce((acc, visit) => {
      const school = visit.user.school || "Non renseigné";
      const filiere = visit.user.filiere || "Non renseignée";
      const sex = visit.user.sex === "F" ? "F" : "M";

      if (!acc[school]) acc[school] = {};
      if (!acc[school][filiere]) acc[school][filiere] = { M: 0, F: 0 };

      acc[school][filiere][sex]++;
      return acc;
    }, {} as Record<string, Record<string, { M: number; F: number }>>);

    // Aggregations par motif
    const statsByMotif = visitsOfTheDay.reduce((acc, visit) => {
      const label = motifLabels[visit.motif] || visit.motif;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Construction HTML du rapport
    const reportContainer = document.createElement("div");
    reportContainer.style.padding = "20px";
    reportContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, sans-serif";
    reportContainer.style.color = "#1e293b";
    reportContainer.style.width = "750px";

    let tablesHtml = "";
    Object.keys(statsBySchool).forEach((school) => {
      let schoolTotalM = 0;
      let schoolTotalF = 0;

      const rows = Object.keys(statsBySchool[school])
        .map((filiere) => {
          const s = statsBySchool[school][filiere];
          schoolTotalM += s.M;
          schoolTotalF += s.F;
          const totalFiliere = s.M + s.F;

          return `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">${filiere}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #0284c7;">${s.M}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #ec4899;">${s.F}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; background-color: #f8fafc;">${totalFiliere}</td>
          </tr>
        `;
        })
        .join("");

      tablesHtml += `
        <div style="margin-bottom: 20px;">
          <h3 style="background-color: #0369a1; color: white; padding: 8px 12px; margin: 0 0 8px 0; border-radius: 4px; font-size: 14px;">
            Établissement : ${school}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Filière / Option</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 90px;">Hommes (M)</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 90px;">Femmes (F)</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 90px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr style="background-color: #e2e8f0; font-weight: bold;">
                <td style="border: 1px solid #cbd5e1; padding: 8px;">Sous-total (${school})</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: #0284c7;">${schoolTotalM}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: #ec4899;">${schoolTotalF}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${
                  schoolTotalM + schoolTotalF
                }</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    });

    reportContainer.innerHTML = `
      <div style="text-align: center; border-bottom: 2px solid #0369a1; padding-bottom: 10px; margin-bottom: 15px;">
        <h2 style="margin: 0; font-size: 18px; color: #0f172a; text-transform: uppercase;">
          Rapport Statistique Global des Visites
        </h2>
        <p style="margin: 4px 0 0 0; color: #0284c7; font-size: 13px; font-weight: bold;">
          Journée du ${formattedDate}
        </p>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; background-color: #f8fafc; padding: 10px; border-radius: 6px; font-size: 13px;">
        <div><strong>Total des entrées :</strong> ${visitsOfTheDay.length} usager(s)</div>
        <div><strong>Date d'extraction :</strong> ${new Date().toLocaleDateString("fr-FR")}</div>
      </div>

      ${tablesHtml}

      <div style="margin-top: 20px;">
        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #334155;">Répartition par motifs de visite :</h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
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
      </div>
    `;

    const opt: any = {
      margin: 10,
      filename: fileName,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(reportContainer).save();
  };

  // --- METRIQUES VISITES UNIQUEMENT ---
  const todayIso = new Date().toISOString().split("T")[0];
  const totalVisitsCount = dataVisits.length;
  const todayVisits = dataVisits.filter((v) => v.date === todayIso);
  const currentlyInRoom = dataVisits.filter((v) => v.date === todayIso && !v.departureAt).length;

  // Groupement par jour
  const visitsByDay = dataVisits.reduce((groups: Record<string, VisitRow[]>, visit) => {
    const date = visit.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(visit);
    return groups;
  }, {});

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p style={{ marginTop: "10px" }}>Chargement du registre des visites...</p>
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

      {/* STATISTIQUES CONCENTRÉES UNIQUEMENT SUR LES VISITES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "25px" }}>
        <div style={cardStyle}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>TOTAL ENREGISTREMENTS</span>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "4px 0 0 0", color: "#0f172a" }}>{totalVisitsCount}</p>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>ENTRÉES AUJOURD'HUI</span>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "4px 0 0 0", color: "#2563eb" }}>{todayVisits.length}</p>
        </div>
        <div style={cardStyle}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>ACTUELLEMENT EN SALLE</span>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: "4px 0 0 0", color: "#16a34a" }}>{currentlyInRoom}</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Registre Journalier des Visites</h3>
        <button
          onClick={fetchAdminData}
          style={{ padding: "8px 14px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <i className="fa-solid fa-rotate"></i> Actualiser
        </button>
      </div>

      {/* AFFICHAGE DES REGISTRES PAR JOUR */}
      {Object.keys(visitsByDay).length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          Aucune visite enregistrée dans la base de données.
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
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{dayVisits.length} usager(s) au total</span>
                </div>
                <button
                  onClick={() => downloadDailyPDF(date, dayVisits)}
                  style={{ padding: "8px 14px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <i className="fa-solid fa-file-pdf"></i> Imprimer Rapport PDF
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                      <th style={thStyle}>Ticket</th>
                      <th style={thStyle}>Usager</th>
                      <th style={thStyle}>Sexe</th>
                      <th style={thStyle}>Établissement / Filière</th>
                      <th style={thStyle}>Téléphone</th>
                      <th style={thStyle}>Motif</th>
                      <th style={thStyle}>Arrivée</th>
                      <th style={thStyle}>Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayVisits.map((visite) => (
                      <tr key={visite.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#0284c7" }}>{visite.ticketNumber}</td>
                        <td style={{ ...tdStyle, fontWeight: "600" }}>{visite.user.fullName}</td>
                        <td style={tdStyle}>{visite.user.sex}</td>
                        <td style={tdStyle}>
                          <span style={{ fontSize: "11px", backgroundColor: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", marginRight: "6px", fontWeight: "500" }}>
                            {visite.user.school}
                          </span>
                          {visite.user.filiere}
                        </td>
                        <td style={tdStyle}>{visite.user.phone || "—"}</td>
                        <td style={{ ...tdStyle, fontStyle: "italic" }}>{motifLabels[visite.motif] || visite.motif}</td>
                        <td style={{ ...tdStyle, color: "#16a34a", fontWeight: "600" }}>{visite.arrivalAt}</td>
                        <td style={tdStyle}>
                          {visite.departureAt ? (
                            <span style={{ color: "#dc2626", fontWeight: "600" }}>{visite.departureAt}</span>
                          ) : (
                            <span style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>
                              En salle
                            </span>
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

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px",
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