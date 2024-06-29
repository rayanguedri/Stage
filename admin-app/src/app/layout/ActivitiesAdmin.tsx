import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Tag, Tooltip, Popconfirm, message, Spin, Button } from 'antd';
import { useStore } from '../stores/store';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Profile } from '../models/profile';
import { Activity } from '../models/activity';

const ActivitiesAdmin = observer(() => {
  const { activityStore, userStore } = useStore();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadActivitiesAndUsers = async () => {
      await activityStore.loadActivities(); // Load all activities
      await userStore.loadUsers();
    };
    loadActivitiesAndUsers();
  }, [activityStore, userStore]);

  const handleDelete = async (id: string) => {
    try {
      await activityStore.deleteActivityAdmin(id);
      message.success('Activity deleted successfully');
      // Reload activities after deletion
      await activityStore.loadActivities();
    } catch (error) {
      message.error('Failed to delete activity');
    }
  };

  const handleBatchDelete = async () => {
    try {
      setLoading(true);
      // Perform batch deletion for selected activities
      await Promise.all(selectedRowKeys.map(async (id) => {
        await activityStore.deleteActivityAdmin(id);
      }));
      message.success('Selected activities deleted successfully');
      // Clear selection and reload activities after deletion
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
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'Venue', dataIndex: 'venue', key: 'venue' },
    {
      title: 'Attendees',
      dataIndex: 'attendees',
      key: 'attendees',
      render: (attendees: Profile[]) => (
        <span>
          {attendees?.map((attendee) => (
            <Tag key={attendee.username}>{attendee.displayName}</Tag>
          ))}
        </span>
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

  return (
    <div>
      <h1>Activities Admin</h1>
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
          dataSource={activityStore.activities} // Use all activities from store
          columns={columns}
          rowKey={(record) => record.id}
          pagination={false} // Disable built-in pagination
          rowSelection={{ ...rowSelection, type: 'checkbox' }} // Enable row selection with checkboxes
          scroll={{ y: 400 }} // Example scroll height
          loading={loading}
          onChange={() => {}} // Empty onChange to prevent console warnings
        />
      </Spin>
    </div>
  );
});

export default ActivitiesAdmin;
