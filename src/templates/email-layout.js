const COLORS = {
	primary: '#34d399',
	primaryDark: '#059669',
	background: '#f8fafc',
	card: '#ffffff',
	text: '#0f172a',
	muted: '#64748b',
	border: '#e2e8f0',
};

export const buildEmailLayout = ({
	title,
	preheader,
	heading,
	greeting,
	paragraphs = [],
	ctaLabel,
	ctaUrl,
	footerNote,
}) => {
	const bodyParagraphs = paragraphs
		.map(
			(text) =>
				`<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${COLORS.muted};">${text}</p>`
		)
		.join('');

	const ctaBlock = ctaLabel && ctaUrl
		? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 8px;">
        <tr>
          <td style="border-radius:9999px;background:${COLORS.primaryDark};">
            <a href="${ctaUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:9999px;background:${COLORS.primaryDark};">
              ${ctaLabel}
            </a>
          </td>
        </tr>
      </table>`
		: '';

	return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.background};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${preheader || ''}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${COLORS.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,0.08);">
            <tr>
              <td style="background:linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%);padding:28px 32px;text-align:center;">
                <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.2);text-align:center;vertical-align:middle;font-size:22px;font-weight:700;color:#ffffff;">T</td>
                    <td style="padding-left:12px;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">TreeLink</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 28px;">
                <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:${COLORS.text};letter-spacing:-0.02em;">${heading}</h1>
                <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${COLORS.text};">Hola <strong>${greeting}</strong>,</p>
                ${bodyParagraphs}
                ${ctaBlock}
                ${footerNote ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:${COLORS.muted};">${footerNote}</p>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid ${COLORS.border};text-align:center;">
                <p style="margin:0;font-size:12px;color:${COLORS.muted};">© ${new Date().getFullYear()} TreeLink — Tu link en bio</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
