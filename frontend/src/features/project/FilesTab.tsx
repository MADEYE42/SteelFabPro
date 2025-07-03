import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Snackbar, Alert, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../../api/axios';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';

interface ProjectFile {
  id: number;
  fileName: string;
  uploadedAt: string;
  url: string;
}

interface FilesTabProps {
  projectId: string | number;
}

const FilesTab: React.FC<FilesTabProps> = ({ projectId }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/project-service/projects/${projectId}/files`);
      setFiles(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load files', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, [projectId]);

  const handleOpen = () => {
    setFile(null);
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
    try {
      await api.post(`/project-service/projects/${projectId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSnackbar({ open: true, message: 'File uploaded', severity: 'success' });
      fetchFiles();
      handleClose();
    } catch {
      setSnackbar({ open: true, message: 'Failed to upload file', severity: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/project-service/files/${id}`);
      setSnackbar({ open: true, message: 'File deleted', severity: 'success' });
      fetchFiles();
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete file', severity: 'error' });
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const columns: GridColDef[] = [
    { field: 'fileName', headerName: 'File Name', flex: 2 },
    { field: 'uploadedAt', headerName: 'Uploaded At', flex: 1 },
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

  // Helper to get file type from fileName
  const getFileType = (fileName: string) => {
    if (/\.(pdf)$/i.test(fileName)) return 'PDF';
    if (/\.(jpg|jpeg|png|gif)$/i.test(fileName)) return 'Image';
    if (/\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(fileName)) return 'Document';
    return 'Other';
  };

  // Client-side search and filter
  const filteredFiles = files.filter(f =>
    (fileTypeFilter === 'All' || getFileType(f.fileName) === fileTypeFilter) &&
    (f.fileName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Files</Typography>
        <Button variant="contained" startIcon={<UploadFileIcon />} onClick={handleOpen}>Upload File</Button>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          placeholder="Search files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
        <TextField
          select
          label="File Type"
          value={fileTypeFilter}
          onChange={e => setFileTypeFilter(e.target.value)}
          sx={{ minWidth: 120 }}
        >
          {['All', 'PDF', 'Image', 'Document', 'Other'].map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      </Box>
      <DataGrid
        autoHeight
        rows={filteredFiles}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pagination
        loading={loading}
        disableRowSelectionOnClick
      />
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload File</DialogTitle>
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

export default FilesTab; 