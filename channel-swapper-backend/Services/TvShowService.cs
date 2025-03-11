using System.Text.Json;
using channel_swapper_backend.Models;

namespace channel_swapper_backend.Services
{
    public class TvShowService
    {
        private readonly object _lock = new object();
        private readonly Random _random = new Random();
        private List<TvShow> _tvShows;
        private int _currentVotes = 0;
        private int _totalVisitors = 0;
        private readonly string _dataPath = "tvshows.json";
        private HashSet<string> _votedConnections = new HashSet<string>();
        private TvShow? _currentShow = null;

        public TvShowService()
        {
            LoadData();
        }

        private void LoadData()
        {
            lock (_lock)
            {
                if (File.Exists(_dataPath))
                {
                    var json = File.ReadAllText(_dataPath);
                    _tvShows = JsonSerializer.Deserialize<List<TvShow>>(json) ?? new List<TvShow>();
                }
                else
                {
                    _tvShows = new List<TvShow>();
                    SaveData();
                }
            }
        }

        private void SaveData()
        {
            lock (_lock)
            {
                var json = JsonSerializer.Serialize(_tvShows);
                File.WriteAllText(_dataPath, json);
            }
        }

        public void AddShow(TvShow show)
        {
            lock (_lock)
            {
                _tvShows.Add(show);
                _currentShow = GetRandomShow();
                SaveData();
            }
        }

        public void RemoveShow(int id)
        {
            lock (_lock)
            {
                _tvShows.RemoveAll(s => s.id == id);
                _currentShow = _tvShows.Any() ? GetRandomShow() : null;
                SaveData();
            }
        }

        public List<TvShow> GetAllShows()
        {
            lock (_lock)
            {
                return _tvShows.ToList();
            }
        }

        public TvShow? GetRandomShow()
        {
            lock (_lock)
            {
                if (!_tvShows.Any())
                    return null;
                
                // If we only have one show, return it
                if (_tvShows.Count == 1)
                    return _tvShows[0];

                // Get all shows except the current one
                var availableShows = _tvShows.Where(s => s != _currentShow).ToList();
                
                // If no other shows available (shouldn't happen due to first check)
                if (!availableShows.Any())
                    return _tvShows[0];
                
                int index = _random.Next(availableShows.Count);
                return availableShows[index];
            }
        }

        public bool HasVoted(string connectionId)
        {
            lock (_lock)
            {
                var hasVoted = _votedConnections.Contains(connectionId);
                Console.WriteLine($"Connection {connectionId} has voted: {hasVoted}");
                Console.WriteLine($"Current voted connections: {string.Join(", ", _votedConnections)}");
                return hasVoted;
            }
        }

        public void AddVote(string connectionId)
        {
            lock (_lock)
            {
                if (!_votedConnections.Contains(connectionId))
                {
                    _currentVotes++;
                    _votedConnections.Add(connectionId);
                    Console.WriteLine($"Vote added for connection {connectionId}");
                    Console.WriteLine($"Total votes: {_currentVotes}, Voted connections: {_votedConnections.Count}");
                }
                else
                {
                    Console.WriteLine($"Duplicate vote attempt from connection {connectionId}");
                    throw new InvalidOperationException("You have already voted");
                }
            }
        }

        public void ResetVotes()
        {
            lock (_lock)
            {
                _currentVotes = 0;
                var oldCount = _votedConnections.Count;
                _votedConnections.Clear();
                Console.WriteLine($"Votes reset. Cleared {oldCount} voted connections");
            }
        }

        public void AddVisitor()
        {
            lock (_lock)
            {
                _totalVisitors++;
            }
        }

        public void RemoveVisitor()
        {
            lock (_lock)
            {
                if (_totalVisitors > 0)
                    _totalVisitors--;
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
                // Only change channel if we have visitors and enough votes (more than 50%)
                var shouldChange = _totalVisitors > 0 && _currentVotes > _totalVisitors / 2;
                if (shouldChange)
                {
                    Console.WriteLine($"Should change channel: true (votes: {_currentVotes}, visitors: {_totalVisitors}, threshold: {_totalVisitors / 2})");
                }
                return shouldChange;
            }
        }

        public TvShow? GetCurrentShow()
        {
            lock (_lock)
            {
                return _currentShow;
            }
        }
    }
} 