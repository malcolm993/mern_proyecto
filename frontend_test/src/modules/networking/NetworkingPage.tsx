import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography
} from 'antd';
import { CheckOutlined, CloseOutlined, MailOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons';
import { networkingService } from '../../services/networkingService';
import { ContactRequest, NetworkingUser } from '../../types/networking.types';

const { Title, Text, Paragraph } = Typography;

// showEmail solo es true cuando status === 'accepted'
const renderUserSummary = (user: NetworkingUser, showEmail = false) => (
  <Space direction="vertical" size={2}>
    <Text strong>{user.name}</Text>
    <Text type="secondary">{user.company || 'Sin empresa cargada'}</Text>
    {user.businessArea && <Tag color="blue">{user.businessArea}</Tag>}
    {user.bio && <Paragraph style={{ marginBottom: 0 }}>{user.bio}</Paragraph>}
    {user.interests && user.interests.length > 0 && (
      <Space size={[4, 4]} wrap>
        {user.interests.map((interest) => (
          <Tag key={interest}>{interest}</Tag>
        ))}
      </Space>
    )}
    {/* Email visible solo cuando la solicitud fue aceptada */}
    {showEmail && user.email && (
      <Space>
        <MailOutlined style={{ color: '#1890ff' }} />
        <Text copyable style={{ color: '#1890ff' }}>
          {user.email}
        </Text>
      </Space>
    )}
  </Space>
);

const getStatusTag = (status: ContactRequest['status']) => {
  const config = {
    pending:  { color: 'gold',    label: 'Pendiente' },
    accepted: { color: 'green',   label: 'Aceptada'  },
    rejected: { color: 'red',     label: 'Rechazada' },
  };
  const { color, label } = config[status];
  return <Tag color={color}>{label}</Tag>;
};

const NetworkingPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<NetworkingUser[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<ContactRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<NetworkingUser | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadNetworkingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [suggestionsData, receivedData, sentData] = await Promise.all([
        networkingService.getSuggestions(),
        networkingService.getReceivedRequests(),
        networkingService.getSentRequests()
      ]);
      setSuggestions(suggestionsData);
      setReceivedRequests(receivedData);
      setSentRequests(sentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar networking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkingData();
  }, []);

  const handleSendRequest = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await networkingService.createContactRequest(selectedUser._id, contactMessage);
      message.success('Solicitud enviada');
      setSelectedUser(null);
      setContactMessage('');
      await loadNetworkingData();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await networkingService.acceptRequest(requestId);
        message.success('Solicitud aceptada');
      } else {
        await networkingService.rejectRequest(requestId);
        message.success('Solicitud rechazada');
      }
      await loadNetworkingData();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Error al responder solicitud');
    }
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
      <Title level={1}>
        <TeamOutlined /> Networking
      </Title>
      <Text type="secondary">Conecta con participantes con intereses o rubro en común.</Text>

      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginTop: 24 }} />}

      <Tabs
        style={{ marginTop: 24 }}
        items={[
          {
            key: 'suggestions',
            label: 'Sugerencias',
            children: suggestions.length === 0 ? (
              <Empty description="Completa tu rubro e intereses en el perfil para recibir sugerencias" />
            ) : (
              <Row gutter={[16, 16]}>
                {suggestions.map((participant) => (
                  <Col xs={24} md={12} lg={8} key={participant._id}>
                    <Card
                      title={participant.name}
                      actions={[
                        <Button
                          key="contact"
                          type="link"
                          icon={<SendOutlined />}
                          onClick={() => setSelectedUser(participant)}
                        >
                          Contactar
                        </Button>
                      ]}
                    >
                      {/* En sugerencias nunca se muestra el email */}
                      {renderUserSummary(participant, false)}
                    </Card>
                  </Col>
                ))}
              </Row>
            )
          },
          {
            key: 'received',
            label: 'Recibidas',
            children: (
              <List
                locale={{ emptyText: 'No tienes solicitudes recibidas' }}
                dataSource={receivedRequests}
                renderItem={(request) => (
                  <List.Item
                    actions={
                      request.status === 'pending'
                        ? [
                            <Button
                              key="accept"
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={() => handleRespond(request._id, 'accept')}
                            >
                              Aceptar
                            </Button>,
                            <Button
                              key="reject"
                              danger
                              icon={<CloseOutlined />}
                              onClick={() => handleRespond(request._id, 'reject')}
                            >
                              Rechazar
                            </Button>
                          ]
                        : [getStatusTag(request.status)]
                    }
                  >
                    <List.Item.Meta
                      title={request.requester.name}
                      description={
                        <Space direction="vertical">
                          {/* Email del requester visible solo si aceptaste la solicitud */}
                          {renderUserSummary(request.requester, request.status === 'accepted')}
                          {request.message && <Text>Mensaje: {request.message}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )
          },
          {
            key: 'sent',
            label: 'Enviadas',
            children: (
              <List
                locale={{ emptyText: 'No tienes solicitudes enviadas' }}
                dataSource={sentRequests}
                renderItem={(request) => (
                  <List.Item actions={[getStatusTag(request.status)]}>
                    <List.Item.Meta
                      title={request.receiver.name}
                      description={
                        <Space direction="vertical">
                          {/* Email del receiver visible solo si aceptó la solicitud */}
                          {renderUserSummary(request.receiver, request.status === 'accepted')}
                          {request.message && <Text>Mensaje: {request.message}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )
          }
        ]}
      />

      <Modal
        title={`Contactar a ${selectedUser?.name || ''}`}
        open={Boolean(selectedUser)}
        onCancel={() => {
          setSelectedUser(null);
          setContactMessage('');
        }}
        onOk={handleSendRequest}
        okText="Enviar solicitud"
        confirmLoading={submitting}
      >
        <Input.TextArea
          rows={4}
          maxLength={300}
          showCount
          value={contactMessage}
          onChange={(event) => setContactMessage(event.target.value)}
          placeholder="Mensaje opcional para iniciar el contacto"
        />
      </Modal>
    </div>
  );
};

export default NetworkingPage;