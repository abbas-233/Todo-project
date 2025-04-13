/**
 * Represents a single task (Todo item).
 * Exported for use in other modules.
 */
export class Todo {
    /**
     * Creates a new Todo instance.
     * @param {string} title - The title of the task.
     * @param {string} description - A detailed description of the task.
     * @param {string} dueDate - The due date of the task (YYYY-MM-DD).
     * @param {string} priority - The priority level ('low', 'medium', 'high').
     * @param {string} [notes=''] - Additional notes for the task.
     * @param {boolean} [completed=false] - Whether the task is completed.
     */
    constructor(title, description, dueDate, priority, notes = '', completed = false) {
        // Generate a unique ID combining timestamp and random string
        this.id = `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.notes = notes;
        // this.checklist = []; // Placeholder for future checklist feature
        this.completed = completed;
    }
}
