import { UserQuitus } from "@/app/(dashboard)/profil/QuitusPrint";

export function generateQuitusHTML(q: UserQuitus): string {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8">
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        color: #1e293b;
        background: #ffffff;
      }
      .quitus-container {
        padding: 30px;
        background: #ffffff;
        border: 8px solid #0f172a;
        border-radius: 4px;
        position: relative;
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
        letter-spacing: 0.5px;
      }
      .header p {
        margin: 0;
        font-size: 12px;
        color: #2563eb;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .title-section {
        text-align: center;
        margin-bottom: 24px;
      }
      .badge-official {
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
      }
      .main-title {
        margin: 0 0 6px 0;
        font-size: 20px;
        color: #0f172a;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .quitus-number {
        display: inline-block;
        background: #1e293b;
        color: #ffffff;
        font-weight: 700;
        font-size: 14px;
        padding: 4px 16px;
        border-radius: 6px;
        letter-spacing: 1px;
      }
      .info-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        font-size: 13px;
        border: 1px solid #e2e8f0;
      }
      .info-table td {
        padding: 9px 14px;
        vertical-align: middle;
      }
      .info-table tr.alt {
        background: #f8fafc;
      }
      .info-table tr {
        border-bottom: 1px solid #e2e8f0;
      }
      .label-col {
        width: 200px;
        font-weight: 700;
        color: #475569;
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
      .instructions-title {
        font-weight: 800;
        font-size: 11px;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .instructions ul {
        margin: 0;
        padding-left: 18px;
        line-height: 1.5;
        color: #0369a1;
        font-weight: 600;
      }
      .signature-table {
        width: 100%;
        margin-bottom: 15px;
      }
      .footer-table {
        width: 100%;
        font-size: 10px;
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="quitus-container">
      <!-- En-tête Institutionnel -->
      <div class="header">
        <h3>République du Bénin</h3>
        <h2>École Nationale d'Administration et de Magistrature</h2>
        <p>Service de la Documentation et des Archives — Abomey-Calavi</p>
      </div>

      <!-- Titre Principal + Badge Quitus -->
      <div class="title-section">
        <span class="badge-official">Document Officiel</span>
        <h1 class="main-title">Quitus Provisoire de Dépôt Numérique</h1>
        <div class="quitus-number">N° ${q.quitusNumber}</div>
      </div>

      <!-- Grille d'Informations (Tableau HTML natif pour rendu PDF) -->
      <table class="info-table">
        <tr class="alt">
          <td class="label-col">Impétrant(e) :</td>
          <td style="font-weight: 700; color: #0f172a; font-size: 14px;">
            ${q.fullName} ${q.matricule ? `(${q.matricule})` : ""}
          </td>
        </tr>
        <tr>
          <td class="label-col">Titre du mémoire :</td>
          <td style="color: #0f172a; font-weight: 600; line-height: 1.4;">${q.title}</td>
        </tr>
        <tr class="alt">
          <td class="label-col">Filière / Spécialité :</td>
          <td style="color: #0f172a;">${q.filiere || "-"}</td>
        </tr>
        <tr>
          <td class="label-col">Année académique :</td>
          <td style="color: #0f172a;">${q.academicYear || "-"}</td>
        </tr>
        <tr class="alt">
          <td class="label-col">Directeur de mémoire :</td>
          <td style="color: #0f172a;">${q.supervisor || "-"}</td>
        </tr>
        <tr>
          <td class="label-col">Lieu de stage :</td>
          <td style="color: #0f172a;">${q.internshipLocation || "-"}</td>
        </tr>
        <tr class="alt">
          <td class="label-col">Mention obtenue :</td>
          <td style="color: #16a34a; font-weight: 700;">${q.mention || "-"}</td>
        </tr>
        <tr>
          <td class="label-col">Date de validation :</td>
          <td style="color: #0f172a;">${q.approvedAt || "-"}</td>
        </tr>
      </table>

      <!-- Attestation Textuelle -->
      <p class="attestation">
        Le présent document atteste officiellement de la conformité du <strong>dépôt numérique</strong> du mémoire de M./Mme <strong>${q.fullName}</strong> auprès du Service de la Documentation et des Archives de l'ENAM.
      </p>

      <!-- Encadré d'Information : Pièces Physiques à Déposer -->
      <div class="instructions">
        <div class="instructions-title">
          📌 Instructions pour la délivrance du Quitus DÉFINITIF
        </div>
        <p style="margin: 0 0 6px 0; line-height: 1.4; color: #0c4a6e;">
          L'étudiant(e) doit se présenter à la bibliothèque muni(e) de ce document imprimé ainsi que des pièces obligatoires suivantes :
        </p>
        <ul>
          <li>Version papier du mémoire signée par le Président du Jury</li>
          <li>Version numérique complète du mémoire enregistrée sur CD</li>
          <li>Quitus de la comptabilité / SIF</li>
          <li>Quittances certifiées de paiement des frais d'établissement des actes</li>
        </ul>
      </div>

      <!-- Bloc Signature -->
      <table class="signature-table">
        <tr>
          <td></td>
          <td style="text-align: center; width: 220px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 40px;">
              Le Chef du Service
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #0f172a; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
              Cadnel HOUNSA
            </div>
          </td>
        </tr>
      </table>

      <!-- Pied de Page / Contact -->
      <table class="footer-table">
        <tr>
          <td style="text-align: left;">
            <strong>Horaire Guichet :</strong> Lundi à Vendredi (9h00 – 18h30)
          </td>
          <td style="text-align: right;">
            <strong>Contact :</strong> +229 99 90 14 93 | enambeninbibliotheque@gmail.com
          </td>
        </tr>
      </table>
    </div>
  </body>
  </html>
  `;
}