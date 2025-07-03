import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, InputAdornment, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface StockEntry {
  id: number;
  material: string;
  quantity: number;
  type: string;
  date: string;
  user: string;
}

const typeOptions = ['All', 'In', 'Out'];

const StockEntriesTab: React.FC = () => {
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<StockEntry | null>(null);
  const [form, setForm] = useState({ material: '', quantity: 0, type: '', date: '', user: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<number[]>([]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory-service/stock-entries');
      setEntries(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load stock entries', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleOpen = (entry?: StockEntry) => {
    if (entry) {
      setEditEntry(entry);
      setForm({ material: entry.material, quantity: entry.quantity, type: entry.type, date: entry.date, user: entry.user });
    } else {
      setEditEntry(null);
      setForm({ material: '', quantity: 0, type: '', date: '', user: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditEntry(null);
  };

  const handleSubmit = async () => {
    try {
      if (editEntry) {
        await api.put(`/inventory-service/stock-entries/${editEntry.id}`, form);
        setSnackbar({ open: true, message: 'Stock entry updated', severity: 'success' });
      } else {
        await api.post('/inventory-service/stock-entries', form);
        setSnackbar({ open: true, message: 'Stock entry created', severity: 'success' });
      }
      fetchEntries();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save stock entry', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/inventory-service/stock-entries/${id}`);
      setSnackbar({ open: true, message: 'Stock entry deleted', severity: 'success' });
      fetchEntries();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete stock entry', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'material', headerName: 'Material', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'user', headerName: 'User', flex: 1 },
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
  const filteredEntries = entries.filter(e =>
    (typeFilter === 'All' || e.type === typeFilter) &&
    (e.material.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase()))
  );

  // Export to CSV
  const handleExport = () => {
    const rows = filteredEntries;
    const csv = [
      ['Material', 'Quantity', 'Type', 'Date', 'User'],
      ...rows.map(e => [e.material, e.quantity, e.type, e.date, e.user])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stock_entries.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectionModel.map(id => api.delete(`/inventory-service/stock-entries/${id}`)));
      setSnackbar({ open: true, message: 'Selected entries deleted', severity: 'success' });
      fetchEntries();
      setSelectionModel([]);
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected entries', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Stock Entries</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={selectionModel.length === 0}>Bulk Delete</Button>
          <Button variant="contained" onClick={() => handleOpen()}>Add Entry</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search stock entries..."
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
        rows={filteredEntries}
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
        <DialogTitle>{editEntry ? 'Edit Stock Entry' : 'Add Stock Entry'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Material"
            fullWidth
            value={form.material}
            onChange={e => setForm(f => ({ ...f, material: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Quantity"
            type="number"
            fullWidth
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
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
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="User"
            fullWidth
            value={form.user}
            onChange={e => setForm(f => ({ ...f, user: e.target.value }))}
          />
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

export default StockEntriesTab; 