// src/modules/events/EditEventPage.tsx
import React, { useEffect, useState } from 'react';
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
  Spin,
  Alert
} from 'antd';
import {
  SaveOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import dayjs, { Dayjs } from 'dayjs';
import type { RuleObject } from 'antd/es/form';
import { Event } from '../../types/event.types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Misma interfaz que CreateEventPage
interface EventFormValues {
  title: string;
  description: string;
  location: string;
  dateRange: [Dayjs, Dayjs];
  maxParticipants: number;
  interestCategory: Event['interestCategory'];
}

const EditEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [form] = Form.useForm<EventFormValues>();
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos del evento al montar el componente
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;

      try {
        setLoadingEvent(true);
        const event = await eventService.getEventById(eventId);

        // Pre-cargar el formulario con los datos existentes
        // La diferencia clave con CreateEventPage: acá seteamos valores iniciales
        form.setFieldsValue({
          title: event.title,
          description: event.description,
          location: event.location,
          dateRange: [
            dayjs(event.startDateTime),
            dayjs(event.endDateTime)
          ],
          maxParticipants: event.maxParticipants,
          interestCategory: event.interestCategory
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el evento');
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEvent();
  }, [eventId, form]);

  const onFinish = async (values: EventFormValues) => {
    if (!eventId) return;

    try {
      setLoading(true);

      await eventService.updateEvent(eventId, {
        title: values.title,
        description: values.description,
        location: values.location,
        startDateTime: values.dateRange[0].toISOString(),
        endDateTime: values.dateRange[1].toISOString(),
        maxParticipants: values.maxParticipants,
        interestCategory: values.interestCategory
      });

      message.success('Evento actualizado exitosamente');
      navigate('/my-events');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Error al actualizar evento');
    } finally {
      setLoading(false);
    }
  };

  // Mismo validador que CreateEventPage
  const validateDateRange: RuleObject['validator'] = (
    _rule: RuleObject,
    value?: [Dayjs, Dayjs]
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

  if (loadingEvent) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/my-events')}>
              Volver a Mis Eventos
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        {/* Botón volver */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/my-events')}
          style={{ marginBottom: 16, padding: 0 }}
        >
          Volver a Mis Eventos
        </Button>

        <Title level={2} style={{ marginBottom: 8, textAlign: 'center' }}>
          <CalendarOutlined /> Editar Evento
        </Title>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
          Modificá los campos que quieras actualizar
        </Text>

        {/* Formulario — idéntico al de CreateEventPage, pre-cargado con form.setFieldsValue */}
        <Form<EventFormValues>
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={[24, 16]}>
            <Col span={24}>
              <Form.Item<EventFormValues>
                name="title"
                label="Título del Evento"
                rules={[
                  { required: true, message: 'Ingresa un título' },
                  { max: 100, message: 'Máximo 100 caracteres' }
                ]}
              >
                <Input placeholder="Ej: Taller de React Avanzado" size="large" />
              </Form.Item>
            </Col>

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
                <Input placeholder="Ej: Av. Principal 123, Sala de Conferencias" size="large" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item<EventFormValues>
                name="dateRange"
                label="Fecha y Hora del Evento"
                rules={[
                  { required: true, message: 'Selecciona fecha y hora' },
                  { validator: validateDateRange }
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
                <InputNumber min={1} max={10} style={{ width: '100%' }} size="large" />
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

          <Form.Item style={{ marginTop: 32 }}>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                type="default"
                size="large"
                onClick={() => navigate('/my-events')}
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
                Guardar Cambios
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditEventPage;
