import { format } from 'date-fns';

export interface ICSEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}

/**
 * Generates an iCalendar (.ics) format string.
 */
export function generateICS(events: ICSEvent[]): string {
  const formatICSDate = (date: Date) => format(date, "yyyyMMdd'T'HHmmss'Z'");

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Iter Ecosystem//Calendar//CA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach(event => {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@iter-ecosystem.com`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${formatICSDate(event.startDate)}`);
    if (event.endDate) {
      lines.push(`DTEND:${formatICSDate(event.endDate)}`);
    } else {
      // If no end date, set to 1 hour after start
      const defaultEnd = new Date(event.startDate.getTime() + 60 * 60 * 1000);
      lines.push(`DTEND:${formatICSDate(defaultEnd)}`);
    }
    lines.push(`SUMMARY:${event.title.replace(/[,;]/g, '\\$&')}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n').replace(/[,;]/g, '\\$&')}`);
    }
    if (event.location) {
      lines.push(`LOCATION:${event.location.replace(/[,;]/g, '\\$&')}`);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}
