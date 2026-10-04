import React, { useState } from 'react';
import { Card, Button, Typography, Alert, Space, Divider } from 'antd';

const { Title, Text } = Typography;

const TestPage = () => {
  const [testResults, setTestResults] = useState({});

  const testConnection = async (endpoint, description) => {
    try {
      console.log(`Probando: ${description}`);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      setTestResults(prev => ({
        ...prev,
        [description]: {
          success: response.ok,
          status: response.status,
          data: data,
          url: `${import.meta.env.VITE_API_URL}${endpoint}`
        }
      }));

      console.log('Respuesta:', { status: response.status, data });
    } catch (error) {
      console.error(`Error en ${description}:`, error);
      setTestResults(prev => ({
        ...prev,
        [description]: {
          success: false,
          error: error.message,
          url: `${import.meta.env.VITE_API_URL}${endpoint}`
        }
      }));
    }
  };

  const testLogin = async () => {
    try {
      console.log('Probando login...');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'admin@test.com',
            password: '123456'
          }),
        }
      );

      const data = await response.json();

      setTestResults(prev => ({
        ...prev,
        'Login Test': {
          success: response.ok,
          status: response.status,
          data: data,
          url: `${import.meta.env.VITE_API_URL}/api/auth/login`
        }
      }));

      console.log('Login response:', { status: response.status, data });
    } catch (error) {
      console.error('Error en login:', error);
      setTestResults(prev => ({
        ...prev,
        'Login Test': {
          success: false,
          error: error.message,
          url: `${import.meta.env.VITE_API_URL}/api/auth/login`
        }
      }));
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>Página de Pruebas - Diagnóstico de Conexión</Title>

      <Alert
        message="Información de Debugging"
        description={
          <div>
            <p><strong>Frontend URL:</strong> {window.location.origin}</p>
            <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL}</p>
            <p><strong>Ambiente:</strong> {import.meta.env.MODE || 'development'}</p>
          </div>
        }
        type="info"
        style={{ marginBottom: 24 }}
      />

      <Card title="Pruebas de Conexión">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            onClick={() => testConnection('/api/products', 'Productos (Público)')}
            block
          >
            Probar Productos (Sin Autenticación)
          </Button>

          <Button
            type="default"
            onClick={() => testConnection('/api/users', 'Usuarios (Protegido)')}
            block
          >
            Probar Usuarios (Requiere Autenticación)
          </Button>

          <Button
            type="default"
            onClick={() => testConnection('/api/history', 'Historial (Protegido)')}
            block
          >
            Probar Historial (Requiere Autenticación)
          </Button>

          <Divider />

          <Button
            type="primary"
            onClick={testLogin}
            block
          >
            Probar Login con Usuario de Prueba
          </Button>
        </Space>
      </Card>

      <Card title="Resultados de las Pruebas" style={{ marginTop: 16 }}>
        {Object.entries(testResults).map(([testName, result]) => (
          <Alert
            key={testName}
            message={testName}
            description={
              <div>
                <p><strong>URL:</strong> {result.url}</p>
                <p><strong>Estado:</strong> {result.status || 'N/A'}</p>
                <p><strong>Éxito:</strong> {result.success ? '✅ Sí' : '❌ No'}</p>
                {result.error && <p><strong>Error:</strong> {result.error}</p>}
                {result.data && (
                  <details>
                    <summary>Ver respuesta completa</summary>
                    <pre style={{ fontSize: 12, marginTop: 8 }}>
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            }
            type={result.success ? 'success' : 'error'}
            style={{ marginBottom: 8 }}
          />
        ))}
      </Card>
    </div>
  );
};

export default TestPage;