import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { tvShowStore } from '../stores/TvShowStore';

const ShowDisplay: React.FC = observer(() => {
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
                    {tvShowStore.currentShow.name}
                </Typography>
            </Paper>
        </Box>
    );
});

export default ShowDisplay; 