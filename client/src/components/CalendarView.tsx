import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch events for the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const eventsQuery = trpc.calendar.getEvents.useQuery({
    startDate: monthStart,
    endDate: monthEnd,
  });

  const events = eventsQuery.data || [];
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group events by date
  const eventsByDate = events.reduce(
    (acc, event) => {
      const dateKey = format(new Date(event.startTime), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    },
    {} as Record<string, typeof events>
  );

  const getEventsForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return eventsByDate[dateKey] || [];
  };

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-slate-600 dark:text-slate-400 text-sm py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((date) => {
            const dayEvents = getEventsForDate(date);
            const isSelected = isSameDay(date, selectedDate);
            const isCurrentMonth = isSameMonth(date, currentDate);

            return (
              <button
                key={date.toString()}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square p-2 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                } ${!isCurrentMonth ? "opacity-50" : ""}`}
              >
                <div className="h-full flex flex-col">
                  <span className={`text-sm font-semibold ${isCurrentMonth ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>
                    {format(date, "d")}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-1 content-start overflow-hidden">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <div
                        key={idx}
                        className="w-full h-1 rounded-full bg-blue-500 dark:bg-blue-400"
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-xs text-slate-500">+{dayEvents.length - 2}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected date details */}
        {getEventsForDate(selectedDate).length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
              Events on {format(selectedDate, "MMM d")}
            </h4>
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <p className="font-medium text-slate-900 dark:text-white">
                    {event.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {format(new Date(event.startTime), "h:mm a")} -{" "}
                    {format(new Date(event.endTime), "h:mm a")}
                  </p>
                  {event.location && (
                    <p className="text-sm text-slate-500 dark:text-slate-500">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
