import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, InputAdornment, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../api/axios';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

interface Message {
  id: number;
  thread: string;
  sender: string;
  content: string;
  sentAt: string;
  status: string;
}

const statusOptions = ['All', 'Sent', 'Delivered', 'Read'];

const MessagesTab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMessage, setEditMessage] = useState<Message | null>(null);
  const [form, setForm] = useState({ thread: '', sender: '', content: '', status: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/communication-service/messages');
      setMessages(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load messages', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleOpen = (message?: Message) => {
    if (message) {
      setEditMessage(message);
      setForm({ thread: message.thread, sender: message.sender, content: message.content, status: message.status });
    } else {
      setEditMessage(null);
      setForm({ thread: '', sender: '', content: '', status: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMessage(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMessage) {
        await api.put(`/communication-service/messages/${editMessage.id}`, form);
        setSnackbar({ open: true, message: 'Message updated', severity: 'success' });
      } else {
        await api.post('/communication-service/messages', form);
        setSnackbar({ open: true, message: 'Message created', severity: 'success' });
      }
      fetchMessages();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save message', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/communication-service/messages/${id}`);
      setSnackbar({ open: true, message: 'Message deleted', severity: 'success' });
      fetchMessages();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete message', severity: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.delete(`/communication-service/messages/${id}`)));
        setSnackbar({ open: true, message: 'Selected messages deleted', severity: 'success' });
        fetchMessages();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected messages', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'thread', headerName: 'Thread', flex: 1 },
    { field: 'sender', headerName: 'Sender', flex: 1 },
    { field: 'content', headerName: 'Content', flex: 2 },
    { field: 'sentAt', headerName: 'Sent At', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
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

  const filteredMessages = messages.filter(m =>
    (statusFilter === 'All' || m.status === statusFilter) &&
    (m.thread.toLowerCase().includes(search.toLowerCase()) || m.sender.toLowerCase().includes(search.toLowerCase()) || m.content.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Messages</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add Message</Button>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search messages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {statusOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      </Box>
      <DataGrid
        autoHeight
        rows={filteredMessages}
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
      <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={!Array.isArray(selectionModel) || selectionModel.length === 0}>Bulk Delete</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMessage ? 'Edit Message' : 'Add Message'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Thread"
            fullWidth
            value={form.thread}
            onChange={e => setForm(f => ({ ...f, thread: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Sender"
            fullWidth
            value={form.sender}
            onChange={e => setForm(f => ({ ...f, sender: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Content"
            fullWidth
            multiline
            minRows={2}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Status"
            fullWidth
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
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

export default MessagesTab; 