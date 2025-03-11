import React, { useState } from 'react';
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
import { observer } from 'mobx-react-lite';
import { tvShowStore } from '../stores/TvShowStore';

const ShowManager: React.FC = observer(() => {
    const [openDialog, setOpenDialog] = useState(false);
    const [newShowName, setNewShowName] = useState('');

    const handleAddShow = async () => {
        if (newShowName.trim()) {
            await tvShowStore.addShow(newShowName.trim());
            setNewShowName('');
            setOpenDialog(false);
        }
    };

    const handleRemoveShow = async (id: number) => {
        await tvShowStore.removeShow(id);
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
                    {tvShowStore.shows.map((show) => (
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
                        value={newShowName}
                        onChange={(e) => setNewShowName(e.target.value)}
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
});

export default ShowManager; 