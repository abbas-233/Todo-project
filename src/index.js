import { Todo } from './models/Todo.js';
import { Project } from './models/Project.js';
import { TodoList } from './models/TodoList.js';
import { UI } from './ui/UI.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const todoList = new TodoList();
    const ui = new UI(todoList);
    
    // Load saved data from localStorage
    todoList.loadFromStorage();
    
    // Initialize UI
    ui.initialize();
});
