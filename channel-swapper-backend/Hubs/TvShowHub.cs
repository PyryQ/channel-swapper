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
            _tvShowService.AddVote();
            // Broadcast stats immediately after adding vote
            await BroadcastStats();
            
            if (_tvShowService.ShouldChangeChannel())
            {
                var newShow = _tvShowService.GetRandomShow();
                _tvShowService.ResetVotes();
                if (newShow != null)
                {
                    await Clients.All.SendAsync("ChannelChanged", newShow);
                }
                // Broadcast stats again after reset
                await BroadcastStats();
            }
        }

        public (int votes, int visitors) GetCurrentStats()
        {
            return _tvShowService.GetCurrentStats();
        }

        public async Task AddShow(TvShow show)
        {
            _tvShowService.AddTvShow(show);
            await Clients.All.SendAsync("ShowsUpdated", _tvShowService.GetAllShows());
        }

        public async Task RemoveShow(int id)
        {
            if (_tvShowService.RemoveTvShow(id))
            {
                await Clients.All.SendAsync("ShowsUpdated", _tvShowService.GetAllShows());
            }
        }

        private async Task BroadcastStats()
        {
            var (votes, visitors) = _tvShowService.GetCurrentStats();
            Console.WriteLine($"Broadcasting stats - Votes: {votes}, Visitors: {visitors}");
            await Clients.All.SendAsync("StatsUpdated", votes, visitors);
        }
    }
} 