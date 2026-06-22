// src/modules/events/ManageAgendaPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Timeline,
  Typography
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { agendaService } from '../../services/agendaService';
import { CreateAgendaItemRequest } from '../../types/agenda.types';
import { eventService } from '../../services/eventService';
import { AgendaItem, Event } from '../../types/event.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AgendaFormValues {
  title: string;
  description?: string;
  speaker?: string;
  timeRange: [Dayjs, Dayjs];
  order?: number;
}

const ManageAgendaPage: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Control del modal de agregar/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [form] = Form.useForm<AgendaFormValues>();

  // Cargar evento y agenda al montar
  const loadData = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const [eventData, agendaData] = await Promise.all([
        eventService.getEventById(eventId),
        agendaService.getEventAgenda(eventId)
      ]);
      setEvent(eventData);
      setAgenda(agendaData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  // Abrir modal para agregar nuevo item
  const handleOpenAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalOpen(true);
  };

  // Abrir modal para editar item existente
  const handleOpenEdit = (item: AgendaItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      description: item.description,
      speaker: item.speaker,
      timeRange: [dayjs(item.startTime), dayjs(item.endTime)],
      order: item.order
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  // Guardar (crear o editar)
  const handleSubmit = async (values: AgendaFormValues) => {
    if (!eventId) return;
    setSubmitting(true);
    try {
      if (editingItem) {
        // Editar item existente
        const updated = await agendaService.updateAgendaItem(editingItem._id, {
          title: values.title,
          description: values.description,
          speaker: values.speaker,
          startTime: values.timeRange[0].toISOString(),
          endTime: values.timeRange[1].toISOString(),
          order: values.order ?? editingItem.order
        });
        // Actualizar lista local sin recargar
        setAgenda(prev =>
          prev.map(item => item._id === updated._id ? updated : item)
            .sort((a, b) => a.order - b.order ||
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        );
        message.success('Actividad actualizada exitosamente');
      } else {
        // Crear nuevo item
        const itemData: CreateAgendaItemRequest = {
          title: values.title,
          description: values.description,
          speaker: values.speaker,
          startTime: values.timeRange[0].toISOString(),
          endTime: values.timeRange[1].toISOString(),
          order: values.order ?? agenda.length
        };
        const created = await agendaService.createAgendaItem(eventId, itemData);
        setAgenda(prev =>
          [...prev, created].sort((a, b) => a.order - b.order ||
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        );
        message.success('Actividad agregada exitosamente');
      }
      handleCloseModal();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Error al guardar actividad');
    } finally {
      setSubmitting(false);
    }
  };

  // Eliminar item con confirmación
  const handleDelete = (item: AgendaItem) => {
    Modal.confirm({
      title: '¿Eliminar esta actividad?',
      content: (
        <Text>
          Estás por eliminar <Text strong>"{item.title}"</Text> de la agenda.
        </Text>
      ),
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await agendaService.deleteAgendaItem(item._id);
          setAgenda(prev => prev.filter(a => a._id !== item._id));
          message.success('Actividad eliminada');
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Error al eliminar actividad');
        }
      }
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
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
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Encabezado */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/my-events')}
        style={{ marginBottom: 16, padding: 0 }}
      >
        Volver a Mis Eventos
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            <ScheduleOutlined /> Gestionar Agenda
          </Title>
          {event && (
            <Text type="secondary">{event.title}</Text>
          )}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleOpenAdd}
        >
          Agregar Actividad
        </Button>
      </div>

      {/* Aviso de que puede terminar sin agregar agenda */}
      <Alert
        message="La agenda es opcional"
        description="Podés agregar actividades ahora o más tarde desde Mis Eventos. El evento ya fue creado exitosamente."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        closable
      />

      {/* Lista de agenda */}
      <Card>
        {agenda.length === 0 ? (
          <Empty
            description="Todavía no hay actividades en la agenda"
            style={{ padding: '40px 0' }}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
              Agregar primera actividad
            </Button>
          </Empty>
        ) : (
          <Timeline
            items={agenda.map(item => ({
              color: 'blue',
              children: (
                <Card
                  size="small"
                  style={{ marginBottom: 8 }}
                  extra={
                    <Space>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(item)}
                      >
                        Eliminar
                      </Button>
                    </Space>
                  }
                >
                  <Row gutter={[16, 8]}>
                    <Col xs={24} md={5}>
                      <Tag color="blue">
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </Tag>
                      <Tag color="default">#{item.order}</Tag>
                    </Col>
                    <Col xs={24} md={19}>
                      <Text strong style={{ display: 'block' }}>{item.title}</Text>
                      {item.speaker && (
                        <Text type="secondary" style={{ display: 'block' }}>
                          Disertante: {item.speaker}
                        </Text>
                      )}
                      {item.description && (
                        <Text style={{ display: 'block', marginTop: 4 }}>
                          {item.description}
                        </Text>
                      )}
                    </Col>
                  </Row>
                </Card>
              )
            }))}
          />
        )}
      </Card>

      {/* Botón finalizar */}
      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          icon={<CheckOutlined />}
          onClick={() => navigate('/my-events')}
        >
          Finalizar y volver a Mis Eventos
        </Button>
      </div>

      {/* Modal agregar/editar actividad */}
      <Modal
        title={editingItem ? 'Editar Actividad' : 'Agregar Actividad'}
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="Título de la actividad"
            rules={[
              { required: true, message: 'Ingresa un título' },
              { max: 120, message: 'Máximo 120 caracteres' }
            ]}
          >
            <Input placeholder="Ej: Charla principal" />
          </Form.Item>

          <Form.Item
            name="speaker"
            label="Disertante"
          >
            <Input placeholder="Ej: María García" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción"
          >
            <TextArea
              rows={3}
              maxLength={500}
              showCount
              placeholder="Descripción opcional de la actividad"
            />
          </Form.Item>

          {event && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 12 }}
              message="Restricción horaria"
              description={`Las actividades deben realizarse entre ${dayjs(event.startDateTime).format('DD/MM/YYYY HH:mm')} y ${dayjs(event.endDateTime).format('DD/MM/YYYY HH:mm')}`}
            />
          )}

          <Form.Item
            name="timeRange"
            label="Horario"
            rules={[
              { required: true, message: 'Selecciona horario de inicio y fin' },
              {
                validator: (_, value?: [Dayjs, Dayjs]) => {

                  if (!value || value.length !== 2) {
                    return Promise.reject(
                      new Error('Selecciona horario de inicio y fin')
                    );
                  }

                  const [start, end] = value;

                  if (end.isSame(start) || end.isBefore(start)) {
                    return Promise.reject(
                      new Error('La hora de fin debe ser posterior al inicio')
                    );
                  }

                  if (event) {

                    const eventStart = dayjs(event.startDateTime);
                    const eventEnd = dayjs(event.endDateTime);

                    if (start.isBefore(eventStart)) {
                      return Promise.reject(
                        new Error(
                          `La actividad no puede comenzar antes de ${eventStart.format('DD/MM/YYYY HH:mm')}`
                        )
                      );
                    }

                    if (end.isAfter(eventEnd)) {
                      return Promise.reject(
                        new Error(
                          `La actividad no puede finalizar después de ${eventEnd.format('DD/MM/YYYY HH:mm')}`
                        )
                      );
                    }
                  }

                  return Promise.resolve();
                }
              }
            ]}
          >
            <DatePicker.RangePicker
              showTime={{ format: 'HH:mm' }}
              format="DD/MM/YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder={['Hora inicio', 'Hora fin']}
              disabledDate={(current) => {
                if (!event) return false;

                const eventStart = dayjs(event.startDateTime).startOf('day');
                const eventEnd = dayjs(event.endDateTime).endOf('day');

                return (
                  current &&
                  (
                    current.isBefore(eventStart) ||
                    current.isAfter(eventEnd)
                  )
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="order"
            label="Orden"
            tooltip="Número que define la posición en la agenda (0 = primero)"
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingItem ? 'Guardar Cambios' : 'Agregar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageAgendaPage;
