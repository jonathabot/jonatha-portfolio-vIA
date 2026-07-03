import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

async function callRoute(body: unknown) {
  const { POST } = await import('@/app/api/contact/route');
  return POST(
    new Request('http://x/api/contact', { method: 'POST', body: JSON.stringify(body) }),
  );
}

const valid = { name: 'Ana', email: 'ana@x.com', message: 'oi', website: '', lang: 'pt' };

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    vi.stubEnv('RESEND_API_KEY', 'test');
    vi.stubEnv('CONTACT_TO_EMAIL', 'to@x.com');
  });

  it('sends and returns ok on valid input', async () => {
    sendMock.mockResolvedValue({ data: { id: '1' }, error: null });
    const res = await callRoute(valid);
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledOnce();
  });

  it('returns 400 on invalid input without sending', async () => {
    const res = await callRoute({ ...valid, email: 'nope' });
    expect(res.status).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('silently accepts a filled honeypot without sending', async () => {
    const res = await callRoute({ ...valid, website: 'bot' });
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('returns 500 when the provider fails', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const res = await callRoute(valid);
    expect(res.status).toBe(500);
  });
});
