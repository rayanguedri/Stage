import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/store';
import { Link } from 'react-router-dom';
import { Table, Container, Button } from 'semantic-ui-react';
import { User } from '../models/user';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility function to safely handle error type
function isErrorWithMessage(error: unknown): error is { message: string } {
  return typeof error === 'object' && error !== null && 'message' in error;
}

const Users = () => {
  const { userStore } = useStore();

  useEffect(() => {
    const loadUsersAndLogStatus = async () => {
      await userStore.loadUsers();
      // Log isBanned status of each user
      userStore.users.forEach(user => {
        console.log(`User: ${user.username}, isBanned: ${user.isBanned}`);
      });
    };
    loadUsersAndLogStatus();
  }, [userStore]);

  const handleBanUser = async (user: User) => {
    try {
      await userStore.banUser(user);
      toast.success(`User ${user.displayName} was banned successfully.`);
      userStore.loadUsers(); // Refresh user list from the backend
    } catch (error) {
      if (isErrorWithMessage(error)) {
        console.error('Error banning user:', error.message);
        toast.error(`Error banning user: ${error.message}`);
      } else {
        console.error('Unknown error banning user:', error);
        toast.error('Unknown error banning user.');
      }
    }
  };

  const handleUnbanUser = async (user: User) => {
    try {
      await userStore.unbanUser(user);
      toast.success(`User ${user.displayName} was unbanned successfully.`);
      userStore.loadUsers(); // Refresh user list from the backend
    } catch (error) {
      if (isErrorWithMessage(error)) {
        console.error('Error unbanning user:', error.message);
        toast.error(`Error unbanning user: ${error.message}`);
      } else {
        console.error('Unknown error unbanning user:', error);
        toast.error('Unknown error unbanning user.');
      }
    }
  };

  return (
    <Container>
      <h1>Users</h1>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Profile Image</Table.HeaderCell>
            <Table.HeaderCell>Display Name</Table.HeaderCell>
            <Table.HeaderCell>Username</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell>Banned</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {userStore.users.map((user) => (
            <Table.Row key={user.username}>
              <Table.Cell>
                <img 
                  src={user.image || '/assets/user.png'} 
                  alt={`${user.displayName}`}
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                />
              </Table.Cell>
              <Table.Cell>
                <Link to={`/profiles/${user.username}`}>{user.displayName}</Link>
              </Table.Cell>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
              <Table.Cell>{user.isBanned ? 'Yes' : 'No'}</Table.Cell>
              <Table.Cell>
                {user.isBanned ? (
                  <Button color='green' onClick={() => handleUnbanUser(user)}>Unban</Button>
                ) : (
                  <Button color='red' onClick={() => handleBanUser(user)}>Ban</Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

export default observer(Users);
