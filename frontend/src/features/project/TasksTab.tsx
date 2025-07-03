import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../../api/axios';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import CommentIcon from '@mui/icons-material/Comment';
import CommentsDialog from './CommentsDialog';

interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: string;
}

interface TasksTabProps {
  projectId: string | number;
}

const TasksTab: React.FC<TasksTabProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', assignee: '', dueDate: '', status: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [commentsTask, setCommentsTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/project-service/projects/${projectId}/tasks`);
      setTasks(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load tasks', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [projectId]);

  const handleOpen = (task?: Task) => {
    if (task) {
      setEditTask(task);
      setForm({ title: task.title, description: task.description, assignee: task.assignee, dueDate: task.dueDate, status: task.status });
    } else {
      setEditTask(null);
      setForm({ title: '', description: '', assignee: '', dueDate: '', status: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTask(null);
  };

  const handleSubmit = async () => {
    try {
      if (editTask) {
        await api.put(`/project-service/tasks/${editTask.id}`, form);
        setSnackbar({ open: true, message: 'Task updated', severity: 'success' });
      } else {
        await api.post(`/project-service/projects/${projectId}/tasks`, form);
        setSnackbar({ open: true, message: 'Task created', severity: 'success' });
      }
      fetchTasks();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to save task', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/project-service/tasks/${id}`);
      setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
      fetchTasks();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
    }
  };

  const statusOptions = ['All', 'Not Started', 'In Progress', 'Completed'];

  // Client-side search and filter
  const filteredTasks = tasks.filter(t =>
    (statusFilter === 'All' || t.status === statusFilter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    { field: 'assignee', headerName: 'Assignee', flex: 1 },
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
          <Button size="small" startIcon={<CommentIcon />} onClick={() => setCommentsTask(params.row)}>Comments</Button>
        </>
      ),
      flex: 1,
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Tasks</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>Add Task</Button>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search tasks..."
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
        rows={filteredTasks}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editTask ? 'Edit Task' : 'Add Task'}</DialogTitle>
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
            label="Description"
            fullWidth
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <TextField
            margin="normal"
            label="Assignee"
            fullWidth
            value={form.assignee}
            onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
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
      <CommentsDialog open={!!commentsTask} task={commentsTask} onClose={() => setCommentsTask(null)} />
    </Box>
  );
};

export default TasksTab; 