import { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Stack,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useStore } from '../stores/store';
import { observer } from 'mobx-react-lite';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ErrorIcon from '@mui/icons-material/Error';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Arrow down icon

const Sidebar = () => {
  const { userStore: { user, logout, isLoggedIn } } = useStore();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
        open={open}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="div">
            Reactivities
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem
            button
            component={NavLink}
            to="/activities"
            activeClassName="Mui-selected"
            onClick={handleDrawerClose}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Activities" />
          </ListItem>
          <ListItem
            button
            component={NavLink}
            to="/errors"
            activeClassName="Mui-selected"
            onClick={handleDrawerClose}
          >
            <ListItemIcon>
              <ErrorIcon />
            </ListItemIcon>
            <ListItemText primary="Errors" />
          </ListItem>
          <ListItem
            button
            component={NavLink}
            to="/stats"
            activeClassName="Mui-selected"
            onClick={handleDrawerClose}
          >
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Stats" />
          </ListItem>
          <ListItem
            button
            component={NavLink}
            to="/createActivity"
            onClick={handleDrawerClose}
          >
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="Create Activity" />
          </ListItem>
          <ListItem
            button
            component={NavLink}
            to="/users"
            activeClassName="Mui-selected"
            onClick={handleDrawerClose}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          {isLoggedIn ? (
            <Stack direction="column" alignItems="center" spacing={1}>
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar alt="User Avatar" src={user?.image || '/assets/user.png'} />
              </IconButton>
              <Typography variant="body2">
                {user?.displayName}
                <IconButton onClick={handleMenuOpen} size="small">
                  <ArrowDropDownIcon />
                </IconButton>
              </Typography>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem component={NavLink} to={`/profiles/${user?.username}`} onClick={handleMenuClose}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </Stack>
          ) : (
            <Button
              variant="contained"
              color="primary"
              component={NavLink}
              to="/login"
              fullWidth
              onClick={handleDrawerClose}
            >
              Login
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default observer(Sidebar);
