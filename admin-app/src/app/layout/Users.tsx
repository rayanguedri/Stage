import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/store';
import { Link } from 'react-router-dom';
import { Table, Container } from 'semantic-ui-react'; // Import UI components

const Users = () => {
  const { userStore } = useStore();

  useEffect(() => {
    userStore.loadUsers();
  }, [userStore]);

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
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {userStore.users.map((user) => (
            <Table.Row key={user.username}>
              <Table.Cell>
                <img 
                  src={user.image || '/assets/user.png'} 
                  alt={`${user.displayName}`}
                  style={{width: '50px', height: '50px', borderRadius: '50%'}}
                />
              </Table.Cell>
              <Table.Cell>
                <Link to={`/profiles/${user.username}`}>{user.displayName}</Link>
              </Table.Cell>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.email}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

export default observer(Users);
