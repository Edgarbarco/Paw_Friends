const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  // Información básica de la mascota
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Dog', 'Cat', 'Bird', 'Other'], // Valores permitidos
    required: true,
  },
  breed: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'], // Valores permitidos
    required: true,
  },
  color: {
    type: String,
    default: '',
  },

  // Información física
  birthDate: {
    type: Date,
    required: true,
  },
  weight: {
    type: Number,
    min: 0,
  },
  height: {
    type: Number,
    min: 0,
  },

  // Información del dueño
  ownerName: {
    type: String,
    required: true,
  },
  ownerEmail: {
    type: String,
    required: true,
  },
  ownerPhone: {
    type: String,
    required: true,
  },
  ownerAddress: {
    type: String,
    default: '',
  },

  // Información médica
  isSterilized: {
    type: Boolean,
    default: false,
  },
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    notes: String,
  }],

  // Historial de vacunas
  vaccinations: [{
    vaccineName: {
      type: String,
      required: true,
    },
    vaccineType: {
      type: String,
      enum: ['vacuna', 'desparasitante', 'vitamina', 'otro'],
      default: 'vacuna',
    },
    dateAdministered: {
      type: Date,
      required: true,
    },
    nextDueDate: Date,
    batchNumber: String,
    veterinarian: String,
    notes: String,
  }],

  // Historial médico
  medicalHistory: [{
    date: {
      type: Date,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['consulta', 'cirugía', 'tratamiento', 'emergencia', 'otro'],
      required: true,
    },
    veterinarian: String,
    diagnosis: String,
    treatment: String,
    medications: [String],
    notes: String,
    cost: {
      type: Number,
      min: 0,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: Date,
  }],

  // Información de emergencia
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },

  // Configuración de recordatorios
  reminderSettings: {
    vaccinations: {
      type: Boolean,
      default: true,
    },
    checkups: {
      type: Boolean,
      default: true,
    },
    grooming: {
      type: Boolean,
      default: false,
    },
    daysInAdvance: {
      type: Number,
      default: 7,
      min: 1,
      max: 30,
    },
  },

  // Fotos de la mascota
  photos: [{
    url: String,
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  }],

  // Información adicional
  notes: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },

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
petSchema.index({ ownerEmail: 1 });
petSchema.index({ name: 1, ownerEmail: 1 });
petSchema.index({ type: 1 });
petSchema.index({ isActive: 1 });

// Middleware para actualizar updatedAt
petSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método virtual para calcular la edad en años
petSchema.virtual('age').get(function() {
  if (!this.birthDate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
});

// Método para obtener vacunas próximas a vencer
petSchema.methods.getUpcomingVaccinations = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return this.vaccinations.filter(vac => {
    if (!vac.nextDueDate) return false;
    return new Date(vac.nextDueDate) <= futureDate;
  });
};

// Método para obtener historial médico reciente
petSchema.methods.getRecentMedicalHistory = function(limit = 5) {
  return this.medicalHistory
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
};

// Método para calcular el costo total de atención médica
petSchema.methods.getTotalMedicalCost = function() {
  return this.medicalHistory.reduce((total, record) => total + (record.cost || 0), 0);
};

// Método para obtener información formateada
petSchema.methods.getFormattedInfo = function() {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    breed: this.breed,
    gender: this.gender,
    age: this.age,
    weight: this.weight,
    owner: {
      name: this.ownerName,
      email: this.ownerEmail,
      phone: this.ownerPhone,
    },
    medicalInfo: {
      isSterilized: this.isSterilized,
      allergies: this.allergies,
      currentMedications: this.medications.filter(med => {
        if (!med.endDate) return true;
        return new Date(med.endDate) > new Date();
      }),
      upcomingVaccinations: this.getUpcomingVaccinations(),
      totalMedicalCost: this.getTotalMedicalCost(),
    },
    stats: {
      totalVaccinations: this.vaccinations.length,
      totalMedicalRecords: this.medicalHistory.length,
      lastCheckup: this.medicalHistory.length > 0 ?
        this.medicalHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date : null,
    },
  };
};

module.exports = mongoose.model('Pet', petSchema);