'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Search, Settings, Lock } from 'lucide-react';

const PlugTimer = ({ installDate, retrievalDate }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(installDate);
      const now = retrievalDate ? new Date(retrievalDate) : new Date();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [installDate, retrievalDate]);

  return (
    <div className="font-mono text-2xl font-bold text-blue-600">
      {time.days}d {time.hours}h {time.minutes}m {time.seconds}s
    </div>
  );
};

const PlugDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(true);
  const [plugs, setPlugs] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('installDate');
  const [sortDirection, setSortDirection] = useState('asc');

  const addNewPlug = () => {
    const newPlug = {
      id: Date.now(),
      wellId: '',
      uwi: '',
      installDate: '',
      retrievalDate: '',
    };
    setPlugs([...plugs, newPlug]);
  };

  const updatePlug = (id, field, value) => {
    setPlugs(plugs.map(plug => 
      plug.id === id ? { ...plug, [field]: value } : plug
    ));
  };

  const deletePlug = (id) => {
    setPlugs(plugs.filter(plug => plug.id !== id));
  };

  const calculateCost = (installDate, retrievalDate) => {
    if (!installDate) return 0;
    const start = new Date(installDate);
    const end = retrievalDate ? new Date(retrievalDate) : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const regularDays = Math.min(diffDays, 60);
    const discountedDays = Math.max(0, diffDays - 60);
    return (regularDays * 55) + (discountedDays * 27.50);
  };

  const filteredAndSortedPlugs = plugs
    .filter(plug => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return plug.wellId.toLowerCase().includes(term) || 
             plug.uwi.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      if (sortField === 'wellId') {
        return sortDirection === 'asc' 
          ? a.wellId.localeCompare(b.wellId)
          : b.wellId.localeCompare(a.wellId);
      }
      if (sortField === 'installDate') {
        if (!a.installDate) return 1;
        if (!b.installDate) return -1;
        const dateA = new Date(a.installDate);
        const dateB = new Date(b.installDate);
        return sortDirection === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isAdmin ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Switch to Customer View
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Switch to Admin Panel
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? 'Admin Panel' : 'Plug Tracking Dashboard'}
            </h1>
            {!isAdmin && <Lock className="text-gray-500 h-6 w-6" />}
          </div>

          {/* Company Name Input (Admin Only) */}
          {isAdmin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Search and Sort (Customer View) */}
          {!isAdmin && (
            <div className="mb-6 space-y-4">
              <div className="max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search by Well ID or UWI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSortField('wellId');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sort by Well ID {sortField === 'wellId' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => {
                    setSortField('installDate');
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sort by Install Date {sortField === 'installDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          )}

          {/* Add New Plug Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={addNewPlug}
              className="mb-6 inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Plug
            </button>
          )}

          {/* Plugs List */}
          <div className="space-y-6">
            {filteredAndSortedPlugs.map(plug => (
              <div key={plug.id} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Well ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Well ID
                    </label>
                    {isAdmin ? (
                      <input
                        type="text"
                        value={plug.wellId}
                        onChange={(e) => updatePlug(plug.id, 'wellId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{plug.wellId}</div>
                    )}
                  </div>

                  {/* UWI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UWI
                    </label>
                    {isAdmin ? (
                      <input
                        type="text"
                        value={plug.uwi}
                        onChange={(e) => updatePlug(plug.id, 'uwi', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">{plug.uwi}</div>
                    )}
                  </div>

                  {/* Install Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Install Date
                    </label>
                    {isAdmin ? (
                      <input
                        type="datetime-local"
                        value={plug.installDate}
                        onChange={(e) => updatePlug(plug.id, 'installDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                        {plug.installDate ? new Date(plug.installDate).toLocaleString() : ''}
                      </div>
                    )}
                  </div>

                  {/* Retrieval Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retrieval Date
                    </label>
                    {isAdmin ? (
                      <input
                        type="datetime-local"
                        value={plug.retrievalDate}
                        onChange={(e) => updatePlug(plug.id, 'retrievalDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!plug.installDate}
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-900">
                        {plug.retrievalDate ? new Date(plug.retrievalDate).toLocaleString() : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timer and Cost Display */}
                <div className="flex items-center justify-between bg-gray-50 p-4 border-t border-gray-200">
                  <div className="flex items-center gap-4">
                    <Clock className="h-6 w-6 text-blue-500" />
                    {plug.installDate && (
                      <PlugTimer 
                        installDate={plug.installDate} 
                        retrievalDate={plug.retrievalDate}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-semibold text-green-600">
                      ${calculateCost(plug.installDate, plug.retrievalDate).toFixed(2)}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deletePlug(plug.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlugDashboard;