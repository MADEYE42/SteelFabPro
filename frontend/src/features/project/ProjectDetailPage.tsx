import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import MilestonesTab from './MilestonesTab';
import TasksTab from './TasksTab';
import FilesTab from './FilesTab';
import FeedbackTab from './FeedbackTab';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
}

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/project-service/projects/${projectId}`);
        setProject(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading) return <Box p={4} textAlign="center"><CircularProgress /></Box>;
  if (!project) return <Box p={4}><Typography>Project not found.</Typography></Box>;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>{project.name}</Typography>
      <Typography variant="subtitle1" gutterBottom>{project.description}</Typography>
      <Typography variant="body2" gutterBottom>Status: {project.status}</Typography>
      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Milestones" />
          <Tab label="Tasks" />
          <Tab label="Files" />
          <Tab label="Feedback" />
        </Tabs>
        <Box p={2}>
          {tab === 0 && <MilestonesTab projectId={project.id} />}
          {tab === 1 && <TasksTab projectId={project.id} />}
          {tab === 2 && <FilesTab projectId={project.id} />}
          {tab === 3 && <FeedbackTab projectId={project.id} />}
        </Box>
      </Paper>
    </Box>
  );
};

export default ProjectDetailPage; 