import { format } from 'date-fns';

class Todo {
    constructor(title, description, dueDate, priority = 'medium') {
        this.id = Date.now().toString();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = false;
    }

    get formattedDueDate() {
        return format(new Date(this.dueDate), 'MMM d, yyyy');
    }

    toggleComplete() {
        this.completed = !this.completed;
    }

    static getPriorities() {
        return ['low', 'medium', 'high'];
    }
}

export { Todo };
