import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../../api/axios';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';

interface Milestone {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  status: string;
}

interface MilestonesTabProps {
  projectId: string | number;
}

const MilestonesTab: React.FC<MilestonesTabProps> = ({ projectId }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMilestone, setEditMilestone] = useState<Milestone | null>(null);
  const [form, setForm] = useState({ name: '', description: '', dueDate: '', status: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const statusOptions = ['All', 'Not Started', 'In Progress', 'Completed'];

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/project-service/projects/${projectId}/milestones`);
      setMilestones(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load milestones', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMilestones(); }, [projectId]);

  const handleOpen = (milestone?: Milestone) => {
    if (milestone) {
      setEditMilestone(milestone);
      setForm({ name: milestone.name, description: milestone.description, dueDate: milestone.dueDate, status: milestone.status });
    } else {
      setEditMilestone(null);
      setForm({ name: '', description: '', dueDate: '', status: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMilestone(null);
  };

  const handleSubmit = async () => {
    try {
      if (editMilestone) {
        await api.put(`/project-service/milestones/${editMilestone.id}`, form);
        setSnackbar({ open: true, message: 'Milestone updated', severity: 'success' });
      } else {
        await api.post(`/project-service/projects/${projectId}/milestones`, form);
        setSnackbar({ open: true, message: 'Milestone created', severity: 'success' });
      }
      fetchMilestones();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save milestone', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/project-service/milestones/${id}`);
      setSnackbar({ open: true, message: 'Milestone deleted', severity: 'success' });
      fetchMilestones();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete milestone', severity: 'error' });
    }
  };

  // Client-side search and filter
  const filteredMilestones = milestones.filter(m =>
    (statusFilter === 'All' || m.status === statusFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { field: 'dueDate', headerName: 'Due Date', flex: 1 },
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Milestones</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add Milestone</Button>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search milestones..."
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
        rows={filteredMilestones}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMilestone ? 'Edit Milestone' : 'Add Milestone'}</DialogTitle>
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
            label="Description"
            fullWidth
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Due Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
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

export default MilestonesTab; 