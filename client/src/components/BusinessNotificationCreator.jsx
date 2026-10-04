import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Tabs,
  Row,
  Col,
  message,
  Space,
  Divider,
  Typography,
} from 'antd';
import {
  BellOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  HeartOutlined,
  WarningOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const BusinessNotificationCreator = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (values) => {
    if (!token) return;

    setLoading(true);
    try {
      // Determinar el endpoint según el tipo de notificación
      let endpoint = '';
      let payload = {};

      switch (values.notificationType) {
        case 'medical_reminder':
          endpoint = '/api/business-notifications/medical-reminder';
          payload = {
            historyId: values.historyId,
            title: values.title,
            message: values.message,
            scheduledDate: values.scheduledDate,
            priority: values.priority,
          };
          break;

        case 'appointment_reminder':
          endpoint = '/api/business-notifications/appointment-reminder';
          payload = {
            petName: values.petName,
            ownerName: values.ownerName,
            appointmentDate: values.appointmentDate,
            appointmentType: values.appointmentType,
            veterinarian: values.veterinarian,
            priority: values.priority,
          };
          break;

        case 'vaccination_alert':
          endpoint = '/api/business-notifications/vaccination-alert';
          payload = {
            petName: values.petName,
            ownerName: values.ownerName,
            vaccineName: values.vaccineName,
            dueDate: values.dueDate,
            priority: values.priority,
          };
          break;

        case 'deworming_alert':
          endpoint = '/api/business-notifications/deworming-alert';
          payload = {
            petName: values.petName,
            ownerName: values.ownerName,
            productName: values.productName,
            dueDate: values.dueDate,
            priority: values.priority,
          };
          break;

        case 'treatment_followup':
          endpoint = '/api/business-notifications/treatment-followup';
          payload = {
            petName: values.petName,
            ownerName: values.ownerName,
            treatmentName: values.treatmentName,
            currentDose: values.currentDose,
            totalDoses: values.totalDoses,
            nextDoseDate: values.nextDoseDate,
            priority: values.priority,
          };
          break;

        case 'pet_birthday':
          endpoint = '/api/business-notifications/pet-birthday';
          payload = {
            petName: values.petName,
            ownerName: values.ownerName,
            birthday: values.birthday,
            age: values.age,
            priority: values.priority,
          };
          break;

        case 'expiring_product':
          endpoint = '/api/business-notifications/expiring-product';
          payload = {
            productName: values.productName,
            productType: values.productType,
            expiryDate: values.expiryDate,
            daysUntilExpiry: values.daysUntilExpiry,
            priority: values.priority,
          };
          break;

        case 'system_maintenance':
          endpoint = '/api/business-notifications/system-maintenance';
          payload = {
            title: values.title,
            message: values.message,
            scheduledDate: values.scheduledDate,
            estimatedDuration: values.estimatedDuration,
            priority: values.priority,
          };
          break;

        default:
          message.error('Tipo de notificación no válido');
          return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        message.success(data.message);
        form.resetFields();
      } else {
        const error = await response.json();
        message.error(error.message || 'Error al crear notificación');
      }
    } catch (error) {
      message.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={
      <Space>
        <BellOutlined />
        Crear Notificaciones de Negocio
      </Space>
    }>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Tabs defaultActiveKey="medical">
          {/* Recordatorios Médicos */}
          <TabPane
            tab={
              <span>
                <MedicineBoxOutlined />
                Médicos
              </span>
            }
            key="medical"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['medical_reminder', 'historyId']}
                  label="ID del Historial Médico"
                  rules={[{ required: true, message: 'Ingrese el ID del historial' }]}
                >
                  <Input placeholder="ID del historial médico" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['medical_reminder', 'priority']}
                  label="Prioridad"
                  initialValue="medium"
                >
                  <Select>
                    <Option value="low">Baja</Option>
                    <Option value="medium">Media</Option>
                    <Option value="high">Alta</Option>
                    <Option value="urgent">Urgente</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name={['medical_reminder', 'title']}
              label="Título"
            >
              <Input placeholder="Título del recordatorio" />
            </Form.Item>
            <Form.Item
              name={['medical_reminder', 'message']}
              label="Mensaje"
            >
              <TextArea rows={3} placeholder="Mensaje del recordatorio" />
            </Form.Item>
            <Form.Item
              name={['medical_reminder', 'scheduledDate']}
              label="Fecha Programada"
            >
              <DatePicker showTime style={{ width: '100%' }} />
            </Form.Item>
          </TabPane>

          {/* Recordatorios de Citas */}
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                Citas
              </span>
            }
            key="appointment"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['appointment_reminder', 'petName']}
                  label="Nombre de la Mascota"
                  rules={[{ required: true, message: 'Ingrese el nombre de la mascota' }]}
                >
                  <Input placeholder="Nombre de la mascota" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['appointment_reminder', 'ownerName']}
                  label="Nombre del Dueño"
                  rules={[{ required: true, message: 'Ingrese el nombre del dueño' }]}
                >
                  <Input placeholder="Nombre del dueño" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['appointment_reminder', 'appointmentDate']}
                  label="Fecha de la Cita"
                  rules={[{ required: true, message: 'Seleccione la fecha de la cita' }]}
                >
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['appointment_reminder', 'appointmentType']}
                  label="Tipo de Cita"
                  rules={[{ required: true, message: 'Seleccione el tipo de cita' }]}
                >
                  <Select placeholder="Tipo de cita">
                    <Option value="consulta">Consulta General</Option>
                    <Option value="vacunacion">Vacunación</Option>
                    <Option value="cirugia">Cirugía</Option>
                    <Option value="revision">Revisión</Option>
                    <Option value="urgencia">Urgencia</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name={['appointment_reminder', 'veterinarian']}
              label="Veterinario"
            >
              <Input placeholder="Nombre del veterinario" />
            </Form.Item>
          </TabPane>

          {/* Alertas de Salud */}
          <TabPane
            tab={
              <span>
                <HeartOutlined />
                Salud
              </span>
            }
            key="health"
          >
            <Tabs defaultActiveKey="vaccination">
              <TabPane tab="Vacunación" key="vaccination">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['vaccination_alert', 'petName']}
                      label="Nombre de la Mascota"
                      rules={[{ required: true, message: 'Ingrese el nombre de la mascota' }]}
                    >
                      <Input placeholder="Nombre de la mascota" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['vaccination_alert', 'ownerName']}
                      label="Nombre del Dueño"
                      rules={[{ required: true, message: 'Ingrese el nombre del dueño' }]}
                    >
                      <Input placeholder="Nombre del dueño" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['vaccination_alert', 'vaccineName']}
                      label="Nombre de la Vacuna"
                      rules={[{ required: true, message: 'Ingrese el nombre de la vacuna' }]}
                    >
                      <Input placeholder="Nombre de la vacuna" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['vaccination_alert', 'dueDate']}
                      label="Fecha Límite"
                      rules={[{ required: true, message: 'Seleccione la fecha límite' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Desparasitación" key="deworming">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['deworming_alert', 'petName']}
                      label="Nombre de la Mascota"
                      rules={[{ required: true, message: 'Ingrese el nombre de la mascota' }]}
                    >
                      <Input placeholder="Nombre de la mascota" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['deworming_alert', 'ownerName']}
                      label="Nombre del Dueño"
                      rules={[{ required: true, message: 'Ingrese el nombre del dueño' }]}
                    >
                      <Input placeholder="Nombre del dueño" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['deworming_alert', 'productName']}
                      label="Producto"
                      rules={[{ required: true, message: 'Ingrese el nombre del producto' }]}
                    >
                      <Input placeholder="Nombre del producto de desparasitación" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['deworming_alert', 'dueDate']}
                      label="Fecha Límite"
                      rules={[{ required: true, message: 'Seleccione la fecha límite' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Tratamiento" key="treatment">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['treatment_followup', 'petName']}
                      label="Nombre de la Mascota"
                      rules={[{ required: true, message: 'Ingrese el nombre de la mascota' }]}
                    >
                      <Input placeholder="Nombre de la mascota" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['treatment_followup', 'ownerName']}
                      label="Nombre del Dueño"
                      rules={[{ required: true, message: 'Ingrese el nombre del dueño' }]}
                    >
                      <Input placeholder="Nombre del dueño" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name={['treatment_followup', 'treatmentName']}
                      label="Tratamiento"
                      rules={[{ required: true, message: 'Ingrese el nombre del tratamiento' }]}
                    >
                      <Input placeholder="Nombre del tratamiento" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name={['treatment_followup', 'currentDose']}
                      label="Dosis Actual"
                      rules={[{ required: true, message: 'Ingrese la dosis actual' }]}
                    >
                      <Input type="number" placeholder="1" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name={['treatment_followup', 'totalDoses']}
                      label="Total de Dosis"
                      rules={[{ required: true, message: 'Ingrese el total de dosis' }]}
                    >
                      <Input type="number" placeholder="5" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name={['treatment_followup', 'nextDoseDate']}
                  label="Fecha de Próxima Dosis"
                  rules={[{ required: true, message: 'Seleccione la fecha de próxima dosis' }]}
                >
                  <DatePicker showTime style={{ width: '100%' }} />
                </Form.Item>
              </TabPane>
            </Tabs>
          </TabPane>

          {/* Sistema y Productos */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Sistema
              </span>
            }
            key="system"
          >
            <Tabs defaultActiveKey="maintenance">
              <TabPane tab="Mantenimiento" key="maintenance">
                <Form.Item
                  name={['system_maintenance', 'title']}
                  label="Título"
                >
                  <Input placeholder="Título del mantenimiento" />
                </Form.Item>
                <Form.Item
                  name={['system_maintenance', 'message']}
                  label="Mensaje"
                >
                  <TextArea rows={3} placeholder="Mensaje del mantenimiento" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['system_maintenance', 'scheduledDate']}
                      label="Fecha Programada"
                      rules={[{ required: true, message: 'Seleccione la fecha programada' }]}
                    >
                      <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['system_maintenance', 'estimatedDuration']}
                      label="Duración Estimada"
                    >
                      <Input placeholder="2 horas" />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>

              <TabPane tab="Productos Próximos a Vencer" key="expiring">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['expiring_product', 'productName']}
                      label="Nombre del Producto"
                      rules={[{ required: true, message: 'Ingrese el nombre del producto' }]}
                    >
                      <Input placeholder="Nombre del producto" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['expiring_product', 'productType']}
                      label="Tipo de Producto"
                      rules={[{ required: true, message: 'Ingrese el tipo de producto' }]}
                    >
                      <Input placeholder="Tipo de producto" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['expiring_product', 'expiryDate']}
                      label="Fecha de Vencimiento"
                      rules={[{ required: true, message: 'Seleccione la fecha de vencimiento' }]}
                    >
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['expiring_product', 'daysUntilExpiry']}
                      label="Días hasta Vencimiento"
                      rules={[{ required: true, message: 'Ingrese los días hasta vencimiento' }]}
                    >
                      <Input type="number" placeholder="30" />
                    </Form.Item>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>

        <Divider />

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Crear Notificación
            </Button>
            <Button onClick={() => form.resetFields()}>
              Limpiar
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default BusinessNotificationCreator;