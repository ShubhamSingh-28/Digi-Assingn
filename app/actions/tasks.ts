"use server";

import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/getUser";

const VALID_STATUSES = ["Todo", "In Progress", "Done"];

export async function createTask(title: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Validate title
  if (!title || title.trim().length === 0) {
    throw new Error("Title is required");
  }
  if (title.length > 500) {
    throw new Error("Title must be less than 500 characters");
  }

  await prisma.task.create({
    data: {
      title: title.trim(),
      status: "Todo",
      userId: user.id,
    },
  });
}

export async function updateTaskStatus(taskId: number, status: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Validate status
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }

  // Security fix: Only allow updating user's own tasks
  const result = await prisma.task.updateMany({
    where: {
      id: taskId,
      userId: user.id, // Verify ownership
    },
    data: { status },
  });

  if (result.count === 0) {
    throw new Error("Task not found or unauthorized");
  }
}

export async function getTasks() {
  const user = await getCurrentUser();
  if (!user) return [];

  return prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}
