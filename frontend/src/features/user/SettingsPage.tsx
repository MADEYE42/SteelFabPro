import React from 'react';
import { Box, Card, CardContent, Typography, Switch, FormControlLabel } from '@mui/material';
import { useThemeContext } from '../../theme/ThemeContext';
import { useNotificationContext } from '../../notification/NotificationContext';

const SettingsPage: React.FC = () => {
  const { mode, toggleTheme } = useThemeContext();
  const { notifications, toggleNotifications } = useNotificationContext();

  return (
    <Box maxWidth={500} mx="auto" mt={6}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Settings</Typography>
          <FormControlLabel
            control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
            label="Dark Mode"
          />
          <FormControlLabel
            control={<Switch checked={notifications} onChange={toggleNotifications} />}
            label="Enable Notifications"
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage; 