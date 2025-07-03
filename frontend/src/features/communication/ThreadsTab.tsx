import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, InputAdornment } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface Thread {
  id: number;
  title: string;
  participants: string;
  createdAt: string;
}

const ThreadsTab: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editThread, setEditThread] = useState<Thread | null>(null);
  const [form, setForm] = useState({ title: '', participants: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/communication-service/threads');
      setThreads(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load threads', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
    const interval = setInterval(() => {
      fetchThreads();
      setLastUpdated(new Date());
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (thread?: Thread) => {
    if (thread) {
      setEditThread(thread);
      setForm({ title: thread.title, participants: thread.participants });
    } else {
      setEditThread(null);
      setForm({ title: '', participants: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditThread(null);
  };

  const handleSubmit = async () => {
    try {
      if (editThread) {
        await api.put(`/communication-service/threads/${editThread.id}`, form);
        setSnackbar({ open: true, message: 'Thread updated', severity: 'success' });
      } else {
        await api.post('/communication-service/threads', form);
        setSnackbar({ open: true, message: 'Thread created', severity: 'success' });
      }
      fetchThreads();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save thread', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/communication-service/threads/${id}`);
      setSnackbar({ open: true, message: 'Thread deleted', severity: 'success' });
      fetchThreads();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete thread', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'participants', headerName: 'Participants', flex: 2 },
    { field: 'createdAt', headerName: 'Created At', flex: 1 },
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

  const filteredThreads = threads.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.participants.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const rows = filteredThreads;
    const csv = [
      ['Title', 'Participants', 'Created At'],
      ...rows.map(t => [t.title, t.participants, t.createdAt])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threads.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.delete(`/communication-service/threads/${id}`)));
        setSnackbar({ open: true, message: 'Selected threads deleted', severity: 'success' });
        fetchThreads();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected threads', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Threads</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </Typography>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={!Array.isArray(selectionModel) || selectionModel.length === 0}>Bulk Delete</Button>
          <Button variant="contained" onClick={() => handleOpen()}>Add Thread</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search threads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Box>
      <DataGrid
        autoHeight
        rows={filteredThreads}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
        checkboxSelection
        onRowSelectionModelChange={ids => setSelectionModel(Array.isArray(ids) ? ids : [])}
        rowSelectionModel={selectionModel}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editThread ? 'Edit Thread' : 'Add Thread'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Title"
            fullWidth
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Participants"
            fullWidth
            value={form.participants}
            onChange={e => setForm(f => ({ ...f, participants: e.target.value }))}
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

export default ThreadsTab; 