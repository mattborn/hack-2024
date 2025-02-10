// Sample medical procedure events data
// Sample medical procedure events data
const events = [
    { id: 1, hospital: "Northwestern Memorial", location: "Chicago Downtown", 
      startTime: new Date(2024, 0, 15, 9, 0), duration: 180, // 3 hours
      status: "scheduled", assignedTo: "Alice Smith" },
    { id: 2, hospital: "Rush University", location: "Chicago West", 
      startTime: new Date(2024, 0, 15, 9, 30), duration: 60,
      status: "scheduled", assignedTo: "Bob Johnson" },
    { id: 3, hospital: "Loyola University", location: "Maywood", 
      startTime: new Date(2024, 0, 15, 10, 0), duration: 180,
      status: "scheduled", assignedTo: "Carol Davis" },
    { id: 4, hospital: "NorthShore Evanston", location: "Evanston", 
      startTime: new Date(2024, 0, 15, 10, 15), duration: 120,
      status: "delayed", assignedTo: "David Wilson" },
    { id: 5, hospital: "Advocate Lutheran", location: "Park Ridge", 
      startTime: new Date(2024, 0, 15, 10, 30), duration: 180,
      status: "scheduled", assignedTo: "Eve Brown" },
    { id: 6, hospital: "UIC Medical Center", location: "Chicago West", 
      startTime: new Date(2024, 0, 15, 11, 0), duration: 60,
      status: "scheduled", assignedTo: "Frank Miller" },
    { id: 7, hospital: "Swedish Hospital", location: "North Park", 
      startTime: new Date(2024, 0, 15, 11, 30), duration: 180,
      status: "scheduled", assignedTo: "Grace Lee" },
    { id: 8, hospital: "Weiss Memorial", location: "Uptown", 
      startTime: new Date(2024, 0, 15, 12, 0), duration: 120,
      status: "rescheduled", assignedTo: "Henry Taylor" },
    { id: 9, hospital: "Holy Cross", location: "South Chicago", 
      startTime: new Date(2024, 0, 15, 12, 30), duration: 180,
      status: "scheduled", assignedTo: "Iris Chen" },
    { id: 10, hospital: "Mercy Hospital", location: "Bronzeville", 
      startTime: new Date(2024, 0, 15, 13, 0), duration: 60,
      status: "scheduled", assignedTo: "Jack Martin" }
    // ... more events can be added here
];

const teamMembers = [
    { id: 1, name: "Alice Smith", role: "QB", availability: [9, 10, 11, 14, 15, 16] },
    { id: 2, name: "Bob Johnson", role: "Specialist", availability: [10, 11, 12, 13, 14] },
    { id: 3, name: "Carol Davis", role: "Specialist", availability: [9, 10, 13, 14, 15] },
    { id: 4, name: "David Wilson", role: "Specialist", availability: [11, 12, 13, 14, 15] },
    { id: 5, name: "Eve Brown", role: "Specialist", availability: [9, 10, 11, 15, 16] }
];

// Current QB (normally would come from auth)
const currentQB = teamMembers[0];

function renderSchedule() {
    const container = document.createElement('div');
    container.className = 'schedule-container';
    
    // Create time column
    const timeColumn = document.createElement('div');
    timeColumn.className = 'time-column';
    const hours = Array.from({length: 9}, (_, i) => i + 9);
    hours.forEach(hour => {
        const label = document.createElement('div');
        label.className = 'time-label';
        label.style.top = `${(hour - 9) * 60}px`;
        label.textContent = `${hour}:00`;
        timeColumn.appendChild(label);
    });
    container.appendChild(timeColumn);

    // Create events area
    const eventsArea = document.createElement('div');
    eventsArea.className = 'events-area';

    // Render events
    events.forEach(event => {
        const startHour = event.startTime.getHours();
        const durationHours = event.duration / 60;
        const statusClass = event.status === 'delayed' || event.status === 'rescheduled' ? 'unavailable' : 'available';
        
        const eventDiv = document.createElement('div');
        eventDiv.className = `event-block ${statusClass}`;
        eventDiv.style.top = `${(startHour - 9) * 60}px`;
        eventDiv.style.height = `${durationHours * 60 - 10}px`; // -10 for margin
        
        // Calculate horizontal position based on overlapping events
        const overlappingEvents = events.filter(e => {
            const eStart = e.startTime.getTime();
            const eEnd = eStart + (e.duration * 60 * 1000);
            const thisStart = event.startTime.getTime();
            const thisEnd = thisStart + (event.duration * 60 * 1000);
            return e.id < event.id && // Only look at earlier events
                   ((eStart <= thisStart && eEnd > thisStart) || // Event starts during another
                    (eStart < thisEnd && eEnd >= thisEnd));      // Event ends during another
        });
        
        const column = overlappingEvents.length;
        const width = 200; // px
        eventDiv.style.left = `${column * (width + 10)}px`;
        eventDiv.style.width = `${width}px`;
        const initials = event.assignedTo.split(' ').map(n => n[0]).join('');
        eventDiv.innerHTML = `
            ${event.hospital} (${event.location})<br>
            <span class="initials">${initials}</span>
            ${event.status !== 'scheduled' ? `(${event.status})` : ''}
        `;
        
        eventsArea.appendChild(eventDiv);
    });

    document.getElementById('teamSchedule').innerHTML = '';
    // Add team list
    const teamList = document.createElement('div');
    teamList.className = 'team-list';
    teamList.innerHTML = `
        <h3>Team Members</h3>
        ${teamMembers.map(member => {
            const initials = member.name.split(' ').map(n => n[0]).join('');
            return `<div>
                <span class="initials">${initials}</span>
                ${member.name} (${member.role})
            </div>`;
        }).join('')}
    `;
    
    container.appendChild(eventsArea);
    document.getElementById('teamSchedule').appendChild(container);
    document.getElementById('teamSchedule').appendChild(teamList);
}

// Initialize the schedule display
document.addEventListener('DOMContentLoaded', () => {
    renderSchedule();
    
    // Add prompt input handler
    const promptInput = document.getElementById('promptInput');
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handlePrompt(promptInput.value);
            promptInput.value = '';
        }
    });
});

// Handle prompt commands
function handlePrompt(prompt) {
    prompt = prompt.toLowerCase();
    
    // Simple command parsing for event updates
    if (prompt.includes('reschedule') || prompt.includes('delay')) {
        const hospital = prompt.match(/at\s+([^,]+)/i)?.[1];
        const time = prompt.match(/to\s+(\d+)(?:\s*(?:am|pm))/i)?.[1];
        
        if (hospital && time) {
            const event = events.find(e => e.hospital.toLowerCase().includes(hospital.toLowerCase()));
            if (event) {
                const newHour = parseInt(time);
                event.originalStart = new Date(event.startTime);
                event.startTime.setHours(newHour);
                event.status = prompt.includes('reschedule') ? 'rescheduled' : 'delayed';
                document.getElementById('teamSchedule').innerHTML = '';
                renderSchedule();
            }
        }
    }
}
