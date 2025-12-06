// src/modules/events/CreateEventPage.tsx
import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  DatePicker,
  InputNumber,
  Select,
  Space,
  message,
  Row,
  Col,
} from 'antd';
import {
  SaveOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CreateEventRequest } from '../../types/event.types';
import { eventService } from '../../services/eventService';
import dayjs, { Dayjs } from 'dayjs';
import type { RuleObject } from 'antd/es/form';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Interfaz para los valores del formulario
interface EventFormValues {
  title: string;
  description: string;
  location: string;
  dateRange: [Dayjs, Dayjs];
  maxParticipants: number;
  interestCategory: string;
}

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<EventFormValues>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: EventFormValues) => {
    try {
      setLoading(true);
      
      // Formatear fechas
      const eventData: CreateEventRequest = {
        title: values.title,
        description: values.description,
        location: values.location,
        startDateTime: values.dateRange[0].toISOString(),
        endDateTime: values.dateRange[1].toISOString(),
        maxParticipants: values.maxParticipants,
        interestCategory: values.interestCategory
      };

      await eventService.createEvent(eventData);
      
      message.success('Evento creado exitosamente');
      navigate('/events');
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message || 'Error al crear evento');
      } else {
        message.error('Error desconocido al crear evento');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateEndDate: RuleObject['validator'] = (
    rule: RuleObject,
    value?: [Dayjs , Dayjs]
  ) => {
    if (!value || value.length !== 2) {
      return Promise.reject('Selecciona fecha de inicio y fin');
    }
    
    const [start, end] = value;
    if (start.isBefore(dayjs(), 'minute')) {
      return Promise.reject('La fecha de inicio debe ser futura');
    }
    
    if (end.isBefore(start, 'minute')) {
      return Promise.reject('La fecha de fin debe ser posterior al inicio');
    }
    
    return Promise.resolve();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={2} style={{ marginBottom: 24, textAlign: 'center' }}>
          <CalendarOutlined /> Crear Nuevo Evento
        </Title>
        
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
          Completa todos los campos para crear tu evento
        </Text>

        <Form<EventFormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            maxParticipants: 5,
            interestCategory: 'tecnología'
          }}
        >
          <Row gutter={[24, 16]}>
            {/* Título */}
            <Col span={24}>
              <Form.Item<EventFormValues>
                name="title"
                label="Título del Evento"
                rules={[
                  { required: true, message: 'Ingresa un título' },
                  { max: 100, message: 'Máximo 100 caracteres' }
                ]}
              >
                <Input 
                  placeholder="Ej: Taller de React Avanzado" 
                  size="large"
                />
              </Form.Item>
            </Col>

            {/* Descripción */}
            <Col span={24}>
              <Form.Item<EventFormValues>
                name="description"
                label="Descripción"
                rules={[
                  { required: true, message: 'Ingresa una descripción' },
                  { max: 1000, message: 'Máximo 1000 caracteres' }
                ]}
              >
                <TextArea 
                  rows={4}
                  placeholder="Describe tu evento detalladamente..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>
            </Col>

            {/* Ubicación */}
            <Col span={24}>
              <Form.Item<EventFormValues>
                name="location"
                label={
                  <Space>
                    <EnvironmentOutlined />
                    <span>Ubicación</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Ingresa una ubicación' }]}
              >
                <Input 
                  placeholder="Ej: Av. Principal 123, Sala de Conferencias" 
                  size="large"
                />
              </Form.Item>
            </Col>

            {/* Fechas */}
            <Col span={24}>
              <Form.Item<EventFormValues>
                name="dateRange"
                label="Fecha y Hora del Evento"
                rules={[
                  { required: true, message: 'Selecciona fecha y hora' },
                  { validator: validateEndDate }
                ]}
              >
                <RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                  size="large"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>

            {/* Participantes y Categoría */}
            <Col xs={24} md={12}>
              <Form.Item<EventFormValues>
                name="maxParticipants"
                label={
                  <Space>
                    <UserOutlined />
                    <span>Máximo de Participantes</span>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Ingresa el número máximo' },
                  { type: 'number', min: 1, max: 10, message: 'Entre 1 y 10 participantes' }
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item<EventFormValues>
                name="interestCategory"
                label={
                  <Space>
                    <BookOutlined />
                    <span>Categoría</span>
                  </Space>
                }
                rules={[{ required: true, message: 'Selecciona una categoría' }]}
              >
                <Select size="large">
                  <Option value="tecnología">Tecnología</Option>
                  <Option value="negocios">Negocios</Option>
                  <Option value="artes">Artes</Option>
                  <Option value="deportes">Deportes</Option>
                  <Option value="educacion">Educación</Option>
                  <Option value="networking">Networking</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Botones de acción */}
          <Form.Item style={{ marginTop: 32 }}>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                type="default"
                size="large"
                onClick={() => navigate('/events')}
              >
                Cancelar
              </Button>
              
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Crear Evento
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateEventPage;