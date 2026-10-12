import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Popconfirm,
  message,
  Typography,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import PetProfile from '../components/PetProfile';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const PetsPage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [form] = Form.useForm();
  const { token, userData } = useAuth();

  // Obtener todas las mascotas
  const fetchPets = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPets(data.data || []);
      }
    } catch (error) {
      console.error('Error obteniendo mascotas:', error);
      message.error('Error al obtener mascotas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [token]);

  // Crear nueva mascota
  const handleCreatePet = () => {
    setEditingPet(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Editar mascota
  const handleEditPet = (pet) => {
    setEditingPet(pet);
    form.setFieldsValue({
      ...pet,
      birthDate: pet.birthDate ? moment(pet.birthDate) : null,
    });
    setIsModalVisible(true);
  };

  // Enviar formulario
  const handleSubmit = async (values) => {
    if (!token) return;

    try {
      const petData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      };

      const url = editingPet
        ? `${import.meta.env.VITE_API_URL}/api/pets/${editingPet._id}`
        : `${import.meta.env.VITE_API_URL}/api/pets`;

      const method = editingPet ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(petData),
      });

      if (response.ok) {
        message.success(
          editingPet
            ? 'Mascota actualizada exitosamente'
            : 'Mascota creada exitosamente'
        );
        setIsModalVisible(false);
        form.resetFields();
        fetchPets();
      } else {
        const error = await response.json();
        message.error(error.message || 'Error al guardar mascota');
      }
    } catch (error) {
      console.error('Error guardando mascota:', error);
      message.error('Error de conexión');
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.type} • {record.gender}
          </div>
        </div>
      ),
    },
    {
      title: 'Información',
      key: 'info',
      render: (_, record) => (
        <div>
          <div>Edad: {moment().diff(moment(record.birthDate), 'years')} años</div>
          <div>Dueño: {record.ownerName}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.ownerPhone}</div>
        </div>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'Activa' : 'Inactiva'}
          </Tag>
          {record.medicalHistory && record.medicalHistory.length > 0 && (
            <Tag color="blue" icon={<HeartOutlined />}>
              {record.medicalHistory.length} consultas
            </Tag>
          )}
          {record.vaccinations && record.vaccinations.length > 0 && (
            <Tag color="purple" icon={<MedicineBoxOutlined />}>
              {record.vaccinations.length} vacunas
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => setSelectedPet(record)}
          >
            Ver Perfil
          </Button>
          {userData?.role === 'admin' && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditPet(record)}
              />
              <Popconfirm
                title="¿Estás seguro de desactivar esta mascota?"
                onConfirm={() => handleDeletePet(record._id)}
                okText="Sí"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Función para eliminar mascota
  const handleDeletePet = async (petId) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pets/${petId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        message.success('Mascota desactivada exitosamente');
        fetchPets();
      } else {
        message.error('Error al desactivar mascota');
      }
    } catch (error) {
      console.error('Error desactivando mascota:', error);
      message.error('Error de conexión');
    }
  };

  // Si hay una mascota seleccionada, mostrar su perfil
  if (selectedPet) {
    return (
      <PetProfile
        petId={selectedPet._id}
        onClose={() => setSelectedPet(null)}
      />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Gestión de Mascotas</Title>
        {userData?.role === 'admin' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreatePet}
          >
            Nueva Mascota
          </Button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Mascotas"
              value={pets.length}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Perros"
              value={pets.filter(pet => pet.type === 'perro').length}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Gatos"
              value={pets.filter(pet => pet.type === 'gato').length}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Con Vacunas Próximas"
              value={pets.filter(pet =>
                pet.vaccinations?.some(vac =>
                  vac.nextDueDate && moment(vac.nextDueDate).isBefore(moment().add(30, 'days'))
                )
              ).length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabla de mascotas */}
      <Card>
        <Table
          columns={columns}
          dataSource={pets}
          loading={loading}
          rowKey="_id"
          pagination={{
            total: pets.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} mascotas`,
          }}
        />
      </Card>

      {/* Modal para crear/editar mascotas */}
      <Modal
        title={editingPet ? 'Editar Mascota' : 'Nueva Mascota'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Nombre de la Mascota"
                rules={[{ required: true, message: 'Ingrese el nombre de la mascota' }]}
              >
                <Input placeholder="Nombre de la mascota" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Tipo de Mascota"
                rules={[{ required: true, message: 'Seleccione el tipo de mascota' }]}
              >
                <Select placeholder="Tipo de mascota">
                  <Option value="perro">Perro</Option>
                  <Option value="gato">Gato</Option>
                  <Option value="ave">Ave</Option>
                  <Option value="conejo">Conejo</Option>
                  <Option value="hurón">Hurón</Option>
                  <Option value="otro">Otro</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Sexo"
                rules={[{ required: true, message: 'Seleccione el sexo' }]}
              >
                <Select placeholder="Sexo">
                  <Option value="macho">Macho</Option>
                  <Option value="hembra">Hembra</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="breed"
                label="Raza"
              >
                <Input placeholder="Raza de la mascota" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="birthDate"
                label="Fecha de Nacimiento"
                rules={[{ required: true, message: 'Seleccione la fecha de nacimiento' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Peso (lb)"
              >
                <Input type="number" step="0.1" placeholder="Peso en lb" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Información del Dueño</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ownerName"
                label="Nombre del Dueño"
                rules={[{ required: true, message: 'Ingrese el nombre del dueño' }]}
              >
                <Input placeholder="Nombre del dueño" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ownerEmail"
                label="Email del Dueño"
                rules={[
                  { required: true, message: 'Ingrese el email del dueño' },
                  { type: 'email', message: 'Ingrese un email válido' },
                ]}
              >
                <Input placeholder="dueño@email.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ownerPhone"
                label="Teléfono del Dueño"
                rules={[{ required: true, message: 'Ingrese el teléfono del dueño' }]}
              >
                <Input placeholder="+502 1234-5678" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="ownerAddress"
                label="Dirección"
              >
                <Input placeholder="Dirección del dueño" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notas Adicionales"
          >
            <Input.TextArea rows={3} placeholder="Notas adicionales sobre la mascota" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPet ? 'Actualizar Mascota' : 'Crear Mascota'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PetsPage;