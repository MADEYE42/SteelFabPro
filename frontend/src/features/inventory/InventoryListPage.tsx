import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import MaterialsTab from './MaterialsTab';
import StockEntriesTab from './StockEntriesTab';
import SuppliersTab from './SuppliersTab';
import AlertsTab from './AlertsTab';

const InventoryListPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box p={2}>
      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Materials" />
          <Tab label="Stock Entries" />
          <Tab label="Suppliers" />
          <Tab label="Alerts" />
        </Tabs>
        <Box p={2}>
          {tab === 0 && <MaterialsTab />}
          {tab === 1 && <StockEntriesTab />}
          {tab === 2 && <SuppliersTab />}
          {tab === 3 && <AlertsTab />}
        </Box>
      </Paper>
    </Box>
  );
};

export default InventoryListPage; 