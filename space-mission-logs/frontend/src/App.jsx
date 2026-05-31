import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const CARD_STYLE = { marginBottom: '8px' };

// BROKEN: Unstable prop trap - creates new object on every render
const MissionCard = React.memo(({ mission, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200" style={CARD_STYLE}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-gray-900">{mission.name}</h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
          {mission.status}
        </span>
      </div>
      
      <div className="text-sm text-gray-600 mb-2">
        🚀 {mission.rocket} • 📅 {new Date(mission.launchDate).toLocaleDateString()}
      </div>
      
      <div className="text-sm text-gray-700 mb-4">
        {mission.crew?.length || 0} crew members • {mission.logs?.length || 0} log entries
      </div>
      
      <div className="flex flex-wrap gap-2">
        {mission.crew?.slice(0, 3).map((crew) => (
          <span key={crew.id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {crew.role}
          </span>
        ))}
      </div>
    </div>
  );
});

function App() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(12); // BROKEN: Renders all 200 at once

  // BROKEN: Double fetch on mount + no cleanup
  useEffect(() => {
    const controller = new AbortController();
    fetchMissions(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const fetchMissions = async (signal) => {
    try {
      setLoading(true);
      // Fetch all missions with limit=200 for frontend state holding and client-side slicing
      const response = await axios.get('http://localhost:3001/api/missions?limit=200', { signal });
      setMissions(response.data.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
      } else {
        console.error('Failed to fetch missions:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // BROKEN: Expensive computation in render (not memoized)
  const filteredMissions = useMemo(() => {
    return missions.filter(mission => 
      mission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.rocket.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));
  }, [missions, searchTerm]);

  const handleDelete = async (missionId) => {
    // BROKEN: Unstable callback - new function on every render
    if (window.confirm('Are you sure you want to delete this mission?')) {
      try {
        // This would normally call DELETE API
        setMissions(missions.filter(m => m.id !== missionId));
      } catch (error) {
        console.error('Failed to delete mission:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Space Mission Logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Mission Control</h1>
          <p className="text-gray-600 mb-6">Space Mission Logs Dashboard</p>
          
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search missions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* BROKEN: DOM Overload - renders all 200 missions */}
          {filteredMissions.slice(0, visibleCount).map((mission) => (
            <MissionCard 
              key={mission.id} 
              mission={mission}
              onDelete={() => handleDelete(mission.id)}
            />
          ))}
        </div>

        {visibleCount < filteredMissions.length && (
          <div className="text-center mt-8">
            <button 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setVisibleCount(prev => prev + 12)}
            >
              Load More Missions ({filteredMissions.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
