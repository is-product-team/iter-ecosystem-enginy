declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId: number;
        role: string;
        centerId?: number;
      };
    }
  }
}
export {};
