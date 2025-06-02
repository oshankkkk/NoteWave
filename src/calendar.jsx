import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop';
import '@schedule-x/theme-default/dist/calendar.css';
import './styles/calendar.css';
function App() {
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Event 1',
            start: '2025-01-01 00:00',
            end: '2025-01-01 02:00',
        },
        {
            id: 2,
            title: 'Event 2',
            start: '2025-01-02 02:00',
            end: '2025-01-02 04:00',
        }
    ]);

    const addEvent = () => {
        const title = prompt("Enter event title:");
        if (!title) return;

        const start = prompt("Enter start datetime (YYYY-MM-DD HH:mm):");
        if (!start) return;

        const end = prompt("Enter end datetime (YYYY-MM-DD HH:mm):");
        if (!end) return;

        const newEvent = {
            id: Date.now(),
            title,
            start,
            end,
        };

        setEvents([...events, newEvent]);
    };

    const calendar = useCalendarApp({
        views: [createViewMonthGrid(), createViewWeek()],
        selectedDate: '2025-01-01',
        events: events,
        plugins: [createEventModalPlugin(), createDragAndDropPlugin()],
    });

    return (
        <div style={{ padding: '20px' }}>
            {/* Button inside calendar container */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <button
                    onClick={addEvent}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#9333ea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                    }}
                >
                    + Add Event
                </button>
            </div>

            <ScheduleXCalendar calendarApp={calendar} />
        </div>
    );
}

export default App;