const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  apellido: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
  },
  numero: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    default: 'Pendiente',
    enum: ['Pendiente', 'Atendido']
  }
});

module.exports = mongoose.model('Contact', contactSchema);
