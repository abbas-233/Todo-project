class Todo {
    constructor(title) {
        this.id = Date.now().toString();
        this.title = title;
        this.completed = false;
    }

    toggleComplete() {
        this.completed = !this.completed;
    }
}

export { Todo };
