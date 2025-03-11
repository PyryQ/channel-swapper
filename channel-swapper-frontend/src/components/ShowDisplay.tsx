import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import { signalRService } from '../services/signalrService';
import { tvShowStore } from '../stores/TvShowStore';
import styles from './ShowDisplay.module.css';

const ShowDisplay = observer(() => {
    useEffect(() => {
        signalRService.setOnChannelChanged((show) => {
            tvShowStore.setCurrentShow(show);
        });
    }, []);

    if (!tvShowStore.currentShow) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <Typography variant="h6" color="text.secondary">
                    No shows available...
                </Typography>
            </Box>
        );
    }

    return (
        <div className={styles.container}>
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    maxWidth: 600,
                    width: '100%',
                    textAlign: 'center'
                }}
            >
                <Typography variant="h3" gutterBottom color="primary">
                    {tvShowStore.currentShow.name}
                </Typography>
                <p>{tvShowStore.currentShow.description}</p>
            </Paper>
            <Link to="/manage" className={styles.cornerButton}>
                ⚙️
            </Link>
        </div>
    );
});

export default ShowDisplay; 