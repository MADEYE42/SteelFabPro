import React, { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert, Typography, InputAdornment, MenuItem, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface Payment {
  id: number;
  invoiceNumber: string;
  payer: string;
  method: string;
  amount: number;
  paidAt: string;
  status: string;
}

const statusOptions = ['All', 'Completed', 'Pending', 'Failed'];

const PaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment-service/payments');
      setPayments(res.data);
      setLastUpdated(new Date());
    } catch {
      setSnackbar({ open: true, message: 'Failed to load payments', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(() => {
      fetchPayments();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredPayments = payments.filter(pmt =>
    (statusFilter === 'All' || pmt.status === statusFilter) &&
    (pmt.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || pmt.payer.toLowerCase().includes(search.toLowerCase()))
  );

  const handleExport = () => {
    const rows = filteredPayments;
    const csv = [
      ['Invoice #', 'Payer', 'Method', 'Amount', 'Paid At', 'Status'],
      ...rows.map(p => [p.invoiceNumber, p.payer, p.method, p.amount, p.paidAt, p.status])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.delete(`/payment-service/payments/${id}`)));
        setSnackbar({ open: true, message: 'Selected payments deleted', severity: 'success' });
        fetchPayments();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected payments', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'invoiceNumber', headerName: 'Invoice #', flex: 1 },
    { field: 'payer', headerName: 'Payer', flex: 1 },
    { field: 'method', headerName: 'Method', flex: 1 },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    { field: 'paidAt', headerName: 'Paid At', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Payments</Typography>
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
        rows={filteredPayments}
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

export default PaymentsTab; 