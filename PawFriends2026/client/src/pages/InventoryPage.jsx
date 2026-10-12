import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  message,
  Card,
  Space,
  Typography,
  Modal,
  Form,
  Popconfirm,
  DatePicker,
  Select
} from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  EditOutlined
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;

const InventoryPage = () => {
  const [form] = Form.useForm();
  const [productos, setProductos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const sortedData = (res.data.data || []).sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
      setProductos(sortedData);
      setFiltered(sortedData);
    } catch (error) {
      console.error("Error:", error);
      message.error("Error al cargar productos");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const filteredData = productos.filter(
      (p) =>
        (p.name?.toLowerCase().includes(term) || "") ||
        (p.type?.toLowerCase().includes(term) || "")
    );
    setFiltered(filteredData);
  }, [search, productos]);

  const handleCreate = () => {
    form.resetFields();
    setEditing(null);
    setVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      ...record,
      entryDate: record.entryDate ? dayjs(record.entryDate) : null
    });
    setEditing(record);
    setVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const tokenData = JSON.parse(localStorage.getItem('userData'));
      const token = tokenData?.userToken || localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success("Producto eliminado");
      fetchProductos();
    } catch (error) {
      message.error("Error al eliminar");
    }
  };

  const onFinish = async (values) => {
    try {
      const formattedValues = {
        name: values.name,
        description: values.description,
        type: Array.isArray(values.type) ? values.type.join(', ') : values.type,
        quantity: parseInt(values.quantity) || 0,
        stock: parseInt(values.stock) || 0,
        price: parseFloat(values.price) || 0,
        category: Array.isArray(values.category) ? values.category.join(', ') : (values.category || "Otros"),
        entryDate: values.entryDate ? values.entryDate.toISOString() : new Date().toISOString()
      };

      const tokenData = JSON.parse(localStorage.getItem('userData'));
      const token = tokenData?.userToken || localStorage.getItem('token');

      if (editing) {
        await axios.put(
         `${import.meta.env.VITE_API_URL}/api/products/${editing._id}`, 
          formattedValues, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Producto actualizado");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products`, 
          formattedValues, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Producto creado");
      }
      
      setVisible(false);
      fetchProductos();
    } catch (error) {
      console.error("Error completo:", error.response?.data);
      message.error(error.response?.data?.message || "Error al guardar");
    }
  };

  const columns = [
    {
      title: "",
      dataIndex: "icon",
      width: 50,
      render: () => <AppstoreOutlined style={{ fontSize: 22, color: "#1890ff" }} />
    },
    { title: "Nombre", dataIndex: "name" },
    { title: "Descripción", dataIndex: "description" },
    { title: "Tipo", dataIndex: "type" },
    { 
      title: "Stock", 
      dataIndex: "stock", 
      render: (stock, record) => {
        const isLowStock = stock <= record.quantity;
        return (
          <strong style={{ color: isLowStock ? '#ff4d4f' : 'inherit' }}>
            {stock}
          </strong>
        );
      } 
    },
    { title: "Stock Mín. (Alerta)", dataIndex: "quantity", responsive: ['lg'] },
    { title: "Precio", dataIndex: "price", render: (price) => `Q${parseFloat(price || 0).toFixed(2)}` },
    { 
      title: "Fecha de Ingreso", 
      dataIndex: "entryDate",
      render: (text) => text ? dayjs(text).format('DD/MM/YYYY HH:mm') : 'N/A'
    },
    {
      title: "Acciones",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
          />
          <Popconfirm
            title="¿Eliminar?"
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
      <Card style={{ maxWidth: 950, margin: "0 auto", borderRadius: 12 }}>
        <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
          Inventario
        </Title>
        <Space style={{ marginBottom: 24 }}>
          <Button type="primary" onClick={handleCreate}>
            Agregar Producto
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar..."
            style={{ maxWidth: 350 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Space>
        <Table
          rowKey="_id"
          loading={loading}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 6 }}
          bordered
        />
      </Card>

      <Modal
        title={editing ? "Editar Producto" : "Agregar Producto"}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
        okText={editing ? "Actualizar" : "Crear"}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descripción" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Categoría" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="Selecciona o escribe una categoría">
              <Select.Option value="Alimentos">Alimentos</Select.Option>
              <Select.Option value="Medicamentos">Medicamentos</Select.Option>
              <Select.Option value="Accesorios">Accesorios</Select.Option>
              <Select.Option value="Higiene">Higiene</Select.Option>
              <Select.Option value="Equipamiento">Equipamiento</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="type" label="Tipo / Para quién" rules={[{ required: true }]}>
            <Select mode="tags" placeholder="Selecciona o escribe un tipo">
              <Select.Option value="Perros">Perros</Select.Option>
              <Select.Option value="Gatos">Gatos</Select.Option>
              <Select.Option value="Aves">Aves</Select.Option>
              <Select.Option value="General">Uso General</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="stock" label="Stock Actual" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="quantity" label="Stock Mínimo (Alerta)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="price" label="Precio de Venta" rules={[{ required: true }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          {/* La fecha se asigna automáticamente en el código, no es necesario pedirla al usuario */}
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;