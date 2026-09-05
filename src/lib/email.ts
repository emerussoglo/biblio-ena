import nodemailer from "nodemailer";
import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import { execSync } from "child_process";
import fs from "fs";
import { generateQuitusHTML, UserQuitusData } from "./generateQuitusHtml";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Détection automatique de Google Chrome ou Microsoft Edge sur Windows local
 */
function getLocalChromePath(): string {
  const paths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error("Aucun navigateur compatible (Chrome ou Edge) trouvé sur ce PC.");
}

/**
 * Génération du PDF isolée et sans conflit de protocole
 */
async function generatePdfBuffer(quitusData: UserQuitusData): Promise<Buffer> {
  const htmlContent = generateQuitusHTML(quitusData);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any = null;

  try {
    const isVercel = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";

    let executablePath = "";

    if (isVercel) {
      // Configuration Vercel Serverless
      executablePath = await chromium.executablePath();
    } else {
      // Configuration Développement Windows local
      executablePath = getLocalChromePath();
    }

    browser = await puppeteerCore.launch({
      args: isVercel ? chromium.args : ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfUint8Array = await page.pdf({
      format: "A4",
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
      printBackground: true,
    });

    return Buffer.from(pdfUint8Array);
  } catch (err) {
    console.error("Erreur lors de la génération du PDF :", err);
    throw err;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}

export async function sendQuitusApprovalEmail({
  toEmail,
  quitusData,
}: {
  toEmail: string;
  quitusData: UserQuitusData;
}) {
  try {
    const pdfBuffer = await generatePdfBuffer(quitusData);

    const info = await transporter.sendMail({
      from: `"Bibliothèque ENA" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Validation numérique & Quitus Provisoire N° ${quitusData.quitusNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px;">
          <h2 style="color: #0369a1; text-align: center; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">
            Bibliothèque de l'ENA
          </h2>
          <p>Bonjour <strong>${quitusData.fullName}</strong>,</p>
          <p>Votre mémoire intitulé :</p>
          <blockquote style="background-color: #f8fafc; border-left: 4px solid #0369a1; margin: 10px 0; padding: 10px; font-style: italic;">
            "${quitusData.title}"
          </blockquote>
          <p>a été <strong>validé sur le plan numérique</strong>.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <span style="color: #166534; font-weight: bold; font-size: 16px;">
              Numéro de Quitus Provisoire : ${quitusData.quitusNumber}
            </span>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #15803d;">
              📎 Votre Quitus Provisoire est directement joint à cet e-mail en pièce jointe (format PDF).
            </p>
          </div>

          <h3 style="color: #1e293b; margin-top: 20px;">Procédure de dépôt physique à la bibliothèque :</h3>
          <p>Pour finaliser votre dossier, vous devez vous présenter en personne à la bibliothèque muni(e) des pièces suivantes :</p>
          <ul style="line-height: 1.6; color: #334155;">
            <li>Le <strong>Quitus Provisoire ci-joint</strong> (à imprimer).</li>
            <li>La <strong>version papier du mémoire</strong>, dûment signée par le Président du jury.</li>
            <li>La <strong>version numérique sur CD</strong>.</li>
            <li>Le <strong>quitus de comptabilité / quitus du CIRF</strong>.</li>
            <li>Les <strong>quittances certifiées de paiement</strong> des frais d'établissement des actes.</li>
          </ul>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            Service de la Documentation et des Archives - ENA Bénin
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Quitus_Provisoire_${quitusData.quitusNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log("Email de validation envoyé avec succès, ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de validation :", error);
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
      from: `"Bibliothèque ENA" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Demande de correction - Dépôt de mémoire non conforme`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #dc2626; text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
            Bibliothèque de l'ENA
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

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            Service de la Documentation et des Archives - ENA Bénin
          </p>
        </div>
      `,
    });

    console.log("Email de rejet envoyé avec succès, ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de rejet :", error);
    throw error;
  }
}