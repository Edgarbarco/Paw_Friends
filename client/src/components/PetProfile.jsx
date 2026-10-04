import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tabs,
  Timeline,
  List,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Typography,
  Divider,
  Avatar,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
  Alert,
} from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const PetProfile = ({ petId, onClose }) => {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();
  const { token, userData } = useAuth();

  // Obtener información de la mascota
  const fetchPet = async () => {
    if (!token || !petId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pets/${petId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPet(data.data);
      }
    } catch (error) {
      console.error('Error obteniendo mascota:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPet();
  }, [petId, token]);

  // Función para calcular la edad
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'No especificada';
    const today = moment();
    const birth = moment(birthDate);
    const years = today.diff(birth, 'years');
    const months = today.diff(birth, 'months') % 12;

    if (years === 0) {
      return `${months} meses`;
    }
    return `${years} años ${months} meses`;
  };

  // Función para obtener el color del estado de vacunación
  const getVaccinationStatusColor = (nextDueDate) => {
    if (!nextDueDate) return 'default';

    const today = moment();
    const dueDate = moment(nextDueDate);
    const daysDiff = dueDate.diff(today, 'days');

    if (daysDiff < 0) return 'red'; // Vencida
    if (daysDiff <= 7) return 'orange'; // Próxima a vencer
    return 'green'; // Al día
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
    }).format(amount || 0);
  };

  // Manejar agregar registro médico
  const handleAddMedicalRecord = async (values) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pets/${petId}/medical-record`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        setIsModalVisible(false);
        form.resetFields();
        fetchPet(); // Recargar información
      }
    } catch (error) {
      console.error('Error agregando registro médico:', error);
    }
  };

  // Manejar agregar vacunación
  const handleAddVaccination = async (values) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/pets/${petId}/vaccination`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        setIsModalVisible(false);
        form.resetFields();
        fetchPet(); // Recargar información
      }
    } catch (error) {
      console.error('Error agregando vacunación:', error);
    }
  };

  if (loading) {
    return (
      <Card loading={loading} style={{ margin: 24 }}>
        <div style={{ height: 400 }} />
      </Card>
    );
  }

  if (!pet) {
    return (
      <Card style={{ margin: 24 }}>
        <Alert message="Mascota no encontrada" type="error" />
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header con información básica */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar size={64} style={{ backgroundColor: '#1890ff' }}>
              {pet.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                {pet.name}
              </Title>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Tag color="blue">{pet.type.toUpperCase()}</Tag>
                <Tag color="green">{pet.gender}</Tag>
                <Tag color="purple">{calculateAge(pet.birthDate)}</Tag>
              </div>
              <Text type="secondary">
                Dueño: {pet.ownerName} • {pet.ownerPhone}
              </Text>
            </div>
          </div>

          {userData?.role === 'admin' && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setModalType('edit');
                form.setFieldsValue(pet);
                setIsModalVisible(true);
              }}
            >
              Editar Perfil
            </Button>
          )}
        </div>
      </Card>

      {/* Información detallada */}
      <Card>
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Información General" key="overview">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nombre">{pet.name}</Descriptions.Item>
              <Descriptions.Item label="Tipo">{pet.type}</Descriptions.Item>
              <Descriptions.Item label="Raza">{pet.breed || 'No especificada'}</Descriptions.Item>
              <Descriptions.Item label="Sexo">{pet.gender}</Descriptions.Item>
              <Descriptions.Item label="Fecha de Nacimiento">
                {pet.birthDate ? moment(pet.birthDate).format('DD/MM/YYYY') : 'No especificada'}
              </Descriptions.Item>
              <Descriptions.Item label="Edad">{calculateAge(pet.birthDate)}</Descriptions.Item>
              <Descriptions.Item label="Peso">{pet.weight ? `${pet.weight} lb` : 'No especificado'}</Descriptions.Item>
              <Descriptions.Item label="Esterilizado">{pet.isSterilized ? 'Sí' : 'No'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Información del Dueño</Title>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Nombre">{pet.ownerName}</Descriptions.Item>
              <Descriptions.Item label="Email">{pet.ownerEmail}</Descriptions.Item>
              <Descriptions.Item label="Teléfono">{pet.ownerPhone}</Descriptions.Item>
              <Descriptions.Item label="Dirección">{pet.ownerAddress || 'No especificada'}</Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Historial Médico" key="medical">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4}>Registros Médicos</Title>
              {userData?.role === 'admin' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setModalType('medical');
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                >
                  Agregar Registro
                </Button>
              )}
            </div>

            {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
              <Timeline>
                {pet.medicalHistory.map((record, index) => (
                  <Timeline.Item
                    key={index}
                    color={record.followUpRequired ? 'red' : 'green'}
                    dot={record.followUpRequired ? <WarningOutlined /> : <CheckCircleOutlined />}
                  >
                    <Card size="small">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <Tag color="blue">{record.type.toUpperCase()}</Tag>
                            <Text strong>{moment(record.date).format('DD/MM/YYYY')}</Text>
                          </div>
                          <Text><strong>Veterinario:</strong> {record.veterinarian}</Text>
                          <br />
                          <Text><strong>Diagnóstico:</strong> {record.diagnosis}</Text>
                          {record.treatment && (
                            <>
                              <br />
                              <Text><strong>Tratamiento:</strong> {record.treatment}</Text>
                            </>
                          )}
                          {record.cost && (
                            <>
                              <br />
                              <Text type="success"><strong>Costo:</strong> {formatCurrency(record.cost)}</Text>
                            </>
                          )}
                        </div>
                        {record.followUpRequired && (
                          <Badge count="Seguimiento requerido" style={{ backgroundColor: '#ff4d4f' }} />
                        )}
                      </div>
                    </Card>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Alert message="No hay registros médicos" type="info" />
            )}
          </TabPane>

          <TabPane tab="Vacunaciones" key="vaccinations">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={4}>Historial de Vacunaciones</Title>
              {userData?.role === 'admin' && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setModalType('vaccination');
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                >
                  Agregar Vacunación
                </Button>
              )}
            </div>

            {pet.vaccinations && pet.vaccinations.length > 0 ? (
              <Row gutter={[16, 16]}>
                {pet.vaccinations.map((vaccination, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <Card
                      size="small"
                      title={vaccination.vaccineName}
                      extra={
                        <Badge
                          color={getVaccinationStatusColor(vaccination.nextDueDate)}
                          text={vaccination.nextDueDate ? 'Programada' : 'Completa'}
                        />
                      }
                    >
                      <div style={{ fontSize: 12 }}>
                        <p><strong>Tipo:</strong> {vaccination.vaccineType}</p>
                        <p><strong>Fecha:</strong> {moment(vaccination.dateAdministered).format('DD/MM/YYYY')}</p>
                        {vaccination.nextDueDate && (
                          <p><strong>Próxima:</strong> {moment(vaccination.nextDueDate).format('DD/MM/YYYY')}</p>
                        )}
                        <p><strong>Veterinario:</strong> {vaccination.veterinarian}</p>
                        {vaccination.batchNumber && (
                          <p><strong>Lote:</strong> {vaccination.batchNumber}</p>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert message="No hay vacunaciones registradas" type="info" />
            )}
          </TabPane>

          <TabPane tab="Estadísticas" key="stats">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Total de Consultas"
                  value={pet.medicalHistory?.length || 0}
                  prefix={<HeartOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Vacunas Aplicadas"
                  value={pet.vaccinations?.length || 0}
                  prefix={<MedicineBoxOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Costo Total"
                  value={pet.medicalHistory?.reduce((total, record) => total + (record.cost || 0), 0) || 0}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(value)}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Statistic
                  title="Seguimientos Pendientes"
                  value={pet.medicalHistory?.filter(record => record.followUpRequired).length || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Col>
            </Row>

            <Divider />

            <Alert
              message="Próximas vacunas"
              description={
                pet.vaccinations?.filter(vac => {
                  if (!vac.nextDueDate) return false;
                  return moment(vac.nextDueDate).isBefore(moment().add(30, 'days'));
                }).length > 0
                  ? `${pet.vaccinations.filter(vac => vac.nextDueDate && moment(vac.nextDueDate).isBefore(moment().add(30, 'days'))).length} vacunas próximas en 30 días`
                  : 'Todas las vacunas están al día'
              }
              type={pet.vaccinations?.some(vac => vac.nextDueDate && moment(vac.nextDueDate).isBefore(moment().add(30, 'days'))) ? 'warning' : 'success'}
              showIcon
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal para agregar registros médicos o vacunaciones */}
      <Modal
        title={
          modalType === 'medical'
            ? 'Agregar Registro Médico'
            : modalType === 'vaccination'
              ? 'Agregar Vacunación'
              : 'Editar Información de Mascota'
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={modalType === 'medical' ? handleAddMedicalRecord : modalType === 'vaccination' ? handleAddVaccination : null}
        >
          {modalType === 'medical' && (
            <>
              <Form.Item
                name="type"
                label="Tipo de Consulta"
                rules={[{ required: true, message: 'Seleccione el tipo de consulta' }]}
              >
                <Select placeholder="Tipo de consulta">
                  <Option value="consulta">Consulta General</Option>
                  <Option value="cirugía">Cirugía</Option>
                  <Option value="tratamiento">Tratamiento</Option>
                  <Option value="emergencia">Emergencia</Option>
                  <Option value="otro">Otro</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="veterinarian"
                label="Veterinario"
                rules={[{ required: true, message: 'Ingrese el nombre del veterinario' }]}
              >
                <Input placeholder="Nombre del veterinario" />
              </Form.Item>

              <Form.Item
                name="diagnosis"
                label="Diagnóstico"
                rules={[{ required: true, message: 'Ingrese el diagnóstico' }]}
              >
                <Input.TextArea rows={3} placeholder="Descripción del diagnóstico" />
              </Form.Item>

              <Form.Item
                name="treatment"
                label="Tratamiento"
              >
                <Input.TextArea rows={3} placeholder="Descripción del tratamiento" />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item
                  name="cost"
                  label="Costo (Q)"
                >
                  <InputNumber
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item
                  name="followUpRequired"
                  label="¿Requiere Seguimiento?"
                  valuePropName="checked"
                >
                  <Select>
                    <Option value={false}>No</Option>
                    <Option value={true}>Sí</Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="notes"
                label="Notas Adicionales"
              >
                <Input.TextArea rows={2} placeholder="Notas adicionales" />
              </Form.Item>
            </>
          )}

          {modalType === 'vaccination' && (
            <>
              <Form.Item
                name="vaccineName"
                label="Nombre de la Vacuna"
                rules={[{ required: true, message: 'Ingrese el nombre de la vacuna' }]}
              >
                <Input placeholder="Nombre de la vacuna" />
              </Form.Item>

              <Form.Item
                name="vaccineType"
                label="Tipo"
                rules={[{ required: true, message: 'Seleccione el tipo' }]}
              >
                <Select placeholder="Tipo de vacuna">
                  <Option value="vacuna">Vacuna</Option>
                  <Option value="desparasitante">Desparasitante</Option>
                  <Option value="vitamina">Vitamina</Option>
                  <Option value="otro">Otro</Option>
                </Select>
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item
                  name="dateAdministered"
                  label="Fecha de Aplicación"
                  rules={[{ required: true, message: 'Seleccione la fecha' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name="nextDueDate"
                  label="Próxima Dosis (opcional)"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item
                  name="veterinarian"
                  label="Veterinario"
                >
                  <Input placeholder="Nombre del veterinario" />
                </Form.Item>

                <Form.Item
                  name="batchNumber"
                  label="Número de Lote"
                >
                  <Input placeholder="Número de lote" />
                </Form.Item>
              </div>

              <Form.Item
                name="notes"
                label="Notas"
              >
                <Input.TextArea rows={2} placeholder="Notas adicionales" />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {modalType === 'medical' ? 'Agregar Registro' : 'Agregar Vacunación'}
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

export default PetProfile;