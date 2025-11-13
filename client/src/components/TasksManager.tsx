import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";

export default function TasksManager() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });

  const tasksQuery = trpc.tasks.list.useQuery({});
  const createTaskMutation = trpc.tasks.create.useMutation();
  const updateTaskMutation = trpc.tasks.update.useMutation();

  const tasks = tasksQuery.data || [];
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      await createTaskMutation.mutateAsync({
        title: formData.title,
        description: formData.description || undefined,
        priority: formData.priority,
      });
      setFormData({ title: "", description: "", priority: "medium" });
      setShowForm(false);
      tasksQuery.refetch();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        status: "completed",
        completedAt: new Date(),
      });
      tasksQuery.refetch();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Tasks & Chores</CardTitle>
        <Button
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Form */}
        {showForm && (
          <form onSubmit={handleCreateTask} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-3">
            <Input
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as "low" | "medium" | "high",
                })
              }
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createTaskMutation.isPending}>
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Pending ({pendingTasks.length})
            </h4>
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
              >
                <button
                  onClick={() => handleCompleteTask(task.id)}
                  className="flex-shrink-0 mt-1 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Circle className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Completed ({completedTasks.length})
            </h4>
            {completedTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg opacity-75"
              >
                <button className="flex-shrink-0 mt-1 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white truncate line-through">
                    {task.title}
                  </p>
                </div>
              </div>
            ))}
            {completedTasks.length > 3 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                +{completedTasks.length - 3} more completed
              </p>
            )}
          </div>
        )}

        {/* Empty State */}
        {pendingTasks.length === 0 && completedTasks.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No tasks yet</p>
            <p className="text-sm mt-2">Create one to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
