import React, { useState, useEffect } from 'react';
import { Calendar, Card, Typography, Timeline, Modal, Badge } from 'antd';
import { ClockCircleOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const { Title } = Typography;

const AgendaPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => moment());
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Obtener historial de citas del backend
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/history`);
        if (response.ok) {
          const data = await response.json();
          setAppointments(data || []);
        }
      } catch (err) {
        console.error('Error obteniendo historial de citas:', err);
      }
    };
    fetchAppointments();
  }, []);

  // Al darle clic a un día en el calendario
  const onSelect = (value, info) => {
    // "info.source" can be 'date' or 'month'. If they just clicked a date cell:
    if (info?.source === 'date' || !info) {
      setSelectedDate(value);
      setIsModalVisible(true);
    } else {
      // Just changed month, do nothing with modal
      setSelectedDate(value);
    }
  };

  // Filtrar citas para el día seleccionado (para el modal)
  const appointmentsForSelectedDate = appointments.filter(app => {
    const appDate = app.date ? moment(app.date).format('YYYY-MM-DD') : null;
    return appDate === selectedDate.format('YYYY-MM-DD');
  });

  // Renderizar inyecciones visuales dentro de cada cuadrito del mes
  const dateCellRender = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(app => 
      app.date && moment(app.date).format('YYYY-MM-DD') === dateStr
    );

    if (dayAppointments.length === 0) return null;

    return (
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontSize: '11px' }}>
        {dayAppointments.slice(0, 3).map((app, index) => {
          const isCompleted = app.completed === true || app.status === 'completado' || app.status === true;
          return (
            <li key={index} style={{ marginBottom: '2px' }}>
              <Badge 
                color={isCompleted ? 'green' : 'blue'} 
                text={`${moment(app.date).format('HH:mm')} ${app.petName || 'Mascota'}`} 
                style={{ fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
              />
            </li>
          );
        })}
        {dayAppointments.length > 3 && (
          <li style={{ color: '#1890ff', fontWeight: 'bold' }}>
            + {dayAppointments.length - 3} más...
          </li>
        )}
      </ul>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ width: '100%', maxWidth: 1100, margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, textAlign: 'center', color: '#2c3e50' }}>Agenda General de la Clínica</Title>
          <p style={{ color: '#7f8c8d' }}>Da clic en cualquier día para ver el detalle de las citas.</p>
        </div>
        
        {/* El calendario maestro */}
        <Calendar 
          onSelect={onSelect} 
          cellRender={(current, info) => {
             if (info.type === 'date') return dateCellRender(current);
             return info.originNode;
          }} 
        />
      </Card>

      {/* Modal Flotante con el Detalle del Día */}
      <Modal
        title={
          <div style={{ fontSize: '20px', color: '#1890ff' }}>
            Citas para el {selectedDate.format('DD [de] MMMM [de] YYYY')}
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <div style={{ padding: '20px 0' }}>
          {appointmentsForSelectedDate.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', fontSize: '16px' }}>
              No hay citas programadas para este día. ¡Día libre! ☕
            </div>
          ) : (
            <Timeline mode="left" style={{ marginTop: '20px' }}>
              {appointmentsForSelectedDate.map((app, idx) => {
                const isCompleted = app.completed === true || app.status === 'completado' || app.status === true;
                return (
                  <Timeline.Item
                    key={app._id || idx}
                    color={isCompleted ? "#52c41a" : "#1890ff"}
                    dot={isCompleted ? <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} /> : <ClockCircleOutlined style={{ fontSize: '18px' }} />}
                  >
                    <Card size="small" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ fontWeight: 'bold', fontSize: 16, color: '#222' }}>
                        <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                        {app.petName || 'Mascota'}
                        <span style={{ color: '#888', fontWeight: 'normal', marginLeft: 8 }}>
                          {app.ownerName ? `— Dueño: ${app.ownerName}` : ''}
                        </span>
                      </div>
                      <div style={{ color: '#666', fontSize: 14, marginBottom: 8, marginTop: 4 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        <strong>Hora:</strong> {moment(app.date).format('HH:mm')}
                      </div>
                      {app.status && (
                        <div style={{ fontSize: 13, marginBottom: 4 }}>
                          <strong>Estado:</strong> <span style={{ color: isCompleted ? '#52c41a' : '#faad14', fontWeight: 'bold' }}>{app.status.toUpperCase()}</span>
                        </div>
                      )}
                      {app.phone && <div style={{ fontSize: 13, marginBottom: 4 }}><strong>📞 Teléfono:</strong> {app.phone}</div>}
                      {app.medication && <div style={{ fontSize: 13, marginBottom: 4 }}><strong>🩺 Tratamiento:</strong> {app.medication}</div>}
                      {app.reason && <div style={{ fontSize: 13, marginBottom: 4 }}><strong>💡 Motivo:</strong> {app.reason}</div>}
                    </Card>
                  </Timeline.Item>
                );
              })}
            </Timeline>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AgendaPage;