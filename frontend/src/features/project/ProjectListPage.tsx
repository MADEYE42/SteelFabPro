import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, InputAdornment, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
}

const statusOptions = ['All', 'Active', 'Completed', 'On Hold'];

const ProjectListPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '', status: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/project-service/projects');
      setProjects(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load projects', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleOpen = (project?: Project) => {
    if (project) {
      setEditProject(project);
      setForm({ name: project.name, description: project.description, status: project.status });
    } else {
      setEditProject(null);
      setForm({ name: '', description: '', status: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProject(null);
  };

  const handleSubmit = async () => {
    try {
      if (editProject) {
        await api.put(`/project-service/projects/${editProject.id}`, form);
        setSnackbar({ open: true, message: 'Project updated', severity: 'success' });
      } else {
        await api.post('/project-service/projects', form);
        setSnackbar({ open: true, message: 'Project created', severity: 'success' });
      }
      fetchProjects();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save project', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/project-service/projects/${id}`);
      setSnackbar({ open: true, message: 'Project deleted', severity: 'success' });
      fetchProjects();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete project', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
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

  // Client-side search and filter
  const filteredProjects = projects.filter(p =>
    (statusFilter === 'All' || p.status === statusFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Create Project</Button>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search projects..."
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
        rows={filteredProjects}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
        onRowClick={(params) => navigate(`/project/${params.row.id}`)}
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editProject ? 'Edit Project' : 'Create Project'}</DialogTitle>
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

export default ProjectListPage; 