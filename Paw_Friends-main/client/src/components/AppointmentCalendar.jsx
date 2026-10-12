import React, { useState, useEffect } from 'react';
import { Calendar, Badge, Modal, Form, Input, Select, DatePicker, TimePicker, Button, Space, Card, Typography, Tag, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;

const AppointmentCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { token, userData } = useAuth();

  // Obtener citas del mes seleccionado
  const fetchAppointments = async (date = selectedDate) => {
    if (!token) return;

    setLoading(true);
    try {
      const startOfMonth = date.startOf('month').toISOString();
      const endOfMonth = date.endOf('month').toISOString();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/appointments?startDate=${startOfMonth}&endDate=${endOfMonth}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error('Error obteniendo citas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, token]);

  // Función para obtener citas de una fecha específica
  const getAppointmentsForDate = (date) => {
    return appointments.filter(appointment => {
      const appointmentDate = moment(appointment.appointmentDate);
      return appointmentDate.isSame(date, 'day');
    });
  };

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'blue',
      confirmed: 'green',
      in_progress: 'orange',
      completed: 'purple',
      cancelled: 'red',
      no_show: 'gray',
    };
    return colors[status] || 'blue';
  };

  // Función para formatear la fecha para el calendario
  const dateCellRender = (date) => {
    const dayAppointments = getAppointmentsForDate(date);

    if (dayAppointments.length === 0) return null;

    return (
      <div style={{ padding: '4px' }}>
        {dayAppointments.slice(0, 3).map((appointment, index) => (
          <Tooltip
            key={appointment._id}
            title={`${appointment.petName} - ${appointment.clientName}`}
          >
            <Badge
              color={getStatusColor(appointment.status)}
              text={`${appointment.petName}`}
              style={{
                display: 'block',
                marginBottom: '2px',
                fontSize: '11px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
          </Tooltip>
        ))}
        {dayAppointments.length > 3 && (
          <Text type="secondary" style={{ fontSize: '10px' }}>
            +{dayAppointments.length - 3} más
          </Text>
        )}
      </div>
    );
  };

  // Manejar selección de fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Manejar creación de nueva cita
  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    form.resetFields();
    form.setFieldsValue({
      appointmentDate: selectedDate,
      appointmentTime: moment('09:00', 'HH:mm'),
      duration: 30,
    });
    setIsModalVisible(true);
  };

  // Manejar edición de cita
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    form.setFieldsValue({
      ...appointment,
      appointmentDate: moment(appointment.appointmentDate),
      appointmentTime: moment(appointment.appointmentDate),
    });
    setIsModalVisible(true);
  };

  // Enviar formulario
  const handleSubmit = async (values) => {
    if (!token) return;

    try {
      const appointmentData = {
        ...values,
        appointmentDate: values.appointmentDate
          .hour(values.appointmentTime.hour())
          .minute(values.appointmentTime.minute())
          .toISOString(),
      };

      delete appointmentData.appointmentTime; // Remover campo temporal

      const url = editingAppointment
        ? `${import.meta.env.VITE_API_URL}/api/appointments/${editingAppointment._id}`
        : `${import.meta.env.VITE_API_URL}/api/appointments`;

      const method = editingAppointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        setIsModalVisible(false);
        form.resetFields();
        fetchAppointments(); // Recargar citas
      }
    } catch (error) {
      console.error('Error guardando cita:', error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Calendario de Citas</Title>
        {userData?.role === 'admin' && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateAppointment}
          >
            Nueva Cita
          </Button>
        )}
      </div>

      <Card>
        <Calendar
          fullscreen={false}
          dateCellRender={dateCellRender}
          onSelect={handleDateSelect}
          value={selectedDate}
        />
      </Card>

      {/* Lista de citas del día seleccionado */}
      <Card title={`Citas del ${selectedDate.format('DD/MM/YYYY')}`} style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>Cargando...</div>
        ) : getAppointmentsForDate(selectedDate).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            No hay citas programadas para este día
          </div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {getAppointmentsForDate(selectedDate).map(appointment => (
              <Card
                key={appointment._id}
                size="small"
                style={{
                  borderLeft: `4px solid ${getStatusColor(appointment.status) === 'blue' ? '#1890ff' : '#52c41a'}`,
                }}
                actions={
                  userData?.role === 'admin'
                    ? [
                        <EditOutlined key="edit" onClick={() => handleEditAppointment(appointment)} />,
                        <DeleteOutlined key="delete" />,
                      ]
                    : []
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Tag color={getStatusColor(appointment.status)}>
                        {appointment.status.toUpperCase()}
                      </Tag>
                      <Text strong>{appointment.petName}</Text>
                      <Text type="secondary">•</Text>
                      <Text>{appointment.clientName}</Text>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#666' }}>
                      <span>
                        <ClockCircleOutlined /> {moment(appointment.appointmentDate).format('HH:mm')}
                      </span>
                      <span>
                        <UserOutlined /> {appointment.veterinarian}
                      </span>
                    </div>

                    {appointment.reason && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {appointment.reason}
                        </Text>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', fontSize: 12 }}>
                    <div>
                      <PhoneOutlined /> {appointment.clientPhone}
                    </div>
                    <div>
                      <MailOutlined /> {appointment.clientEmail}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Card>

      {/* Modal para crear/editar citas */}
      <Modal
        title={editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="clientName"
              label="Nombre del Cliente"
              rules={[{ required: true, message: 'Ingrese el nombre del cliente' }]}
            >
              <Input placeholder="Nombre del cliente" />
            </Form.Item>

            <Form.Item
              name="clientEmail"
              label="Email del Cliente"
              rules={[
                { required: true, message: 'Ingrese el email del cliente' },
                { type: 'email', message: 'Ingrese un email válido' },
              ]}
            >
              <Input placeholder="cliente@email.com" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="clientPhone"
              label="Teléfono del Cliente"
              rules={[{ required: true, message: 'Ingrese el teléfono del cliente' }]}
            >
              <Input placeholder="+502 1234-5678" />
            </Form.Item>

            <Form.Item
              name="veterinarian"
              label="Veterinario"
              rules={[{ required: true, message: 'Seleccione el veterinario' }]}
            >
              <Select placeholder="Seleccionar veterinario">
                <Option value="Dr. García">Dr. García</Option>
                <Option value="Dra. López">Dra. López</Option>
                <Option value="Dr. Martínez">Dr. Martínez</Option>
                <Option value="Dra. Rodríguez">Dra. Rodríguez</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="petName"
              label="Nombre de la Mascota"
              rules={[{ required: true, message: 'Ingrese el nombre de la mascota' }]}
            >
              <Input placeholder="Nombre de la mascota" />
            </Form.Item>

            <Form.Item
              name="petType"
              label="Tipo de Mascota"
              rules={[{ required: true, message: 'Seleccione el tipo de mascota' }]}
            >
              <Select placeholder="Tipo de mascota">
                <Option value="perro">Perro</Option>
                <Option value="gato">Gato</Option>
                <Option value="ave">Ave</Option>
                <Option value="conejo">Conejo</Option>
                <Option value="otro">Otro</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duración (minutos)"
              initialValue={30}
            >
              <Select>
                <Option value={15}>15 minutos</Option>
                <Option value={30}>30 minutos</Option>
                <Option value={45}>45 minutos</Option>
                <Option value={60}>1 hora</Option>
                <Option value={90}>1.5 horas</Option>
                <Option value={120}>2 horas</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="appointmentDate"
              label="Fecha de la Cita"
              rules={[{ required: true, message: 'Seleccione la fecha' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="appointmentTime"
              label="Hora de la Cita"
              rules={[{ required: true, message: 'Seleccione la hora' }]}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                minuteStep={15}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="reason"
            label="Motivo de la Consulta"
            rules={[{ required: true, message: 'Ingrese el motivo de la consulta' }]}
          >
            <Input placeholder="Motivo de la consulta veterinaria" />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notas Adicionales"
          >
            <Input.TextArea
              rows={3}
              placeholder="Notas adicionales sobre la cita"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAppointment ? 'Actualizar Cita' : 'Crear Cita'}
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

export default AppointmentCalendar;