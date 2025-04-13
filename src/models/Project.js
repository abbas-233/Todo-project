class Project {
    /**
     * Creates a new Project instance.
     * @param {string} name - The name of the project.
     */
    constructor(name) {
        this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.name = name;
        this.todos = [];
        this.createdDate = new Date();
        this.lastModified = new Date();
    }

    /**
     * Adds a Todo object to the project's list.
     * @param {Todo} todo - The Todo instance to add.
     */
    addTodo(todo) {
        this.todos.push(todo);
        this.lastModified = new Date();
    }

    /**
     * Removes a Todo from the project by its ID.
     * @param {string} todoId - The ID of the Todo to remove.
     */
    removeTodo(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
        this.lastModified = new Date();
    }

    /**
     * Finds and returns a Todo object by its ID.
     * @param {string} todoId - The ID of the Todo to find.
     * @returns {Todo|undefined} The found Todo object, or undefined if not found.
     */
    getTodoById(todoId) {
        return this.todos.find(todo => todo.id === todoId);
    }

    /**
     * Gets all incomplete todos that have pending dependencies.
     * @returns {Todo[]} Array of todos with pending dependencies.
     */
    getTodosWithPendingDependencies() {
        return this.todos.filter(todo => {
            if (todo.completed) return false;
            return todo.dependencies.some(dependencyId => {
                const dependency = this.getTodoById(dependencyId);
                return dependency && !dependency.completed;
            });
        });
    }

    /**
     * Gets all incomplete todos that are due today.
     * @returns {Todo[]} Array of todos due today.
     */
    getTodosDueToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.todos.filter(todo => {
            if (todo.completed) return false;
            const due = new Date(todo.dueDate);
            due.setHours(0, 0, 0, 0);
            return due.getTime() === today.getTime();
        });
    }

    /**
     * Gets all incomplete todos that are overdue.
     * @returns {Todo[]} Array of overdue todos.
     */
    getOverdueTodos() {
        const now = new Date();
        return this.todos.filter(todo => {
            if (todo.completed) return false;
            const due = new Date(todo.dueDate);
            return due < now;
        });
    }

    /**
     * Gets all incomplete urgent tasks (high priority and due soon).
     * @returns {Todo[]} Array of urgent tasks.
     */
    getUrgentTasks() {
        const now = new Date();
        return this.todos.filter(todo => {
            if (todo.completed) return false;
            return todo.priority === 'high' && todo.dueDate && new Date(todo.dueDate) <= now;
        });
    }

    /**
     * Gets all incomplete important tasks (high priority).
     * @returns {Todo[]} Array of important tasks.
     */
    getImportantTasks() {
        return this.todos.filter(todo => {
            if (todo.completed) return false;
            return todo.priority === 'high';
        });
    }

    /**
     * Gets all incomplete tasks that have subtasks.
     * @returns {Todo[]} Array of tasks with subtasks.
     */
    getTasksWithSubtasks() {
        return this.todos.filter(todo => {
            if (todo.completed) return false;
            return todo.subtasks && todo.subtasks.length > 0;
        });
    }

    /**
     * Gets all incomplete tasks that are being timed.
     * @returns {Todo[]} Array of tasks being timed.
     */
    getTasksBeingTimed() {
        return this.todos.filter(todo => {
            if (todo.completed) return false;
            return todo.startTime !== null;
        });
    }

    /**
     * Gets total time spent on all tasks in the project.
     * @returns {number} Total time spent in seconds.
     */
    getTotalTimeSpent() {
        return this.todos.reduce((total, todo) => total + todo.timeSpent, 0);
    }

    /**
     * Gets all templates in the project.
     * @returns {Todo[]} Array of templates.
     */
    getTemplates() {
        return this.todos.filter(todo => todo.templateId === 'template');
    }

    /**
     * Applies a template to create a new task.
     * @param {Todo} template - The template to apply.
     * @returns {Todo} The newly created task.
     */
    applyTemplate(template) {
        const newTodo = new Todo(
            template.title,
            template.description,
            template.dueDate,
            template.priority,
            template.notes,
            false,
            template.category,
            template.isRecurring,
            template.recurrence,
            template.tags,
            template.dependencies,
            template.subtasks,
            0
        );
        this.addTodo(newTodo);
        return newTodo;
    }
}

export { Project };
