// Main application entry point

// --- Imports ---
import { TodoList } from '@/models/TodoList.js';
import { Todo } from '@/models/Todo.js';
import { saveData, loadData } from '@/storage.js';
import * as ui from '@/UI/UI.js';

// --- State ---
let todoList = new TodoList();
let currentProjectId = 'default';
let editingTodoId = null;
let currentSort = 'priority';
let currentFilter = 'all';
let searchQuery = '';
let isDarkMode = false;
let templates = new Map();

// --- DOM Elements ---
const addProjectButton = document.getElementById('add-project-button');
const deleteProjectButton = document.getElementById('delete-project-button');
const addTodoButton = document.getElementById('add-todo-button');
const quickAddButton = document.getElementById('quick-add');
const todoModal = document.getElementById('todo-modal');
const closeModalButton = document.getElementById('close-modal-button');
const cancelTodoButton = document.getElementById('cancel-todo-button');
const todoForm = document.getElementById('todo-form');
const sortSelect = document.getElementById('todo-sort');
const filterSelect = document.getElementById('todo-filter');
const searchInput = document.getElementById('search-input');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const importButton = document.getElementById('import-button');
const exportButton = document.getElementById('export-button');
const projectsList = document.getElementById('projects-list');
const todoListContainer = document.getElementById('todo-list');

// --- Event Handlers ---

/**
 * Handles selecting a project from the list.
 * @param {string} projectId - The ID of the project that was selected.
 */
function handleProjectSelect(projectId) {
    currentProjectId = projectId;
    saveData(todoList);
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
        const todo = project.getTodoById(todoId);
        if (todo) {
            todo.completed = !todo.completed;
            console.log(`Todo "${todo.title}" marked as ${todo.completed ? 'complete' : 'incomplete'}`);
            
            // Check notifications
            if (todo.completed) {
                checkNotifications(todo);
            }
            
            saveData(todoList);
            renderApp();
        }
    }
}

/**
 * Handles initiating the edit process for a todo.
 * @param {Todo} todo - The todo object to edit.
 */
function handleEditTodo(todo) {
    editingTodoId = todo.id;
    ui.openModal(todo);
}

/**
 * Handles deleting a todo.
 * @param {string} projectId - The project ID.
 * @param {string} todoId - The todo ID.
 */
function handleDeleteTodo(projectId, todoId) {
    const project = todoList.getProjectById(projectId);
    if (project) {
        project.removeTodo(todoId);
        console.log(`Todo ${todoId} deleted from project ${projectId}`);
        saveData(todoList);
        renderApp();
    }
}

/**
 * Handles adding a new project.
 */
function handleAddProject() {
    const name = prompt('Enter project name:');
    if (name !== null && name.trim()) {
        try {
            todoList.createProject(name.trim());
            saveData(todoList);
            renderApp();
        } catch (error) {
            alert(error.message);
        }
    } else {
        alert('Please enter a valid project name');
    }
}

/**
 * Handles deleting the current project.
 */
function handleDeleteProject() {
    if (confirm('Are you sure you want to delete this project?')) {
        try {
            todoList.deleteProject(currentProjectId);
            currentProjectId = 'default';
            saveData(todoList);
            renderApp();
        } catch (error) {
            alert(error.message);
        }
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
    
    if (editingTodoId) {
        // Edit existing todo
        const todo = project.getTodoById(editingTodoId);
        todo.update(formData);
        editingTodoId = null;
    } else {
        // Create new todo
        const todo = new Todo(
            formData.title,
            formData.description,
            formData.dueDate,
            formData.priority,
            formData.notes,
            formData.category,
            formData.tags,
            formData.dependencies,
            formData.isRecurring,
            formData.recurrence,
            formData.subtasks,
            formData.timeSpent,
            formData.templateId
        );
        project.addTodo(todo);
    }
    
    saveData(todoList);
    ui.closeModal();
    renderApp();
}

/**
 * Handles sorting todos based on selected criteria.
 * @param {string} sortBy - The field to sort by (priority, dueDate, created, modified)
 */
function handleSortChange(sortBy) {
    currentSort = sortBy;
    renderApp();
}

/**
 * Handles filtering todos based on selected criteria.
 * @param {string} filterBy - The filter to apply (all, completed, active, urgent, important)
 */
function handleFilterChange(filterBy) {
    currentFilter = filterBy;
    renderApp();
}

/**
 * Handles searching todos.
 */
function handleSearch() {
    searchQuery = searchInput.value.trim().toLowerCase();
    renderApp();
}

/**
 * Handles toggling dark mode.
 */
function handleDarkModeToggle() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    localStorage.setItem('isDarkMode', isDarkMode);
    renderApp();
}

/**
 * Handles importing todos from a file.
 * @param {Event} event - The file input event.
 */
function handleImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                todoList = new TodoList(data);
                saveData(todoList);
                renderApp();
            } catch (error) {
                console.error('Error importing data:', error);
                alert('Error importing data. Please ensure the file is in the correct format.');
            }
        };
        reader.readAsText(file);
    }
}

/**
 * Handles exporting todos to a file.
 */
