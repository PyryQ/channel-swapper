import * as signalR from '@microsoft/signalr';
import { TvShow } from '../types/TvShow';

class SignalRService {
    private connection: signalR.HubConnection;
    private onChannelChanged: ((show: TvShow) => void) | null = null;
    private onStatsUpdated: ((votes: number, visitors: number) => void) | null = null;
    private onShowsUpdated: ((shows: TvShow[]) => void) | null = null;
    private shows: TvShow[] = [];
    private isShowDisplay: boolean = false;

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

        this.connection.on('VoteRejected', (message: string) => {
            console.warn('Vote rejected:', message);
        });
    }

    public async start(isShowDisplay: boolean = false) {
        this.isShowDisplay = isShowDisplay;
        try {
            await this.connection.start();
            console.log('SignalR Connected');
            if (this.isShowDisplay) {
                await this.connection.invoke('OnShowDisplayConnect');
                console.log('Identified as show display');
            }
            this.shows = await this.getAllShows();
            
            // Get current show on connection
            const currentShow = await this.getCurrentShow();
            if (currentShow && this.onChannelChanged) {
                this.onChannelChanged(currentShow);
            }
        } catch (err) {
            console.log('SignalR Connection Error: ', err);
            setTimeout(() => this.start(this.isShowDisplay), 5000);
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

    public async getCurrentShow(): Promise<TvShow | null> {
        try {
            return await this.connection.invoke('GetCurrentShow');
        } catch (error) {
            console.error('Error getting current show:', error);
            return null;
        }
    }
}

export const signalRService = new SignalRService(); 