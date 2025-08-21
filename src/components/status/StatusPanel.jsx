'use client';

import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import StatusCircle from '../StatusCircle';

export default function StatusPanel({ onStatusSelect, selectedStatus }) {
  const { users, getUserStatuses, getUserStatusCircles } = useAppContext();
  
  // Filter users who have statuses
  const usersWithStatuses = users.filter(user => user.statuses && user.statuses.length > 0);
  
  // Separate users into recent (unviewed) and viewed updates
  const recentUpdates = [];
  const viewedUpdates = [];
  
  usersWithStatuses.forEach(user => {
    const userStatuses = getUserStatuses(user.id);
    const statusCircles = getUserStatusCircles(user.id);
    
    // Check if user has any unviewed statuses
    const hasUnviewed = userStatuses.some(status => !status.isViewed);
    
    if (hasUnviewed) {
      recentUpdates.push({ user, userStatuses, statusCircles });
    } else {
      viewedUpdates.push({ user, userStatuses, statusCircles });
    }
  });
  
  const handleStatusClick = (user) => {
    if (onStatusSelect) {
      const userStatuses = getUserStatuses(user.id);
      if (userStatuses.length > 0) {
        onStatusSelect({
          ...userStatuses[0],
          user: user
        });
      }
    }
  };

  // Function to format time
  const formatStatusTime = (status) => {
    const now = new Date();
    const statusDate = new Date(status.createdAt);
    const diffDays = Math.floor((now - statusDate) / (1000 * 60 * 60 * 24));
    
    // Format time as 12-hour format
    const hours = statusDate.getHours();
    const minutes = statusDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    
    if (diffDays === 0) {
      return `Today, ${timeString}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${timeString}`;
    } else {
      const month = statusDate.toLocaleString('en-US', { month: 'short' });
      const day = statusDate.getDate();
      return `${month} ${day}, ${timeString}`;
    }
  };

  return (
    <div className="h-full bg-[#2C2C2C] flex flex-col rounded-tl-xl">
      {/* Header */}
      <div className="p-4">
        <h2 className="text-white text-[20px] font-semibold">Status</h2>
      </div>

      {/* Contenu défilable */}
      <div className="flex-1 overflow-y-auto">
        {/* My status */}
        <div className="pl-5 pr-1">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700/50 cursor-pointer transition-colors">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                alt="My status"
                className="w-12 h-12 rounded-full"
              />
              
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">My status</p>
              <p className="text-sm text-gray-300">No updates</p>
            </div>
          </div>
        </div>

        {/* Recent updates */}
        {recentUpdates.length > 0 && (
          <div className="p-4 border-b border-neutral-800">
            <h3 className="text-gray-400 text-sm font-medium mb-3">Recent updates</h3>
            <div className="space-y-3">
              {recentUpdates.map(({ user, userStatuses, statusCircles }) => {
                const latestStatus = userStatuses[0];
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleStatusClick(user)}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700/50 cursor-pointer transition-colors ${
                      selectedStatus?.userId === user.id ? 'bg-neutral-700/50' : ''
                    }`}
                  >
                    <StatusCircle statusCircles={statusCircles} size="default">
                      <img
                        src={user.avatar}
                        alt={`${user.name} status`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </StatusCircle>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-400">{formatStatusTime(latestStatus)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Viewed updates */}
        {viewedUpdates.length > 0 && (
          <div className="p-4">
            <h3 className="text-gray-400 text-sm font-medium mb-3">Viewed updates</h3>
            <div className="space-y-3">
              {viewedUpdates.map(({ user, userStatuses, statusCircles }) => {
                const latestStatus = userStatuses[0];
                
                return (
                  <div
                    key={user.id}
                    onClick={() => handleStatusClick(user)}
                    className={`flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700/50 cursor-pointer transition-colors ${
                      selectedStatus?.userId === user.id ? 'bg-neutral-700/50' : ''
                    }`}
                  >
                    <StatusCircle statusCircles={statusCircles} size="default">
                      <img
                        src={user.avatar}
                        alt={`${user.name} status`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </StatusCircle>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-400">{formatStatusTime(latestStatus)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