function handleExport() {
    const data = todoList.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Handles starting/stopping timer for a task.
 * @param {Todo} todo - The todo to start/stop timing for.
 */
function handleTimer(todo) {
    if (todo.isBeingTimed()) {
        todo.stopTiming();
    } else {
        todo.startTiming();
    }
    saveData(todoList);
    renderApp();
}

/**
 * Handles adding a subtask.
 * @param {string} todoId - The ID of the parent task.
 */
function handleAddSubtask(todoId) {
    const subtaskTitle = prompt('Enter subtask title:');
    if (subtaskTitle && subtaskTitle.trim()) {
        const project = todoList.getProjectById(currentProjectId);
        const todo = project.getTodoById(todoId);
        todo.addSubtask(subtaskTitle.trim());
        saveData(todoList);
        renderApp();
    }
}

/**
 * Handles toggling subtask completion.
 * @param {string} todoId - The ID of the parent task.
 * @param {string} subtaskId - The ID of the subtask.
 */
function handleToggleSubtask(todoId, subtaskId) {
    const project = todoList.getProjectById(currentProjectId);
    const todo = project.getTodoById(todoId);
    todo.toggleSubtask(subtaskId);
    saveData(todoList);
    renderApp();
}

/**
 * Handles creating a new task template.
 */
function handleCreateTemplate() {
    const title = prompt('Enter template title:');
    if (title && title.trim()) {
        const template = new Todo(
            title.trim(),
            '',
            '',
            'medium',
            '',
            'general',
            [],
            [],
            false,
            '',
            [],
            0,
            'template'
        );
        templates.set(template.id, template);
        localStorage.setItem('todoTemplates', JSON.stringify(Array.from(templates.values())));
        renderApp();
    }
}

/**
 * Handles applying a template to a new task.
 * @param {string} templateId - The ID of the template to apply.
 */
function handleApplyTemplate(templateId) {
    const template = templates.get(templateId);
    if (template) {
        const newTodo = template.clone();
        newTodo.id = null; // Generate new ID
        newTodo.templateId = templateId;
        
        const project = todoList.getProjectById(currentProjectId);
        project.addTodo(newTodo);
        
        saveData(todoList);
        renderApp();
    }
}

/**
 * Checks if a notification should be shown for a todo.
 * @param {Todo} todo - The todo to check.
 */
function checkNotifications(todo) {
    if (Notification.permission === "granted") {
        if (todo.isUrgent() && !todo.completed) {
            showNotification(`Task "${todo.title}" is urgent and needs attention!`);
        }
        if (todo.isDueToday() && !todo.completed) {
            showNotification(`Task "${todo.title}" is due today!`);
        }
    }
}

/**
 * Shows a desktop notification.
 * @param {string} message - The notification message.
 */
function showNotification(message) {
    new Notification('Todo Reminder', {
        body: message,
        icon: '/images/icon.png'
    });
}

/**
 * Updates analytics data.
 */
function updateAnalytics() {
    const analytics = todoList.getAnalytics();
    ui.renderAnalyticsDashboard(analytics);
    ui.renderEisenhowerMatrix(todoList.getProjects());
}

/**
 * Renders the entire application UI.
 */
function renderApp() {
    // Render projects
    ui.renderProjects(todoList.getProjects(), currentProjectId, handleProjectSelect);
    
    // Render templates
    ui.renderTemplates(templates);
    
    // Render todos with filtering and sorting
    const project = todoList.getProjectById(currentProjectId);
    if (project) {
        const filteredTodos = project.todos.filter(todo => {
            if (currentFilter === 'completed') return todo.completed;
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'urgent') return todo.isUrgent();
            if (currentFilter === 'important') return todo.priority === 'high';
            return true;
        });

        const sortedTodos = filteredTodos.sort((a, b) => {
            switch (currentSort) {
                case 'priority':
                    return a.priority.localeCompare(b.priority);
                case 'dueDate':
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'modified':
                    return new Date(b.modifiedAt) - new Date(a.modifiedAt);
                default:
                    return 0;
            }
        });

        const progress = todoList.getProjectProgress(currentProjectId);
        ui.renderTodos(project, handleToggleComplete, handleEditTodo, handleDeleteTodo, progress);
    }
    
    // Update analytics
    updateAnalytics();
}

// --- Initial Setup ---

function initializeApp() {
    console.log("Initializing application...");

    // Load data
    try {
        todoList = new TodoList(loadData());
    } catch (error) {
        console.error("Error loading data:", error);
        todoList = new TodoList();
    }

    // Load dark mode preference
    isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark');
    }

    // Load templates
    const savedTemplates = localStorage.getItem('todoTemplates');
    if (savedTemplates) {
        try {
            const parsedTemplates = JSON.parse(savedTemplates);
            parsedTemplates.forEach(templateData => {
                const template = new Todo(
                    templateData.title,
                    templateData.description,
                    templateData.dueDate,
                    templateData.priority,
                    templateData.notes,
                    templateData.category,
                    templateData.tags,
                    templateData.dependencies,
                    templateData.isRecurring,
                    templateData.recurrence,
                    templateData.subtasks,
                    templateData.timeSpent,
                    'template'
                );
                templates.set(template.id, template);
            });
        } catch (error) {
            console.error("Error loading templates:", error);
        }
    }

    // Request notification permission
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Attach event listeners
    addProjectButton.addEventListener('click', handleAddProject);
    deleteProjectButton.addEventListener('click', handleDeleteProject);
    addTodoButton.addEventListener('click', () => ui.openModal());
    quickAddButton.addEventListener('click', () => ui.openModal());
    todoForm.addEventListener('submit', handleTodoFormSubmit);
    sortSelect.addEventListener('change', (e) => handleSortChange(e.target.value));
    filterSelect.addEventListener('change', (e) => handleFilterChange(e.target.value));
    searchInput.addEventListener('input', handleSearch);
    darkModeToggle.addEventListener('click', handleDarkModeToggle);
    importButton.addEventListener('change', handleImport);
    exportButton.addEventListener('click', handleExport);
    
    // Render initial state
    renderApp();
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeApp);
