import { type Schedule, SCHEDULE_STORAGE_KEY } from "@ramo-libre/shared";
import { DefaultStore } from "./default";

const DEFAULT_SCHEDULES: Schedule[] = [];

export class ScheduleManager extends DefaultStore<Schedule[]> {
    constructor() {
        super(SCHEDULE_STORAGE_KEY, DEFAULT_SCHEDULES);
    }

    addSchedule(schedule: Schedule) {
        if (!schedule.id) {
            schedule.id = crypto.randomUUID();
        }
        this.update(current => [...current, schedule]);
    }

    removeSchedule(scheduleId: string) {
        this.update(current => {
            const index = current.findIndex(schedule => schedule.id === scheduleId);
            if (index > -1) current.splice(index, 1);
            return current;
        });
    }

    removeSchedulesBySubject(subjectId: string) {
        this.update(current => {
            return current.filter(schedule => schedule.subjectId !== subjectId);
        });
    }

    updateSchedule(updatedSchedule: Schedule) {
        this.update(current => 
            current.map(schedule => schedule.id === updatedSchedule.id ? updatedSchedule : schedule)
        );
    }

    getDayName(day: number): string {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return days[day] || '';
    }

    getTypeIcon(type: Schedule['type']): string {
        const icons: Record<Schedule['type'], string> = {
            'class': '📚',
            'lab': '🧪',
            'tutorial': '💡',
        };
        return icons[type] || '❓';
    }
}

export const currentSchedules = new ScheduleManager();
