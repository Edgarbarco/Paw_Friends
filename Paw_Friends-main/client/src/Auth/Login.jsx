import React, { useState } from "react";
import { Alert, Card, Form, Spin, Input, Typography, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext"; // Asegúrate de importar el contexto
import "../App.css";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth(); // Usar el método login del contexto
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Enviando datos de inicio de sesión:", values);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok && data.status === "exito") {
        console.log("Inicio de sesión exitoso. Datos recibidos:", data);

        // Usar el método login del contexto para actualizar el estado global
        login(data.token, data.user);

        message.success("¡Inicio de sesión exitoso!");
        navigate("/dashboard"); // Redirigir al dashboard
      } else {
        // Manejar errores del servidor correctamente
        const errorMessage = data.message || `Error del servidor (${response.status})`;
        setError(errorMessage);
        message.error(errorMessage);
        console.error("Error en el login:", {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
      }
    } catch (e) {
      console.error("Error de conexión con el servidor:", e);
      setError("Error de conexión con el servidor");
      message.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Card className="form-container" style={{ marginTop: 120 }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <img
              src="https://i.pinimg.com/736x/ef/97/90/ef9790a063fd9d4e72cb3b59aa0a3a6c.jpg"
              alt="Inicio de Sesión"
              className="form-img-vertical"
            />
          </div>
          <div style={{ flex: 1 }}>
            <Typography.Title level={3} strong className="title">
              Iniciar Sesión
            </Typography.Title>
            <Typography.Text type="secondary" strong className="slogan">
              PawFriends - Gestión Eficiente y Amor Animal
            </Typography.Text>

            {error && (
              <Alert
                description={error}
                type="error"
                showIcon
                closable
                className="alert"
                style={{ marginBottom: "1rem" }}
              />
            )}

            <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
              <Form.Item
                label="Correo Electrónico"
                name="email"
                rules={[
                  {
                    required: true,
                    type: "email",
                    message: "Por favor ingresa un correo electrónico válido",
                  },
                ]}
              >
                <Input type="email" placeholder="Ingresa tu correo electrónico" />
              </Form.Item>

              <Form.Item
                label="Contraseña"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingresa tu contraseña",
                  },
                ]}
              >
                <Input.Password placeholder="Ingresa tu contraseña" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="btn"
                  loading={loading}
                >
                  {loading ? <Spin /> : "Iniciar Sesión"}
                </Button>
              </Form.Item>

              <Form.Item>
                <Link to="/register">
                  <Button size="large" className="btn">
                    Crear una cuenta
                  </Button>
                </Link>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Card>
    </>
  );
};

export default Login;
