import React, { useEffect, useState } from 'react';
import { Button, Typography, Box, CircularProgress } from '@mui/material';
import { signalRService } from '../services/signalrService';

const VotingPage: React.FC = () => {
    const [votes, setVotes] = useState(0);
    const [visitors, setVisitors] = useState(0);
    const [votingPercentage, setVotingPercentage] = useState(0);

    useEffect(() => {
        // Get initial stats when component mounts
        const getInitialStats = async () => {
            const stats = await signalRService.getCurrentStats();
            if (stats) {
                setVotes(stats.votes);
                setVisitors(stats.visitors);
                setVotingPercentage(stats.visitors > 0 ? (stats.votes / stats.visitors) * 100 : 0);
            }
        };
        getInitialStats();

        signalRService.setOnStatsUpdated((newVotes, newVisitors) => {
            console.log('Stats updated:', { votes: newVotes, visitors: newVisitors }); // Add logging
            setVotes(newVotes);
            setVisitors(newVisitors);
            setVotingPercentage(newVisitors > 0 ? (newVotes / newVisitors) * 100 : 0);
        });

        return () => {
            signalRService.setOnStatsUpdated(null);
        };
    }, []);

    const handleVote = async () => {
        try {
            await signalRService.vote();
            // Get updated stats immediately after voting
            const stats = await signalRService.getCurrentStats();
            if (stats) {
                setVotes(stats.votes);
                setVisitors(stats.visitors);
                setVotingPercentage(stats.visitors > 0 ? (stats.votes / stats.visitors) * 100 : 0);
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
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
                    value={votingPercentage}
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
                        {`${Math.round(votingPercentage)}%`}
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
                    Current Votes: {votes}
                </Typography>
                <Typography variant="body1">
                    Active Visitors: {visitors}
                </Typography>
            </Box>
        </Box>
    );
};

export default VotingPage; 