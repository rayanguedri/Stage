import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Tag, Tooltip, Popconfirm, message } from 'antd';
import { useStore } from '../stores/store';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Profile } from '../models/profile';
import { Activity } from '../models/activity';

const ActivitiesAdmin = observer(() => {
  const { activityStore, userStore } = useStore();

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
    } catch (error) {
      message.error('Failed to delete activity');
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
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
      render: (activity: Activity) => (
        <span>
          <Link to={`/activities/${activity.id}`}>View Activity</Link>
          <Popconfirm
            title="Are you sure you want to delete this activity?"
            onConfirm={() => handleDelete(activity.id)}
            okText="Yes"
            cancelText="No"
          >
            <a style={{ marginLeft: 16, color: 'red' }}>Delete</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>Activities Admin</h1>
      <Table
        dataSource={activityStore.activities.slice()} // Use all activities from store
        columns={columns}
        loading={activityStore.loadingInitial}
        rowKey={(activity) => activity.id}
      />
    </div>
  );
});

export default ActivitiesAdmin;
