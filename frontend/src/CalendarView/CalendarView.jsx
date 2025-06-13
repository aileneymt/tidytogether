import { useState, useEffect } from 'react';
import { Calendar, dayjsLocalizer  } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarView.css';

const localizer = dayjsLocalizer(dayjs)

function CalendarView({ tasks, editClick }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const formattedTasks = tasks.map(t => {
      return {
        ...t,
        id: t.id,
        title: t.name,
        start: new Date(t.deadline),
        end: new Date(t.deadline)
      }
    });
    setEvents(formattedTasks);
  }, [tasks])

  const handleSelectEvent = (event) => {
    editClick(event);
  }

  const isEventOverdue = (event) => {
    let backgroundColor = '#3174ad'; // default
    const now = new Date();
    const deadlinePassed = new Date(event.deadline) < now;
    const taskIncomplete = !event.completed_at;
    if (deadlinePassed && taskIncomplete) {
      backgroundColor = 'red'
    }

    return {
      style: { backgroundColor }
    }
  }

  return (
    <>
    <div className='background'>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        toolbar={false}
        popup
        eventPropGetter={isEventOverdue}
        onSelectEvent={(event) => handleSelectEvent(event)}
        style={{ minHeight: 800 }}
      />
    </div>
    </>
  )
}

export default CalendarView