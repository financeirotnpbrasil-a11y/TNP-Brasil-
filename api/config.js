export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const endpoint = process.env.GLOBAL_CONFIG_ITEMS_URL;
    if (!endpoint) throw new Error('Configuração ausente');
    const response = await fetch(endpoint, { cache: 'no-store' });
    if (!response.ok) throw new Error('Falha ao consultar configuração');
    const data = await response.json();
    const config = {};
    if (Array.isArray(data)) {
      for (const item of data) config[item.key] = item.value;
    } else if (data && typeof data === 'object') {
      Object.assign(config, data);
    }
    const activeGroup = Math.min(Math.max(Number(config.activeGroup) || 1, 1), 4);
    const groups = Array.isArray(config.groups) ? config.groups : [];
    return res.status(200).json({ activeGroup, groups });
  } catch (error) {
    return res.status(500).json({ error: 'Configuração temporariamente indisponível.' });
  }
}
