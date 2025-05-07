import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Card,
  CardContent,
  CardActions,
  LinearProgress,
  Tooltip,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import SavingGoalForm from './SavingGoalForm';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const SavingGoalList = () => {
  const { savingGoals, deleteSavingGoal } = useAppContext();
  const [openForm, setOpenForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    setOpenForm(true);
  };

  const handleDelete = (goal) => {
    setGoalToDelete(goal);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSavingGoal(goalToDelete.id);
      setOpenDeleteDialog(false);
      setGoalToDelete(null);
    } catch (error) {
      console.error('Error deleting saving goal:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedGoal(null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedGoal(null);
  };

  // Calculate days remaining and format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Saving Goals
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New Goal
        </Button>
      </Box>

      {savingGoals.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            You don't have any saving goals yet.
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ mt: 2 }}
          >
            Create Your First Saving Goal
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {savingGoals.map((goal) => {
            const progressPercentage = (goal.current_amount / goal.target_amount) * 100;
            const daysRemaining = calculateDaysRemaining(goal.target_date);
            
            // Determine progress color
            let progressColor = 'primary';
            if (progressPercentage >= 100) progressColor = 'success';
            else if (daysRemaining < 7 && progressPercentage < 90) progressColor = 'error';
            else if (daysRemaining < 14 && progressPercentage < 75) progressColor = 'warning';
            
            return (
              <Grid item xs={12} sm={6} md={4} key={goal.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    ...(goal.completed && {
                      border: '2px solid #4caf50',
                      boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)'
                    })
                  }}
                >
                  {goal.completed && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Completed"
                      color="success"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1
                      }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {goal.title}
                    </Typography>
                    
                    <Box sx={{ mt: 2, mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {progressPercentage.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(progressPercentage, 100)} 
                        color={progressColor}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Saved
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          ₹{goal.current_amount.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary" align="right">
                          Target
                        </Typography>
                        <Typography variant="body1" fontWeight="medium" align="right">
                          ₹{goal.target_amount.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Target Date
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(goal.target_date)}
                          {!goal.completed && daysRemaining > 0 && (
                            <Typography 
                              component="span" 
                              variant="body2" 
                              sx={{ 
                                ml: 1,
                                color: daysRemaining < 7 ? 'error.main' : 'text.secondary',
                                fontWeight: daysRemaining < 7 ? 'bold' : 'normal'
                              }}
                            >
                              ({daysRemaining} days left)
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(goal)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(goal)} size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Saving Goal Form Dialog */}
      <SavingGoalForm
        open={openForm}
        onClose={handleCloseForm}
        goal={selectedGoal}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Saving Goal"
        content={`Are you sure you want to delete the "${goalToDelete?.title}" saving goal?`}
      />
    </Box>
  );
};

export default SavingGoalList;