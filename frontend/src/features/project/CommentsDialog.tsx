import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemText, IconButton, Typography, Snackbar, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api/axios';

interface Comment {
  id: number;
  author: string;
  content: string;
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
}

interface CommentsDialogProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
}

const CommentsDialog: React.FC<CommentsDialogProps> = ({ open, task, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ author: '', content: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchComments = async () => {
    if (!task) return;
    setLoading(true);
    try {
      const res = await api.get(`/project-service/tasks/${task.id}/comments`);
      setComments(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load comments', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) fetchComments(); }, [open, task]);

  const handleAdd = async () => {
    if (!task) return;
    try {
      await api.post(`/project-service/tasks/${task.id}/comments`, form);
      setSnackbar({ open: true, message: 'Comment added', severity: 'success' });
      setForm({ author: '', content: '' });
      fetchComments();
    } catch {
      setSnackbar({ open: true, message: 'Failed to add comment', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!task) return;
    try {
      await api.delete(`/project-service/comments/${id}`);
      setSnackbar({ open: true, message: 'Comment deleted', severity: 'success' });
      fetchComments();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete comment', severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Comments for: {task?.title}</DialogTitle>
      <DialogContent>
        <List>
          {comments.map(comment => (
            <ListItem key={comment.id} alignItems="flex-start" secondaryAction={
              <IconButton edge="end" color="error" onClick={() => handleDelete(comment.id)}><DeleteIcon /></IconButton>
            }>
              <ListItemText
                primary={<><b>{comment.author}</b> <Typography variant="caption" color="text.secondary">{new Date(comment.createdAt).toLocaleString()}</Typography></>}
                secondary={comment.content}
              />
            </ListItem>
          ))}
          {comments.length === 0 && <Typography color="text.secondary">No comments yet.</Typography>}
        </List>
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
          minRows={2}
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!form.author || !form.content}>Add Comment</Button>
      </DialogActions>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Dialog>
  );
};

export default CommentsDialog; 