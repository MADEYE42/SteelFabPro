import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface Supplier {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
}

const SuppliersTab: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', phone: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<number[]>([]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory-service/suppliers');
      setSuppliers(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load suppliers', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleOpen = (supplier?: Supplier) => {
    if (supplier) {
      setEditSupplier(supplier);
      setForm({ name: supplier.name, contact: supplier.contact, email: supplier.email, phone: supplier.phone });
    } else {
      setEditSupplier(null);
      setForm({ name: '', contact: '', email: '', phone: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditSupplier(null);
  };

  const handleSubmit = async () => {
    try {
      if (editSupplier) {
        await api.put(`/inventory-service/suppliers/${editSupplier.id}`, form);
        setSnackbar({ open: true, message: 'Supplier updated', severity: 'success' });
      } else {
        await api.post('/inventory-service/suppliers', form);
        setSnackbar({ open: true, message: 'Supplier created', severity: 'success' });
      }
      fetchSuppliers();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save supplier', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/inventory-service/suppliers/${id}`);
      setSnackbar({ open: true, message: 'Supplier deleted', severity: 'success' });
      fetchSuppliers();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete supplier', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'contact', headerName: 'Contact', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Phone', flex: 1 },
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

  // Client-side search
  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.toLowerCase().includes(search.toLowerCase())
  );

  // Export to CSV
  const handleExport = () => {
    const rows = filteredSuppliers;
    const csv = [
      ['Name', 'Contact', 'Email', 'Phone'],
      ...rows.map(s => [s.name, s.contact, s.email, s.phone])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suppliers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectionModel.map(id => api.delete(`/inventory-service/suppliers/${id}`)));
      setSnackbar({ open: true, message: 'Selected suppliers deleted', severity: 'success' });
      fetchSuppliers();
      setSelectionModel([]);
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected suppliers', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Suppliers</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={selectionModel.length === 0}>Bulk Delete</Button>
          <Button variant="contained" onClick={() => handleOpen()}>Add Supplier</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Box>
      <DataGrid
        autoHeight
        rows={filteredSuppliers}
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
        <DialogTitle>{editSupplier ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Contact"
            fullWidth
            value={form.contact}
            onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Email"
            fullWidth
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
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

export default SuppliersTab; 