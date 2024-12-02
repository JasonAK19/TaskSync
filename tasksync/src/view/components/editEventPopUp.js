import React, { useState, useEffect } from 'react';
import './eventPopUp.css';

const EditEventPopUp = ({ isOpen, closeModal, onSave, eventData: initialEventData }) => {
  // Initialize state with event data (if provided)
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
    reminderTime: 15,
  });

  // Update the state when the component is opened and receives new event data
  useEffect(() => {
    if (isOpen && initialEventData) {
      console.log('initialEventData inside useEffect:', initialEventData);  // Debug log

      setEventData({
        title: initialEventData.title || '',
        description: initialEventData.description || '',
        startDate: initialEventData.startDateTime ? initialEventData.startDateTime.split('T')[0] : '',
        startTime: initialEventData.startDateTime ? initialEventData.startDateTime.split('T')[1] : '',
        endDate: initialEventData.endDateTime ? initialEventData.endDateTime.split('T')[0] : '',
        endTime: initialEventData.endDateTime ? initialEventData.endDateTime.split('T')[1] : '',
        location: initialEventData.location || '',
        isAllDay: initialEventData.isAllDay || false,
        reminder: initialEventData.reminder || false,
        reminderTime: initialEventData.reminderTime || 15,
      });
    }
  }, [isOpen, initialEventData]); // Re-run effect when isOpen or initialEventData changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventPayload = {
      ...eventData,
      startDateTime: `${eventData.startDate}T${eventData.startTime}`,
      endDateTime: `${eventData.endDate}T${eventData.endTime}`,
    };
    onSave(eventPayload);
    closeModal();
  };

  // If the modal is not open, return null to render nothing
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Edit Event</h2>

        {/* Temporary debug info */}
        <div className="debug-info">
          <pre>{JSON.stringify(eventData, null, 2)}</pre> {/* Shows current eventData */}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title*</label>
            <input
              type="text"
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date*</label>
              <input
                type="date"
                value={eventData.startDate}
                onChange={(e) => setEventData({ ...eventData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={eventData.startTime}
                onChange={(e) => setEventData({ ...eventData, startTime: e.target.value })}
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
                onChange={(e) => setEventData({ ...eventData, endDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={eventData.endTime}
                onChange={(e) => setEventData({ ...eventData, endTime: e.target.value })}
                disabled={eventData.isAllDay}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={eventData.isAllDay}
                onChange={(e) => setEventData({ ...eventData, isAllDay: e.target.checked })}
              />
              All Day Event
            </label>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={eventData.reminder}
                onChange={(e) => setEventData({ ...eventData, reminder: e.target.checked })}
              />
              Set Reminder
            </label>
          </div>

          <div className="button-group">
            <button type="submit">Save Event</button>
            <button type="button" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPopUp;