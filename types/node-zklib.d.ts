declare module "node-zklib" {
  interface AttendanceRecord {
    deviceUserId?: string;
    userId?: string;
    id?: string;
    recordTime?: string;
    punchTime?: string;
    time?: string;
  }

  interface UserRecord {
    userId?: string;
    id?: string;
    name?: string;
  }

  interface ZKInterface {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getAttendances(): Promise<{ data: AttendanceRecord[] }>;
    getUsers(): Promise<{ data: UserRecord[] }>;
    getDeviceInfo(): Promise<any>;
    getRealTimeLogs(callback: (data: any) => void): Promise<void>;
    clearAttendanceLog(): Promise<void>;
    setUser(uid: string, name: string, password: string, role: string, cardno: string): Promise<void>;
    deleteUser(uid: string): Promise<void>;
    enableDevice(): Promise<void>;
    disableDevice(): Promise<void>;
  }

  export const ZKLib: {
    new (ip: string, port: number, timeout?: number, inport?: number): ZKInterface;
  };
}
