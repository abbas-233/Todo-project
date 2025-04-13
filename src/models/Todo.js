import { format } from 'date-fns';

class Todo {
    /**
     * Creates a new Todo instance.
     * @param {string} title - The title of the task.
     * @param {string} description - A detailed description of the task.
     * @param {string} dueDate - The due date of the task (YYYY-MM-DD).
     * @param {string} priority - The priority level ('low', 'medium', 'high').
     * @param {string} notes - Additional notes for the task.
     * @param {boolean} [completed=false] - Whether the task is completed.
     * @param {string} [category='general'] - Task category.
     * @param {boolean} [isRecurring=false] - Recurring task flag.
     * @param {string} [recurrence=null] - Recurrence pattern.
     * @param {string[]} [tags=[]] - Task tags/labels.
     * @param {string[]} [dependencies=[]] - Task dependencies.
     * @param {Object[]} [subtasks=[]] - Subtasks array.
     * @param {number} [timeSpent=0] - Time tracking.
     * @param {string} [templateId=null] - Template reference.
     */
    constructor(title, description, dueDate, priority, notes, completed = false, category = 'general', isRecurring = false, recurrence = null, tags = [], dependencies = [], subtasks = [], timeSpent = 0, templateId = null) {
        // Generate a unique ID combining timestamp and random string
        this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.notes = notes;
        this.completed = completed;
        this.category = category;
        this.isRecurring = isRecurring;
        this.recurrence = recurrence;
        this.tags = tags;
        this.dependencies = dependencies;
        this.subtasks = subtasks;
        this.timeSpent = timeSpent;
        this.templateId = templateId;
        this.startTime = null; // For time tracking
        this.createdDate = new Date();
        this.lastModified = new Date();
    }

    /**
     * Formats the due date in a readable format.
     * @returns {string} Formatted date string.
     */
    get formattedDueDate() {
        return format(new Date(this.dueDate), 'MMM d, yyyy');
    }

    /**
     * Toggles the completion status of the task.
     */
    toggleComplete() {
        this.completed = !this.completed;
        this.lastModified = new Date();
    }

    /**
     * Gets all available priority levels.
     * @returns {string[]} Array of priority levels.
     */
    static getPriorities() {
        return ['low', 'medium', 'high'];
    }

    /**
     * Gets all available categories.
     * @returns {string[]} Array of categories.
     */
    static getCategories() {
        return ['general', 'work', 'personal', 'shopping', 'travel'];
    }

    /**
     * Gets all available recurrence patterns.
     * @returns {string[]} Array of recurrence patterns.
     */
    static getRecurrences() {
        return ['daily', 'weekly', 'monthly', 'yearly'];
    }

    /**
     * Starts timing the task.
     */
    startTiming() {
        if (!this.completed && this.startTime === null) {
            this.startTime = new Date();
            this.lastModified = new Date();
        }
    }

    /**
     * Stops timing the task and updates time spent.
     */
    stopTiming() {
        if (this.startTime !== null) {
            const endTime = new Date();
            const timeDiff = (endTime - this.startTime) / 1000; // Convert to seconds
            this.timeSpent += timeDiff;
            this.startTime = null;
            this.lastModified = new Date();
        }
    }

    /**
     * Checks if the task is currently being timed.
     * @returns {boolean} True if task is being timed.
     */
    isBeingTimed() {
        return this.startTime !== null;
    }

    /**
     * Gets the formatted time spent on the task.
     * @returns {string} Formatted time string (e.g., "2h 30m").
     */
    getFormattedTimeSpent() {
        const hours = Math.floor(this.timeSpent / 3600);
        const minutes = Math.floor((this.timeSpent % 3600) / 60);
        
        return `${hours}h ${minutes}m`;
    }

    /**
     * Checks if the task is urgent (high priority and due soon).
     * @returns {boolean} True if task is urgent.
     */
    isUrgent() {
        if (this.completed) return false;
        const now = new Date();
        const due = new Date(this.dueDate);
        return this.priority === 'high' && due <= now;
    }

    /**
     * Checks if the task is important (high priority).
     * @returns {boolean} True if task is important.
     */
    isImportant() {
        return this.priority === 'high';
    }

    /**
     * Gets the progress of this task if it has subtasks.
     * @returns {number} Progress percentage (0-100).
     */
    getSubtaskProgress() {
        if (!this.subtasks || this.subtasks.length === 0) return 0;
        
        const completed = this.subtasks.filter(subtask => subtask.completed).length;
        return Math.round((completed / this.subtasks.length) * 100);
    }

    /**
     * Adds a subtask to this task.
     * @param {Object} subtask - The subtask to add.
     */
    addSubtask(subtask) {
        if (!this.subtasks) this.subtasks = [];
        this.subtasks.push(subtask);
        this.lastModified = new Date();
    }

    /**
     * Removes a subtask from this task.
     * @param {string} subtaskId - The ID of the subtask to remove.
     */
    removeSubtask(subtaskId) {
        if (this.subtasks) {
            this.subtasks = this.subtasks.filter(subtask => subtask.id !== subtaskId);
            this.lastModified = new Date();
        }
    }

    /**
     * Updates a subtask's completion status.
     * @param {string} subtaskId - The ID of the subtask to update.
     * @param {boolean} completed - The new completion status.
     */
    updateSubtask(subtaskId, completed) {
        if (this.subtasks) {
            const subtask = this.subtasks.find(sub => sub.id === subtaskId);
            if (subtask) {
                subtask.completed = completed;
                this.lastModified = new Date();
            }
        }
    }
}

export { Todo };
