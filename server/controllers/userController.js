const User = require('../models/UserModel.js');
const bcrypt = require('bcryptjs');

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error });
  }
};

// Crear un nuevo usuario
// Actualizar estado de usuario (activo/inactivo)
exports.updateEstadoUsuario = async (req, res) => {
  try {
    const { activo } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { activo },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estado', error });
  }
};
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'El correo ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario creado exitosamente', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error });
  }
};

// Actualizar un usuario
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el usuario', error });
  }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error });
  }
};

// Obtener el usuario autenticado (por token)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error });
  }
};

// Actualizar preferencias de notificaciones del usuario autenticado
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { email, push, types, quietHours } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Actualizar preferencias de notificaciones
    if (email !== undefined) user.notificationPreferences.email = email;
    if (push !== undefined) user.notificationPreferences.push = push;

    if (types) {
      user.notificationPreferences.types = {
        ...user.notificationPreferences.types,
        ...types
      };
    }

    if (quietHours) {
      user.notificationPreferences.quietHours = {
        ...user.notificationPreferences.quietHours,
        ...quietHours
      };
    }

    await user.save();
    res.status(200).json({
      message: 'Preferencias de notificaciones actualizadas exitosamente',
      notificationPreferences: user.notificationPreferences
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar preferencias de notificaciones',
      error: error.message
    });
  }
};

// Obtener preferencias de notificaciones del usuario autenticado
exports.getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationPreferences');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.status(200).json({
      notificationPreferences: user.notificationPreferences
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener preferencias de notificaciones',
      error: error.message
    });
  }
};