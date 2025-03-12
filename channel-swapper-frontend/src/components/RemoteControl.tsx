import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { signalRService } from '../services/signalrService';
import { tvShowStore } from '../stores/TvShowStore';
import styles from './RemoteControl.module.css';

const RemoteControl = observer(() => {
    useEffect(() => {
        signalRService.setOnStatsUpdated((votes, visitors) => {
            tvShowStore.setStats(votes, visitors);
        });
    }, []);

    const handleVote = async () => {
        try {
            await tvShowStore.vote();
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    return (
        <div className={styles.remoteContainer}>
            <div className={styles.remote}>
                <div className={styles.stats}>
                    <div>Votes: {tvShowStore.votes}</div>
                    <div>Visitors: {tvShowStore.visitors}</div>
                </div>
                <button 
                    className={styles.voteButton}
                    onClick={handleVote}
                >
                    CHANGE CHANNEL
                </button>
            </div>
        </div>
    );
});

export default RemoteControl; 