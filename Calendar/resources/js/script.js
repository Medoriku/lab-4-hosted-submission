// Array to store events
let events = [];
// Track currently editing event index; null when creating
let editingEventIndex = null;

// Category colors mapping
const categoryColors = {
  academic: '#e3f2fd',  // Light blue
  work: '#f3e5f5',      // Light purple
  personal: '#fce4ec', // Light pink
  social: '#e8f5e9'    // Light green
};

// Toggle between Location and Remote URL fields based on modality
function updateLocationOptions(modality) {
  const locationField = document.getElementById('location_field');
  const remoteUrlField = document.getElementById('remote_url_field');
  const locationInput = document.getElementById('event_location');
  const remoteUrlInput = document.getElementById('event_remote_url');
  
  if (modality === 'in-person') {
    locationField.classList.remove('hidden');
    remoteUrlField.classList.add('hidden');
    // Validation: require location, not remote URL
    locationInput.required = true;
    remoteUrlInput.required = false;
  } else if (modality === 'remote') {
    locationField.classList.add('hidden');
    remoteUrlField.classList.remove('hidden');
    // Validation: require remote URL, not location
    locationInput.required = false;
    remoteUrlInput.required = true;
  }
}

// Save event from form and add to calendar
function saveEvent() {
  // Enforce HTML5 form validation before proceeding
  const form = document.getElementById('event-form');
  const modalityValue = document.getElementById('event_modality').value;
  // Ensure required attributes are set based on current modality
  updateLocationOptions(modalityValue);
  if (!form.reportValidity()) {
    return;
  }

  // Get form values
  const name = document.getElementById('event_name').value;
  const weekday = document.getElementById('event_weekday').value;
  const time = document.getElementById('event_time').value;
  const modality = document.getElementById('event_modality').value;
  const location = document.getElementById('event_location').value;
  const remoteUrl = document.getElementById('event_remote_url').value;
  const category = document.getElementById('event_category').value;
  const attendees = document.getElementById('event_attendees').value;

  // Create event object
  const eventDetails = {
    name: name,
    weekday: weekday,
    time: time,
    modality: modality,
    location: modality === 'in-person' ? location : null,
    remote_url: modality === 'remote' ? remoteUrl : null,
    category: category,
    attendees: attendees
  };

  if (editingEventIndex !== null) {
    // Update existing event
    events[editingEventIndex] = eventDetails;

    // Replace/move existing card in UI
    const oldCard = document.getElementById('event-card-' + editingEventIndex);
    if (oldCard && oldCard.parentNode) {
      oldCard.parentNode.removeChild(oldCard);
    }
    addEventToCalendarUI(eventDetails, editingEventIndex);

    // Reset editing state
    editingEventIndex = null;
    const titleEl = document.getElementById('event_modal_label');
    if (titleEl) titleEl.textContent = 'Create Event';
  } else {
    // Add to events array
    events.push(eventDetails);

    // Log to console for debugging
    console.log('Events array:', events);

    // Add event to calendar UI (use last index)
    addEventToCalendarUI(eventDetails, events.length - 1);
  }

  // Reset form
  document.getElementById('event-form').reset();

  // Close modal
  const modalElement = document.getElementById('event_modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}

// Add event card to the calendar UI
function addEventToCalendarUI(eventInfo, eventIndex) {
  // Create the event card
  const eventCard = createEventCard(eventInfo, eventIndex);
  
  // Get the correct day column
  const dayColumn = document.getElementById(eventInfo.weekday);
  
  // Append event card to the day
  dayColumn.appendChild(eventCard);
}

// Create individual event card HTML element
function createEventCard(eventDetails, eventIndex) {
  // Create main event div
  let eventElement = document.createElement('div');
  eventElement.classList = 'event row border rounded m-1 py-1';
  eventElement.id = 'event-card-' + eventIndex;
  
  // Set background color based on category
  const bgColor = categoryColors[eventDetails.category] || '#f0f0f0';
  eventElement.style.backgroundColor = bgColor;
  
  // Create info div with event details
  let info = document.createElement('div');
  info.classList = 'col-12';
  
  // Build event details HTML using template string
  const locationInfo = eventDetails.modality === 'in-person' 
    ? `<strong>Location:</strong> ${eventDetails.location}<br>` 
    : `<strong>Remote URL:</strong> ${eventDetails.remote_url}<br>`;
  
  info.innerHTML = `
    <strong>${eventDetails.name}</strong><br>
    <small><strong>Time:</strong> ${eventDetails.time}</small><br>
    <small><strong>Modality:</strong> ${eventDetails.modality}</small><br>
    <small>${locationInfo}</small>
    <small><strong>Category:</strong> ${eventDetails.category}</small><br>
    <small><strong>Attendees:</strong> ${eventDetails.attendees || 'None'}</small>
  `;
  
  // Append info to event element
  eventElement.appendChild(info);

  // Clicking the event opens modal in edit mode
  eventElement.addEventListener('click', function() {
    startEditEvent(eventIndex);
  });
  
  // Return the event card
  return eventElement;
}

// Start editing an existing event
function startEditEvent(index) {
  const data = events[index];
  if (!data) return;

  editingEventIndex = index;

  // Prefill form fields
  document.getElementById('event_name').value = data.name || '';
  document.getElementById('event_weekday').value = data.weekday || 'sunday';
  document.getElementById('event_time').value = data.time || '';
  document.getElementById('event_modality').value = data.modality || 'in-person';
  document.getElementById('event_category').value = data.category || 'academic';
  document.getElementById('event_attendees').value = data.attendees || '';

  // Toggle and set location/remote URL
  updateLocationOptions(data.modality || 'in-person');
  document.getElementById('event_location').value = data.location || '';
  document.getElementById('event_remote_url').value = data.remote_url || '';

  // Update modal title
  const titleEl = document.getElementById('event_modal_label');
  if (titleEl) titleEl.textContent = 'Update Event';

  // Show modal
  const modalElement = document.getElementById('event_modal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

// Ensure create button opens in create mode
function startCreateEvent() {
  editingEventIndex = null;
  const form = document.getElementById('event-form');
  if (form) form.reset();
  const titleEl = document.getElementById('event_modal_label');
  if (titleEl) titleEl.textContent = 'Create Event';
  const currentModality = document.getElementById('event_modality').value || 'in-person';
  updateLocationOptions(currentModality);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set initial modality view (show location field)
  const initialModality = document.getElementById('event_modality').value || 'in-person';
  updateLocationOptions(initialModality);

  // Wire Create Event button to clear edit state
  const createBtn = document.querySelector('button[data-bs-target="#event_modal"]');
  if (createBtn) {
    createBtn.addEventListener('click', startCreateEvent);
  }
});
