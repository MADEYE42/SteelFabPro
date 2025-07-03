import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, InputAdornment, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface Material {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  supplier: string;
}

const typeOptions = ['All', 'Steel', 'Aluminum', 'Copper', 'Other'];

const MaterialsTab: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState({ name: '', type: '', quantity: 0, unit: '', supplier: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<number[]>([]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory-service/materials');
      setMaterials(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load materials', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, []);

  const handleOpen = (material?: Material) => {
    if (material) {
      setEditMaterial(material);
      setForm({ name: material.name, type: material.type, quantity: material.quantity, unit: material.unit, supplier: material.supplier });
    } else {
      setEditMaterial(null);
      setForm({ name: '', type: '', quantity: 0, unit: '', supplier: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMaterial(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMaterial) {
        await api.put(`/inventory-service/materials/${editMaterial.id}`, form);
        setSnackbar({ open: true, message: 'Material updated', severity: 'success' });
      } else {
        await api.post('/inventory-service/materials', form);
        setSnackbar({ open: true, message: 'Material created', severity: 'success' });
      }
      fetchMaterials();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save material', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/inventory-service/materials/${id}`);
      setSnackbar({ open: true, message: 'Material deleted', severity: 'success' });
      fetchMaterials();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete material', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'unit', headerName: 'Unit', flex: 1 },
    { field: 'supplier', headerName: 'Supplier', flex: 1 },
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
  const filteredMaterials = materials.filter(m =>
    (typeFilter === 'All' || m.type === typeFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.supplier.toLowerCase().includes(search.toLowerCase()))
  );

  // Export to CSV
  const handleExport = () => {
    const rows = filteredMaterials;
    const csv = [
      ['Name', 'Type', 'Quantity', 'Unit', 'Supplier'],
      ...rows.map(m => [m.name, m.type, m.quantity, m.unit, m.supplier])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materials.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectionModel.map(id => api.delete(`/inventory-service/materials/${id}`)));
      setSnackbar({ open: true, message: 'Selected materials deleted', severity: 'success' });
      fetchMaterials();
      setSelectionModel([]);
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected materials', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Materials</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={selectionModel.length === 0}>Bulk Delete</Button>
          <Button variant="contained" onClick={() => handleOpen()}>Add Material</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search materials..."
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
        rows={filteredMaterials}
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
        <DialogTitle>{editMaterial ? 'Edit Material' : 'Add Material'}</DialogTitle>
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
            label="Type"
            fullWidth
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
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
            label="Unit"
            fullWidth
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Supplier"
            fullWidth
            value={form.supplier}
            onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
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

export default MaterialsTab; 