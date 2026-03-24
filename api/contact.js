// checar elendpoint en el formulario de contacto, debe ser /api/contact
// Se esperan variables de entorno SENDGRID_API_KEY y CONTACT_EMAIL para enviar el correo
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, telefono, motivo, mensaje, correo } = req.body || {};

  if (!name || !mensaje || !correo) {
    res.status(400).json({ error: 'Faltan campos requeridos (name, correo, mensaje).' });
    return;
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const CONTACT_EMAIL = process.env.CONTACT_EMAIL;

  if (!SENDGRID_API_KEY || !CONTACT_EMAIL) {
    res.status(500).json({ error: 'Servidor no configurado. Falta SENDGRID_API_KEY o CONTACT_EMAIL.' });
    return;
  }

  const subject = `Consulta web: ${name} - ${motivo || 'Sin motivo'}`;
  const text = `Nombre: ${name}\nCorreo: ${correo}\nTeléfono: ${telefono || 'N/A'}\nMotivo: ${motivo || 'N/A'}\n\nMensaje:\n${mensaje}`;

  const payload = {
    personalizations: [
      {
        to: [{ email: CONTACT_EMAIL }],
        subject,
      },
    ],
    from: { email: 'no-reply@drjesusmeneses.com', name: 'Sitio Dr. Jesús Meneses' },
    content: [
      {
        type: 'text/plain',
        value: text,
      },
    ],
  };

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      res.status(502).json({ error: 'Error enviando correo', details: body });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error interno', details: String(err) });
  }
};
