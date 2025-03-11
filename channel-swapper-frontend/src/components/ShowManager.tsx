import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { signalRService } from '../services/signalrService';
import { TvShow } from '../types/TvShow';

const ShowManager: React.FC = () => {
    const [shows, setShows] = useState<TvShow[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newShow, setNewShow] = useState({ name: '', id: 1 });
    const [nextId, setNextId] = useState(1);

    useEffect(() => {
        // Load shows immediately from service
        const loadShows = async () => {
            const currentShows = await signalRService.getAllShows();
            setShows(currentShows);
        };
        loadShows();

        // Set up listener for updates
        const onShowsUpdated = (updatedShows: TvShow[]) => {
            setShows(updatedShows);
        };
        signalRService.setOnShowsUpdated(onShowsUpdated);

        return () => {
            signalRService.setOnShowsUpdated(null);
        };
    }, []);

    const handleAddShow = async () => {
        if (newShow.name.trim()) {
            try {
                await signalRService.addShow({ ...newShow, id: nextId });
                setNextId(prev => prev + 1);
                setNewShow({ name: '', id: nextId + 1 });
                setOpenDialog(false);
            } catch (error) {
                console.error('Error adding show:', error);
            }
        }
    };

    const handleRemoveShow = async (id: number) => {
        try {
            await signalRService.removeShow(id);
        } catch (error) {
            console.error('Error removing show:', error);
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            padding={3}
            minHeight="100vh"
        >
            <Typography variant="h4" gutterBottom>
                Manage TV Shows
            </Typography>

            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ marginBottom: 3 }}
            >
                Add New Show
            </Button>

            <Paper elevation={3} sx={{ width: '100%', maxWidth: 600 }}>
                <List>
                    {shows.map((show) => (
                        <ListItem key={show.id}>
                            <ListItemText
                                primary={show.name}
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => handleRemoveShow(show.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add New TV Show</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Show Name"
                        fullWidth
                        value={newShow.name}
                        onChange={(e) => setNewShow({ ...newShow, name: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleAddShow} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ShowManager; 