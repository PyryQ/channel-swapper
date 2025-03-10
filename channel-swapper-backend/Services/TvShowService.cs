using channel_swapper_backend.Models;

namespace channel_swapper_backend.Services
{
    public class TvShowService
    {
        private readonly List<TvShow> _tvShows = new();
        private int _currentVotes = 0;
        private int _totalVisitors = 0;
        private readonly object _lock = new();
        private static Random _random = new();

        public void AddTvShow(TvShow show)
        {
            lock (_lock)
            {
                show.Id = _tvShows.Count + 1;
                _tvShows.Add(show);
            }
        }

        public bool RemoveTvShow(int id)
        {
            lock (_lock)
            {
                var show = _tvShows.FirstOrDefault(s => s.Id == id);
                if (show != null)
                {
                    return _tvShows.Remove(show);
                }
                return false;
            }
        }

        public List<TvShow> GetAllShows()
        {
            lock (_lock)
            {
                return _tvShows.ToList();
            }
        }

        public TvShow GetRandomShow()
        {
            lock (_lock)
            {
                if (!_tvShows.Any())
                    return null;
                
                int index = _random.Next(_tvShows.Count);
                return _tvShows[index];
            }
        }

        public void AddVisitor()
        {
            lock (_lock)
            {
                _totalVisitors++;
                Console.WriteLine($"Visitor added. Total visitors: {_totalVisitors}");
            }
        }

        public void RemoveVisitor()
        {
            lock (_lock)
            {
                _totalVisitors = Math.Max(0, _totalVisitors - 1);
            }
        }

        public void AddVote()
        {
            lock (_lock)
            {
                _currentVotes++;
                Console.WriteLine($"Vote added. Current votes: {_currentVotes}");
            }
        }

        public void ResetVotes()
        {
            lock (_lock)
            {
                _currentVotes = 0;
            }
        }

        public (int votes, int visitors) GetCurrentStats()
        {
            lock (_lock)
            {
                return (_currentVotes, _totalVisitors);
            }
        }

        public bool ShouldChangeChannel()
        {
            lock (_lock)
            {
                if (_totalVisitors == 0) return false;
                return _currentVotes > (_totalVisitors / 2);
            }
        }
    }
} 