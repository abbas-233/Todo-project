// Main application entry point

// --- Imports ---
import { TodoList } from './assets/TodoList.js';
import * as ui from './assets/UI.js';
import TodoPage from './assets/TodoPage.js';

// --- State ---
let todoList = new TodoList();
let currentProjectId = null;

// Initialize TodoPage
const todoPage = new TodoPage();

// --- Event Handlers ---

/**
 * Handles selecting a project from the list.
 * @param {string} projectId - The ID of the project that was selected.
 */
function handleProjectSelect(projectId) {
    currentProjectId = projectId;
    renderApp();
}

/**
 * Handles toggling the completion status of a todo.
 * @param {string} projectId - The project ID.
 * @param {string} todoId - The todo ID.
 */
function handleToggleComplete(projectId, todoId) {
    const project = todoList.getProjectById(projectId);
    if (project) {
        const todo = project.todos.find(t => t.id === todoId);
        if (todo) {
            todo.toggleComplete();
            todoList.save();
            renderApp();
        }
    }
}

/**
 * Handles adding a new project.
 */
function handleAddProject() {
    const name = prompt('Enter project name:');
    if (name && name.trim()) {
        const project = todoList.createProject(name.trim());
        currentProjectId = project.id;
        renderApp();
    }
}

/**
 * Handles the submission of the Add/Edit Todo form.
 * @param {Event} event - The form submission event.
 */
function handleTodoFormSubmit(event) {
    event.preventDefault();
    const formData = ui.getFormData();
    const project = todoList.getProjectById(currentProjectId);

    if (project) {
        project.todos.push({
            id: Date.now().toString(),
            title: formData.title,
            completed: false
        });
        todoList.save();
        ui.closeModal();
        renderApp();
    }
}

/**
 * Renders the entire application UI.
 */
function renderApp() {
    // Render projects
    ui.renderProjects(todoList.projects, currentProjectId, handleProjectSelect);

    // Render todos
    const project = todoList.getProjectById(currentProjectId);
    if (project) {
        ui.renderTodos(project, handleToggleComplete);
    }
}

// --- Initial Setup ---
function initializeApp() {
    // Attach event listeners
    document.getElementById('add-project-button').addEventListener('click', handleAddProject);
    document.getElementById('add-todo-button').addEventListener('click', () => ui.openModal());
    document.getElementById('todo-form').addEventListener('submit', handleTodoFormSubmit);
    document.getElementById('close-modal-button').addEventListener('click', ui.closeModal);

    // Render initial state
    renderApp();
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeApp);
