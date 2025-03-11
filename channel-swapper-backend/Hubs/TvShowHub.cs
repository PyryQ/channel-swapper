using Microsoft.AspNetCore.SignalR;
using channel_swapper_backend.Services;
using channel_swapper_backend.Models;

namespace channel_swapper_backend.Hubs
{
    public class TvShowHub : Hub
    {
        private readonly TvShowService _tvShowService;

        public TvShowHub(TvShowService tvShowService)
        {
            _tvShowService = tvShowService;
        }

        public override async Task OnConnectedAsync()
        {
            _tvShowService.AddVisitor();
            await BroadcastStats();
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _tvShowService.RemoveVisitor();
            await BroadcastStats();
            await base.OnDisconnectedAsync(exception);
        }

        public async Task Vote()
        {
            var connectionId = Context.ConnectionId;
            Console.WriteLine($"Vote attempt from connection: {connectionId}");

            try
            {
                if (_tvShowService.HasVoted(connectionId))
                {
                    Console.WriteLine($"Rejected duplicate vote from connection: {connectionId}");
                    await Clients.Caller.SendAsync("VoteRejected", "You have already voted");
                    return;
                }

                _tvShowService.AddVote(connectionId);
                await BroadcastStats();
                
                if (_tvShowService.ShouldChangeChannel())
                {
                    var (votes, visitors) = _tvShowService.GetCurrentStats();
                    Console.WriteLine($"Channel change threshold reached - Votes: {votes}, Visitors: {visitors}");
                    
                    var newShow = _tvShowService.GetRandomShow();
                    if (newShow != null)
                    {
                        Console.WriteLine($"Changing channel to: {newShow.name}");
                        _tvShowService.ResetVotes(); // Reset votes after getting new show but before broadcasting
                        await Clients.All.SendAsync("ChannelChanged", newShow);
                        await BroadcastStats(); // Broadcast updated stats after reset
                    }
                }
            }
            catch (InvalidOperationException ex)
            {
                await Clients.Caller.SendAsync("VoteRejected", ex.Message);
            }
        }

        public (int votes, int visitors) GetCurrentStats()
        {
            return _tvShowService.GetCurrentStats();
        }

        public async Task AddShow(TvShow show)
        {
            _tvShowService.AddShow(show);
            await Clients.All.SendAsync("ShowsUpdated", _tvShowService.GetAllShows());
            // Always broadcast the current show after adding a show
            var currentShow = _tvShowService.GetCurrentShow();
            await Clients.All.SendAsync("ChannelChanged", currentShow);
        }

        public async Task RemoveShow(int id)
        {
            _tvShowService.RemoveShow(id);
            await Clients.All.SendAsync("ShowsUpdated", _tvShowService.GetAllShows());
            // Broadcast the current show (which might be null if list is empty)
            var currentShow = _tvShowService.GetCurrentShow();
            await Clients.All.SendAsync("ChannelChanged", currentShow);
        }

        public TvShow? GetCurrentShow()
        {
            return _tvShowService.GetCurrentShow();
        }

        private async Task BroadcastStats()
        {
            var (votes, visitors) = _tvShowService.GetCurrentStats();
            Console.WriteLine($"Broadcasting stats - Votes: {votes}, Visitors: {visitors}");
            await Clients.All.SendAsync("StatsUpdated", votes, visitors);
        }
    }
} 