import { useEffect } from 'react';
import { Container, CssBaseline, Grid } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useStore } from '../stores/store';
import { observer } from 'mobx-react-lite';
import LoadingComponent from './LoadingComponent';
import ModalContainer from '../common/modals/ModalContainer';

import NavBar from './NavBar';
import { MapsProvider } from '../util/MapsContext';
import HomePage from '../../features/home/HomePage';

function App() {
  const location = useLocation();
  const { commonStore, userStore } = useStore();

  useEffect(() => {
    if (commonStore.token) {
      userStore.getUser().finally(() => commonStore.setAppLoaded());
    } else {
      commonStore.setAppLoaded();
    }
  }, [commonStore, userStore]);

  if (!commonStore.appLoaded) return <LoadingComponent content="Loading app..." />;

  return (
    <MapsProvider>
      <CssBaseline />
      <ModalContainer />
      <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
      <Grid container>
        {/* Sidebar */}
        <Grid item lg={3} md={4} sm={5} xs={12}>
          <NavBar />
        </Grid>

        {/* Main Content Area */}
        <Grid item lg={9} md={8} sm={7} xs={12}>
          <NavBar />
          <Container sx={{ marginTop: '7em', marginBottom: '2em' }}>
            {location.pathname === '/' ? <HomePage /> : <Outlet />}
          </Container>
        </Grid>
      </Grid>
    </MapsProvider>
  );
}

export default observer(App);
