import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, IconButton, InputAdornment, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface Attachment {
  id: number;
  fileName: string;
  uploadedAt: string;
  url: string;
  type: string;
}

const typeOptions = ['All', 'Image', 'Document', 'Other'];

const AttachmentsTab: React.FC = () => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({ type: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/communication-service/attachments');
      setAttachments(res.data);
      setLastUpdated(new Date());
    } catch {
      setSnackbar({ open: true, message: 'Failed to load attachments', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttachments();
    const interval = setInterval(() => {
      fetchAttachments();
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setFile(null);
    setForm({ type: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', form.type);
    try {
      await api.post('/communication-service/attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbar({ open: true, message: 'Attachment uploaded', severity: 'success' });
      fetchAttachments();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to upload attachment', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/communication-service/attachments/${id}`);
      setSnackbar({ open: true, message: 'Attachment deleted', severity: 'success' });
      fetchAttachments();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete attachment', severity: 'error' });
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const columns: GridColDef[] = [
    { field: 'fileName', headerName: 'File Name', flex: 2 },
    { field: 'uploadedAt', headerName: 'Uploaded At', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleDownload(params.row.url)}><CloudDownloadIcon /></IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton>
        </>
      ),
      flex: 1,
    },
  ];

  const filteredAttachments = attachments.filter(a =>
    (typeFilter === 'All' || a.type === typeFilter) &&
    (a.fileName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const rows = filteredAttachments;
    const csv = [
      ['File Name', 'Uploaded At', 'Type', 'URL'],
      ...rows.map(a => [a.fileName, a.uploadedAt, a.type, a.url])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attachments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.delete(`/communication-service/attachments/${id}`)));
        setSnackbar({ open: true, message: 'Selected attachments deleted', severity: 'success' });
        fetchAttachments();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected attachments', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Attachments</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </Typography>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={!Array.isArray(selectionModel) || selectionModel.length === 0}>Bulk Delete</Button>
          <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleOpen}>Upload Attachment</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search attachments..."
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
        rows={filteredAttachments}
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload Attachment</DialogTitle>
        <DialogContent>
          <Button variant="outlined" component="label">
            Select File
            <input
              type="file"
              hidden
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              ref={fileInputRef}
            />
          </Button>
          {file && <Typography mt={2}>{file.name}</Typography>}
          <TextField
            margin="normal"
            label="Type"
            select
            fullWidth
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            sx={{ mt: 2 }}
          >
            {typeOptions.filter(t => t !== 'All').map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!file}>Upload</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AttachmentsTab; 