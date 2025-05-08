export interface LogEntry {
    timestamp: number;
    message: string;
    type: "info" | "error" | "warning";
}