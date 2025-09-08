export type Context = {
  Variables: {
    requestId: string;
    userId?: string;
    session?: {
      user: { id: string; email: string };
    };
  };
};

export type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  requestId: string;
  timestamp: string;
};