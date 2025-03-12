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
            // Set initial show if we have any
            if (_tvShows.Any())
            {
                _currentShow = _tvShows.First();
                Console.WriteLine($"Initial show: {_currentShow.name}");
            }
        }

        private void LoadData()
        {
            lock (_lock)
            {
                if (File.Exists(_dataPath))
                {
                    var json = File.ReadAllText(_dataPath);
                    var shows = JsonSerializer.Deserialize<List<TvShow>>(json) ?? new List<TvShow>();
                    
                    // Validate that all IDs are unique
                    var duplicateIds = shows.GroupBy(s => s.id)
                        .Where(g => g.Count() > 1)
                        .Select(g => g.Key)
                        .ToList();
                    
                    if (duplicateIds.Any())
                    {
                        Console.WriteLine("Warning: Found duplicate IDs in tvshows.json, reassigning...");
                        int currentId = 1;
                        foreach (var show in shows)
                        {
                            show.id = currentId++;
                        }
                        _tvShows = shows;
                        SaveData();
                    }
                    else
                    {
                        _tvShows = shows;
                    }
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
                int maxId = _tvShows.Any() ? _tvShows.Max(s => s.id) : 0;
                show.id = maxId + 1;
                
                if (_tvShows.Any(s => s.id == show.id))
                {
                    throw new InvalidOperationException($"ID {show.id} is already in use");
                }

                _tvShows.Add(show);
                Console.WriteLine($"Added show: {show.name} (ID: {show.id})");
                
                if (_currentShow == null)
                {
                    _currentShow = show;
                }
                
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
                
                if (_tvShows.Count == 1)
                    return _tvShows[0];

                // Get all shows except current one
                var availableShows = _currentShow != null
                    ? _tvShows.Where(s => s.id != _currentShow.id).ToList()
                    : _tvShows.ToList();

                // Select random show from available ones
                _currentShow = availableShows.OrderBy(x => Guid.NewGuid()).First();
                Console.WriteLine($"Selected new show: {_currentShow.name}");
                return _currentShow;
            }
        }

        public bool HasVoted(string connectionId)
        {
            lock (_lock)
            {
                var hasVoted = _votedConnections.Contains(connectionId);
                if (hasVoted)
                {
                    Console.WriteLine($"Duplicate vote attempt from {connectionId}");
                }
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
                    Console.WriteLine($"Vote added (total: {_currentVotes}, connections: {_votedConnections.Count})");
                }
                else
                {
                    throw new InvalidOperationException("You have already voted");
                }
            }
        }

        public void ResetVotes()
        {
            lock (_lock)
            {
                var oldCount = _votedConnections.Count;
                _currentVotes = 0;
                _votedConnections.Clear();
                Console.WriteLine($"Votes reset (cleared {oldCount} connections)");
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
                // Subtract 1 from visitors to account for show display
                var actualVisitors = Math.Max(0, _totalVisitors - 1);
                return (_currentVotes, actualVisitors);
            }
        }

        public bool ShouldChangeChannel()
        {
            lock (_lock)
            {
                // Subtract 1 from visitors to account for show display
                var actualVisitors = Math.Max(0, _totalVisitors - 1);
                var shouldChange = actualVisitors > 0 && _currentVotes > actualVisitors / 2;
                if (shouldChange)
                {
                    Console.WriteLine($"Channel change threshold reached (votes: {_currentVotes}/{actualVisitors})");
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