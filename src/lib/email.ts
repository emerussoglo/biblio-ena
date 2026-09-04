import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true uniquement pour le port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Évite les blocages de certificats SSL auto-signés
  },
});

const PROFILE_URL = "https://biblio-ena.vercel.app/profil";

export async function sendQuitusApprovalEmail({
  toEmail,
  studentName,
  memoireTitle,
  quitusNumber,
}: {
  toEmail: string;
  studentName: string;
  memoireTitle: string;
  quitusNumber: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Bibliothèque ENAM" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Validation numérique & Quitus Provisoire N° ${quitusNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px;">
          <h2 style="color: #0369a1; text-align: center; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">
            Bibliothèque de l'ENAM
          </h2>
          <p>Bonjour <strong>${studentName}</strong>,</p>
          <p>Votre mémoire intitulé :</p>
          <blockquote style="background-color: #f8fafc; border-left: 4px solid #0369a1; margin: 10px 0; padding: 10px; font-style: italic;">
            "${memoireTitle}"
          </blockquote>
          <p>a été <strong>validé sur le plan numérique</strong>.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <span style="color: #166534; font-weight: bold; font-size: 16px;">
              Numéro de Quitus Provisoire : ${quitusNumber}
            </span>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${PROFILE_URL}" target="_blank" style="background-color: #0284c7; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
              📄 Imprimer mon Quitus depuis mon Profil
            </a>
          </div>

          <h3 style="color: #1e293b; margin-top: 20px;">Procédure de dépôt physique à la bibliothèque :</h3>
          <p>Pour finaliser votre dossier, vous devez vous présenter en personne à la bibliothèque muni(e) des pièces suivantes :</p>
          <ul style="line-height: 1.6; color: #334155;">
            <li>Le présent <strong>Quitus Provisoire</strong> imprimé depuis votre espace usager.</li>
            <li>La <strong>version papier du mémoire</strong>, dûment signée par le Président du jury.</li>
            <li>La <strong>version numérique sur CD</strong>.</li>
            <li>Le <strong>quitus de comptabilité / quitus du SIF</strong>.</li>
            <li>Les <strong>quittances certifiées de paiement</strong> des frais d'établissement des actes.</li>
          </ul>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            Service de la Documentation et des Archives - ENAM Bénin
          </p>
        </div>
      `,
    });
    console.log("Email d'approbation envoyé :", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email d'approbation :", error);
    throw error;
  }
}

export async function sendQuitusRejectionEmail({
  toEmail,
  studentName,
  memoireTitle,
  reason,
}: {
  toEmail: string;
  studentName: string;
  memoireTitle: string;
  reason?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Bibliothèque ENAM" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Demande de correction - Dépôt de mémoire non conforme`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #dc2626; text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
            Bibliothèque de l'ENAM
          </h2>
          <p>Bonjour <strong>${studentName}</strong>,</p>
          <p>Votre dépôt numérique de mémoire concernant le sujet :</p>
          <blockquote style="background-color: #f8fafc; border-left: 4px solid #dc2626; margin: 10px 0; padding: 10px; font-style: italic;">
            "${memoireTitle}"
          </blockquote>
          <p>présente des non-conformités et requiert des corrections avant d'être validé.</p>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <strong style="color: #991b1b;">Points à corriger :</strong>
            <p style="margin-top: 5px; color: #7f1d1d;">${reason || "Informations incomplètes ou fichier non conforme."}</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${PROFILE_URL}" target="_blank" style="background-color: #dc2626; color: #ffffff; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 6px; display: inline-block;">
              ✏️ Mettre à jour mon dépôt sur mon Profil
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            Service de la Documentation et des Archives - ENAM Bénin
          </p>
        </div>
      `,
    });
    console.log("Email de rejet envoyé :", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de rejet :", error);
    throw error;
  }
}