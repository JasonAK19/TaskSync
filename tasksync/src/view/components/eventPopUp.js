import React, { useState } from 'react';
import axios from 'axios';
import './eventPopUp.css';

const EventPopUp = ({ isOpen, onClose, onSave }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    isAllDay: false,
    reminder: false,
    reminderTime: 15
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventPayload = {
      ...eventData,
      startDateTime: `${eventData.startDate}T${eventData.startTime}`,
      endDateTime: `${eventData.endDate}T${eventData.endTime}`
    };
    onSave(eventPayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Create Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title*</label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => setEventData({...eventData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({...eventData, description: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date*</label>
              <input
                type="date"
                value={eventData.startDate}
                onChange={(e) => setEventData({...eventData, startDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={eventData.startTime}
                onChange={(e) => setEventData({...eventData, startTime: e.target.value})}
                disabled={eventData.isAllDay}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>End Date*</label>
              <input
                type="date"
                value={eventData.endDate}
                onChange={(e) => setEventData({...eventData, endDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={eventData.endTime}
                onChange={(e) => setEventData({...eventData, endTime: e.target.value})}
                disabled={eventData.isAllDay}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={eventData.location}
              onChange={(e) => setEventData({...eventData, location: e.target.value})}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={eventData.isAllDay}
                onChange={(e) => setEventData({...eventData, isAllDay: e.target.checked})}
              />
              All Day Event
            </label>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={eventData.reminder}
                onChange={(e) => setEventData({...eventData, reminder: e.target.checked})}
              />
              Set Reminder
            </label>
          </div>

          <div className="button-group">
            <button type="submit">Create Event</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventPopUp;