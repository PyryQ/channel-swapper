import { makeAutoObservable } from 'mobx';
import { TvShow } from '../types/TvShow';
import { signalRService } from '../services/signalrService';

class TvShowStore {
    currentShow: TvShow | null = null;
    shows: TvShow[] = [];
    votes: number = 0;
    visitors: number = 0;
    votingPercentage: number = 0;

    constructor() {
        makeAutoObservable(this);
        this.initializeSignalR();
    }

    private async initializeSignalR() {
        // Set up SignalR listeners
        signalRService.setOnChannelChanged((show) => {
            this.setCurrentShow(show);
        });

        signalRService.setOnStatsUpdated((newVotes, newVisitors) => {
            this.setStats(newVotes, newVisitors);
        });

        signalRService.setOnShowsUpdated((updatedShows) => {
            this.setShows(updatedShows);
        });

        // Get initial data
        const shows = await signalRService.getAllShows();
        if (shows.length > 0) {
            this.setShows(shows);
            const randomIndex = Math.floor(Math.random() * shows.length);
            this.setCurrentShow(shows[randomIndex]);
        }
    }

    setCurrentShow = (show: TvShow | null) => {
        this.currentShow = show;
    }

    setShows = (shows: TvShow[]) => {
        this.shows = shows;
    }

    setStats = (votes: number, visitors: number) => {
        this.votes = votes;
        this.visitors = visitors;
        this.votingPercentage = visitors > 0 ? (votes / visitors) * 100 : 0;
    }

    vote = async () => {
        try {
            await signalRService.vote();
        } catch (error) {
            console.error('Error voting:', error);
        }
    }

    addShow = async (name: string) => {
        try {
            await signalRService.addShow({ id: this.shows.length + 1, name });
            const shows = await signalRService.getAllShows();
            this.setShows(shows);
            // If this is the first show, set it as current
            if (shows.length === 1) {
                this.setCurrentShow(shows[0]);
            }
        } catch (error) {
            console.error('Error adding show:', error);
        }
    }

    removeShow = async (id: number) => {
        try {
            await signalRService.removeShow(id);
            const shows = await signalRService.getAllShows();
            this.setShows(shows);
        } catch (error) {
            console.error('Error removing show:', error);
        }
    }
}

export const tvShowStore = new TvShowStore(); 