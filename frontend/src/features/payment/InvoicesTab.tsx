import React, { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert, Typography, InputAdornment, MenuItem, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface Invoice {
  id: number;
  number: string;
  customer: string;
  amount: number;
  status: string;
  issuedAt: string;
}

const statusOptions = ['All', 'Paid', 'Unpaid', 'Overdue'];

const InvoicesTab: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment-service/invoices');
      setInvoices(res.data);
      setLastUpdated(new Date());
    } catch {
      setSnackbar({ open: true, message: 'Failed to load invoices', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(() => {
      fetchInvoices();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredInvoices = invoices.filter(inv =>
    (statusFilter === 'All' || inv.status === statusFilter) &&
    (inv.number.toLowerCase().includes(search.toLowerCase()) || inv.customer.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const rows = filteredInvoices;
    const csv = [
      ['Number', 'Customer', 'Amount', 'Status', 'Issued At'],
      ...rows.map(i => [i.number, i.customer, i.amount, i.status, i.issuedAt])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.delete(`/payment-service/invoices/${id}`)));
        setSnackbar({ open: true, message: 'Selected invoices deleted', severity: 'success' });
        fetchInvoices();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected invoices', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'number', headerName: 'Invoice #', flex: 1 },
    { field: 'customer', headerName: 'Customer', flex: 1 },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'issuedAt', headerName: 'Issued At', flex: 1 },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Invoices</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
          </Typography>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>Export</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={handleBulkDelete} disabled={!Array.isArray(selectionModel) || selectionModel.length === 0}>Bulk Delete</Button>
        </Box>
      </Box>
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Search"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {statusOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      </Box>
      <DataGrid
        autoHeight
        rows={filteredInvoices}
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
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicesTab; 