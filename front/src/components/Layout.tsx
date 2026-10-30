import { ReactNode, useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon as MuiListItemIcon,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon,
  List as ListIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { usePermissions } from '../hooks/usePermissions';

const drawerWidth = 240;

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  text: string;
  icon: ReactNode;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/home' },
  { text: 'Tiers', icon: <PeopleIcon />, path: '/tiers' },
  { text: 'Sociétés', icon: <BusinessIcon />, path: '/societes' },
  { text: 'Demandes d\'approbation', icon: <HourglassEmptyIcon />, path: '/tiers-pending-approval' },
  { text: 'Rôles de tiers', icon: <AssignmentIcon />, path: '/roles' },
  { text: 'Champs personnalisés', icon: <SettingsIcon />, path: '/custom-attributes' },
  { text: 'Listes de valeurs', icon: <ListIcon />, path: '/value-lists' },
  { text: 'Utilisateurs', icon: <ManageAccountsIcon />, path: '/users', adminOnly: true }
];

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const permissions = usePermissions();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    const result = (first + last).toUpperCase() || 'U';

    return result;
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.displayName) {
      return user.displayName;
    }
    return user?.email || 'Utilisateur';
  };

  // Filtrer les items du menu selon les permissions
  const visibleMenuItems = menuItems.filter((item) => {
    if (item.adminOnly) {
      return permissions.isAdmin();
    }
    return true;
  });

  const drawer = (
    <Box sx={{ backgroundColor: 'primary.main', height: '100%' }}>
      <Toolbar>
        <Box
          component="img"
          src="/logo_blanc_advitam.png"
          alt="Logo"
          sx={{
            width: '100%',
            height: 'auto',
            p: 2,
          }}
        />
      </Toolbar>
      <List>
        {visibleMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: 'white' }}
              />
              {item.adminOnly && (
                <Chip
                  label="ADMIN"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            MDM - Gestion des Tiers
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' } }}>
                {getDisplayName()}
              </Typography>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={anchorEl ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={anchorEl ? 'true' : undefined}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'secondary.main',
                    fontSize: '0.875rem',
                  }}
                >
                  {getInitials(user.firstName, user.lastName)}
                </Avatar>
              </IconButton>
            </Box>
          )}

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  minWidth: 200,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user && getInitials(user.firstName, user.lastName)}
              </Avatar>
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user && getDisplayName()}
                  </Typography>
                  <Chip
                    label={permissions.role}
                    size="small"
                    color={
                      permissions.isAdmin()
                        ? 'error'
                        : permissions.isManagerOrAbove()
                        ? 'warning'
                        : 'default'
                    }
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <MuiListItemIcon>
                <LogoutIcon fontSize="small" />
              </MuiListItemIcon>
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
