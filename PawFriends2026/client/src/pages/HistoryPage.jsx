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
  Tag,
  Popconfirm,
  DatePicker,
  Switch
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const { Title } = Typography;

const HistoryPage = () => {
  const [form] = Form.useForm();
  const [histories, setHistories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [visible, setVisible] = useState(false);

  const fetchHistories = async () => {
    setLoading(true);
    try {
      console.log("Cargando historial...");
      const storedData = JSON.parse(localStorage.getItem("userData"));
      const token = storedData?.userToken;
      console.log("Token de usuario:", token);
      if (!token) throw new Error("No hay token");

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Ordenar para que las recién agregadas/fechas futuras salgan de primero
      const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log("Historial cargado:", sortedData);
      setHistories(sortedData);
      setFiltered(sortedData);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      message.error("Error al cargar historial");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistories();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    console.log("Buscando en el historial con el término:", term);
    const filteredData = histories.filter(
      (h) =>
        h.petName?.toLowerCase().includes(term) ||
        h.ownerName?.toLowerCase().includes(term) ||
        h.medication?.toLowerCase().includes(term)
    );
    console.log("Historial filtrado:", filteredData);
    setFiltered(filteredData);
  }, [search, histories]);

  const handleCreate = () => {
    console.log("Abriendo modal para registrar nueva cita...");
    setEditingRecord(null);
    form.resetFields();
    setVisible(true);
  };

  const handleEdit = (record) => {
    console.log("Editando cita:", record); // Verificar los datos del registro
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      date: record.date ? dayjs(record.date) : null, // Convertir la fecha a un objeto dayjs
    });
    setVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      console.log("Eliminando cita con ID:", id);
      const storedData = JSON.parse(localStorage.getItem("userData"));
      const token = storedData?.userToken;
      if (!token) throw new Error("No hay token");

      await axios.delete(`${import.meta.env.VITE_API_URL}/api/history/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Cita eliminada");
      fetchHistories();
    } catch (error) {
      console.error("Error al eliminar cita:", error);
      message.error("Error al eliminar");
    }
  };

  const handleStatusChange = async (id, completed) => {
    try {
      const storedData = JSON.parse(localStorage.getItem("userData"));
      const token = storedData?.userToken;
      if (!token) throw new Error("No hay token");

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/history/${id}`,
        { completed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success(completed ? "Cita marcada como completada" : "Cita marcada como pendiente");
      fetchHistories();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      message.error("Error al actualizar estado");
    }
  };

  const onFinish = async (values) => {
    try {
      console.log("Datos enviados al servidor:", values);
      const storedData = JSON.parse(localStorage.getItem("userData"));
      const token = storedData?.userToken;
      if (!token) throw new Error("No hay token");

      const payload = {
        ...values,
        date: values.date ? values.date.toISOString() : undefined,
      };

      if (editingRecord) {
        console.log("Editando cita con ID:", editingRecord._id);
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/history/${editingRecord._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("Cita actualizada");
      } else {
        console.log("Creando nueva cita...");
        await axios.post(`${import.meta.env.VITE_API_URL}/api/history`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        message.success("Cita creada");
      }
      setVisible(false);
      fetchHistories();
    } catch (error) {
      console.error("Error al guardar cita:", error.response?.data || error.message);
      message.error("Error al guardar cita");
    }
  };

  const columns = [
    {
      title: "",
      dataIndex: "icon",
      width: 50,
      render: () => <FileTextOutlined style={{ fontSize: 22, color: "#1890ff" }} />,
    },
    {
      title: "Mascota",
      dataIndex: "petName",
      render: (petName) => (
        <span style={{ fontWeight: 500 }}>{petName}</span>
      ),
    },
    {
      title: "Dueño",
      dataIndex: "ownerName",
      render: (ownerName) => <span>{ownerName}</span>,
    },
    {
      title: "Correo",
      dataIndex: "ownerEmail",
      render: (email) => (
        <span style={{ fontSize: 12 }}>
          <MailOutlined /> {email || 'N/A'}
        </span>
      ),
    },
    {
      title: "Teléfono",
      dataIndex: "ownerPhone",
      render: (phone) => (
        <span style={{ fontSize: 12 }}>
          <PhoneOutlined /> {phone || 'N/A'}
        </span>
      ),
    },
    {
      title: "Estado",
      dataIndex: "completed",
      align: "center",
      render: (completed, record) => (
        <Switch
          checked={completed}
          onChange={(checked) => handleStatusChange(record._id, checked)}
          checkedChildren="Completado"
          unCheckedChildren="Pendiente"
        />
      ),
    },
    {
      title: "Motivo",
      dataIndex: "medication",
      render: (medication) =>
        medication ? (
          <Tag color="purple" style={{ fontWeight: 500 }}>
            {medication}
          </Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
    },
    {
      title: "Peso",
      dataIndex: "weight",
      render: (weight) =>
        weight ? (
          <Tag color="blue">{weight} lb</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
    },
    {
      title: "Fecha y Hora",
      dataIndex: "date",
      render: (date) =>
        date ? (
          <Tag color="gold">
            {dayjs(date).format("DD/MM/YYYY HH:mm")}
          </Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        ),
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
            title="¿Seguro que deseas eliminar esta cita?"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger type="primary" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        style={{
          maxWidth: 950,
          margin: "0 auto",
          borderRadius: 12,
          boxShadow: "0 2px 12px #00000010",
        }}
        bodyStyle={{ padding: 24 }}
      >
        <Title level={2} style={{ marginBottom: 24, textAlign: "center" }}>
          Historial de Citas
        </Title>
        <Space style={{ marginBottom: 24, width: "100%" }}>
          <Button type="primary" onClick={handleCreate}>
            Registrar nueva cita
          </Button>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Buscar por mascota, dueño o medicación..."
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
          scroll={{ x: true }}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          bordered
        />
      </Card>

      <Modal
        title={editingRecord ? "Editar Cita" : "Registrar Cita"}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
        okText={editingRecord ? "Actualizar" : "Crear"}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="petName"
            label="Nombre de la Mascota"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ownerName"
            label="Nombre del Dueño"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="ownerEmail"
            label="Correo del Dueño"
            rules={[
              { required: true, message: "Este campo es obligatorio" },
              { type: 'email', message: 'Ingrese un email válido' },
            ]}
          >
            <Input placeholder="correo@ejemplo.com" />
          </Form.Item>
          <Form.Item
            name="ownerPhone"
            label="Teléfono del Dueño"
            rules={[{ required: true, message: "Este campo es obligatorio" }]}
          >
            <Input placeholder="+502 1234-5678" />
          </Form.Item>
          <Form.Item name="medication" label="Motivo">
            <Input />
          </Form.Item>
          <Form.Item name="weight" label="Peso" rules={[
             {required: true, message: "Este campo es obligatorio"},
             {
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
              message: "Por favor ingresa un número válido",
             },
          ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="date"
            label="Fecha y Hora de la Cita"
            rules={[
              { required: true, message: "Este campo es obligatorio" },
              {
                validator: (_, value) =>
                  value && value.isBefore(dayjs())
                    ? Promise.reject("La fecha debe ser futura")
                    : Promise.resolve(),
              },
            ]}
          >
            <DatePicker
              showTime={{ format: "HH:mm" }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HistoryPage;