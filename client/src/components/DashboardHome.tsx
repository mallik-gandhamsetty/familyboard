import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, Utensils, List, MessageSquare, Bell, Plus } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import AIChatInterface from "./AIChatInterface";
import CalendarView from "./CalendarView";
import TasksManager from "./TasksManager";
import ListsManager from "./ListsManager";

export default function DashboardHome() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch family data
  const familyQuery = trpc.family.getMyFamily.useQuery();
  const membersQuery = trpc.family.getMembers.useQuery();

  // Fetch today's data
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const eventsQuery = trpc.calendar.getEvents.useQuery({
    startDate: startOfDay,
    endDate: endOfDay,
  });

  const tasksQuery = trpc.tasks.list.useQuery({});
  const mealQuery = trpc.meals.getPlan.useQuery({ date: selectedDate });
  const notificationsQuery = trpc.notifications.getUnread.useQuery();

  const family = familyQuery.data;
  const members = membersQuery.data || [];
  const events = eventsQuery.data || [];
  const tasks = tasksQuery.data || [];
  const meals = mealQuery.data || [];
  const unreadNotifications = notificationsQuery.data || [];

  const pendingTasks = tasks.filter((t) => t.status === "pending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      <AIChatInterface />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Good {getTimeOfDay()}, {family?.name || "Family"}! 👋
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Today's Events"
            value={events.length}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="w-5 h-5" />}
            label="Pending Tasks"
            value={pendingTasks.length}
            color="orange"
          />
          <StatCard
            icon={<Utensils className="w-5 h-5" />}
            label="Meals Planned"
            value={meals.length}
            color="green"
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            label="Family Members"
            value={members.length}
            color="purple"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar & Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Schedule */}
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Today's Schedule
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>No events scheduled for today</p>
                    <p className="text-sm mt-2">Create one to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                            {event.title}
                          </h3>
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
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  Tasks & Chores
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p>All tasks completed! 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingTasks.slice(0, 5).map((task) => {
                      const priorityColor =
                        task.priority === "high"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-slate-300 text-orange-600 cursor-pointer"
                            defaultChecked={false}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {task.title}
                            </p>
                            {task.assignedTo && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Assigned to member {task.assignedTo}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColor}`}>
                            {task.priority}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6">
            {/* Meal Plan */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-green-600" />
                  Meal Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <p className="text-sm">No meals planned</p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {meals.map((meal) => (
                      <div key={meal.id} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="font-semibold text-slate-900 dark:text-white capitalize">
                          {meal.mealType}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{meal.meal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Family Members */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Family Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        style={{ backgroundColor: member.color || "#3B82F6" }}
                      >
                        {member.id % 10}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Member</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  New Task
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <List className="w-4 h-4 mr-2" />
                  New List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask HomeBrain
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Additional Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Calendar Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Calendar</h2>
          <CalendarView />
        </div>

        {/* Tasks Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All Tasks</h2>
          <TasksManager />
        </div>

        {/* Lists Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Lists</h2>
          <ListsManager />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-24 py-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2025 FamilyBoard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "orange" | "green" | "purple";
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
