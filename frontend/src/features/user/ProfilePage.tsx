import React, { useState, useRef } from 'react';
import { Box, Typography, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Avatar, IconButton, CircularProgress } from '@mui/material';
import { useAuth } from './AuthContext';
import api from '../../api/axios';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone: string) {
  return /^\+?[0-9\-\s]{7,15}$/.test(phone);
}

const ProfilePage: React.FC = () => {
  const { user, token, login } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [address, setAddress] = useState(user?.address || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleEdit = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setCompany(user.company || '');
    setAddress(user.address || '');
    setEmail(user.email || '');
    setPassword('');
    setAvatar(user.avatarUrl || null);
    setAvatarFile(null);
    setError(null);
    setSuccess(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !company.trim() || !address.trim()) {
      setError('Name, Email, Company, and Address are required.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email format.');
      return;
    }
    if (phone && !validatePhone(phone)) {
      setError('Invalid phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let avatarUrl = user.avatarUrl;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const uploadRes = await api.post('/user-service/users/me/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        avatarUrl = uploadRes.data.avatarUrl;
      }
      const res = await api.patch('/user-service/users/me', {
        name,
        phone,
        company,
        address,
        email,
        avatarUrl,
        ...(password ? { password } : {}),
      });
      login(token!, res.data); // update user in context
      setSuccess('Profile updated successfully!');
      setTimeout(() => setOpen(false), 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={6}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar src={user.avatarUrl} sx={{ width: 64, height: 64, mr: 2 }} />
            <Box>
              <Typography variant="h5" gutterBottom>Profile</Typography>
              <Typography><b>Name:</b> {user.name}</Typography>
              <Typography><b>Email:</b> {user.email}</Typography>
              {user.phone && <Typography><b>Phone:</b> {user.phone}</Typography>}
              {user.company && <Typography><b>Company:</b> {user.company}</Typography>}
              {user.address && <Typography><b>Address:</b> {user.address}</Typography>}
              {user.roles && <Typography><b>Roles:</b> {user.roles.join(', ')}</Typography>}
            </Box>
          </Box>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleEdit}>Edit Profile</Button>
        </CardContent>
      </Card>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar src={avatar || undefined} sx={{ width: 64, height: 64, mr: 2 }} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <IconButton onClick={() => fileInputRef.current?.click()} color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </Box>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            label="Email"
            fullWidth
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            error={!!error && error.toLowerCase().includes('email')}
          />
          <TextField
            margin="normal"
            label="Phone"
            fullWidth
            value={phone}
            onChange={e => setPhone(e.target.value)}
            error={!!error && error.toLowerCase().includes('phone')}
          />
          <TextField
            margin="normal"
            label="Company"
            fullWidth
            value={company}
            onChange={e => setCompany(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            label="Address"
            fullWidth
            value={address}
            onChange={e => setAddress(e.target.value)}
            required
          />
          <TextField
            margin="normal"
            label="New Password"
            type="password"
            fullWidth
            value={password}
            onChange={e => setPassword(e.target.value)}
            helperText="Leave blank to keep current password"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading} variant="contained" startIcon={loading ? <CircularProgress size={18} /> : null}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage; 