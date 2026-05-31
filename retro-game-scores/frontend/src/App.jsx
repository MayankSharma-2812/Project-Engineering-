import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

// FIXED: Wrapped with React.memo to prevent unnecessary re-renders
const ScoreCard = React.memo(({ score, onDelete, onLike }) => {
  return (
    <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 shadow-xl border-2 border-yellow-400">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-yellow-400">{score.game.name}</h3>
          <p className="text-gray-300">{score.game.genre} • {score.game.year}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{score.score.toLocaleString()}</div>
          <div className="text-sm text-gray-400">{score.playerName}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          📅 {new Date(score.date).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onLike(score.id)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            ❤️ Like
          </button>
          <button
            onClick={() => onDelete(score.id)}
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
});

function App() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // FIXED: Single fetch with AbortController and proper cleanup
  useEffect(() => {
    const controller = new AbortController();

    const fetchScoresWithCleanup = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/scores', {
          signal: controller.signal
        });
        setScores(response.data.data || response.data);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Failed to fetch scores:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchScoresWithCleanup();

    return () => {
      controller.abort();
    };
  }, []);

  // FIXED: Expensive computation wrapped in useMemo
  const filteredScores = useMemo(() => {
    return scores.filter(score =>
      score.game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.game.genre.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.score - a.score);
  }, [scores, searchTerm]);

  // FIXED: Stable callback with useCallback
  const handleDelete = useCallback(async (scoreId) => {
    if (window.confirm('Are you sure you want to delete this high score?')) {
      try {
        setScores(scores.filter(s => s.id !== scoreId));
      } catch (error) {
        console.error('Failed to delete score:', error);
      }
    }
  }, [scores]);

  // FIXED: Stable callback with useCallback
  const handleLike = useCallback(async (scoreId) => {
    try {
      console.log(`Liked score ${scoreId}`);
    } catch (error) {
      console.error('Failed to like score:', error);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400 text-xl font-bold">Loading Retro High Scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-400 mb-2">🎮 RETRO HIGH SCORE WALL 🎮</h1>
          <p className="text-gray-400 mb-6">Classic Arcade Game Champions</p>

          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search games, players, or genres..."
              className="w-full px-4 py-3 bg-gray-900 text-yellow-400 border-2 border-yellow-400 rounded-lg focus:outline-none focus:border-yellow-300 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScores.map((score) => (
            <ScoreCard
              key={score.id}
              score={score}
              onDelete={handleDelete}
              onLike={handleLike}
            />
          ))}
        </div>

        {filteredScores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No high scores found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
