// Main application entry point

// --- Imports ---
import { Todo } from '../models/Todo.js';
import { Project } from '../models/Project.js';
import { saveData, loadData } from '../storage.js';
import * as ui from '../UI/UI.js'; // Import all exported functions from UI.js

// --- State ---
let projects = {};
let currentProjectId = 'default';
let editingTodoId = null; // Still useful here to track modal state origin
let currentSort = 'priority'; // Added sorting state
let currentFilter = 'all'; // Added filtering state
let searchQuery = ''; // Added search state
let isDarkMode = false; // Added dark mode state
let categories = ['general', 'work', 'personal', 'shopping', 'travel']; // Available categories
let tags = new Set(); // Track all used tags
let templates = new Map(); // Store task templates
let analyticsData = {
    totalTasks: 0,
    completedTasks: 0,
    averageTimeSpent: 0,
    urgentTasks: 0,
    importantTasks: 0
};

// --- DOM Elements (for event listeners attached in this file) ---
const addProjectButton = document.getElementById('add-project-button');
const newProjectNameInput = document.getElementById('new-project-name');
const deleteProjectButton = document.getElementById('delete-project-button');
const addTodoButton = document.getElementById('add-todo-button');
const quickAddButton = document.getElementById('quick-add-button');
const todoModal = document.getElementById('todo-modal'); // Needed for backdrop click listener
const closeModalButton = document.getElementById('close-modal-button');
const cancelTodoButton = document.getElementById('cancel-todo-button');
const todoForm = document.getElementById('todo-form');
const sortSelect = document.getElementById('sort-select');
const filterSelect = document.getElementById('filter-select');
const searchInput = document.getElementById('search-input');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const tagsInput = document.getElementById('tags-input');
const exportButton = document.getElementById('export-button');
const importButton = document.getElementById('import-button');
const timerButton = document.getElementById('timer-button');
const subtasksContainer = document.getElementById('subtasks-container');
const analyticsDashboard = document.getElementById('analytics-dashboard');
const projectsList = document.getElementById('projects-list');

// --- Core Logic / Event Handlers ---

/**
 * Handles selecting a project from the list.
 * @param {string} projectId - The ID of the project that was selected.
 */
function handleProjectSelect(projectId) {
    currentProjectId = projectId;
    saveData(projects, currentProjectId);
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
function handleAddProject() {
    const projectName = newProjectNameInput.value.trim();
    
    if (!projectName) {
        alert('Please enter a project name');
        return;
    }

    // Check if project already exists
    const existingProject = Object.values(projects).find(project => project.name === projectName);
    if (existingProject) {
        alert('A project with this name already exists');
        return;
    }

    const newProject = new Project(projectName);
    projects[newProject.id] = newProject;
    
    // Reset form
    newProjectNameInput.value = '';
    
    // Set as current project
    currentProjectId = newProject.id;
    
    // Save to storage
    saveData(projects, currentProjectId);
    
    // Re-render with new project
    renderApp();
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
            todoToUpdate.update({
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
                priority: formData.priority,
                notes: formData.notes,
                category: formData.category,
                isRecurring: formData.isRecurring,
                recurrence: formData.recurrence,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                dependencies: formData.dependencies.split(',').map(id => id.trim()).filter(id => id)
            });

            // Update global tags set
            todoToUpdate.tags.forEach(tag => tags.add(tag));
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
            formData.notes,
            false,
            formData.category,
            formData.isRecurring,
            formData.recurrence,
            formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            formData.dependencies.split(',').map(id => id.trim()).filter(id => id)
        );

        project.addTodo(newTodo);
        // Update global tags set
        newTodo.tags.forEach(tag => tags.add(tag));
    }

    editingTodoId = null; // Reset editing state
    ui.closeModal();
    renderApp();

    // Check for notifications if it's a new todo
    if (!formData.id) {
        checkNotifications(newTodo);
    }
}

/**
 * Checks if a notification should be shown for a todo.
 * @param {Todo} todo - The todo to check.
 */
function checkNotifications(todo) {
    const now = new Date();
    const dueDate = new Date(todo.dueDate);
    const diff = dueDate - now;

    // Show notification if due within 24 hours
    if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        showNotification(`Task "${todo.title}" is due tomorrow!`);
    }
}

