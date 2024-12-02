import React, { useState, useEffect } from 'react';
import './eventPopUp.css';

const EditEventPopUp = ({ isOpen, closeModal, onSave, event }) => {
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

  useEffect(() => {
    if (event) {
      const startDateTime = new Date(event.startDateTime);
      const endDateTime = new Date(event.endDateTime);

      setEventData({
        title: event.title || '',
        description: event.description || '',
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toISOString().split('T')[1].substring(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toISOString().split('T')[1].substring(0, 5),
        location: event.location || '',
        isAllDay: event.isAllDay || false,
        reminder: event.reminder || false,
        reminderTime: event.reminderTime || 15,
      });
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventPayload = {
      title: eventData.title,
      description: eventData.description,
      startDateTime: `${eventData.startDate}T${eventData.startTime}:00.000Z`,
      endDateTime: `${eventData.endDate}T${eventData.endTime}:00.000Z`,
      location: eventData.location,
      isAllDay: eventData.isAllDay,
      reminder: eventData.reminder,
      reminderTime: eventData.reminderTime
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