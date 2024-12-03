// DetailModal.js
import React from 'react';
import './detailModal.css';

const DetailModal = ({ isOpen, onClose, item, groupNames }) => {
  if (!isOpen || !item) return null;

  const isEvent = 'startDateTime' in item;
  const isGroupItem = 'groupId' in item;

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    try {
      // Check if date is valid
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'No date specified';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date Format';
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="detail-modal">
        <div className="modal-header">
          <div className="header-content">
            <span className={`item-type ${isEvent ? 'event-type' : 'task-type'}`}>
              {isEvent ? 'Event' : 'Task'}
            </span>
            <h2>{item.title}</h2>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-content">
        {isGroupItem && (
        <div className="info-section group-info">
          <h3>Group Details</h3>
          <div className="detail-row">
            <i className="fas fa-users"></i>
            <div>
              <p className="group-name">{groupNames[item.groupId] || 'Unknown Group'}</p>
            </div>
          </div>
        </div>
      )}
          {isEvent ? (
            <>
              <div className="info-section">
                <h3>Event Details</h3>
                <div className="detail-row">
                  <i className="fas fa-align-left"></i>
                  <div>
                    <strong>Description:</strong>
                    <p>{item.description || 'No description'}</p>
                  </div>
                </div>

                <div className="detail-row">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <strong>Location:</strong>
                    <p>{item.location || 'No location specified'}</p>
                  </div>
                </div>

                <div className="detail-row">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>Time:</strong>
                    <p>From: {formatDateTime(item.startDateTime)}</p>
                    <p>To: {formatDateTime(item.endDateTime)}</p>
                  </div>
                </div>

                {item.isAllDay && (
                  <div className="detail-row">
                    <i className="fas fa-calendar-day"></i>
                    <p>All Day Event</p>
                  </div>
                )}

                {item.reminder && (
                  <div className="detail-row">
                    <i className="fas fa-bell"></i>
                    <p>Reminder set for {item.reminderTime} minutes before</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="info-section">
                <h3>Task Details</h3>
                <div className="detail-row">
                  <i className="fas fa-align-left"></i>
                  <div>
                    <strong>Description:</strong>
                    <p>{item.description || 'No description'}</p>
                  </div>
                </div>

                <div className="detail-row">
                  <i className="fas fa-calendar"></i>
                  <div>
                    <strong>Due Date:</strong>
                    <p>{formatDate(item.date)}</p>
                  </div>
                </div>

                {item.time && (
                  <div className="detail-row">
                    <i className="fas fa-clock"></i>
                    <div>
                      <strong>Time:</strong>
                      <p>{item.time}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="info-section assignment-info">
                <h3>Assignment Details</h3>
                {!isGroupItem && item.assignedTo && (
                  <div className="detail-row">
                    <i className="fas fa-user"></i>
                    <div>
                      <strong>Assigned to:</strong>
                      <p>{item.assignedTo}</p>
                    </div>
                  </div>
                )}
                {isGroupItem && item.assignedTo && (
                  <div className="detail-row">
                    <i className="fas fa-users"></i>
                    <div>
                      <strong>Group Members Assigned:</strong>
                      <p>{Array.isArray(item.assignedTo) ? 
                        item.assignedTo.join(', ') : 
                        item.assignedTo}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;