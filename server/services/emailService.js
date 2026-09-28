const nodemailer = require('nodemailer');

/**
 * Servicio para envío de emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Inicializar el transporter de nodemailer
   */
  initializeTransporter() {
    try {
      // Verificar si están configuradas las variables de email
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Configuración de email incompleta. El envío de emails estará deshabilitado.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          ciphers: 'SSLv3'
        }
      });

      console.log('Servicio de email inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando servicio de email:', error.message);
    }
  }

  /**
   * Verificar si el servicio de email está disponible
   */
  isEmailAvailable() {
    return this.transporter !== null;
  }

  /**
   * Enviar email de notificación
   */
  async sendNotificationEmail(recipientEmail, notification) {
    try {
      if (!this.isEmailAvailable()) {
        console.log(' Email no disponible - Saltando envío de email');
        return false;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"PawFriends" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `🔔 ${notification.title}`,
        html: this.generateNotificationEmailTemplate(notification),
        text: this.generateNotificationTextTemplate(notification),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado exitosamente a ${recipientEmail}: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando email a ${recipientEmail}:`, error.message);
      return false;
    }
  }

  /**
   * Enviar email a múltiples destinatarios
   */
  async sendBulkNotificationEmails(notifications) {
    try {
      if (!this.isEmailAvailable()) {
        console.log('📧 Email no disponible - Saltando envío masivo');
        return 0;
      }

      const results = [];

      for (const notification of notifications) {
        // Obtener el email del destinatario
        const recipientEmail = notification.recipient?.email || notification.recipientEmail;

        if (recipientEmail) {
          const success = await this.sendNotificationEmail(recipientEmail, notification);
          results.push({ email: recipientEmail, success });
        }
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`📧 Emails enviados: ${successCount}/${results.length}`);

      return successCount;
    } catch (error) {
      console.error('❌ Error en envío masivo de emails:', error.message);
      return 0;
    }
  }

  /**
   * Generar template HTML para email de notificación
   */
  generateNotificationEmailTemplate(notification) {
    const priorityColors = {
      low: '#52c41a',
      medium: '#1890ff',
      high: '#faad14',
      urgent: '#ff4d4f',
    };

    const priorityLabels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
    };

    const typeLabels = {
      low_stock: 'Stock Bajo',
      new_product: 'Nuevo Producto',
      product_updated: 'Producto Actualizado',
      product_deleted: 'Producto Eliminado',
      medical_reminder: 'Recordatorio Médico',
      appointment_reminder: 'Recordatorio de Cita',
      system_alert: 'Alerta del Sistema',
      custom: 'Notificación Personalizada',
    };

    const typeEmojis = {
      low_stock: '📦',
      new_product: '✨',
      product_updated: '🔄',
      product_deleted: '🗑️',
      medical_reminder: '🏥',
      appointment_reminder: '📅',
      system_alert: '⚠️',
      custom: '🔔',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${notification.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .notification-card { background: white; padding: 20px; border-radius: 8px;
                               box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px;
                            font-size: 12px; font-weight: bold; color: white;
                            background-color: ${priorityColors[notification.priority] || '#1890ff'}; }
            .type-badge { display: inline-block; padding: 4px 12px; border-radius: 20px;
                         font-size: 12px; font-weight: bold; color: white;
                         background-color: #722ed1; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .timestamp { color: #999; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${typeEmojis[notification.type] || '🔔'} PawFriends</h1>
              <p>Sistema de Notificaciones</p>
            </div>

            <div class="content">
              <div class="notification-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                  <h2 style="margin: 0; color: #333;">${notification.title}</h2>
                  <div>
                    <span class="priority-badge">${priorityLabels[notification.priority] || 'Media'}</span>
                  </div>
                </div>

                <div style="margin-bottom: 15px;">
                  <span class="type-badge">${typeLabels[notification.type] || 'Notificación'}</span>
                </div>

                <p style="font-size: 16px; line-height: 1.6; margin: 15px 0;">
                  ${notification.message}
                </p>

                ${notification.data ? `
                  <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #555;">Detalles adicionales:</h4>
                    <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">
${JSON.stringify(notification.data, null, 2)}
                    </pre>
                  </div>
                ` : ''}

                <div class="timestamp">
                  Recibido: ${new Date(notification.createdAt).toLocaleString('es-GT')}
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Este es un mensaje automático del sistema PawFriends.</p>
              <p>Para gestionar tus preferencias de notificaciones, inicia sesión en tu cuenta.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generar template de texto plano para email
   */
  generateNotificationTextTemplate(notification) {
    const priorityLabels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente',
    };

    const typeLabels = {
      low_stock: 'Stock Bajo',
      new_product: 'Nuevo Producto',
      product_updated: 'Producto Actualizado',
      product_deleted: 'Producto Eliminado',
      medical_reminder: 'Recordatorio Médico',
      appointment_reminder: 'Recordatorio de Cita',
      system_alert: 'Alerta del Sistema',
      custom: 'Notificación Personalizada',
    };

    return `
PAW FRIENDSAPP - NOTIFICACIÓN
=============================

Título: ${notification.title}
Tipo: ${typeLabels[notification.type] || 'Notificación'}
Prioridad: ${priorityLabels[notification.priority] || 'Media'}

Mensaje:
${notification.message}

${notification.data ? `Detalles adicionales:
${JSON.stringify(notification.data, null, 2)}` : ''}

Fecha: ${new Date(notification.createdAt).toLocaleString('es-GT')}

---
Este es un mensaje automático del sistema PawFriends.
Para gestionar tus preferencias de notificaciones, inicia sesión en tu cuenta.
    `.trim();
  }

  /**
   * Enviar email de prueba
   */
  async sendTestEmail(testEmail) {
    try {
      if (!this.isEmailAvailable()) {
        return {
          success: false,
          message: 'Servicio de email no disponible. Configure las credenciales en el archivo .env'
        };
      }

      const testNotification = {
        title: 'Prueba de Email - PawFriends',
        message: 'Este es un email de prueba para verificar que el servicio de notificaciones funciona correctamente.',
        type: 'system_alert',
        priority: 'medium',
        createdAt: new Date(),
        data: {
          test: true,
          timestamp: new Date().toISOString(),
        }
      };

      const success = await this.sendNotificationEmail(testEmail, testNotification);

      return {
        success,
        message: success
          ? 'Email de prueba enviado exitosamente'
          : 'Error al enviar email de prueba'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }
}

// Crear instancia singleton
const emailService = new EmailService();

module.exports = emailService;