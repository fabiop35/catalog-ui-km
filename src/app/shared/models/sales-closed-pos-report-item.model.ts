export interface SalesClosedPosReportItem {
    host: string;
    hostSequence: number;
    money: string;
    dateStart: string; // Or Date if you handle conversion
    dateEnd: string; 
    payment: string;
    total: number; // Or string if it's a formatted string
}