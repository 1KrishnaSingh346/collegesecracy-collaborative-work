import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';

const InteractiveCalendar = ({ events, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [eventsMap, setEventsMap] = useState({});

  useEffect(() => {
    const map = {};
    events.forEach(event => {
      const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(event);
    });
    setEventsMap(map);
  }, [events]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (day) => {
    setSelectedDate(day);
    const dateKey = format(day, 'yyyy-MM-dd');
    if (eventsMap[dateKey] && eventsMap[dateKey].length > 0) {
      onDateSelect(eventsMap[dateKey][0]); // Select first event of the day
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button 
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const hasEvents = eventsMap[dateKey] && eventsMap[dateKey].length > 0;
          
          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={`h-10 rounded-full flex items-center justify-center text-sm
                ${!isSameMonth(day, currentMonth) ? 'text-gray-300 dark:text-gray-600' : ''}
                ${isSameDay(day, selectedDate) ? 'bg-orange-500 text-white' : ''}
                ${hasEvents && isSameMonth(day, currentMonth) && !isSameDay(day, selectedDate) ? 
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300' : 
                  'hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
            >
              {format(day, 'd')}
              {hasEvents && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500"></span>
              )}
            </button>
          );
        })}
      </div>
      
      {eventsMap[format(selectedDate, 'yyyy-MM-dd')] && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-800 dark:text-white mb-2">
            Events on {format(selectedDate, 'MMMM d, yyyy')}
          </h4>
          <div className="space-y-2">
            {eventsMap[format(selectedDate, 'yyyy-MM-dd')].map(event => (
              <div 
                key={event.id}
                className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
              >
                <div className="font-medium">{event.title}</div>
                <div className="text-gray-600 dark:text-gray-300">{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveCalendar;