// Main application entry point

// --- Imports ---
import TodoPage from './pages/TodoPage.js';
import AnalyticsPage from './pages/AnalyticsPage.js';
import SettingsPage from './pages/SettingsPage.js';
import UI from './UI/UI.js';
import Navigation from './components/Navigation.js';
import Footer from './components/Footer.js';
import { TodoList } from '@/models/TodoList.js';
import { Todo } from '@/models/Todo.js';
import { saveData, loadData } from '@/storage.js';

// --- State ---
let todoList = new TodoList();
let currentProjectId = 'default';
let editingTodoId = null;
let currentSort = 'priority';
let currentFilter = 'all';
let searchQuery = '';
let templates = new Map();
let currentPage = null;

// --- Page Management ---
function initializePages() {
    // Initialize pages
    currentPage = new TodoPage();
    
    // Initialize UI
    UI.initialize();
    
    // Initialize navigation
    Navigation.initialize();
    
    // Initialize footer
    Footer.initialize();
}

// --- Navigation ---
function navigateTo(pageClass) {
    if (currentPage) {
        currentPage.remove();
    }
    currentPage = new pageClass();
    currentPage.render();
    currentPage.addEventListeners();
}

// --- Event Listeners ---
function setupEventListeners() {
    // Navigation event listeners
    const navigation = document.getElementById('navigation');
    if (navigation) {
        navigation.addEventListener('click', (e) => {
            const target = e.target.closest('[data-page]');
            if (target) {
                const page = target.dataset.page;
                switch (page) {
                    case 'todo':
                        navigateTo(TodoPage);
                        break;
                    case 'analytics':
                        navigateTo(AnalyticsPage);
                        break;
                    case 'settings':
                        navigateTo(SettingsPage);
                        break;
                }
            }
        });
    }
}

/**
 * Handles selecting a project from the list.
 * @param {string} projectId - The ID of the project that was selected.
 */
function handleProjectSelect(projectId) {
    currentProjectId = projectId;
    saveData(todoList);
    UI.renderProjects(todoList.getProjects(), currentProjectId, handleProjectSelect);
    UI.renderTodos(todoList.getProjectById(projectId), handleToggleComplete, handleEditTodo, handleDeleteTodo);
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
            UI.renderTodos(project, handleToggleComplete, handleEditTodo, handleDeleteTodo);
        }
    }
}

/**
 * Handles initiating the edit process for a todo.
 * @param {Todo} todo - The todo object to edit.
 */
function handleEditTodo(todo) {
    editingTodoId = todo.id;
    UI.openModal(todo);
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
        UI.renderTodos(project, handleToggleComplete, handleEditTodo, handleDeleteTodo);
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
            UI.renderProjects(todoList.getProjects(), currentProjectId, handleProjectSelect);
        } catch (error) {
            UI.showError(error.message);
        }
    } else {
        UI.showError('Please enter a valid project name');
    }
}

/**
 * Handles deleting the current project.
 */
function handleDeleteProject() {
    if (confirm('Are you sure you want to delete this project?')) {
        todoList.deleteProject(currentProjectId);
        currentProjectId = 'default';
        saveData(todoList);
        UI.renderProjects(todoList.getProjects(), currentProjectId, handleProjectSelect);
    }
}

/**
 * Handles the submission of the Add/Edit Todo form.
 * @param {Event} event - The form submission event.
 */
function handleTodoFormSubmit(event) {
    event.preventDefault();
    
    const formData = UI.getFormData();
    const project = todoList.getProjectById(currentProjectId);
    
    if (!project) {
        UI.showError('No project selected');
        return;
    }
    
    if (editingTodoId) {
        // Update existing todo
        const todo = project.getTodoById(editingTodoId);
        if (todo) {
            todo.update(formData);
            editingTodoId = null;
            UI.closeModal();
            saveData(todoList);
            UI.renderTodos(project, handleToggleComplete, handleEditTodo, handleDeleteTodo);
        }
    } else {
        // Create new todo
        const newTodo = new Todo(
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
            formData.timeSpent
        );
        
        project.addTodo(newTodo);
        UI.closeModal();
        saveData(todoList);
        UI.renderTodos(project, handleToggleComplete, handleEditTodo, handleDeleteTodo);
    }
}

/**
 * Handles sorting todos based on selected criteria.
 * @param {string} sortBy - The field to sort by (priority, dueDate, created, modified)
 */
function handleSortChange(sortBy) {
    currentSort = sortBy;
    UI.renderTodos(todoList.getProjectById(currentProjectId), handleToggleComplete, handleEditTodo, handleDeleteTodo);
}

/**
 * Handles filtering todos based on selected criteria.
 * @param {string} filterBy - The filter to apply (all, completed, active, urgent, important)
 */
function handleFilterChange(filterBy) {
    currentFilter = filterBy;
    UI.renderTodos(todoList.getProjectById(currentProjectId), handleToggleComplete, handleEditTodo, handleDeleteTodo);
}

/**
 * Handles searching todos.
 */
function handleSearch() {
    const searchInput = document.getElementById('todo-search');
    if (searchInput) {
        searchQuery = searchInput.value;
        UI.renderTodos(todoList.getProjectById(currentProjectId), handleToggleComplete, handleEditTodo, handleDeleteTodo);
    }
}

/**
 * Checks if a notification should be shown for a todo.
 * @param {Todo} todo - The todo to check.
 */
function checkNotifications(todo) {
    if (todo.isUrgent() && !todo.completed) {
        showNotification(`Task "${todo.title}" is urgent and needs attention!`);
    }
    if (todo.isDueToday() && !todo.completed) {
        showNotification(`Task "${todo.title}" is due today!`);
    }
}

/**
 * Shows a desktop notification.
 * @param {string} message - The notification message.
 */
function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification('Todo Reminder', {
            body: message,
            icon: '/images/icon.png'
        });
    }
}

/**
 * Updates analytics data.
 */
function updateAnalytics() {
    const analytics = todoList.getAnalytics();
    UI.renderAnalyticsDashboard(analytics);
    UI.renderEisenhowerMatrix(todoList.getProjects());
}

/**
 * Renders the entire application UI.
 */
function renderApp() {
    // Render projects
    UI.renderProjects(todoList.getProjects(), currentProjectId, handleProjectSelect);
    
    // Render templates
    UI.renderTemplates(templates);
    
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
        UI.renderTodos(project, handleToggleComplete, handleEditTodo, handleDeleteTodo, progress);
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

    initializePages();
    setupEventListeners();
    renderApp();
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeApp);
