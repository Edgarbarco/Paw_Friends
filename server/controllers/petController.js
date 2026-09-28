const Pet = require('../models/petModel');
const { notifyAdmins } = require('../middlewares/notificationMiddleware');

// Obtener todas las mascotas con filtros avanzados
exports.getAllPets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      ownerEmail,
      isActive = true,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Construir filtros
    const filter = { isActive };
    if (type) filter.type = type;
    if (ownerEmail) filter.ownerEmail = { $regex: ownerEmail, $options: 'i' };

    // Construir ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const pets = await Pet.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pet.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: pets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error obteniendo mascotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las mascotas',
      error: error.message,
    });
  }
};

// Crear nueva mascota
exports.createPet = async (req, res) => {
  try {
    const petData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const pet = new Pet(petData);
    await pet.save();

    // Crear notificación automática
    await notifyAdmins(
      `Nueva mascota registrada: ${pet.name}`,
      `Se ha registrado una nueva mascota: ${pet.name} (${pet.type}) del dueño ${pet.ownerName}`,
      'custom',
      'low'
    );

    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      data: pet,
    });
  } catch (error) {
    console.error('Error creando mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la mascota',
      error: error.message,
    });
  }
};

// Obtener mascota por ID
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      data: pet,
    });
  } catch (error) {
    console.error('Error obteniendo mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la mascota',
      error: error.message,
    });
  }
};

// Actualizar mascota
exports.updatePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true }
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mascota actualizada exitosamente',
      data: pet,
    });
  } catch (error) {
    console.error('Error actualizando mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la mascota',
      error: error.message,
    });
  }
};

// Eliminar mascota (desactivar)
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedBy: req.user.id },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mascota desactivada exitosamente',
    });
  } catch (error) {
    console.error('Error desactivando mascota:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar la mascota',
      error: error.message,
    });
  }
};

// Agregar registro médico
exports.addMedicalRecord = async (req, res) => {
  try {
    const { type, veterinarian, diagnosis, treatment, medications, cost, followUpRequired, followUpDate, notes } = req.body;

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    const newRecord = {
      date: new Date(),
      type,
      veterinarian,
      diagnosis,
      treatment,
      medications,
      cost,
      followUpRequired,
      followUpDate,
      notes,
    };

    pet.medicalHistory.push(newRecord);
    await pet.save();

    // Crear notificación si requiere seguimiento
    if (followUpRequired && followUpDate) {
      await notifyAdmins(
        `Seguimiento médico requerido: ${pet.name}`,
        `La mascota ${pet.name} requiere seguimiento médico el ${new Date(followUpDate).toLocaleDateString()}`,
        'medical_reminder',
        'medium'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Registro médico agregado exitosamente',
      data: pet.medicalHistory[pet.medicalHistory.length - 1],
    });
  } catch (error) {
    console.error('Error agregando registro médico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar registro médico',
      error: error.message,
    });
  }
};

// Agregar vacunación
exports.addVaccination = async (req, res) => {
  try {
    const { vaccineName, vaccineType, dateAdministered, nextDueDate, batchNumber, veterinarian, notes } = req.body;

    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada',
      });
    }

    const newVaccination = {
      vaccineName,
      vaccineType,
      dateAdministered: new Date(dateAdministered),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      batchNumber,
      veterinarian,
      notes,
    };

    pet.vaccinations.push(newVaccination);
    await pet.save();

    // Crear notificación si hay próxima dosis
    if (nextDueDate) {
      await notifyAdmins(
        `Nueva vacunación registrada: ${pet.name}`,
        `Se aplicó ${vaccineName} a ${pet.name}. Próxima dosis: ${new Date(nextDueDate).toLocaleDateString()}`,
        'medical_reminder',
        'low'
      );
    }

    res.status(200).json({
      success: true,
      message: 'Vacunación agregada exitosamente',
      data: pet.vaccinations[pet.vaccinations.length - 1],
    });
  } catch (error) {
    console.error('Error agregando vacunación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar vacunación',
      error: error.message,
    });
  }
};

// Obtener mascotas por dueño
exports.getPetsByOwner = async (req, res) => {
  try {
    const { ownerEmail } = req.params;

    const pets = await Pet.find({
      ownerEmail: { $regex: ownerEmail, $options: 'i' },
      isActive: true,
    }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: pets,
      count: pets.length,
    });
  } catch (error) {
    console.error('Error obteniendo mascotas por dueño:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mascotas del dueño',
      error: error.message,
    });
  }
};

// Obtener estadísticas de mascotas
exports.getPetStats = async (req, res) => {
  try {
    // Estadísticas básicas
    const totalPets = await Pet.countDocuments({ isActive: true });
    const petsByType = await Pet.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    // Mascotas con vacunas próximas
    const petsWithUpcomingVaccinations = await Pet.countDocuments({
      isActive: true,
      'vaccinations.nextDueDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Próximos 30 días
      },
    });

    // Mascotas con seguimiento médico requerido
    const petsNeedingFollowUp = await Pet.countDocuments({
      isActive: true,
      'medicalHistory.followUpRequired': true,
      'medicalHistory.followUpDate': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Próximos 7 días
      },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalPets,
        byType: petsByType,
        upcomingVaccinations: petsWithUpcomingVaccinations,
        needingFollowUp: petsNeedingFollowUp,
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de mascotas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de mascotas',
      error: error.message,
    });
  }
};