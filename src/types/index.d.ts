import "express-session";

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: number;
    // Add more session fields as needed
  }
}

export {};
