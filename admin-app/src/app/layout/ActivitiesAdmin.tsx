import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Table, Tag, Tooltip } from 'antd';
import { useStore } from '../stores/store';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Profile } from '../models/profile';
import { Activity } from '../models/activity'; // Import Activity model if not already imported

const ActivitiesAdmin = observer(() => {
  const { activityStore, userStore } = useStore();

  useEffect(() => {
    const loadActivitiesAndUsers = async () => {
      await activityStore.loadActivities();
      await userStore.loadUsers(); 
    };
    loadActivitiesAndUsers();
  }, [activityStore, userStore]);

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date', 
      render: (date: string) => date ? format(new Date(date), 'dd MMM yyyy') : 'N/A' 
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
          {attendees?.map(attendee => (
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
        const host = userStore.userRegistry.get(hostUsername); // Get host data from userRegistry
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
        ) : 'Unknown';
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (activity: Activity) => (
        <Link to={`/activities/${activity.id}`}>View Activity</Link>
      ),
    }
  ];

  return (
    <div>
      <h1>Activities Admin</h1>
      <Table
        dataSource={activityStore.activitiesByDate.slice()} // Ensure data is observable and cloned
        columns={columns}
        loading={activityStore.loadingInitial}
        rowKey={(activity) => activity.id} // Assuming each activity has a unique id
      />
    </div>
  );
});

export default ActivitiesAdmin;