/**
 * Shows a desktop notification.
 * @param {string} message - The notification message.
 */
function showNotification(message) {
    if (Notification.permission === "granted") {
        new Notification("Todo Reminder", {
            body: message,
            icon: "todo-icon.png"
        });
    }
}

/**
 * Handles sorting todos based on selected criteria.
 * @param {string} sortBy - The field to sort by (priority, dueDate, title)
 */
function handleSortChange(sortBy) {
    currentSort = sortBy;
    renderApp();
}

/**
 * Handles filtering todos based on selected criteria.
 * @param {string} filterBy - The filter to apply (all, completed, incomplete)
 */
function handleFilterChange(filterBy) {
    currentFilter = filterBy;
    renderApp();
}

/**
 * Handles searching todos.
 */
function handleSearch() {
    searchQuery = searchInput.value.toLowerCase();
    renderApp();
}

/**
 * Handles toggling dark mode.
 */
function handleDarkModeToggle() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('isDarkMode', isDarkMode);
    renderApp();
}

/**
 * Handles exporting todos to a file.
 */
function handleExport() {
    const currentProject = projects[currentProjectId];
    if (!currentProject) return;

    const todos = currentProject.todos.map(todo => ({
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        priority: todo.priority,
        notes: todo.notes,
        category: todo.category,
        isRecurring: todo.isRecurring,
        recurrence: todo.recurrence,
        tags: todo.tags,
        dependencies: todo.dependencies,
        completed: todo.completed,
        createdDate: todo.createdDate,
        lastModified: todo.lastModified
    }));

    const dataStr = JSON.stringify(todos, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todos_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Handles importing todos from a file.
 */
function handleImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const todos = JSON.parse(e.target.result);
                const currentProject = projects[currentProjectId];
                if (currentProject) {
                    todos.forEach(todoData => {
                        const newTodo = new Todo(
                            todoData.title,
                            todoData.description,
                            todoData.dueDate,
                            todoData.priority,
                            todoData.notes,
                            todoData.completed,
                            todoData.category,
                            todoData.isRecurring,
                            todoData.recurrence,
                            todoData.tags,
                            todoData.dependencies
                        );
                        newTodo.createdDate = new Date(todoData.createdDate);
                        newTodo.lastModified = new Date(todoData.lastModified);
                        currentProject.addTodo(newTodo);
                        // Update global tags set
                        newTodo.tags.forEach(tag => tags.add(tag));
                    });
                    renderApp();
                }
            } catch (error) {
                console.error("Error importing todos:", error);
                alert("Error: Invalid file format");
            }
        };
        reader.readAsText(file);
    }
}

/**
 * Handles starting/stopping timer for a task.
 * @param {string} todoId - The ID of the task.
 */
function handleTimer(todoId) {
    const todo = projects[currentProjectId]?.getTodoById(todoId);
    if (todo) {
        if (todo.startTime) {
            todo.stopTimer();
            timerButton.textContent = 'Start Timer';
        } else {
            todo.startTimer();
            timerButton.textContent = 'Stop Timer';
        }
        updateAnalytics();
        renderApp();
    }
}

/**
 * Handles adding a subtask.
 * @param {string} todoId - The ID of the parent task.
 */
function handleAddSubtask(todoId) {
    const todo = projects[currentProjectId]?.getTodoById(todoId);
    if (todo) {
        const subtaskTitle = prompt('Enter subtask title:');
        if (subtaskTitle) {
            todo.addSubtask(subtaskTitle);
            renderApp();
        }
    }
}

/**
 * Handles toggling subtask completion.
 * @param {string} todoId - The ID of the parent task.
 * @param {string} subtaskId - The ID of the subtask.
 */
function handleToggleSubtask(todoId, subtaskId) {
    const todo = projects[currentProjectId]?.getTodoById(todoId);
    if (todo) {
        todo.toggleSubtask(subtaskId);
        renderApp();
    }
}

/**
 * Handles creating a new task template.
 */
