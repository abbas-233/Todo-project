class Project {
    constructor(name) {
        this.id = Date.now().toString();
        this.name = name;
        this.todos = [];
    }

    addTodo(todo) {
        this.todos.push(todo);
    }

    removeTodo(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
    }

    getCompletedTodos() {
        return this.todos.filter(todo => todo.completed);
    }

    getIncompleteTodos() {
        return this.todos.filter(todo => !todo.completed);
    }
}

export { Project };
