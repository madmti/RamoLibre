import { type Subject, SUBJECT_STORAGE_KEY } from "@ramo-libre/shared";
import { DefaultStore } from "./default";

const DEFAULT_SUBJECTS: Subject[] = [];

export class SubjectManager extends DefaultStore<Subject[]> {
    constructor() {
        super(SUBJECT_STORAGE_KEY, DEFAULT_SUBJECTS);
    }

    addSubject(subject: Subject) {
        if (!subject.id) {
            subject.id = crypto.randomUUID();
        }
        this.update(current => [...current, subject]);
    }

    removeSubject(subjectId: string) {
        this.update(current => {
            const index = current.findIndex(subject => subject.id === subjectId);
            if (index > -1) current.splice(index, 1);
            return current;
        });
    }

    updateSubject(updatedSubject: Subject) {
        this.update(current => 
            current.map(subject => subject.id === updatedSubject.id ? updatedSubject : subject)
        );
    }
}

export const currentSubjects = new SubjectManager();