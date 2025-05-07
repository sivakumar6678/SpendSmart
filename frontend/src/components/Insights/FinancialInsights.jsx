import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';

const FinancialInsights = () => {
  const { insights, loading } = useAppContext();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No financial insights available yet. Add more transactions to get personalized insights.
        </Typography>
      </Paper>
    );
  }

  // Group insights by type
  const groupedInsights = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) {
      acc[insight.type] = [];
    }
    acc[insight.type].push(insight);
    return acc;
  }, {});

  // Get icon and color based on insight type
  const getInsightProps = (type) => {
    switch (type) {
      case 'warning':
        return { icon: <WarningIcon />, color: 'error', label: 'Warning' };
      case 'suggestion':
        return { icon: <LightbulbIcon />, color: 'info', label: 'Suggestion' };
      case 'positive':
        return { icon: <CheckCircleIcon />, color: 'success', label: 'Positive' };
      case 'information':
        return { icon: <InfoIcon />, color: 'primary', label: 'Information' };
      case 'ai_suggestion':
        return { icon: <LightbulbIcon />, color: 'secondary', label: 'AI Suggestion' };
      default:
        return { icon: <InfoIcon />, color: 'default', label: 'Insight' };
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Financial Insights
      </Typography>
      
      <Grid container spacing={3}>
        {Object.entries(groupedInsights).map(([type, typeInsights]) => (
          <React.Fragment key={type}>
            {typeInsights.map((insight, index) => {
              const { icon, color, label } = getInsightProps(insight.type);
              
              return (
                <Grid item xs={12} md={6} key={`${type}-${index}`}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Chip 
                          icon={icon} 
                          label={label} 
                          color={color} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="h6" component="h3">
                          {insight.title}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1">
                        {insight.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
};

export default FinancialInsights;