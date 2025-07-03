import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../../api/axios';
import DeleteIcon from '@mui/icons-material/Delete';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';

interface Feedback {
  id: number;
  author: string;
  comment: string;
  createdAt: string;
}

interface FeedbackTabProps {
  projectId: string | number;
}

const FeedbackTab: React.FC<FeedbackTabProps> = ({ projectId }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ author: '', comment: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/project-service/projects/${projectId}/feedback`);
      setFeedbacks(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load feedback', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, [projectId]);

  const handleOpen = () => {
    setForm({ author: '', comment: '' });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/project-service/projects/${projectId}/feedback`, form);
      setSnackbar({ open: true, message: 'Feedback added', severity: 'success' });
      fetchFeedbacks();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add feedback', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/project-service/feedback/${id}`);
      setSnackbar({ open: true, message: 'Feedback deleted', severity: 'success' });
      fetchFeedbacks();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete feedback', severity: 'error' });
    }
  };

  // Get unique authors for filter
  const authorOptions = ['All', ...Array.from(new Set(feedbacks.map(f => f.author)))];
  // Client-side search and filter
  const filteredFeedbacks = feedbacks.filter(f =>
    (authorFilter === 'All' || f.author === authorFilter) &&
    (f.comment.toLowerCase().includes(search.toLowerCase()) || f.author.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: GridColDef[] = [
    { field: 'author', headerName: 'Author', flex: 1 },
    { field: 'comment', headerName: 'Comment', flex: 2 },
    { field: 'createdAt', headerName: 'Created At', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      renderCell: (params) => (
        <IconButton color="error" onClick={() => handleDelete(params.row.id)}><DeleteIcon /></IconButton>
      ),
      flex: 1,
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Feedback</Typography>
        <Button variant="contained" onClick={handleOpen}>Add Feedback</Button>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search feedback..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <TextField
          select
          label="Author"
          value={authorFilter}
          onChange={e => setAuthorFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {authorOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      </Box>
      <DataGrid
        autoHeight
        rows={filteredFeedbacks}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Feedback</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Author"
            fullWidth
            value={form.author}
            onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Comment"
            fullWidth
            multiline
            minRows={3}
            value={form.comment}
            onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!form.author || !form.comment}>Add</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FeedbackTab; 