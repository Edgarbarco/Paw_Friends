import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space,
  notification,
  message 
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  SendOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ContactForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // Configurar notificaciones de Ant Design
  const [api, contextHolder] = notification.useNotification();

  // Función para mostrar notificación de éxito
  const showSuccessNotification = (values) => {
    api.success({
      message: '✅ ¡Registro Exitoso!',
      description: (
        <div>
          <Text>Tu solicitud ha sido enviada correctamente.</Text>
          <br />
          <Text type="secondary">
            Nos contactaremos contigo pronto a <strong>{values.correo}</strong>
          </Text>
        </div>
      ),
      placement: 'topRight',
      duration: 8,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      style: {
        width: 400,
      },
      btn: (
        <Button 
          type="primary" 
          size="small"
          onClick={() => api.destroy()}
        >
          Entendido
        </Button>
      ),
    });
  };

  // Función para mostrar notificación con progreso
  const showProgressNotification = () => {
    api.open({
      message: '⏳ Enviando Solicitud',
      description: 'Procesando tu información...',
      placement: 'topRight',
      duration: 2,
      showProgress: true,
      pauseOnHover: false,
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    // Mostrar notificación de progreso
    showProgressNotification();

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contacto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        // Mostrar notificación de éxito
        showSuccessNotification(values);
        
        // También mostrar mensaje simple
        message.success('¡Contacto registrado exitosamente!');
        
        // Limpiar formulario
        form.resetFields();
      } else {
        // Notificación de error
        api.error({
          message: '❌ Error al Enviar',
          description: data.message || 'No se pudo enviar tu solicitud. Intenta nuevamente.',
          placement: 'topRight',
          duration: 5,
        });
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Notificación de error de conexión
      api.error({
        message: '🔌 Error de Conexión',
        description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* IMPORTANTE: contextHolder para las notificaciones */}
      {contextHolder}
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card
          style={{
            maxWidth: 600,
            width: '100%',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <Title level={2} style={{ marginBottom: 8 }}>
                🐾 Contáctanos
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Déjanos tus datos y nos comunicaremos contigo pronto
              </Text>
            </div>

            {/* Formulario */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark="optional"
            >
              <Form.Item
                label="Nombre"
                name="nombre"
                rules={[
                  { required: true, message: 'Por favor ingresa tu nombre' },
                  { min: 2, message: 'El nombre debe tener al menos 2 caracteres' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Juan"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Apellido"
                name="apellido"
                rules={[
                  { required: true, message: 'Por favor ingresa tu apellido' },
                  { min: 2, message: 'El apellido debe tener al menos 2 caracteres' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Pérez"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Correo Electrónico"
                name="correo"
                rules={[
                  { required: true, message: 'Por favor ingresa tu correo' },
                  { type: 'email', message: 'Ingresa un correo válido' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="correo@ejemplo.com"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Teléfono"
                name="numero"
                rules={[
                  { required: true, message: 'Por favor ingresa tu teléfono' },
                  { 
                    pattern: /^[0-9+\-\s()]+$/, 
                    message: 'Ingresa un teléfono válido' 
                  }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="555-1234"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Motivo de Contacto"
                name="descripcion"
                rules={[
                  { required: true, message: 'Por favor describe el motivo' },
                  { min: 10, message: 'Describe con más detalle (mínimo 10 caracteres)' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SendOutlined />}
                  loading={loading}
                  block
                  style={{
                    height: 48,
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  Enviar Solicitud
                </Button>
              </Form.Item>
            </Form>

            {/* Info adicional */}
            <div style={{
              background: '#f0f9ff',
              padding: 16,
              borderRadius: 8,
              textAlign: 'center'
            }}>
              <Text type="secondary">
                📧 También puedes escribirnos a <strong>info@pawfriends.com</strong>
                <br />
                📞 o llamarnos al <strong>555-PETS</strong>
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </>
  );
};

export default ContactForm;


// ============================================
// INSTRUCCIONES DE INTEGRACIÓN
// ============================================

/*
PASO 1: Asegúrate de tener Ant Design instalado
---------------------------------------------
npm install antd

PASO 2: Importa los estilos en tu App.jsx o main.jsx
---------------------------------------------
import 'antd/dist/reset.css';

PASO 3: Usa el componente en tu Home.jsx o donde necesites
---------------------------------------------
import ContactForm from './components/ContactForm';

function Home() {
  return (
    <div>
      <ContactForm />
    </div>
  );
}

PASO 4: Actualiza ContactsAdmin.jsx con el código que te di arriba
---------------------------------------------
- Reemplaza todo el contenido de ContactsAdmin.jsx
- Las notificaciones aparecerán automáticamente cuando se cree un contacto

PASO 5: Verifica que el backend esté actualizado
---------------------------------------------
- Asegúrate de que contactController.js tenga el código actualizado
- Verifica que notificationController.js tenga SSE configurado
- Confirma que las rutas estén correctamente configuradas

PASO 6: Prueba el sistema completo
---------------------------------------------
1. Abre el formulario de contacto
2. Llena los datos y envía
3. Verás una notificación de éxito en el formulario
4. En ContactsAdmin verás el nuevo contacto
5. La campana de notificaciones mostrará la alerta
6. Recibirás emails tanto tú como el cliente

NOTAS IMPORTANTES:
- El {contextHolder} DEBE estar dentro del componente que usa notificaciones
- Las notificaciones SSE funcionan en tiempo real para todos los admins conectados
- Los emails se envían automáticamente al crear el contacto
*/