function handleCreateTemplate() {
    const formData = ui.getFormData();
    if (formData.title) {
        const template = new Todo(
            formData.title,
            formData.description,
            formData.dueDate,
            formData.priority,
            formData.notes,
            false,
            formData.category,
            formData.isRecurring,
            formData.recurrence,
            formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            formData.dependencies.split(',').map(id => id.trim()).filter(id => id),
            formData.subtasks || [],
            0,
            'template'
        );
        templates.set(template.id, template);
        alert('Template created successfully!');
    }
}

/**
 * Handles applying a template to a new task.
 * @param {string} templateId - The ID of the template to apply.
 */
function handleApplyTemplate(templateId) {
    const template = templates.get(templateId);
    if (template) {
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
        const currentProject = projects[currentProjectId];
        if (currentProject) {
            currentProject.addTodo(newTodo);
            renderApp();
        }
    }
}

/**
 * Updates analytics data.
 */
function updateAnalytics() {
    const currentProject = projects[currentProjectId];
    if (!currentProject) return;

    const tasks = currentProject.todos;
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTimeSpent = tasks.reduce((sum, t) => sum + t.timeSpent, 0);
    const urgentTasks = tasks.filter(t => t.isUrgent()).length;
    const importantTasks = tasks.filter(t => t.isImportant()).length;

    analyticsData = {
        totalTasks: tasks.length,
        completedTasks,
        averageTimeSpent: tasks.length > 0 ? totalTimeSpent / tasks.length : 0,
        urgentTasks,
        importantTasks
    };
}

/**
 * Renders the analytics dashboard.
 */
function renderAnalytics() {
    if (!analyticsDashboard) return;

    analyticsDashboard.innerHTML = `
        <div class="analytics-card">
            <h3>Task Analytics</h3>
            <div class="analytics-metrics">
                <div class="metric">
                    <span class="metric-label">Total Tasks</span>
                    <span class="metric-value">${analyticsData.totalTasks}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Completed</span>
                    <span class="metric-value">${analyticsData.completedTasks}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Avg Time Spent</span>
                    <span class="metric-value">${Math.round(analyticsData.averageTimeSpent)} min</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Urgent Tasks</span>
                    <span class="metric-value">${analyticsData.urgentTasks}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Important Tasks</span>
                    <span class="metric-value">${analyticsData.importantTasks}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders the entire application UI and saves data.
 */
function renderApp() {
    // Render projects list
    renderProjects(projects, currentProjectId, handleProjectSelect);
    
    // Render current project's todos
    if (currentProjectId === 'all') {
        // Show todos from all projects
        const allTodos = Object.values(projects)
            .flatMap(project => project.todos)
            .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        
        const allTodosProject = new Project('All Projects');
        allTodosProject.todos = allTodos;
        
        const progress = calculateProgress(allTodos);
        renderTodos(allTodosProject, handleToggleComplete, handleEditTodo, handleDeleteTodo, progress);
    } else if (currentProjectId in projects) {
        // Show todos from current project
        const currentProject = projects[currentProjectId];
        const progress = calculateProgress(currentProject.todos);
        renderTodos(currentProject, handleToggleComplete, handleEditTodo, handleDeleteTodo, progress);
    } else {
        // No project selected
        todoListContainer.innerHTML = '<p class="text-gray-600">Select a project to view its tasks.</p>';
    }
}

// --- Initial Setup ---

function initializeApp() {
    console.log("Initializing application...");

    // Load initial data
    const loadedState = loadData();
    projects = loadedState.projects;
    currentProjectId = loadedState.currentProjectId;
    
    // Load dark mode preference
    isDarkMode = localStorage.getItem('isDarkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Request notification permission
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Load templates from localStorage
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
                    false,
                    templateData.category,
                    templateData.isRecurring,
                    templateData.recurrence,
                    templateData.tags,
                    templateData.dependencies,
                    templateData.subtasks,
                    0,
                    'template'
                );
                templates.set(template.id, template);
            });
        } catch (error) {
            console.error("Error loading templates:", error);
        }
    }

    // --- Attach Event Listeners ---
    addProjectButton.addEventListener('click', handleAddProject);
    
    // Render initial state
    renderApp();
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', initializeApp);
