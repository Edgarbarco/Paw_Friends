const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/authRoute');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const historyRoutes = require('./routes/historyRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes');
const businessNotificationRoutes = require('./routes/businessNotificationRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const petRoutes = require('./routes/petRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();



// 1) MIDDLEWARES
app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como las de curl) y localhost
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos los orígenes para desarrollo
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Headers adicionales para máxima compatibilidad con navegadores
app.use((req, res, next) => {
  const origin = req.headers.origin || req.headers.referer || '*';

  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Cache-Control');
  res.header('Access-Control-Max-Age', '86400'); // 24 horas

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// 2) ROUTES
app.use('/api/auth', authRouter);
app.use('/api/products', productRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/business-notifications', businessNotificationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/contacto', contactRoutes);


// 3) MONGODB CONNECTION
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch((error) => console.error('Failed to connect to MongoDB:', error));

// 4) GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('Error global:', {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Asegurar que siempre haya un mensaje de error
  const message = err.message || 'Error interno del servidor';

  res.status(err.statusCode).json({
    status: err.status,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 5) SERVER
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server corriendo en puerto: ${PORT}`);
});