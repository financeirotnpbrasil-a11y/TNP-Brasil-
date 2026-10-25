const UPSTREAM = 'https://tnp-grupos-registro.up.railway.app';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      const health = await fetch(`${UPSTREAM}/health`, { cache: 'no-store' });
      if (!health.ok) throw new Error('Serviço de registro indisponível');
      return res.status(200).json({ ok: true });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ ok: false, error: 'Método não permitido.' });
    }

    const phone = typeof req.body === 'string' ? JSON.parse(req.body).phone : req.body?.phone;
    const response = await fetch(`${UPSTREAM}/assign`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': 'https://tnp-grupos-whatsapp.vercel.app',
      },
      body: JSON.stringify({ phone }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({ ok: false, error: 'Resposta inválida do serviço.' }));
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Falha no direcionamento por telefone:', error);
    return res.status(503).json({ ok: false, error: 'Não foi possível localizar seu grupo agora. Tente novamente.' });
  }
}
