/**
 * Represents a project, which contains a collection of Todos.
 * Exported for use in other modules.
 */
export class Project {
    /**
     * Creates a new Project instance.
     * @param {string} name - The name of the project.
     */
    constructor(name) {
        // Generate a unique ID combining timestamp and random string
        this.id = `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        this.name = name;
        this.todos = []; // Array to hold Todo objects belonging to this project
    }

    /**
     * Adds a Todo object to the project's list.
     * @param {Todo} todo - The Todo instance to add.
     */
    addTodo(todo) {
        this.todos.push(todo);
    }

    /**
     * Removes a Todo from the project by its ID.
     * @param {string} todoId - The ID of the Todo to remove.
     */
    removeTodo(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
    }

    /**
     * Finds and returns a Todo object by its ID.
     * @param {string} todoId - The ID of the Todo to find.
     * @returns {Todo|undefined} The found Todo object, or undefined if not found.
     */
    getTodoById(todoId) {
        return this.todos.find(todo => todo.id === todoId);
    }
}
