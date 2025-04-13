// Main application entry point

// --- Imports ---
import { Todo } from './todo.js';
import { Project } from './project.js';
import { saveData, loadData } from './storage.js';
import * as ui from './UI/UI.js'; // Import all exported functions from ui.js

// --- State ---
let projects = {};
let currentProjectId = 'default';
let editingTodoId = null; // Still useful here to track modal state origin

// --- DOM Elements (for event listeners attached in this file) ---
const addProjectForm = document.getElementById('add-project-form');
const newProjectNameInput = document.getElementById('new-project-name');
const deleteProjectButton = document.getElementById('delete-project-button');
const addTodoButton = document.getElementById('add-todo-button');
const todoModal = document.getElementById('todo-modal'); // Needed for backdrop click listener
const closeModalButton = document.getElementById('close-modal-button');
const cancelTodoButton = document.getElementById('cancel-todo-button');
const todoForm = document.getElementById('todo-form');

// --- Core Logic / Event Handlers ---

/**
 * Handles selecting a project from the list.
 * @param {string} projectId - The ID of the project that was selected.
 */
function handleProjectSelect(projectId) {
    currentProjectId = projectId;
    renderApp(); // Re-render the application UI
}

/**
 * Handles toggling the completion status of a todo.
 * @param {string} projectId - The project ID.
 * @param {string} todoId - The todo ID.
 */
function handleToggleComplete(projectId, todoId) {
    const project = projects[projectId];
    const todo = project?.getTodoById(todoId);
    if (todo) {
        todo.completed = !todo.completed;
        console.log(`Todo "${todo.title}" marked as ${todo.completed ? 'complete' : 'incomplete'}`);
        renderApp(); // Re-render to reflect change and save
    } else {
        console.error(`Could not find todo ${todoId} in project ${projectId} to toggle.`);
    }
}

/**
 * Handles initiating the edit process for a todo.
 * @param {Todo} todo - The todo object to edit.
 */
function handleEditTodo(todo) {
    editingTodoId = todo.id; // Track that we are editing this specific todo
    ui.openModal(todo);
}

/**
 * Handles deleting a todo.
 * @param {string} projectId - The project ID.
 * @param {string} todoId - The todo ID.
 */
function handleDeleteTodo(projectId, todoId) {
    const project = projects[projectId];
    if (project) {
        project.removeTodo(todoId);
        console.log(`Todo ${todoId} deleted from project ${projectId}`);
        renderApp(); // Re-render to reflect deletion and save
    } else {
        console.error(`Project ${projectId} not found when trying to delete todo ${todoId}`);
    }
}

/**
 * Handles adding a new project.
 */
function handleAddProject(event) {
    event.preventDefault();
    const projectName = newProjectNameInput.value.trim();
    if (projectName) {
        const newProject = new Project(projectName);
        projects[newProject.id] = newProject;
        currentProjectId = newProject.id; // Switch to the new project
        newProjectNameInput.value = '';
        renderApp();
    } else {
        alert("Project name cannot be empty.");
    }
}

/**
 * Handles deleting the current project.
 */
function handleDeleteProject() {
    if (currentProjectId === 'default') {
        alert("Cannot delete the default project.");
        return;
    }
    const projectToDelete = projects[currentProjectId];
    if (projectToDelete && confirm(`Are you sure you want to delete the project "${projectToDelete.name}" and all its tasks? This cannot be undone.`)) {
        delete projects[currentProjectId];
        currentProjectId = 'default'; // Switch back to default
        renderApp();
    }
}

/**
 * Handles the submission of the Add/Edit Todo form.
 */
function handleTodoFormSubmit(event) {
    event.preventDefault();
    const formData = ui.getFormData(); // Get data using the UI module function

    if (!formData.title || !formData.dueDate) {
        alert("Task title and due date are required.");
        return;
    }

    const project = projects[currentProjectId];
    if (!project) {
        alert("Error: Current project not found.");
        ui.closeModal();
        return;
    }

    if (formData.id && editingTodoId === formData.id) {
        // Editing existing todo
        const todoToUpdate = project.getTodoById(formData.id);
        if (todoToUpdate) {
            todoToUpdate.title = formData.title;
            todoToUpdate.description = formData.description;
            todoToUpdate.dueDate = formData.dueDate;
            todoToUpdate.priority = formData.priority;
            todoToUpdate.notes = formData.notes;
            console.log("Todo updated:", todoToUpdate);
        } else {
            console.error("Error: Tried to edit a todo that doesn't exist:", formData.id);
            alert("Error updating task.");
        }
    } else {
        // Adding new todo
        const newTodo = new Todo(
            formData.title,
            formData.description,
            formData.dueDate,
            formData.priority,
            formData.notes
        );
        project.addTodo(newTodo);
        console.log("Todo added:", newTodo);
    }

    editingTodoId = null; // Reset editing state
    ui.closeModal();
    renderApp();
}

/**
 * Renders the entire application UI and saves data.
 */
function renderApp() {
    // Pass the necessary state and callbacks to the UI rendering functions
    ui.renderProjects(projects, currentProjectId, handleProjectSelect);
    ui.renderTodos(projects[currentProjectId], handleToggleComplete, handleEditTodo, handleDeleteTodo);
    saveData(projects, currentProjectId); // Save state whenever UI is updated
    console.log("App rendered. Current state:", { projects, currentProjectId });
}

// --- Initial Setup ---

/**
 * Initializes the application. Loads data, sets up listeners, and performs initial render.
 */
function initializeApp() {
    console.log("Initializing application...");

    // Load initial data
    const loadedState = loadData();
    projects = loadedState.projects;
    currentProjectId = loadedState.currentProjectId;

    // --- Attach Event Listeners ---
    addProjectForm.addEventListener('submit', handleAddProject);
    deleteProjectButton.addEventListener('click', handleDeleteProject);
    addTodoButton.addEventListener('click', () => {
        editingTodoId = null; // Ensure add mode
        ui.openModal(); // Open modal for adding
    });

    // Modal listeners
    closeModalButton.addEventListener('click', ui.closeModal);
    cancelTodoButton.addEventListener('click', ui.closeModal);
    window.addEventListener('click', (event) => { // Backdrop click
        if (event.target === todoModal) {
            ui.closeModal();
            editingTodoId = null; // Reset editing state if closed via backdrop
        }
    });
    todoForm.addEventListener('submit', handleTodoFormSubmit);

    // Initial Render
    renderApp();
}

// --- Start Application ---
// Use DOMContentLoaded to ensure the HTML is ready before interacting with it.
document.addEventListener('DOMContentLoaded', initializeApp);
