"use client";

import React, { useEffect, useState } from "react";

interface UserData {
  fullName: string;
  sex: string;
  userType: string;
  school: string;
  phone: string | null;
  filiere: string;
}

interface VisitRow {
  id: string;
  ticketNumber: string;
  motif: string;
  arrivalAt: string;
  departureAt: string | null;
  date: string;
  satisfactionRating: number | null;
  satisfactionReason: string | null;
  user: UserData;
}

interface GenderStat {
  M: number;
  F: number;
}

// Module HTML2PDF
interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: { type: string; quality: number };
  html2canvas: { scale: number; useCORS: boolean };
  jsPDF: { unit: string; format: string; orientation: string };
}

interface Html2PdfInstance {
  set: (options: Html2PdfOptions) => Html2PdfInstance;
  from: (element: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
}

export default function AdminVisitsPage() {
  const [dataVisits, setDataVisits] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Filtres
  const [filterUserType, setFilterUserType] = useState<string>("all");
  const [filterMotif, setFilterMotif] = useState<string>("all");

  const motifLabels: Record<string, string> = {
    etudes: "Études",
    recherche: "Travaux de recherche",
    stages: "Stages",
    depot: "Dépôt de mémoires",
    consultation_ouvrages: "Consultation d'ouvrages",
    consultation_revues: "Consultation de revues",
    internet: "Consultation Internet",
    demande_renseignement: "Demande de renseignement",
    lecture: "Lecture",
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
      const data: VisitRow[] = await response.json();
      setDataVisits(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (isoDate: string): string => {
    if (!isoDate) return "—";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // --- FILTRAGE DYNAMIQUE ---
  const filteredVisits = dataVisits.filter((v) => {
    const matchType = filterUserType === "all" || v.user.userType === filterUserType;
    const matchMotif = filterMotif === "all" || v.motif === filterMotif;
    return matchType && matchMotif;
  });

  // --- GÉNÉRATION DU RAPPORT PDF COMPLET ---
  const downloadDailyPDF = async (date: string, visitsOfTheDay: VisitRow[]) => {
    if (typeof window === "undefined") return;

    const html2pdfModule = await import("html2pdf.js");
    const html2pdf = html2pdfModule.default as unknown as () => Html2PdfInstance;

    // 1. Stats par Statut / Catégorie d'usager x Genre
    const statsByUserType: Record<string, GenderStat> = {};
    // 2. Stats par École / Établissement x Genre
    const statsBySchool: Record<string, GenderStat> = {};
    // 3. Stats par Filière x Genre
    const statsByFiliere: Record<string, GenderStat> = {};
    // 4. Stats par Motif
    const statsByMotif: Record<string, number> = {};

    let totalHommes = 0;
    let totalFemmes = 0;

    visitsOfTheDay.forEach((v) => {
      const sex = v.user.sex === "F" ? "F" : "M";
      if (sex === "M") totalHommes++;
      else totalFemmes++;

      // Catégorie
      const typeLabel = userTypeLabels[v.user.userType] || v.user.userType || "Autre";
      if (!statsByUserType[typeLabel]) statsByUserType[typeLabel] = { M: 0, F: 0 };
      statsByUserType[typeLabel][sex]++;

      // École / Établissement
      const schoolLabel = v.user.school && v.user.school.trim() !== "" ? v.user.school : "Non renseignée";
      if (!statsBySchool[schoolLabel]) statsBySchool[schoolLabel] = { M: 0, F: 0 };
      statsBySchool[schoolLabel][sex]++;

      // Filière
      const filiereLabel = v.user.filiere && v.user.filiere.trim() !== "" ? v.user.filiere : "Non renseignée";
      if (!statsByFiliere[filiereLabel]) statsByFiliere[filiereLabel] = { M: 0, F: 0 };
      statsByFiliere[filiereLabel][sex]++;

      // Motif
      const motifLabel = motifLabels[v.motif] || v.motif;
      statsByMotif[motifLabel] = (statsByMotif[motifLabel] || 0) + 1;
    });

    // 5. Satisfaction
    const ratedVisits = visitsOfTheDay.filter((v) => v.satisfactionRating !== null);
    const avgRating = ratedVisits.length
      ? (
          ratedVisits.reduce((acc, v) => acc + (v.satisfactionRating || 0), 0) /
          ratedVisits.length
        ).toFixed(1)
      : "N/A";

    const negativeReviews = visitsOfTheDay.filter(
      (v) => v.satisfactionRating !== null && v.satisfactionRating <= 2
    );

    const reportContainer = document.createElement("div");
    reportContainer.style.padding = "20px";
    reportContainer.style.fontFamily = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    reportContainer.style.color = "#0f172a";

    reportContainer.innerHTML = `
      <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px;">
        <h2 style="margin: 0; font-size: 18px; color: #0f172a; text-transform: uppercase;">
          Rapport Statistique de Fréquentation & Satisfaction
        </h2>
        <p style="margin: 4px 0 0 0; color: #0284c7; font-size: 13px; font-weight: bold;">
          Journée du ${formatDate(date)}
        </p>
      </div>

      <!-- SYNTHÈSE GLOBALE -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; background-color: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px;">
        <div><strong>Total Fréquentation :</strong> ${visitsOfTheDay.length}</div>
        <div><strong>Hommes :</strong> ${totalHommes} | <strong>Femmes :</strong> ${totalFemmes}</div>
        <div><strong>Note Moyenne :</strong> ${avgRating} / 5 (${ratedVisits.length} avis)</div>
      </div>

      <!-- SECTION 1 : PAR STATUT / CATÉGORIE -->
      <h4 style="margin: 12px 0 6px 0; font-size: 13px; color: #0284c7;">1. Répartition par Statut / Catégorie d'usager</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">Statut</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 70px;">Hommes</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 70px;">Femmes</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(statsByUserType)
            .map((cat) => {
              const row = statsByUserType[cat];
              return `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 5px;">${cat}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${row.M}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${row.F}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-weight: bold;">${row.M + row.F}</td>
              </tr>`;
            })
            .join("")}
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td style="border: 1px solid #cbd5e1; padding: 5px;">TOTAL GENERAL</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${totalHommes}</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${totalFemmes}</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; color: #0284c7;">${visitsOfTheDay.length}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 2 : PAR ÉCOLE / ENTITÉ -->
      <h4 style="margin: 12px 0 6px 0; font-size: 13px; color: #0284c7;">2. Répartition par École / Établissement</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">École / Entité</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 70px;">Hommes</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 70px;">Femmes</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(statsBySchool)
            .map((sch) => {
              const row = statsBySchool[sch];
              return `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 5px;">${sch}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${row.M}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${row.F}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-weight: bold;">${row.M + row.F}</td>
              </tr>`;
            })
            .join("")}
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td style="border: 1px solid #cbd5e1; padding: 5px;">TOTAL GENERAL</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${totalHommes}</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${totalFemmes}</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; color: #0284c7;">${visitsOfTheDay.length}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 3 : PAR FILIÈRE -->
      <h4 style="margin: 12px 0 6px 0; font-size: 13px; color: #0284c7;">3. Répartition par Filière d'étude</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">Filière</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 70px;">Hommes</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 70px;">Femmes</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 80px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(statsByFiliere)
            .map((fil) => {
              const row = statsByFiliere[fil];
              return `
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 5px;">${fil}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${row.M}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${row.F}</td>
                <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-weight: bold;">${row.M + row.F}</td>
              </tr>`;
            })
            .join("")}
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td style="border: 1px solid #cbd5e1; padding: 5px;">TOTAL GENERAL</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${totalHommes}</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center;">${totalFemmes}</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; color: #0284c7;">${visitsOfTheDay.length}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 4 : PAR MOTIF DE VISITE -->
      <h4 style="margin: 12px 0 6px 0; font-size: 13px; color: #0284c7;">4. Répartition par Motif de Visite</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: left;">Motif</th>
            <th style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; width: 80px;">Nombre</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(statsByMotif)
            .map(
              (m) => `
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 5px;">${m}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-weight: bold;">${statsByMotif[m]}</td>
            </tr>`
            )
            .join("")}
          <tr style="background-color: #f8fafc; font-weight: bold;">
            <td style="border: 1px solid #cbd5e1; padding: 5px;">TOTAL MOTIFS</td>
            <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; color: #0284c7;">${visitsOfTheDay.length}</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 5 : AVIS ET INSATISFACTIONS -->
      <h4 style="margin: 12px 0 6px 0; font-size: 13px; color: #0284c7;">5. Remarques et Insatisfactions (Notes ≤ 2/5)</h4>
      ${
        negativeReviews.length === 0
          ? `<p style="font-size: 11px; color: #16a34a; font-style: italic;">Aucune insatisfaction enregistrée pour cette journée.</p>`
          : `
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background-color: #fef2f2; color: #991b1b;">
              <th style="border: 1px solid #fecaca; padding: 5px; text-align: left; width: 60px;">Note</th>
              <th style="border: 1px solid #fecaca; padding: 5px; text-align: left;">Raison / Remarque</th>
            </tr>
          </thead>
          <tbody>
            ${negativeReviews
              .map(
                (r) => `
              <tr>
                <td style="border: 1px solid #fecaca; padding: 5px; font-weight: bold; color: #dc2626;">${r.satisfactionRating} / 5</td>
                <td style="border: 1px solid #fecaca; padding: 5px;">${r.satisfactionReason || "Aucun motif précisé"}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`
      }
    `;

    const opt: Html2PdfOptions = {
      margin: 10,
      filename: `rapport-statistiques-${date}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(reportContainer).save();
  };

  // Groupement par date
  const visitsByDay = filteredVisits.reduce((groups: Record<string, VisitRow[]>, visit) => {
    const date = visit.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(visit);
    return groups;
  }, {});

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
        <p>Chargement des données de statistiques...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      {error && (
        <div style={{ color: "#dc2626", backgroundColor: "#fef2f2", padding: "12px", borderRadius: "6px", border: "1px solid #fecaca", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* FILTRES D'AFFICHAGE */}
      <div style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px", display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontWeight: "700", fontSize: "13px", color: "#334155" }}>Filtres :</span>

        <select
          value={filterUserType}
          onChange={(e) => setFilterUserType(e.target.value)}
          style={selectStyle}
        >
          <option value="all">Tous les statuts</option>
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

      {/* AFFICHAGE DES REGISTRES */}
      {Object.keys(visitsByDay).length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          Aucun enregistrement correspondant aux filtres.
        </div>
      ) : (
        Object.keys(visitsByDay).map((date) => {
          const dayVisits = visitsByDay[date];
          return (
            <div key={date} style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "15px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>
                    Journée du {formatDate(date)}
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>{dayVisits.length} enregistrement(s)</span>
                </div>
                <button
                  onClick={() => downloadDailyPDF(date, dayVisits)}
                  style={{ padding: "8px 14px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                >
                  Télécharger Rapport PDF
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", textAlign: "left" }}>
                      <th style={thStyle}>Ticket</th>
                      <th style={thStyle}>Nom & Prénom</th>
                      <th style={thStyle}>Statut</th>
                      <th style={thStyle}>École</th>
                      <th style={thStyle}>Filière</th>
                      <th style={thStyle}>Sexe</th>
                      <th style={thStyle}>Motif</th>
                      <th style={thStyle}>Horaires</th>
                      <th style={thStyle}>Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayVisits.map((visite) => (
                      <tr key={visite.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#0284c7" }}>{visite.ticketNumber}</td>
                        <td style={{ ...tdStyle, fontWeight: "600" }}>{visite.user.fullName}</td>
                        <td style={tdStyle}>{userTypeLabels[visite.user.userType] || visite.user.userType}</td>
                        <td style={tdStyle}>{visite.user.school}</td>
                        <td style={tdStyle}>{visite.user.filiere}</td>
                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: "bold" }}>{visite.user.sex}</td>
                        <td style={tdStyle}>{motifLabels[visite.motif] || visite.motif}</td>
                        <td style={tdStyle}>
                          <span style={{ color: "#16a34a", fontWeight: "600" }}>{visite.arrivalAt}</span> -{" "}
                          {visite.departureAt ? (
                            <span style={{ color: "#dc2626", fontWeight: "600" }}>{visite.departureAt}</span>
                          ) : (
                            <span style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "2px 6px", borderRadius: "10px", fontSize: "11px" }}>En cours</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          {visite.satisfactionRating ? (
                            <div>
                              <span style={{ fontWeight: "bold", color: visite.satisfactionRating <= 2 ? "#dc2626" : "#16a34a" }}>
                                {visite.satisfactionRating}/5
                              </span>
                              {visite.satisfactionReason && (
                                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#64748b" }}>
                                  "{visite.satisfactionReason}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "11px" }}>—</span>
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