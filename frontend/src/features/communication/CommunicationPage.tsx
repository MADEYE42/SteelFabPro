import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import ThreadsTab from './ThreadsTab';
import MessagesTab from './MessagesTab';
import AttachmentsTab from './AttachmentsTab';
import NotificationsTab from './NotificationsTab';

const CommunicationPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box p={2}>
      <Paper>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Threads" />
          <Tab label="Messages" />
          <Tab label="Attachments" />
          <Tab label="Notifications" />
        </Tabs>
        <Box p={2}>
          {tab === 0 && <ThreadsTab />}
          {tab === 1 && <MessagesTab />}
          {tab === 2 && <AttachmentsTab />}
          {tab === 3 && <NotificationsTab />}
        </Box>
      </Paper>
    </Box>
  );
};

export default CommunicationPage; 