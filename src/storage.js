import { TodoList } from './TodoList.js';
import { Todo } from './models/Todo.js';

const STORAGE_KEY = 'todoAppData';

/**
 * Saves the TodoList instance to localStorage.
 * @param {TodoList} todoList - The TodoList instance to save.
 */
export function saveData(todoList) {
    try {
        const dataToSave = {
            todoList: todoList.exportData(),
            darkMode: localStorage.getItem('isDarkMode'),
            templates: Array.from(todoList.templates.values()).map(template => template.exportData())
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("Data saved successfully:", dataToSave);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
        throw error;
    }
}

/**
 * Loads the TodoList instance from localStorage.
 * @returns {TodoList} The loaded TodoList instance.
 */
export function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            console.log("No saved data found, returning new TodoList");
            return new TodoList();
        }

        const data = JSON.parse(savedData);
        
        // Rehydrate TodoList from saved data
        const todoList = new TodoList(data.todoList);
        
        // Load templates
        if (data.templates) {
            data.templates.forEach(templateData => {
                const template = new Todo(templateData);
                template.type = 'template';
                todoList.templates.set(template.id, template);
            });
        }

        return todoList;
    } catch (error) {
        console.error("Error loading data from localStorage:", error);
        return new TodoList(); // Return new instance if error
    }
}

/**
 * Saves dark mode preference.
 * @param {boolean} isDarkMode - Whether dark mode is enabled.
 */
export function saveDarkModePreference(isDarkMode) {
    try {
        localStorage.setItem('isDarkMode', isDarkMode);
        console.log("Dark mode preference saved:", isDarkMode);
    } catch (error) {
        console.error("Error saving dark mode preference:", error);
    }
}

/**
 * Gets the saved dark mode preference.
 * @returns {boolean} Whether dark mode is enabled.
 */
export function getDarkModePreference() {
    return localStorage.getItem('isDarkMode') === 'true';
}

/**
 * Saves user preferences.
 * @param {object} preferences - User preferences object.
 */
export function savePreferences(preferences) {
    try {
        localStorage.setItem('todoPreferences', JSON.stringify(preferences));
        console.log("Preferences saved:", preferences);
    } catch (error) {
        console.error("Error saving preferences:", error);
    }
}

/**
 * Loads user preferences.
 * @returns {object} User preferences object.
 */
export function loadPreferences() {
    try {
        const preferences = JSON.parse(localStorage.getItem('todoPreferences') || '{}');
        return {
            sort: preferences.sort || 'priority',
            filter: preferences.filter || 'all',
            view: preferences.view || 'list',
            notifications: preferences.notifications || true,
            autoSave: preferences.autoSave || true,
            lastProject: preferences.lastProject || 'default'
        };
    } catch (error) {
        console.error("Error loading preferences:", error);
        return {
            sort: 'priority',
            filter: 'all',
            view: 'list',
            notifications: true,
            autoSave: true,
            lastProject: 'default'
        };
    }
}

/**
 * Clears all application data from localStorage.
 */
export function clearData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('todoPreferences');
        localStorage.removeItem('todoTemplates');
        localStorage.removeItem('isDarkMode');
        console.log("All application data cleared from localStorage");
    } catch (error) {
        console.error("Error clearing data:", error);
    }
}

/**
 * Migrates old data format to new format.
 * @param {object} oldData - The old data format.
 * @returns {object} The migrated data.
 */
export function migrateOldData(oldData) {
    if (!oldData || !oldData.projects) return null;
    
    const migratedData = {
        todoList: {
            projects: Object.values(oldData.projects).map(project => ({
                id: project.id,
                name: project.name,
                todos: project.todos.map(todo => ({
                    ...todo,
                    type: 'task'
                }))
            })),
            currentProjectId: oldData.currentProjectId || 'default',
            templates: Array.from(oldData.templates || []).map(template => ({
                ...template,
                type: 'template'
            })),
            settings: {
                sort: oldData.currentSort || 'priority',
                filter: oldData.currentFilter || 'all'
            }
        }
    };
    
    return migratedData;
}
