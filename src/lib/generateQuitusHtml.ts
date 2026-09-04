export interface UserQuitusData {
  quitusNumber: string;
  fullName: string;
  matricule?: string | null;
  title: string;
  filiere?: string | null;
  academicYear?: string | null;
  supervisor?: string | null;
  internshipLocation?: string | null;
  mention?: string | null;
  approvedAt?: string | null;
}

export function generateQuitusHTML(q: UserQuitusData): string {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1e293b;
        background: #ffffff;
        margin: 0;
        padding: 20px;
      }
      .quitus-container {
        box-sizing: border-box;
        padding: 30px;
        background: #ffffff;
        border: 8px solid #0f172a;
        border-radius: 4px;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 16px;
        margin-bottom: 24px;
      }
      .header h3 {
        margin: 0;
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 1.5px;
        color: #64748b;
        font-weight: 700;
      }
      .header h2 {
        margin: 6px 0 2px 0;
        font-size: 15px;
        text-transform: uppercase;
        color: #0f172a;
        font-weight: 800;
      }
      .header p {
        margin: 0;
        font-size: 12px;
        color: #2563eb;
        font-weight: 600;
        text-transform: uppercase;
      }
      .title-section {
        text-align: center;
        margin-bottom: 24px;
      }
      .badge {
        display: inline-block;
        background-color: #f1f5f9;
        color: #475569;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 20px;
        text-transform: uppercase;
        margin-bottom: 8px;
      }
      .main-title {
        margin: 0 0 6px 0;
        font-size: 20px;
        color: #0f172a;
        font-weight: 800;
        text-transform: uppercase;
      }
      .quitus-number {
        display: inline-block;
        background: #1e293b;
        color: #ffffff;
        font-weight: 700;
        font-size: 14px;
        padding: 4px 16px;
        border-radius: 6px;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 20px;
        font-size: 13px;
      }
      .info-table td {
        padding: 9px 14px;
        border-bottom: 1px solid #e2e8f0;
      }
      .info-table tr:nth-child(even) {
        background-color: #ffffff;
      }
      .info-table tr:nth-child(odd) {
        background-color: #f8fafc;
      }
      .label {
        width: 200px;
        font-weight: 700;
        color: #475569;
      }
      .val {
        color: #0f172a;
      }
      .attestation {
        font-size: 12px;
        color: #334155;
        text-align: justify;
        line-height: 1.5;
        background: #f8fafc;
        padding: 10px 12px;
        border-radius: 6px;
        border-left: 4px solid #2563eb;
        margin-bottom: 18px;
      }
      .instructions {
        background-color: #f0f9ff;
        border: 1px solid #bae6fd;
        padding: 12px 14px;
        border-radius: 8px;
        font-size: 11px;
        color: #0369a1;
        margin-bottom: 20px;
      }
      .signature-block {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 15px;
      }
      .signature-box {
        text-align: center;
        width: 220px;
        float: right;
      }
      .footer {
        clear: both;
        display: flex;
        justify-content: space-between;
        font-size: 10px;
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
        color: #64748b;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="quitus-container">
      <div class="header">
        <h3>République du Bénin</h3>
        <h2>École Nationale d'Administration</h2>
        <p>Service de la Documentation et des Archives — Abomey-Calavi</p>
      </div>

      <div class="title-section">
        <span class="badge">Document Officiel</span>
        <h1 class="main-title">Quitus Provisoire de Dépôt Numérique</h1>
        <div class="quitus-number">N° ${q.quitusNumber}</div>
      </div>

      <table class="info-table">
        <tr>
          <td class="label">Impétrant(e) :</td>
          <td class="val" style="font-weight: 700; font-size: 14px;">
            ${q.fullName} ${q.matricule ? `(${q.matricule})` : ""}
          </td>
        </tr>
        <tr>
          <td class="label">Titre du mémoire :</td>
          <td class="val" style="font-weight: 600;">${q.title}</td>
        </tr>
        <tr>
          <td class="label">Filière / Spécialité :</td>
          <td class="val">${q.filiere || "-"}</td>
        </tr>
        <tr>
          <td class="label">Année académique :</td>
          <td class="val">${q.academicYear || "-"}</td>
        </tr>
        <tr>
          <td class="label">Directeur de mémoire :</td>
          <td class="val">${q.supervisor || "-"}</td>
        </tr>
        <tr>
          <td class="label">Lieu de stage :</td>
          <td class="val">${q.internshipLocation || "-"}</td>
        </tr>
        <tr>
          <td class="label">Mention obtenue :</td>
          <td class="val" style="color: #16a34a; font-weight: 700;">${q.mention || "-"}</td>
        </tr>
        <tr>
          <td class="label">Date de validation :</td>
          <td class="val">${q.approvedAt || "-"}</td>
        </tr>
      </table>

      <p class="attestation">
        Le présent document atteste officiellement de la conformité du <strong>dépôt numérique</strong> du mémoire de M./Mme <strong>${q.fullName}</strong> auprès du Service de la Documentation et des Archives de l'ENAM.
      </p>

      <div class="instructions">
        <div style="font-weight: 800; margin-bottom: 6px; text-transform: uppercase;">
          📌 Instructions pour la délivrance du Quitus DÉFINITIF
        </div>
        <p style="margin: 0 0 6px 0;">
          L'étudiant(e) doit se présenter à la bibliothèque muni(e) de ce document imprimé ainsi que des pièces obligatoires suivantes :
        </p>
        <ul style="margin: 0; padding-left: 18px; font-weight: 600;">
          <li>Version papier du mémoire signée par le Président du Jury</li>
          <li>Version numérique complète du mémoire enregistrée sur CD</li>
          <li>Quitus de la comptabilité / SIF</li>
          <li>Quittances certifiées de paiement des frais d'établissement des actes</li>
        </ul>
      </div>

      <div class="signature-block">
        <div class="signature-box">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 40px;">
            Le Chef du Service
          </div>
          <div style="font-size: 12px; font-weight: 800; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            Cadnel HOUNSA
          </div>
        </div>
      </div>

      <div class="footer">
        <div><strong>Horaire:</strong> Lundi à Vendredi (9h00 – 18h30)</div>
        <div><strong>Contact :</strong> +229 99 90 14 93 | enambeninbibliotheque@gmail.com</div>
      </div>
    </div>
  </body>
  </html>
  `;
}