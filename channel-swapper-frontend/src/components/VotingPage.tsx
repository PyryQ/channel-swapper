import React from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { tvShowStore } from '../stores/TvShowStore';

const VotingPage: React.FC = observer(() => {
    const handleVote = async () => {
        await tvShowStore.vote();
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            gap={4}
        >
            <Typography variant="h4" gutterBottom>
                Channel Swapper
            </Typography>

            <Box position="relative" display="inline-flex">
                <CircularProgress
                    variant="determinate"
                    value={tvShowStore.votingPercentage}
                    size={120}
                    thickness={4}
                />
                <Box
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                >
                    <Typography variant="caption" component="div" color="text.secondary">
                        {`${Math.round(tvShowStore.votingPercentage)}%`}
                    </Typography>
                </Box>
            </Box>

            <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleVote}
            >
                Change channel
            </Button>

            <Box textAlign="center">
                <Typography variant="body1">
                    Current Votes: {tvShowStore.votes}
                </Typography>
                <Typography variant="body1">
                    Active Visitors: {tvShowStore.visitors}
                </Typography>
            </Box>
        </Box>
    );
});

export default VotingPage; 