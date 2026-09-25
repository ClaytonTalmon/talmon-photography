const SITE_URL = 'https://www.claytontalmon.com';
const OWNER_EMAIL = 'ctalmon@gmail.com';
const SENDER = 'Talmon de l’Armée Photography <studio@updates.claytontalmon.com>';

const allowedOrigins = new Set([
  SITE_URL,
  'https://claytontalmon.com',
  'https://willowy-pika-c392c9.netlify.app',
]);

const replies = {
  en: {
    subject: 'Thank you for your inquiry',
    greeting: 'Thank you for your interest in the collections.',
    message: 'Your inquiry has been received. We will reply shortly.',
  },
  fr: {
    subject: 'Merci pour votre demande',
    greeting: 'Merci de l’intérêt que vous portez aux collections.',
    message: 'Votre demande a bien été reçue. Nous vous répondrons prochainement.',
  },
  ja: {
    subject: 'お問い合わせありがとうございます',
    greeting: 'コレクションにご関心をお寄せいただき、ありがとうございます。',
    message: 'お問い合わせを受け付けました。折り返しご連絡いたします。',
  },
};

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : SITE_URL,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status, origin) {
  return Response.json(body, { status, headers: corsHeaders(origin) });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

export default async (request) => {
  const origin = request.headers.get('origin') ?? '';

  if (request.method === 'OPTIONS') {
    if (!allowedOrigins.has(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400, origin);
  }

  const name = String(payload.name ?? '').trim().slice(0, 120);
  const email = String(payload.email ?? '').trim().toLowerCase().slice(0, 254);
  const message = String(payload.message ?? '').trim().slice(0, 5000);
  const locale = ['en', 'fr', 'ja'].includes(payload.locale) ? payload.locale : 'en';
  const company = String(payload.company ?? '').trim();

  // This field is hidden from visitors but is commonly filled by form bots.
  if (company) return json({ ok: true }, 200, origin);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Please complete every field.' }, 400, origin);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured.');
    return json({ error: 'Email service is not configured.' }, 500, origin);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const reply = replies[locale];

  const emails = [
    {
      from: SENDER,
      to: [OWNER_EMAIL],
      reply_to: email,
      subject: `Photography inquiry — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p>${safeMessage}</p>`,
    },
    {
      from: SENDER,
      to: [email],
      reply_to: OWNER_EMAIL,
      subject: reply.subject,
      text: `${reply.greeting}\n\n${reply.message}\n\nTalmon de l’Armée Photography\n${SITE_URL}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.65;color:#1c1b18;max-width:560px"><p>${reply.greeting}</p><p>${reply.message}</p><p style="margin-top:32px">Talmon de l’Armée Photography<br><a href="${SITE_URL}" style="color:#1c1b18">claytontalmon.com</a></p></div>`,
    },
  ];

  try {
    const resendResponse = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emails),
    });

    if (!resendResponse.ok) {
      console.error('Resend error:', resendResponse.status, await resendResponse.text());
      return json({ error: 'Email could not be sent.' }, 502, origin);
    }

    return json({ ok: true }, 200, origin);
  } catch (error) {
    console.error('Contact function error:', error);
    return json({ error: 'Email could not be sent.' }, 502, origin);
  }
};
