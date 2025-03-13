declare module '@clerk/clerk-sdk-node' {
  export interface ClerkOptions {
    apiKey: string;
  }

  export interface Session {
    subject: string;
    sid: string;
  }

  export interface ClerkSessions {
    verifyToken(token: string): Promise<Session>;
  }

  export class Clerk {
    constructor(options: ClerkOptions);
    sessions: ClerkSessions;
  }
} 