"use client";

import React, { useState } from "react";

export interface UserQuitus {
  id: string;
  title: string;
  fullName: string;
  matricule?: string | null;
  filiere: string | null;
  academicYear: string | null;
  supervisor: string | null;
  internshipLocation: string | null;
  quitusNumber: string;
  defenseDate: string | null;
  mention: string | null;
  approvedAt: string | null;
  year: string | null;
  status?: string;
  physicalDepositStatus?: "pending" | "verified";
}

export const downloadQuitusPDF = async (q: UserQuitus) => {
  if (typeof window === "undefined") return;

  const html2pdf = (await import("html2pdf.js")).default;

  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  element.style.color = "#1e293b";
  element.style.lineHeight = "1.5";
  element.style.width = "750px";

  element.innerHTML = `
  <div style="
    box-sizing: border-box;
    padding: 30px;
    background: #ffffff;
    border: 8px solid #0f172a;
    border-radius: 4px;
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    color: #1e293b;
    position: relative;
  ">
    <!-- En-tête Institutionnel -->
    <div style="text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px;">
      <h3 style="margin: 0; text-transform: uppercase; font-size: 11px; letter-spacing: 1.5px; color: #64748b; font-weight: 700;">
        République du Bénin
      </h3>
      <h2 style="margin: 6px 0 2px 0; font-size: 15px; text-transform: uppercase; color: #0f172a; font-weight: 800; letter-spacing: 0.5px;">
        École Nationale d'Administration et de Magistrature
      </h2>
      <p style="margin: 0; font-size: 12px; color: #2563eb; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
        Service de la Documentation et des Archives — Abomey-Calavi
      </p>
    </div>

    <!-- Titre Principal + Badge Quitus -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="
        display: inline-block;
        background-color: #f1f5f9;
        color: #475569;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
      ">
        Document Officiel
      </span>
      <h1 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
        Quitus Provisoire de Dépôt Numérique
      </h1>
      <div style="
        display: inline-block;
        background: #1e293b;
        color: #ffffff;
        font-weight: 700;
        font-size: 14px;
        padding: 4px 16px;
        border-radius: 6px;
        letter-spacing: 1px;
      ">
        N° ${q.quitusNumber}
      </div>
    </div>

    <!-- Grille d'Informations -->
    <div style="
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
      font-size: 13px;
    ">
      <div style="display: flex; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 9px 14px;">
        <span style="width: 200px; font-weight: 700; color: #475569;">Impétrant(e) :</span>
        <span style="flex: 1; font-weight: 700; color: #0f172a; font-size: 14px;">${q.fullName} ${q.matricule ? `(${q.matricule})` : ""}</span>
      </div>
      <div style="display: flex; background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 9px 14px;">
        <span style="width: 200px; font-weight: 700; color: #475569;">Titre du mémoire :</span>
        <span style="flex: 1; color: #0f172a; font-weight: 600; line-height: 1.4;">${q.title}</span>
      </div>
      <div style="display: flex; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 9px 14px;">
        <span style="width: 200px; font-weight: 700; color: #475569;">Filière / Spécialité :</span>
        <span style="flex: 1; color: #0f172a;">${q.filiere || "-"}</span>
      </div>
      <div style="display: flex; background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 9px 14px;">
        <span style="width: 200px; font-weight: 700; color: #475569;">Année académique :</span>
        <span style="flex: 1; color: #0f172a;">${q.academicYear || "-"}</span>
      </div>
      <div style="display: flex; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 9px 14px;">
        <span style="width: 200px; font-weight: 700; color: #475569;">Directeur de mémoire :</span>
        <span style="flex: 1; color: #0f172a;">${q.supervisor || "-"}</span>
      </div>
      <div style="display: flex; background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 9px 14px;">
        <span style="width: 200px; font-weight: 700; color: #475569;">Lieu de stage :</span>
        <span style="flex: 1; color: #0f172a;">${q.internshipLocation || "-"}</span>
      </div>
     
      <div style="display: flex; background: #ffffff; padding: 9px 14px;">
        <span style="width: 200px; font-weight: 700; color: #475569;">Date de validation :</span>
        <span style="flex: 1; color: #0f172a;">${q.approvedAt || "-"}</span>
      </div>
    </div>

    <!-- Attestation Textuelle -->
    <p style="
      font-size: 12px;
      color: #334155;
      text-align: justify;
      line-height: 1.5;
      background: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      border-left: 4px solid #2563eb;
      margin-bottom: 18px;
    ">
      Le présent document atteste officiellement de la conformité du <strong>dépôt numérique</strong> du mémoire de M./Mme <strong>${q.fullName}</strong> auprès du Service de la Documentation et des Archives de l'ENAM.
    </p>

    <!-- Encadré d'Information : Pièces Physiques à Dépôser -->
    <div style="
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      padding: 12px 14px;
      border-radius: 8px;
      font-size: 11px;
      color: #0369a1;
      margin-bottom: 20px;
    ">
      <div style="font-weight: 800; font-size: 11px; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
        📌 Instructions pour la délivrance du Quitus DÉFINITIF
      </div>
      <p style="margin: 0 0 6px 0; line-height: 1.4; color: #0c4a6e;">
        L'étudiant(e) doit se présenter à la bibliothèque muni(e) de ce document imprimé ainsi que des pièces obligatoires suivantes :
      </p>
      <ul style="margin: 0; padding-left: 18px; line-height: 1.5; color: #0369a1; font-weight: 600;">
        <li>Version papier du mémoire signée par le Président du Jury</li>
        <li>Version numérique complète du mémoire enregistrée sur CD</li>
        <li>Quitus de la comptabilité / CIRF</li>
        <li>Quittances certifiées de paiement des frais d'établissement des actes</li>
      </ul>
    </div>

    <!-- Bloc Signature -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
      <div style="text-align: center; width: 220px;">
        <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 40px;">
          Le Chef du Service
        </div>
        <div style="font-size: 12px; font-weight: 800; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
          Cadnel HOUNSA
        </div>
      </div>
    </div>

    <!-- Pied de Page / Contact -->
    <div style="display: flex; justify-content: space-between; gap: 12px; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px; color: #64748b;">
      <div>
        <strong>Horaire:</strong> Lundi à Vendredi (9h00 – 18h30)
      </div>
      <div>
        <strong>Contact :</strong> +229 99 90 14 93 | enambeninbibliotheque@gmail.com
      </div>
    </div>
  </div>
`;

  const opt: any = {
    margin: 10,
    filename: `Quitus_Provisoire_${q.quitusNumber}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  await html2pdf().set(opt).from(element).save();
};

export default function QuitusSection({ quitusList }: { quitusList: UserQuitus[] }) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!quitusList || quitusList.length === 0) return null;

  const handleDownload = async (item: UserQuitus) => {
    try {
      setDownloadingId(item.id);
      await downloadQuitusPDF(item);
    } catch (error) {
      console.error("Erreur téléchargement PDF :", error);
      alert("Une erreur est survenue lors du téléchargement du PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      className="quitus-card"
      style={{
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "25px",
      }}
    >
      <h3 style={{ color: "#166534", marginTop: 0, display: "flex", alignItems: "center", gap: "10px" }}>
        <i className="fa-solid fa-certificate"></i> Vos Quitus Provisoires Disponibles
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
        {quitusList.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#fff",
              padding: "14px 18px",
              borderRadius: "6px",
              border: "1px solid #e2e8f0",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <div>
              <strong style={{ color: "#0f172a", display: "block", fontSize: "1rem" }}>{item.title}</strong>
              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                <span>N° {item.quitusNumber} | Validé le : {item.approvedAt}</span>
              </div>
              
              {/* Badge de Dépôt Physique */}
              <div style={{ marginTop: "6px" }}>
                {item.physicalDepositStatus === "verified" ? (
                  <span style={{ fontSize: "0.75rem", backgroundColor: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                    <i className="fa-solid fa-circle-check"></i> Pièces physiques déposées à la bibliothèque
                  </span>
                ) : (
                  <span style={{ fontSize: "0.75rem", backgroundColor: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: "4px", fontWeight: "600" }}>
                    <i className="fa-solid fa-clock"></i> En attente du dépôt des pièces physiques (CD, Mémoire imprimé, etc.)
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleDownload(item)}
              disabled={downloadingId === item.id}
              style={{
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "6px",
                cursor: downloadingId === item.id ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: downloadingId === item.id ? 0.7 : 1,
              }}
            >
              {downloadingId === item.id ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Génération PDF...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-download"></i> Télécharger le Quitus PDF
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}