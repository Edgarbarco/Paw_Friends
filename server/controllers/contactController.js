const Contact = require('../models/contactModel');
const emailService = require('../services/emailService');
const { notifyAdmins } = require('../middlewares/notificationMiddleware');

// Crear contacto para agendar cita
exports.createContact = async (req, res) => {
  try {
    const { nombre, apellido, correo, numero, descripcion } = req.body;
    const newContact = new Contact({ nombre, apellido, correo, numero, descripcion });
    await newContact.save();

    // Notificar a los admins sobre el nuevo contacto
    await notifyAdmins(
      'Nuevo contacto recibido',
      `Se ha recibido un nuevo contacto de ${nombre} ${apellido} (${correo}, ${numero}). Motivo: ${descripcion}. Es necesario llamar para agendar la cita.`,
      'contact_received',
      'high'
    );

    // Cuerpo del email (igual para ambos)
    const emailBody = {
      title: 'Contacto recibido en PawFriends',
      message: `Hola ${nombre},<br><br>Hemos recibido tu solicitud y nos pondremos en contacto contigo pronto al correo <b>${correo}</b> o por el número de teléfono <b>${numero}</b>.<br><br>Motivo: ${descripcion}<br><br>¡Gracias por confiar en PawFriends!<br><br>---<br><b>Datos del contacto:</b><br>Nombre: ${nombre} ${apellido}<br>Email: ${correo}<br>Teléfono: ${numero}<br>Motivo: ${descripcion}`,
      priority: 'low',
    };

    // Email al usuario
    await emailService.sendNotificationEmail(correo, emailBody);
    // Email al dueño (cambia aquí tu correo)
    await emailService.sendNotificationEmail(process.env.EMAIL_USER, emailBody);

    res.status(201).json({ success: true, contact: newContact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear contacto', error });
  }
};

// Obtener todos los contactos
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener contactos', error });
  }
};

// Eliminar contacto por ID
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Contacto no encontrado' });
    }
    res.status(200).json({ success: true, message: 'Contacto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar contacto', error });
  }
};

// Actualizar estado del contacto
exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const updated = await Contact.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Contacto no encontrado' });
    }
    
    res.status(200).json({ success: true, contact: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar contacto', error });
  }
};
