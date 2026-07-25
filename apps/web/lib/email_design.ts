export const email_design = (
  firstName: string,
  lastName: string,
  email: string,
  subject: string,
  message: string,
) => {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://kammerchor-elikuren.de"
  ).replace(/\/$/, "");
  const logoUrl = `${siteUrl}/Logo.svg`;

  return `
  <div style="font-family: Arial, sans-serif; background-color: #F4F1EB; padding: 40px 0;">
    
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06);">
      
      <!-- HEADER -->
      <div style="background: #1E3A2F; padding: 28px; text-align: center;">
        <img 
          src="${logoUrl}" 
          alt="Kammerchor Elikuren" 
          style="height: 48px; margin-bottom: 12px;"
        />
        <p style="color: #C8A24D; font-size: 12px; letter-spacing: 2px; margin: 0;">
          KONTAKTANFRAGE
        </p>
        <h1 style="color: white; font-size: 20px; font-weight: 400; margin-top: 6px;">
          Neue Nachricht
        </h1>
      </div>

      <!-- CONTENT -->
      <div style="padding: 30px; color: #1F1F23;">
        
        <p style="font-size: 15px; color: #555;">
          Du hast eine neue Nachricht über deine Website erhalten:
        </p>

        <!-- INFOS -->
        <div style="margin-top: 20px;">
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Betreff:</strong> ${subject || "-"}</p>
        </div>

        <!-- MESSAGE -->
        <div style="margin-top: 25px;">
          <p style="margin-bottom: 8px;"><strong>Nachricht:</strong></p>
          <div style="background: #F4F1EB; padding: 16px; border-radius: 8px; color: #1F1F23; line-height: 1.6;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>

        <!-- CTA -->
        <div style="margin-top: 30px;">
          <a 
            href="mailto:${email}" 
            style="display: inline-block; background: #C8A24D; color: #1F1F23; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-size: 14px; font-weight: 500;">
            Direkt antworten
          </a>
        </div>

      </div>

      <!-- FOOTER -->
      <div style="padding: 20px; background: #F4F1EB; text-align: center; font-size: 13px; color: #B7B2A8;">
        <p style="margin: 0;">
          Kammerchor Elikuren e.V.
        </p>
      </div>

    </div>

  </div>
  `;
};
