import React, { useEffect, useState } from 'react';
import { Box, Button, Snackbar, Alert, Typography, InputAdornment, MenuItem, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import api from '../../api/axios';

interface Transaction {
  id: number;
  paymentId: number;
  type: string;
  amount: number;
  date: string;
  status: string;
  description: string;
}

const statusOptions = ['All', 'Completed', 'Pending', 'Failed'];
const typeOptions = ['All', 'Credit', 'Debit'];

const TransactionsTab: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment-service/transactions');
      setTransactions(res.data);
      setLastUpdated(new Date());
    } catch {
      setSnackbar({ open: true, message: 'Failed to load transactions', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(() => {
      fetchTransactions();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = transactions.filter(txn =>
    (statusFilter === 'All' || txn.status === statusFilter) &&
    (typeFilter === 'All' || txn.type === typeFilter) &&
    (
      txn.description.toLowerCase().includes(search.toLowerCase()) ||
      txn.amount.toString().includes(search) ||
      txn.paymentId.toString().includes(search)
    )
  );

  const handleExport = () => {
    const rows = filteredTransactions;
    const csv = [
      ['Payment ID', 'Type', 'Amount', 'Date', 'Status', 'Description'],
      ...rows.map(t => [t.paymentId, t.type, t.amount, t.date, t.status, t.description])
    ].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    try {
      if (Array.isArray(selectionModel)) {
        await Promise.all(selectionModel.map(id => api.delete(`/payment-service/transactions/${id}`)));
        setSnackbar({ open: true, message: 'Selected transactions deleted', severity: 'success' });
        fetchTransactions();
        setSelectionModel([]);
      }
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete selected transactions', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'paymentId', headerName: 'Payment ID', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'amount', headerName: 'Amount', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Transactions</Typography>
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
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {typeOptions.map(option => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </TextField>
      </Box>
      <DataGrid
        autoHeight
        rows={filteredTransactions}
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

export default TransactionsTab; 