import { type Event, EVENT_STORAGE_KEY } from "@ramo-libre/shared";
import { DefaultStore } from "./default";

const DEFAULT_EVENTS: Event[] = [];

export class EventsManager extends DefaultStore<Event[]> {
    constructor() {
        super(EVENT_STORAGE_KEY, DEFAULT_EVENTS);
    }

    addEvent(event: Event) {
        if (!event.id) {
            event.id = crypto.randomUUID();
        }
        this.update(current => [...current, event]);
    }

    removeEvent(eventId: string) {
        this.update(current => {
            const index = current.findIndex(event => event.id === eventId);
            if (index > -1) current.splice(index, 1);
            return current;
        });
    }

    updateEvent(updatedEvent: Event) {
        this.update(current => 
            current.map(event => event.id === updatedEvent.id ? updatedEvent : event)
        );
    }

    toggleComplete(eventId: string) {
        this.update(current => {
            const index = current.findIndex(event => event.id === eventId);
            if (index > -1) {
                current[index].completed = !current[index].completed;
            }
            return current;
        });
    }

    getCategorizedEvents(events: Event[], timeString:string, filterSubject:string): Record<string, Event[]> {
        const upcoming:Event[] = [];
        const overdue:Event[] = [];
        const completed:Event[] = [];
        const all:Event[] = [];
        for (const event of events) {
            if (filterSubject !== 'all' && event.subjectId !== filterSubject) continue;
            if (event.completed) {
                completed.push(event);
            } else if (event.date < timeString) {
                overdue.push(event);
            } else {
                upcoming.push(event);
            }
            all.push(event);
        }
        return { upcoming, overdue, completed, all };
    }

    getTypeIcon(type: Event['type']): string {
		switch (type) {
			case 'exam': return '📝';
			case 'assignment': return '📋';
			case 'project': return '💼';
			case 'deadline': return '⏰';
			case 'class': return '👨‍🏫';
			case 'meeting': return '🤝';
			default: return '📅';
		}
	}

    getTypeName(type: Event['type']): string {
		switch (type) {
			case 'exam': return 'Examen';
			case 'assignment': return 'Tarea';
			case 'project': return 'Proyecto';
			case 'deadline': return 'Fecha límite';
			case 'class': return 'Clase';
			case 'meeting': return 'Reunión';
			default: return 'Evento';
		}
	}

}

export const currentEvents = new EventsManager();
