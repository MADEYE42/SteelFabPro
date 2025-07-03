import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import InvoicesTab from './InvoicesTab';
import PaymentsTab from './PaymentsTab';
import TransactionsTab from './TransactionsTab';

const PaymentPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>Payment Management</Typography>
      <Tabs value={tab} onChange={handleChange} aria-label="Payment Tabs" sx={{ mb: 3 }}>
        <Tab label="Invoices" />
        <Tab label="Payments" />
        <Tab label="Transactions" />
      </Tabs>
      <Box>
        {tab === 0 && <InvoicesTab />}
        {tab === 1 && <PaymentsTab />}
        {tab === 2 && <TransactionsTab />}
      </Box>
    </Box>
  );
};

export default PaymentPage; 