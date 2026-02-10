"use server";

import  prisma  from "@/app/lib/prisma";
import { hashPassword, verifyPassword } from "@/app/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signup(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Missing fields");
  }

  // Validate email format
  if (!email.includes("@") || !email.includes(".")) {
    throw new Error("Invalid email format");
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashed = await hashPassword(password);

  const user = await prisma.user.create({
    data: { email, password: hashed },
  });

  const cookieStore = await cookies();
  cookieStore.set("userId", String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  console.log(user);

  if (!user) throw new Error("Invalid credentials");

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const cookieStore = await cookies();
  cookieStore.set("userId", String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}



export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  redirect("/");
}
