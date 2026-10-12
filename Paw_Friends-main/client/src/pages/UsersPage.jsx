import React, { useEffect, useState } from "react";
import { Table, Button, Input, message, Tag, Switch, Card, Space, Typography, Popconfirm, Modal, Form, Select } from "antd";
import { UserOutlined, SearchOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Title } = Typography;

const UsersPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { userData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData && userData.role !== 'admin') {
      message.error("No tienes permisos para ver esta página.");
      navigate("/dashboard");
    }
  }, [userData, navigate]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const storedData = JSON.parse(localStorage.getItem('userData'));
      const token = storedData?.userToken;
      if (!token) throw new Error('No hay token');

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  const usersArray = Array.isArray(res.data.data) ? res.data.data : [];
  setUsuarios(usersArray);
  setFiltered(usersArray);
    } catch {
      message.error("Error al cargar usuarios");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      const storedData = JSON.parse(localStorage.getItem('userData'));
      const token = storedData?.userToken;
      if (!token) throw new Error('No hay token');

      await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      message.success("Usuario eliminado");
      fetchUsuarios();
    } catch {
      message.error("Error al eliminar usuario");
    }
  };

  const handleToggleEstado = async (id, currentStatus) => {
    try {
      const storedData = JSON.parse(localStorage.getItem('userData'));
      const token = storedData?.userToken;
      if (!token) throw new Error('No hay token');

      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/${id}/estado`,
        { activo: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      message.success("Estado actualizado");
      fetchUsuarios();
    } catch {
      message.error("Error al actualizar estado");
    }
  };

  useEffect(() => {
    fetchUsuarios();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filteredData = Array.isArray(usuarios)
      ? usuarios.filter(u =>
          u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
        )
      : [];
    setFiltered(filteredData);
  }, [search, usuarios]);

  const [visible, setVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const handleCreate = () => {
    form.resetFields();
    setEditingUser(null);
    setVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role
    });
    setEditingUser(record);
    setVisible(true);
  };

  const onFinish = async (values) => {
    try {
      const storedData = JSON.parse(localStorage.getItem('userData'));
      const token = storedData?.userToken;

      if (editingUser) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${editingUser._id}`, 
          { name: values.name, email: values.email, role: values.role },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Usuario actualizado");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, 
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Empleado/Usuario creado exitosamente");
      }
      setVisible(false);
      fetchUsuarios();
    } catch (error) {
      message.error(error.response?.data?.message || "Error al guardar el usuario");
    }
  };

  const columns = [
    {
      title: "",
      dataIndex: "avatar",
      width: 50,
      render: () => <UserOutlined style={{ fontSize: 22, color: "#1890ff" }} />
    },
    { title: "Nombre", dataIndex: "name" },
    { title: "Correo", dataIndex: "email" },
    {
      title: "Rol",
      dataIndex: "role",
      render: (role) => {
        let color = "green";
        let label = "Cliente / Usuario";
        if (role === "admin") { color = "geekblue"; label = "Administrador"; }
        else if (role === "empleado") { color = "purple"; label = "Empleado"; }
        return <Tag color={color} style={{ fontWeight: 500 }}>{label}</Tag>;
      }
    },
    {
      title: "Estado",
      dataIndex: "activo",
      render: (activo, record) => (
        <Switch
          checked={activo}
          checkedChildren="Activo"
          unCheckedChildren="Inactivo"
          onChange={() => handleToggleEstado(record._id, activo)}
        />
      )
    },
    {
      title: "Acciones",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)} 
          />
          <Popconfirm
            title="¿Seguro que deseas eliminar este usuario?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger type="primary" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card
        style={{
          maxWidth: 950,
          margin: "0 auto",
          borderRadius: 12,
          boxShadow: "0 2px 12px #00000010"
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
          Administrar Personal
        </Title>
        <Space style={{ marginBottom: 24 }}>
          <Button type="primary" onClick={handleCreate}>
            Agregar Empleado
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar por nombre o correo..."
            style={{ width: 350 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
          />
        </Space>
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={Array.isArray(filtered) ? filtered : []}
          scroll={{ x: true }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          bordered
        />
      </Card>

      <Modal
        title={editingUser ? "Editar Empleado" : "Nuevo Empleado"}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
        okText={editingUser ? "Actualizar" : "Crear Empleado"}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Nombre Completo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 6 }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="role" label="Rol del Sistema" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Administrador (Acceso total)</Select.Option>
              <Select.Option value="empleado">Empleado (Atención y operaciones)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;