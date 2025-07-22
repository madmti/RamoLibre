import { type SubjectGradeConfig, SUBJECT_GRADE_CONFIG_STORAGE_KEY } from "@ramo-libre/shared";
import { DefaultStore } from "./default";
import { get } from "svelte/store";

const DEFAULT_CONFIGS: SubjectGradeConfig[] = [];

export class SubjectGradeConfigManager extends DefaultStore<SubjectGradeConfig[]> {
    constructor() {
        super(SUBJECT_GRADE_CONFIG_STORAGE_KEY, DEFAULT_CONFIGS);
    }

    addConfig(config: SubjectGradeConfig) {
        if (!config.id) {
            config.id = crypto.randomUUID();
        }
        this.update(current => [...current, config]);
    }

    removeConfig(configId: string) {
        this.update(current => {
            const index = current.findIndex(config => config.id === configId);
            if (index > -1) current.splice(index, 1);
            return current;
        });
    }

    removeConfigsBySubject(subjectId: string) {
        this.update(current => {
            return current.filter(config => config.subjectId !== subjectId);
        });
    }

    updateConfig(updatedConfig: SubjectGradeConfig) {
        this.update(current => 
            current.map(config => config.id === updatedConfig.id ? updatedConfig : config)
        );
    }

    getConfigBySubject(subjectId: string): SubjectGradeConfig | undefined {
        const configs = get(this);
        return configs.find(config => config.subjectId === subjectId);
    }

    public static getGradeScales(): Record<string, { minGrade: number; passingGrade: number; maxGrade: number; name: string }> {
        return {
            chilean: {
                minGrade: 1.0,
                passingGrade: 4.0,
                maxGrade: 7.0,
                name: 'Chilena (1.0 - 7.0)'
            },
            utfsm: {
                minGrade: 0.0,
                passingGrade: 55.0,
                maxGrade: 100.0,
                name: 'UTFSM (0.0 - 100.0)'
            },
            european: {
                minGrade: 1.0,
                passingGrade: 5.0,
                maxGrade: 10.0,
                name: 'Europea (1.0 - 10.0)'
            },
            custom: {
                minGrade: 0.0,
                passingGrade: 60.0,
                maxGrade: 100.0,
                name: 'Personalizada'
            }
        };
    }
}

export const currentSubjectGradeConfigs = new SubjectGradeConfigManager();