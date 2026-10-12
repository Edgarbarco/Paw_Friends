const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  // Información básica de la métrica
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['appointments', 'products', 'users', 'pets', 'financial', 'notifications'],
    required: true,
  },
  type: {
    type: String,
    enum: ['counter', 'currency', 'percentage', 'average', 'trend'],
    required: true,
  },

  // Valores de la métrica
  currentValue: {
    type: Number,
    required: true,
  },
  previousValue: {
    type: Number,
    default: 0,
  },
  targetValue: {
    type: Number,
    default: null,
  },

  // Información de tendencia
  trend: {
    direction: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
    percentage: {
      type: Number,
      default: 0,
    },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'daily',
    },
  },

  // Información temporal
  date: {
    type: Date,
    default: Date.now,
  },
  period: {
    startDate: Date,
    endDate: Date,
  },

  // Metadatos adicionales
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Información del cálculo
  calculationMethod: {
    type: String,
    default: 'auto',
  },
  lastCalculated: {
    type: Date,
    default: Date.now,
  },

  // Información del sistema
  isActive: {
    type: Boolean,
    default: true,
  },
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
metricsSchema.index({ category: 1, type: 1 });
metricsSchema.index({ date: -1 });
metricsSchema.index({ isActive: 1 });

// Middleware para actualizar updatedAt
metricsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Método para calcular el cambio porcentual
metricsSchema.methods.getPercentageChange = function() {
  if (this.previousValue === 0) return 0;
  return ((this.currentValue - this.previousValue) / this.previousValue) * 100;
};

// Método para verificar si está en la meta
metricsSchema.methods.isOnTarget = function() {
  if (this.targetValue === null) return null;
  return this.currentValue >= this.targetValue;
};

// Método para obtener información formateada
metricsSchema.methods.getFormattedData = function() {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-GT').format(value);
  };

  let formattedValue = this.currentValue;

  switch (this.type) {
    case 'currency':
      formattedValue = formatCurrency(this.currentValue);
      break;
    case 'percentage':
      formattedValue = `${this.currentValue}%`;
      break;
    case 'counter':
    case 'average':
      formattedValue = formatNumber(this.currentValue);
      break;
  }

  return {
    id: this._id,
    name: this.name,
    category: this.category,
    type: this.type,
    currentValue: this.currentValue,
    formattedValue: formattedValue,
    previousValue: this.previousValue,
    targetValue: this.targetValue,
    trend: this.trend,
    percentageChange: this.getPercentageChange(),
    isOnTarget: this.isOnTarget(),
    date: this.date,
    period: this.period,
    metadata: this.metadata,
  };
};

module.exports = mongoose.model('Metric', metricsSchema);