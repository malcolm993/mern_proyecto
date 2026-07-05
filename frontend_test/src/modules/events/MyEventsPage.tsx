// src/modules/events/MyEventsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Empty,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  Alert,
  Tooltip
} from 'antd';
import {
  CalendarOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlusOutlined,
  ScheduleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { Event } from '../../types/event.types';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  activo: 'green',
  cancelado: 'red',
  finalizado: 'gray',
  agotado: 'volcano'
};

const MyEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getMyEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, []);

  const handleDelete = (event: Event) => {
    // Validaciones previas al modal de confirmación
    if (event.status !== 'activo') {
      message.error('Solo se pueden eliminar eventos activos');
      return;
    }
    if (event.currentParticipants > 0) {
      message.error('No podés eliminar un evento con participantes inscritos');
      return;
    }

    Modal.confirm({
      title: '¿Eliminar este evento?',
      content: (
        <Text>
          Estás por eliminar <Text strong>"{event.title}"</Text>. Esta acción no se puede deshacer.
        </Text>
      ),
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          setDeletingId(event._id);
          await eventService.deleteEvent(event._id);
          message.success('Evento eliminado exitosamente');
          // Actualizar lista sin recargar la página
          setEvents(prev => prev.filter(e => e._id !== event._id));
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Error al eliminar evento');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleCancelEvent = (event: Event) => {
    if (event.status === 'cancelado') {
      message.error('El evento ya está cancelado');
      return;
    }

    if (event.status === 'finalizado') {
      message.error('No se puede cancelar un evento finalizado');
      return;
    }

    Modal.confirm({
      title: '¿Cancelar este evento?',
      content: (
        <Text>
          Estás por cancelar <Text strong>"{event.title}"</Text>. Las reservas activas asociadas
          pasarán a estado cancelado.
        </Text>
      ),
      okText: 'Sí, cancelar evento',
      okType: 'danger',
      cancelText: 'Volver',
      onOk: async () => {
        try {
          setCancellingId(event._id);
          const cancelledEvent = await eventService.cancelEvent(event._id);
          message.success('Evento cancelado exitosamente');
          setEvents(prev => prev.map(e => e._id === event._id ? cancelledEvent : e));
        } catch (err) {
          message.error(err instanceof Error ? err.message : 'Error al cancelar evento');
        } finally {
          setCancellingId(null);
        }
      }
    });
  };

  const handleExportCSV = (eventId: string) => {
    try {
      eventService.exportReservationsCSV(eventId);
      message.success('Descarga iniciada');
    } catch {
      message.error('Error al iniciar la descarga');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={1}>
            <CalendarOutlined /> Mis Eventos
          </Title>
          <Text type="secondary">Gestioná los eventos que creaste</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/events/create')}
        >
          Crear Evento
        </Button>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {events.length === 0 ? (
        <Empty
          description="Todavía no creaste ningún evento"
          style={{ marginTop: 64 }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/events/create')}>
            Crear mi primer evento
          </Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {events.map((event) => {
            const isDeleting = deletingId === event._id;
            const isCancelling = cancellingId === event._id;
            const canEdit = event.status === 'activo' && event.currentParticipants === 0;
            const canDelete = event.status === 'activo' && event.currentParticipants === 0;
            const canCancel = event.status === 'activo' || event.status === 'agotado';

            return (
              <Col xs={24} md={12} lg={8} key={event._id}>
                <Card
                  style={{ height: '100%' }}
                  actions={[
                    // Editar — solo si activo y sin inscriptos
                    <Tooltip
                      key="edit"
                      title={!canEdit ? 'Solo se puede editar si el evento está activo y sin inscriptos' : ''}
                    >
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        disabled={!canEdit}
                        onClick={() => navigate(`/events/edit/${event._id}`)}
                      >
                        Editar
                      </Button>
                    </Tooltip>,

                    // Descargar inscriptos — siempre disponible
                    <Tooltip key="download" title="Descargar listado de inscriptos (CSV)">
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleExportCSV(event._id)}
                      >
                        Inscriptos
                      </Button>
                    </Tooltip>,

                    // Cancelar evento — cambia el estado y cancela reservas activas
                    <Tooltip
                      key="cancel-event"
                      title={!canCancel ? 'Solo se pueden cancelar eventos activos o agotados' : ''}
                    >
                      <Button
                        type="link"
                        danger
                        icon={<CloseCircleOutlined />}
                        disabled={!canCancel}
                        loading={isCancelling}
                        onClick={() => handleCancelEvent(event)}
                      >
                        Cancelar
                      </Button>
                    </Tooltip>,

                    // Eliminar — solo si activo y sin inscriptos
                    <Tooltip
                      key="delete"
                      title={!canDelete ? 'Solo se puede eliminar si el evento está activo y sin inscriptos' : ''}
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={!canDelete}
                        loading={isDeleting}
                        onClick={() => handleDelete(event)}
                      >
                        Eliminar
                      </Button>
                    </Tooltip>,
                    // Dentro del map de events, en el array actions de Card:
                    <Tooltip key="agenda" title="Agregar o editar actividades de agenda">
                      <Button
                        type="link"
                        icon={<ScheduleOutlined />}
                        onClick={() => navigate(`/events/${event._id}/agenda/manage`)}
                      >
                        Agenda
                      </Button>
                    </Tooltip>
                  ]}
                >
                  {/* Título y estado */}
                  <div style={{ marginBottom: 12 }}>
                    <Title level={4} style={{ marginBottom: 4 }}>
                      {event.title}
                    </Title>
                    <Space>
                      <Tag color={statusColors[event.status]}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Tag>
                      <Tag color="blue">{event.interestCategory}</Tag>
                    </Space>
                  </div>

                  {/* Fecha */}
                  <div style={{ marginBottom: 8 }}>
                    <CalendarOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                    <Text type="secondary">{formatDate(event.startDateTime)}</Text>
                  </div>

                  {/* Participantes */}
                  <div style={{ marginBottom: 8 }}>
                    <TeamOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                    <Text>
                      {event.currentParticipants} / {event.maxParticipants} inscriptos
                    </Text>
                  </div>

                  {/* Ubicación */}
                  <div>
                    <Text type="secondary">{event.location}</Text>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default MyEventsPage;
