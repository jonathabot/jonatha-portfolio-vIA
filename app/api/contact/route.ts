import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { contactSchema } from '@/lib/contact-schema';

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'invalid_json' },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    const website = (json as Record<string, unknown> | null)?.website;
    if (typeof website === 'string' && website.length > 0) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { ok: false, error: 'invalid_input' },
      { status: 400 },
    );
  }

  const { name, email, subject: requestedSubject, message, lang } = parsed.data;
  const to = process.env.CONTACT_TO_EMAIL ?? 'jonathabotelho1@gmail.com';
  const subject = requestedSubject?.trim()
    ? `${requestedSubject.trim()} — ${name}`
    : lang === 'pt'
      ? `Contato via portfólio — ${name}`
      : `Portfolio contact — ${name}`;
  const body = `${message}\n\n— ${name}${email ? ` (${email})` : ''}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to,
      replyTo: email,
      subject,
      text: body,
    });
    if (error)
      return NextResponse.json(
        { ok: false, error: 'send_failed' },
        { status: 500 },
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'send_failed' },
      { status: 500 },
    );
  }
}
