"use client";
import React, { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

export default function AdminPage() {
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
    recherche: "Recherche documentaire"
  };

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/admin/visits");
      if (!response.ok) throw new Error("Impossible de récupérer les enregistrements.");
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

  // Formatage des dates DD/MM/YYYY
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "—";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
  };

  // --- FONCTION DE TÉLÉCHARGEMENT DU RAPPORT PDF STATS ---
  const downloadDailyPDF = async (date: string, visitsOfTheDay: VisitRow[]) => {
    const formattedDate = formatDate(date);
    const fileName = `rapport-stats-salle-${date}.pdf`;

    // 1. Calcul des statistiques consolidées
    const stats = visitsOfTheDay.reduce((acc, visit) => {
      const school = visit.user.school || "Inconnu";
      const filiere = visit.user.filiere || "Inconnue";
      const sex = visit.user.sex || "N/A";

      if (!acc[school]) acc[school] = {};
      if (!acc[school][filiere]) acc[school][filiere] = { M: 0, F: 0, Autre: 0 };
      
      const sexKey = sex === 'M' || sex === 'F' ? sex : 'Autre';
      acc[school][filiere][sexKey]++;
      
      return acc;
    }, {} as Record<string, Record<string, { M: number; F: number; Autre: number }>>);

    // 2. Création de l'élément DOM temporaire
    const reportContainer = document.createElement('div');
    reportContainer.style.padding = '40px';
    reportContainer.style.width = '750px'; 
    reportContainer.style.fontFamily = 'Arial, sans-serif';
    reportContainer.style.color = '#333';
    reportContainer.style.backgroundColor = '#fff';
    reportContainer.style.position = 'absolute';
    reportContainer.style.left = '-9999px'; 

    let tablesHtml = '';
    Object.keys(stats).forEach(school => {
      tablesHtml += `
        <div style="margin-bottom: 25px;">
          <h3 style="background-color: #0369a1; color: white; padding: 10px 14px; margin-bottom: 10px; border-radius: 4px; font-size: 16px;">
            Établissement : ${school}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
            <thead>
              <tr>
                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: left; background-color: #f8fafc;">Filière</th>
                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; background-color: #f8fafc; width: 80px;">Hommes (M)</th>
                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; background-color: #f8fafc; width: 80px;">Femmes (F)</th>
                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; background-color: #f8fafc; width: 80px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${Object.keys(stats[school]).map(filiere => {
                const s = stats[school][filiere];
                const totalFiliere = s.M + s.F + s.Autre;
                return `
                  <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 10px;">${filiere}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #0284c7;">${s.M}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #ec4899;">${s.F}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; background-color: #f1f5f9;">${totalFiliere}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    });

    reportContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0369a1; padding-bottom: 15px;">
        <h1 style="margin: 0; font-size: 22px; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
          Rapport Statistique des Fréquentations
        </h1>
        <p style="margin: 5px 0 0 0; color: #64748b; font-size: 14px; font-weight: bold;">
          Journée du ${formattedDate}
        </p>
      </div>
      <div style="margin-bottom: 25px; font-size: 14px; color: #475569;">
        <strong>Total des entrées enregistrées :</strong> ${visitsOfTheDay.length}
      </div>
      ${tablesHtml}
    `;

    document.body.appendChild(reportContainer);

    try {
      // 3. Transformation en Canvas puis PDF
      const canvas = await html2canvas(reportContainer, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Largeur A4 en mm
      const pageHeight = 297; // Hauteur A4 en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
    } catch (err) {
      console.error("Erreur génération PDF:", err);
    } finally {
      document.body.removeChild(reportContainer);
    }
  };

  // --- STATS GLOBALES ---
  const todayIso = new Date().toISOString().split("T")[0];
  const totalUniqueUsers = new Set(dataVisits.map((v) => v.user.fullName)).size;
  const dailyVisitsCount = dataVisits.filter((v) => v.date === todayIso).length;

  // --- GROUPEMENT PAR JOUR ---
  const visitsByDay = dataVisits.reduce((groups: Record<string, VisitRow[]>, visit) => {
    const date = visit.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(visit);
    return groups;
  }, {});

  if (loading) {
    return <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Chargement du panneau de contrôle...</div>;
  }

  return (
    <div className="admin-view">
      {error && (
        <div style={{ color: "#e53e3e", backgroundColor: "#fff5f5", padding: "12px", borderRadius: "6px", border: "1px solid #fed7d7", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* GRILLE DE STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Usagers</h3>
          <p className="stat-number">{totalUniqueUsers}</p>
          <span className="stat-label">Ayant fréquenté la salle</span>
        </div>
        <div className="stat-card">
          <h3>Documents</h3>
          <p className="stat-number">3,500</p>
          <span className="stat-label">Mémoires & Revues</span>
        </div>
        <div className="stat-card">
          <h3>Visites du jour</h3>
          <p className="stat-number">{dailyVisitsCount}</p>
          <span className="stat-label">Enregistrements salle</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px", marginBottom: "15px" }}>
        <h3 style={{ margin: 0 }}>Gestion des entrées / sorties par journée</h3>
        <button 
          onClick={fetchAdminData} 
          style={{ padding: "6px 12px", fontSize: "0.85rem", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          <i className="fa-solid fa-rotate"></i> Actualiser
        </button>
      </div>

      {/* RENDER DES LISTES PAR BLOC DE JOUR */}
      {Object.keys(visitsByDay).length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px", backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          Aucun enregistrement trouvé dans la base de données.
        </div>
      ) : (
        Object.keys(visitsByDay).map((date) => {
          const dayVisits = visitsByDay[date];
          return (
            <div key={date} className="users-section" style={{ backgroundColor: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
              
              {/* Entête avec bouton PDF */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px", marginBottom: "15px" }}>
                <h4 style={{ margin: 0, fontSize: "1.1rem", color: "#1e293b", fontWeight: "600" }}>
                  Journée du {formatDate(date)} <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "normal", marginLeft: "10px" }}>({dayVisits.length} entrées)</span>
                </h4>
                <button
                  onClick={() => downloadDailyPDF(date, dayVisits)}
                  style={{ padding: "6px 14px", backgroundColor: "#dc2626", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "500", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <i className="fa-solid fa-file-pdf"></i> PDF Stats
                </button>
              </div>

              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Nom & Prénom</th>
                      <th>Sexe</th>
                      <th>Établissement & Filière</th>
                      <th>Téléphone</th>
                      <th>Motif de visite</th>
                      <th>Arrivée</th>
                      <th>Sortie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayVisits.map((visite) => (
                      <tr key={visite.id}>
                        <td style={{ fontWeight: "bold", color: "#0369a1" }}>{visite.ticketNumber}</td>
                        <td style={{ fontWeight: "600" }}>{visite.user.fullName}</td>
                        <td>{visite.user.sex}</td>
                        <td>
                          <span style={{ fontSize: "0.8rem", backgroundColor: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", marginRight: "5px", fontWeight: "500" }}>
                            {visite.user.school}
                          </span>
                          {visite.user.filiere}
                        </td>
                        <td>{visite.user.phone || "—"}</td>
                        <td style={{ fontStyle: "italic" }}>{motifLabels[visite.motif] || visite.motif}</td>
                        <td style={{ color: "#16a34a", fontWeight: "500" }}>{visite.arrivalAt}</td>
                        <td>
                          {visite.departureAt ? (
                            <span style={{ color: "#dc2626", fontWeight: "500" }}>{visite.departureAt}</span>
                          ) : (
                            <span style={{ color: "#d97706", backgroundColor: "#fef3c7", padding: "3px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
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