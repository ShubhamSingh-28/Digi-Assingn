"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTask, updateTaskStatus } from "../actions/tasks";
import type { Task } from "../lib/types";

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function handleCreateTask() {
    if (!title.trim()) return;

    setError("");
    setCreating(true);

    try {
      await createTask(title);
      setTitle("");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateStatus(taskId: number, status: string) {
    // Optimistic update could go here, but for now we rely on router.refresh() 
    // which effectively re-fetches server data.
    try {
      await updateTaskStatus(taskId, status);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update task");
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Todo": return "status-todo";
      case "In Progress": return "status-in-progress";
      case "Done": return "status-done";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Task Input Section */}
      <div className="card p-6 border border-indigo-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Create New Task</h2>
        <div className="flex gap-4 flex-col sm:flex-row">
          <input
            className="input-field flex-1"
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreateTask()}
            disabled={creating}
          />
          <button
            className="btn-primary whitespace-nowrap flex items-center justify-center gap-2"
            onClick={handleCreateTask}
            disabled={creating || !title.trim()}
          >
            {creating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                <span>Add Task</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-red-500 text-sm flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-16 opacity-60">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <p className="text-xl font-medium">No tasks yet</p>
            <p className="text-sm mt-1">Add a task above to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 task-card border-l-4 border-l-indigo-500 hover:border-l-indigo-600">
              <div className="flex-1">
                <h3 className="font-medium text-lg text-gray-800 dark:text-gray-100">{task.title}</h3>
                <p className="text-xs text-gray-400 mt-1">Created {new Date(task.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="relative">
                <select
                  value={task.status}
                  onChange={e => handleUpdateStatus(task.id, e.target.value)}
                  className={`appearance-none cursor-pointer pl-4 pr-10 py-2 rounded-full text-sm font-semibold border-none focus:ring-2 focus:ring-indigo-300 transition-all ${getStatusColor(task.status)}`}
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-current opacity-70">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
