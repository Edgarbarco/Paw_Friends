const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Información básica de la cita
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },

  // Información del cliente
  clientName: {
    type: String,
    required: true,
  },
  clientEmail: {
    type: String,
  },
  petName: {
    type: String,
    required: true,
  },
  petType: {
    type: String,
    enum: ['Dog', 'Cat', 'Bird', 'Other'],
    required: true,
  },
  petBreed: {
    type: String,
    default: '',
  },
  petAge: {
    type: Number,
    min: 0,
  },
  petWeight: {
    type: Number,
    min: 0,
  },

  // Información del veterinario
  veterinarian: {
    type: String,
    required: true,
  },

  // Información de la cita
  appointmentDate: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // en minutos
    default: 30,
    min: 15,
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  clientEmail: {
    type: String,
    required: true,
  },
  clientPhone: {
    type: String,
    required: true,
  },

  // Servicios y tratamientos
  services: [{
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    duration: {
      type: Number, // minutos adicionales
      default: 0,
    },
    notes: String,
  }],

  // Información médica relacionada
  reason: {
    type: String,
    required: true,
  },
  symptoms: [String],
  diagnosis: String,
  treatment: String,
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
  }],

  // Recordatorios y notificaciones
  reminderSent: {
    type: Boolean,
    default: false,
  },
  reminderDate: Date,
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
  },

  // Información adicional
  notes: {
    type: String,
    default: '',
  },
  followUpRequired: {
    type: Boolean,
    default: false,
  },
  followUpDate: Date,

  // Información del sistema
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Índices para mejorar el rendimiento
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ clientEmail: 1 });
appointmentSchema.index({ petName: 1 });
appointmentSchema.index({ veterinarian: 1 });
appointmentSchema.index({ status: 1 });

// Middleware para actualizar updatedAt
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para calcular el costo total
appointmentSchema.methods.getTotalCost = function() {
  return this.services.reduce((total, service) => total + (service.price || 0), 0);
};

// Método para verificar si la cita está próxima (próximas 24 horas)
appointmentSchema.methods.isUpcoming = function() {
  const now = new Date();
  const appointmentTime = new Date(this.appointmentDate);
  const diffHours = (appointmentTime - now) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= 24;
};

// Método para obtener información formateada
appointmentSchema.methods.getFormattedInfo = function() {
  return {
    id: this._id,
    title: this.title,
    client: {
      name: this.clientName,
      email: this.clientEmail,
      phone: this.clientPhone,
    },
    pet: {
      name: this.petName,
      type: this.petType,
      breed: this.petBreed,
      age: this.petAge,
      weight: this.petWeight,
    },
    veterinarian: this.veterinarian,
    appointmentDate: this.appointmentDate,
    duration: this.duration,
    status: this.status,
    services: this.services,
    totalCost: this.getTotalCost(),
    reason: this.reason,
    isUpcoming: this.isUpcoming(),
  };
};

module.exports = mongoose.model('Appointment', appointmentSchema);