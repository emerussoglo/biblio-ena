import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
  return await transporter.sendMail({
    from: `"Bibliothèque ENAM" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Validation de mémoire - Quitus N° ${quitusNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #0369a1; text-align: center; border-bottom: 2px solid #0369a1; padding-bottom: 10px;">
          Bibliothèque de l'ENAM
        </h2>
        <p>Bonjour <strong>${studentName}</strong>,</p>
        <p>Nous vous informons que le dépôt de votre mémoire intitulé :</p>
        <blockquote style="background-color: #f8fafc; border-left: 4px solid #0369a1; margin: 10px 0; padding: 10px; font-style: italic;">
          "${memoireTitle}"
        </blockquote>
        <p>a été <strong>validé avec succès</strong>.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <span style="color: #166534; font-weight: bold; font-size: 16px;">
            Numéro de Quitus Provisoire : ${quitusNumber}
          </span>
        </div>

        <p>Vous pouvez dès à présent vous connecter à votre espace personnel pour télécharger votre Quitus Provisoire au format PDF.</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">
          Service de la Documentation et des Archives - ENAM Bénin
        </p>
      </div>
    `,
  });
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
  return await transporter.sendMail({
    from: `"Bibliothèque ENAM" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Information concernant votre dépôt de mémoire`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
        <h2 style="color: #dc2626; text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
          Bibliothèque de l'ENAM
        </h2>
        <p>Bonjour <strong>${studentName}</strong>,</p>
        <p>Votre dépôt de mémoire concernant le sujet :</p>
        <blockquote style="background-color: #f8fafc; border-left: 4px solid #dc2626; margin: 10px 0; padding: 10px; font-style: italic;">
          "${memoireTitle}"
        </blockquote>
        <p>n'a pas été validé par le service de la documentation.</p>

        ${
          reason
            ? `<p><strong>Motif indiqué :</strong> ${reason}</p>`
            : `<p>Veuillez vérifier les informations saisies et contacter la bibliothèque pour plus d'informations.</p>`
        }

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">
          Service de la Documentation et des Archives - ENAM Bénin
        </p>
      </div>
    `,
  });
}