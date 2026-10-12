const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        index: true, // Índice en el campo email
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'empleado'],
        default: 'user',
    },
    password: {
        type: String,
        required: true,
    },
    activo: {
        type: Boolean,
        default: true,
    },
    // Preferencias de notificaciones
    notificationPreferences: {
        email: {
            type: Boolean,
            default: true,
        },
        push: {
            type: Boolean,
            default: true,
        },
        types: {
            low_stock: {
                type: Boolean,
                default: true,
            },
            new_product: {
                type: Boolean,
                default: true,
            },
            product_updated: {
                type: Boolean,
                default: false,
            },
            product_deleted: {
                type: Boolean,
                default: true,
            },
            medical_reminder: {
                type: Boolean,
                default: true,
            },
            appointment_reminder: {
                type: Boolean,
                default: true,
            },
            system_alert: {
                type: Boolean,
                default: true,
            },
            custom: {
                type: Boolean,
                default: true,
            },
        },
        // Configuración de horarios para notificaciones
        quietHours: {
            enabled: {
                type: Boolean,
                default: false,
            },
            start: {
                type: String, // formato HH:mm
                default: '22:00',
            },
            end: {
                type: String, // formato HH:mm
                default: '08:00',
            },
        },
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

// Middleware para actualizar updatedAt automáticamente
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;