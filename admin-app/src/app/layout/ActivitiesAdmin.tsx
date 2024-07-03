import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Tooltip, Popconfirm, message, Spin, Button, Input, Slider, Row, Col } from 'antd';
import { useStore } from '../stores/store';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Profile } from '../models/profile';
import { Activity } from '../models/activity';
import { ChatComment } from '../models/comment';
import './styles.css'; // Import the CSS file for styling

const ActivitiesAdmin = observer(() => {
  const { activityStore, userStore } = useStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minAverageRating, setMinAverageRating] = useState<number>(0);
  const [maxAverageRating, setMaxAverageRating] = useState<number>(5);

  useEffect(() => {
    const loadActivitiesAndUsers = async () => {
      await activityStore.loadActivities();
      await userStore.loadUsers();
    };
    loadActivitiesAndUsers();
  }, [activityStore, userStore]);

  const handleDelete = async (id: string) => {
    try {
      await activityStore.deleteActivityAdmin(id);
      message.success('Activity deleted successfully');
      await activityStore.loadActivities();
    } catch (error) {
      message.error('Failed to delete activity');
    }
  };

  const handleBatchDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map(async (id) => {
        await activityStore.deleteActivityAdmin(id);
      }));
      message.success('Selected activities deleted successfully');
      setSelectedRowKeys([]);
      await activityStore.loadActivities();
    } catch (error) {
      message.error('Failed to delete selected activities');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Activity) => (
        <Link to={`/activities/${record.id}`}>{text}</Link>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => (date ? format(new Date(date), 'dd MMM yyyy') : 'N/A'),
    },
    { title: 'Category', dataIndex: 'category', key: 'category', ellipsis: true },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'City', dataIndex: 'city', key: 'city', ellipsis: true },
    { title: 'Venue', dataIndex: 'venue', key: 'venue', ellipsis: true },
    {
      title: 'Nº of Comments',
      dataIndex: 'comments',
      key: 'comments',
      render: (comments: ChatComment[]) => (
        <span>{comments ? comments.length : 0}</span>
      ),
    },
    {
      title: 'Nº of Attendees',
      dataIndex: 'attendees',
      key: 'attendees',
      render: (attendees: Profile[]) => (
        <span>{attendees.length}</span>
      ),
    },
    {
      title: 'Host',
      dataIndex: 'hostUsername',
      key: 'host',
      render: (hostUsername: string) => {
        const host = userStore.userRegistry.get(hostUsername);
        return host ? (
          <Tooltip title={host.displayName}>
            <Link to={`/profiles/${host.username}`}>
              <img
                src={host.image || '/assets/user.png'}
                alt={host.displayName}
                style={{ width: '30px', height: '30px', borderRadius: '50%' }}
              />
              <span style={{ marginLeft: 8 }}>{host.displayName}</span>
            </Link>
          </Tooltip>
        ) : (
          'Unknown'
        );
      },
    },
    {
      title: 'Average Rating',
      dataIndex: 'averageRating',
      key: 'averageRating',
      render: (averageRating: number) => (averageRating ? averageRating.toFixed(1) : 'No rating yet'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Activity) => (
        <span>
          <Popconfirm
            title="Are you sure you want to delete this activity?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <a style={{ color: 'red' }}>Delete</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  const onSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys as string[]);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const filteredActivities = activityStore.activities
    .filter(activity =>
      (activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.venue.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activity.averageRating >= minAverageRating) &&
      (activity.averageRating <= maxAverageRating)
    );

  return (
    <div>
      <h1>Activities Admin</h1>
      <div style={{ marginBottom: '16px' }}>
        <Input
          placeholder='Search activities...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '8px', width: '300px' }}
        />
        <Row gutter={16} align="middle">
          <Col>
            <span>Min Rating:</span>
          </Col>
          <Col>
            <Slider
              min={0}
              max={5}
              step={0.1}
              value={minAverageRating}
              onChange={(value) => setMinAverageRating(value)}
              style={{ width: '200px' }}
            />
          </Col>
          <Col>
            <span>{minAverageRating.toFixed(1)}</span>
          </Col>
          <Col>
            <span>Max Rating:</span>
          </Col>
          <Col>
            <Slider
              min={0}
              max={5}
              step={0.1}
              value={maxAverageRating}
              onChange={(value) => setMaxAverageRating(value)}
              style={{ width: '200px' }}
            />
          </Col>
          <Col>
            <span>{maxAverageRating.toFixed(1)}</span>
          </Col>
        </Row>
      </div>
      <Spin spinning={activityStore.loadingInitial}>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={handleBatchDelete}
            loading={loading}
            disabled={selectedRowKeys.length === 0}
          >
            Delete Selected
          </Button>
        </div>
        <Table
          dataSource={filteredActivities}
          columns={columns}
          rowKey={(record) => record.id}
          pagination={false}
          rowSelection={{ ...rowSelection, type: 'checkbox' }}
          scroll={{ x: 'max-content' }} 
          loading={loading}
          onChange={() => {}}
          rowClassName={(_record, index) => index % 2 === 0 ? 'row-even' : 'row-odd'} 
        />
      </Spin>
    </div>
  );
});

export default ActivitiesAdmin;
