import React from 'react';
import { Card, Table, Badge, Button, Space } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';

const VaccinationPage = () => {
  // Datos simulados (Mock Data) para el diseño del Carnet Digital
  const data = [
    { key: '1', pet: 'Perro Pelusa', vaccine: 'Parvovirus Canino', date: '12/03/2026', status: 'Aplicada' },
    { key: '2', pet: 'Perro Lucas', vaccine: 'Antirrábica', date: '20/06/2026', status: 'Aplicada' },
    { key: '3', pet: 'Gato Sasha', vaccine: 'Triple Felina', date: '01/09/2026', status: 'Aplicada' },
    { key: '4', pet: 'Firulais', vaccine: 'Refuerzo Anual Quintuple', date: '15/12/2026', status: 'Pendiente' },
  ];

  const columns = [
    { title: 'Mascota', dataIndex: 'pet', key: 'pet' },
    { title: 'Vacuna / Tratamiento', dataIndex: 'vaccine', key: 'vaccine' },
    { title: 'Fecha Programada', dataIndex: 'date', key: 'date' },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'Aplicada' ? 'success' : 'error'} 
          text={status} 
        />
      ),
    },
  ];

  return (
    <Card 
      title="🐾 Portal de Clientes - Carnet de Vacunación Digital" 
      extra={
        <Button type="primary" danger icon={<FilePdfOutlined />}>
          Exportar Carnet PDF
        </Button>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <p>Bienvenido al módulo de autogestión. Aquí puede visualizar el estado médico actualizado de sus mascotas.</p>
      </div>
      <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
    </Card>
  );
};

export default VaccinationPage;
