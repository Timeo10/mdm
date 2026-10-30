import { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { SnackbarContext } from '../../providers/SnackBarProvider';
import { UserRoleApi, UserRoleData } from '../../services/UserRoleApi';
import { UserRole } from '../../types/permissions';

export default function UsersList() {
  const [users, setUsers] = useState<UserRoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRoleData | null>(null);
  const [formData, setFormData] = useState({ email: '', role: UserRole.READONLY });
  const snackBarProvider = useContext(SnackbarContext);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await UserRoleApi.getAllUserRoles();
      setUsers(data);
    } catch (error) {
      console.error('Erreur de chargement des utilisateurs:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: UserRoleData) => {
    if (user) {
      setEditingUser(user);
      setFormData({ email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ email: '', role: UserRole.READONLY });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({ email: '', role: UserRole.READONLY });
  };

  const handleSubmit = async () => {
    try {
      await UserRoleApi.setUserRole(formData.email, formData.role);
      snackBarProvider?.showSnackbarMessage(
        editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur ajouté avec succès',
        'success',
      );
      handleCloseDialog();
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleToggleActive = async (email: string, currentlyActive: boolean) => {
    try {
      if (currentlyActive) {
        await UserRoleApi.deactivateUser(email);
        snackBarProvider?.showSnackbarMessage('Utilisateur désactivé', 'success');
      } else {
        await UserRoleApi.activateUser(email);
        snackBarProvider?.showSnackbarMessage('Utilisateur activé', 'success');
      }
      loadUsers();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      snackBarProvider?.showSnackbarMessage('Erreur lors du changement de statut', 'error');
    }
  };

  const getRoleColor = (role: UserRole): 'error' | 'warning' | 'info' | 'default' => {
    switch (role) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.MANAGER:
        return 'warning';
      case UserRole.USER:
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Administrateur';
      case UserRole.MANAGER:
        return 'Gestionnaire';
      case UserRole.USER:
        return 'Utilisateur';
      case UserRole.READONLY:
        return 'Lecture seule';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Gestion des Utilisateurs
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Ajouter un utilisateur
        </Button>
      </Box>
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date de création</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">Aucun utilisateur trouvé</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.uuid}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={getRoleLabel(user.role)} color={getRoleColor(user.role)} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.actif ? 'Actif' : 'Inactif'}
                          color={user.actif ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.dateCreation).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(user)}
                          title="Modifier le rôle"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(user.email, user.actif)}
                          title={user.actif ? 'Désactiver' : 'Activer'}
                          color={user.actif ? 'error' : 'success'}
                        >
                          {user.actif ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                label="Rôle"
              >
                <MenuItem value={UserRole.ADMIN}>Administrateur</MenuItem>
                <MenuItem value={UserRole.MANAGER}>Gestionnaire</MenuItem>
                <MenuItem value={UserRole.USER}>Utilisateur</MenuItem>
                <MenuItem value={UserRole.READONLY}>Lecture seule</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.email || !formData.role}
          >
            {editingUser ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
