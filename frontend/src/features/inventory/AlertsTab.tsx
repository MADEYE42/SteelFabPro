import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, InputAdornment, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface AlertItem {
  id: number;
  message: string;
  type: string;
  createdAt: string;
  resolved: boolean;
}

const typeOptions = ['All', 'Stock Low', 'Stock Out', 'Other'];

const AlertsTab: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editAlert, setEditAlert] = useState<AlertItem | null>(null);
  const [form, setForm] = useState({ message: '', type: '', resolved: false });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<number[]>([]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory-service/alerts');
      setAlerts(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load alerts', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleOpen = (alert?: AlertItem) => {
    if (alert) {
      setEditAlert(alert);
      setForm({ message: alert.message, type: alert.type, resolved: alert.resolved });
    } else {
      setEditAlert(null);
      setForm({ message: '', type: '', resolved: false });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditAlert(null);
  };

  const handleSubmit = async () => {
    try {
      if (editAlert) {
        await api.put(`/inventory-service/alerts/${editAlert.id}`, form);
        setSnackbar({ open: true, message: 'Alert updated', severity: 'success' });
      } else {
        await api.post('/inventory-service/alerts', form);
        setSnackbar({ open: true, message: 'Alert created', severity: 'success' });
      }
      fetchAlerts();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save alert', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/inventory-service/alerts/${id}`);
      setSnackbar({ open: true, message: 'Alert deleted', severity: 'success' });
      fetchAlerts();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete alert', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'message', headerName: 'Message', flex: 2 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'createdAt', headerName: 'Created At', flex: 1 },
    { field: 'resolved', headerName: 'Resolved', flex: 1, renderCell: (params) => params.row.resolved ? 'Yes' : 'No' },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <>
          <Button size="small" onClick={() => handleOpen(params.row)}>Edit</Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </>
      ),
      flex: 1,
    },
  ];

  // Client-side search and filter
  const filteredAlerts = alerts.filter(a =>
    (typeFilter === 'All' || a.type === typeFilter) &&
    (a.message.toLowerCase().includes(search.toLowerCase()))
  );

  // Export to CSV
  const handleExport = () => {
    const rows = filteredAlerts;
    const csv = [
      ['Message', 'Type', 'Created At', 'Resolved'],
      ...rows.map(a => [a.message, a.type, a.createdAt, a.resolved ? 'Yes' : 'No'])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alerts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectionModel.map(id => api.delete(`/inventory-service/alerts/${id}`)));
      setSnackbar({ open: true, message: 'Selected alerts deleted', severity: 'success' });
      fetchAlerts();
      setSelectionModel([]);
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected alerts', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Alerts</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={selectionModel.length === 0}>Bulk Delete</Button>
          <Button variant="contained" onClick={() => handleOpen()}>Add Alert</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search alerts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {typeOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      </Box>
      <DataGrid
        autoHeight
        rows={filteredAlerts}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
        checkboxSelection
        onRowSelectionModelChange={ids => setSelectionModel(ids as number[])}
        rowSelectionModel={selectionModel}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editAlert ? 'Edit Alert' : 'Add Alert'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Message"
            fullWidth
            value={form.message}
            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Type"
            fullWidth
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Resolved"
            select
            fullWidth
            value={form.resolved ? 'Yes' : 'No'}
            onChange={e => setForm(f => ({ ...f, resolved: e.target.value === 'Yes' }))}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AlertsTab; 