import { type GradeCategory, CATEGORY_STORAGE_KEY } from "@ramo-libre/shared";
import { DefaultStore } from "./default";

const DEFAULT_CATEGORIES: GradeCategory[] = [];

export class CategoryManager extends DefaultStore<GradeCategory[]> {
    constructor() {
        super(CATEGORY_STORAGE_KEY, DEFAULT_CATEGORIES);
    }

    addCategory(category: GradeCategory) {
        if (!category.id) {
            category.id = crypto.randomUUID();
        }
        this.update(current => [...current, category]);
    }

    removeCategory(categoryId: string) {
        this.update(current => {
            const index = current.findIndex(category => category.id === categoryId);
            if (index > -1) current.splice(index, 1);
            return current;
        });
    }

    removeCategoriesBySubject(subjectId: string) {
        this.update(current => {
            return current.filter(category => category.subjectId !== subjectId);
        });
    }

    updateCategory(updatedCategory: GradeCategory) {
        this.update(current => 
            current.map(category => category.id === updatedCategory.id ? updatedCategory : category)
        );
    }

}

export const currentCategories = new CategoryManager();