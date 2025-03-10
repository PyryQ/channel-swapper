import React, { useEffect, useState } from 'react';
import { signalRService } from '../services/signalrService';
import './RemoteControl.css';


export const RemoteControl: React.FC = () => {
    const [votes, setVotes] = useState(0);
    const [visitors, setVisitors] = useState(0);

    useEffect(() => {
        signalRService.setOnStatsUpdated((votes, visitors) => {
            setVotes(votes);
            setVisitors(visitors);
        });
    }, []);

    const handleVote = async () => {
        await signalRService.vote();
    };

    return (
        <div className="remote-control">
            <h1>TV Remote Control</h1>
            <button className="change-channel-btn" onClick={handleVote}>
                Change Channel
            </button>
            <div className="stats">
                <p>Current Votes: {votes}</p>
                <p>Total Visitors: {visitors}</p>
                <p>Votes needed: {Math.ceil(visitors / 2)}</p>
            </div>
        </div>
    );
}; 