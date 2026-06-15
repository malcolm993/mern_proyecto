// src/components/events/EventFilters.tsx - CORREGIDO
import React from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Space, Row, Col } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  CalendarOutlined,
  TagOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { EventsFilter } from '../../types/event.types';

import { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;


interface FilterFormValues {
  search?: string;
  category?: string;
  status?: string;
  dateRange?: [Dayjs, Dayjs];
}

interface EventFiltersProps {
  onFilterChange: (filters: EventsFilter) => void;
  allowStatusFilter?:boolean; 
}

const EventFilters: React.FC<EventFiltersProps> = ({ onFilterChange , allowStatusFilter = false }) => {
  const [form] = Form.useForm<FilterFormValues>();

  // Categorías disponibles
  const categories = [
    { value: 'tecnología', label: 'Tecnología' },
    { value: 'negocios', label: 'Negocios' },
    { value: 'artes', label: 'Artes' },
    { value: 'deportes', label: 'Deportes' },
    { value: 'educacion', label: 'Educación' },
    { value: 'networking', label: 'Networking' }
  ];

  // Estados disponibles
  const statuses = [
    { value: 'activo', label: 'Activo' },
    { value: 'agotado', label: 'Agotado' },
    {value: 'cancelado', label: 'Cancelado' },
    { value: 'finalizado', label: 'Finalizado' }
  ];

  const handleSearch = (values: FilterFormValues) => {
    const filters: EventsFilter = {
      page: 1, // Siempre volver a página 1 al filtrar
      limit: 6
    };

    // Búsqueda por texto
    if (values.search) {
      filters.search = values.search;
    }

    // Filtro por categoría
    if (values.category) {
      filters.category = values.category;
    }

    // Filtro por estado
    if (values.status) {
      filters.status = values.status;
    }

    // Filtro por fecha
    if (values.dateRange && values.dateRange.length === 2) {
      filters.dateFrom = values.dateRange[0].format('YYYY-MM-DD');
      filters.dateTo = values.dateRange[1].format('YYYY-MM-DD');
    }

    onFilterChange(filters);
  };

  const handleReset = () => {
    form.resetFields();
    onFilterChange({ page: 1, limit: 6 });
  };

  return (
    <Card 
      style={{ marginBottom: 20 }}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <Form
        form={form}
        onFinish={handleSearch}
        layout="vertical"
      >
        <Row gutter={[16, 16]} align="bottom">
          {/* Búsqueda por texto */}
          <Col xs={24} md={8}>
            <Form.Item<FilterFormValues> name="search" label="Buscar eventos">
              <Input 
                placeholder="Título o descripción..."
                prefix={<SearchOutlined />}
                allowClear
              />
            </Form.Item>
          </Col>

          {/* Filtro por categoría */}
          <Col xs={24} md={6}>
            <Form.Item<FilterFormValues> name="category" label="Categoría">
              <Select 
                placeholder="Todas las categorías"
                allowClear
                suffixIcon={<TagOutlined />}
              >
                {categories.map(cat => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Filtro por estado */}
          <Col xs={24} md={5}>
            {allowStatusFilter && (
              <Form.Item<FilterFormValues> name="status" label="Estado">
                <Select 
                  placeholder="Todos los estados"
                  allowClear
                  suffixIcon={<CheckCircleOutlined />}
                >
                {statuses.map(status => (
                  <Option key={status.value} value={status.value}>
                    {status.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>)}
          </Col>

          {/* Filtro por fecha */}
          <Col xs={24} md={7}>
            <Form.Item<FilterFormValues> name="dateRange" label="Rango de fechas">
              <RangePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder={['Fecha inicio', 'Fecha fin']}
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>
          </Col>

          {/* Botones de acción */}
          <Col xs={24} md={24}>
            <Form.Item>
              <Space size="middle">
                <Button 
                  type="primary" 
                  htmlType="submit"
                  icon={<FilterOutlined />}
                >
                  Aplicar Filtros
                </Button>
                <Button 
                  onClick={handleReset}
                  icon={<ReloadOutlined />}
                >
                  Limpiar
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default EventFilters;