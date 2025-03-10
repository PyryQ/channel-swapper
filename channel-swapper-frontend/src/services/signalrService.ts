import * as signalR from '@microsoft/signalr';
import { TvShow } from '../types/TvShow';

class SignalRService {
    private connection: signalR.HubConnection;
    private onChannelChanged: ((show: TvShow) => void) | null = null;
    private onStatsUpdated: ((votes: number, visitors: number) => void) | null = null;
    private onShowsUpdated: ((shows: TvShow[]) => void) | null = null;
    private shows: TvShow[] = [];

    constructor() {
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl('http://localhost:5000/tvShowHub')
            .withAutomaticReconnect()
            .build();

        this.connection.on('ChannelChanged', (show: TvShow) => {
            if (this.onChannelChanged) {
                this.onChannelChanged(show);
            }
        });

        this.connection.on('StatsUpdated', (votes: number, visitors: number) => {
            if (this.onStatsUpdated) {
                this.onStatsUpdated(votes, visitors);
            }
        });

        this.connection.on('ShowsUpdated', (shows: TvShow[]) => {
            this.shows = shows;
            if (this.onShowsUpdated) {
                this.onShowsUpdated(shows);
            }
        });
    }

    public async start() {
        try {
            await this.connection.start();
            console.log('SignalR Connected');
            this.shows = await this.getAllShows();
        } catch (err) {
            console.log('SignalR Connection Error: ', err);
            setTimeout(() => this.start(), 5000);
        }
    }

    public setOnChannelChanged(callback: (show: TvShow) => void) {
        this.onChannelChanged = callback;
    }

    public setOnStatsUpdated(callback: ((votes: number, visitors: number) => void) | null) {
        this.onStatsUpdated = callback;
    }

    public setOnShowsUpdated(callback: ((shows: TvShow[]) => void) | null) {
        this.onShowsUpdated = callback;
    }

    public async getCurrentStats(): Promise<{ votes: number, visitors: number } | null> {
        try {
            return await this.connection.invoke('GetCurrentStats');
        } catch (error) {
            console.error('Error getting current stats:', error);
            return null;
        }
    }

    public async vote() {
        try {
            await this.connection.invoke('Vote');
            console.log('Vote sent to server');
        } catch (error) {
            console.error('Error voting:', error);
            throw error;
        }
    }

    public async addShow(show: TvShow) {
        await this.connection.invoke('AddShow', show);
    }

    public async removeShow(id: number) {
        await this.connection.invoke('RemoveShow', id);
    }

    public async getAllShows(): Promise<TvShow[]> {
        try {
            if (this.shows.length > 0) {
                return this.shows;
            }
            const shows = await this.connection.invoke('GetAllShows');
            this.shows = shows;
            return shows;
        } catch (error) {
            console.error('Error getting shows:', error);
            return this.shows;
        }
    }
}

export const signalRService = new SignalRService(); 