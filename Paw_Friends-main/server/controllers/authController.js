const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const AppError = require('../utils/appError');

// Generar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '90d', // Token válido por 90 días
  });
};

// REGISTRAR USUARIO
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!email || !password || !name) {
      return next(AppError('Por favor proporciona nombre, email y contraseña', 400));
    }

    // Validar que el email no exista
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(AppError('El usuario ya existe', 400));
    }

    // Validar que el rol sea válido
    const validRoles = ['user', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'user';

    // Si intenta crear un admin, verificar el límite
    if (userRole === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      
      if (adminCount >= 3) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya no se pueden crear más administradores. Límite de 3 alcanzado.',
          errorCode: 'ADMIN_LIMIT_EXCEEDED',
        });
      }
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear nuevo usuario
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      status: 'exito',
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// INICIAR SESIÓN USUARIO
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar que los campos requeridos estén presentes
    if (!email || !password) {
      return next(AppError('Por favor proporciona email y contraseña', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(AppError('Usuario no encontrado', 404));
    }

    // Validar si el usuario está activo
    if (user.activo === false) {
      return next(AppError('Usuario inactivo. Contacta al administrador.', 403));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(AppError('Correo o contraseña invalidos', 401));
    }

    const token = generateToken(user._id);

    res.status(200).json({
      status: 'exito',
      token,
      message: 'Usuario inicio sesion exitosamente',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// OBTENER PERFIL DEL USUARIO AUTENTICADO
exports.getProfile = (req, res) => {
  try {
    res.status(200).json({
      status: 'exito',
      message: 'Perfil del usuario autenticado',
      user: req.user, // Esto viene del middleware protect
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el perfil del usuario',
    });
  }
};