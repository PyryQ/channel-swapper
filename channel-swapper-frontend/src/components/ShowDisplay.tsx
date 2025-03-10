import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { signalRService } from '../services/signalrService';
import { TvShow } from '../types/TvShow';

const ShowDisplay: React.FC = () => {
    const [currentShow, setCurrentShow] = useState<TvShow | null>(null);

    useEffect(() => {
        // Set up the channel changed listener
        signalRService.setOnChannelChanged((show) => {
            setCurrentShow(show);
        });

        // Request initial show
        const getInitialShow = async () => {
            const shows = await signalRService.getAllShows();
            if (shows.length > 0) {
                const randomIndex = Math.floor(Math.random() * shows.length);
                setCurrentShow(shows[randomIndex]);
            }
        };
        getInitialShow();
    }, []);

    if (!currentShow) {
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
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            padding={3}
        >
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
                    {currentShow.name}
                </Typography>
            </Paper>
        </Box>
    );
};

export default ShowDisplay; 