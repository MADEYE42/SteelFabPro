import React, { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert, Typography, IconButton, InputAdornment, MenuItem, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import DoneIcon from '@mui/icons-material/Done';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import api from '../../api/axios';

interface NotificationItem {
  id: number;
  message: string;
  type: string;
  createdAt: string;
  read: boolean;
}

const typeOptions = ['All', 'Info', 'Warning', 'Alert'];

const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/communication-service/notifications');
      setNotifications(res.data);
      setLastUpdated(new Date());
    } catch {
      setSnackbar({ open: true, message: 'Failed to load notifications', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.patch(`/communication-service/notifications/${id}`, { read: true });
      setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
      fetchNotifications();
    } catch {
      setSnackbar({ open: true, message: 'Failed to mark as read', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/communication-service/notifications/${id}`);
      setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' });
      fetchNotifications();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete notification', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'message', headerName: 'Message', flex: 2 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'createdAt', headerName: 'Created At', flex: 1 },
    { field: 'read', headerName: 'Read', flex: 1, renderCell: (params) => params.row.read ? 'Yes' : 'No' },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <>
          {!params.row.read && <IconButton color="primary" onClick={() => handleMarkRead(params.row.id)}><DoneIcon /></IconButton>}
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton>
        </>
      ),
      flex: 1,
    },
  ];

  const filteredNotifications = notifications.filter(n =>
    (typeFilter === 'All' || n.type === typeFilter) &&
    (n.message.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBulkDelete = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.delete(`/communication-service/notifications/${id}`)));
        setSnackbar({ open: true, message: 'Selected notifications deleted', severity: 'success' });
        fetchNotifications();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected notifications', severity: 'error' });
    }
  };

  const handleBulkMarkRead = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.patch(`/communication-service/notifications/${id}`, { read: true })));
        setSnackbar({ open: true, message: 'Selected notifications marked as read', severity: 'success' });
        fetchNotifications();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to mark selected notifications as read', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Notifications</Typography>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Search"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {typeOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      </Box>
      <DataGrid
        autoHeight
        rows={filteredNotifications}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
        checkboxSelection
        onRowSelectionModelChange={ids => setSelectionModel(Array.isArray(ids) ? ids : [])}
        rowSelectionModel={selectionModel as any}
      />
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
        <Button variant="outlined" color="primary" startIcon={<DoneAllIcon />} onClick={handleBulkMarkRead} disabled={!Array.isArray(selectionModel) || selectionModel.length === 0}>Bulk Mark as Read</Button>
        <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={!Array.isArray(selectionModel) || selectionModel.length === 0}>Bulk Delete</Button>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationsTab; 