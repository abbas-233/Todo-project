const STORAGE_KEY = 'todoAppData';

/**
 * Saves the TodoList instance to localStorage.
 * @param {object} data - The data to save.
 */
export function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
    }
}

/**
 * Loads the TodoList instance from localStorage.
 * @returns {object|null} The loaded data or null if no data is found.
 */
export function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
        console.error("Error loading data from localStorage:", error);
        return null;
    }
}
