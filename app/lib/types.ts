export type Task = {
  id: number;
  title: string;
  status: string;
  userId: number;
  createdAt: Date;
};

export type User = {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
};
