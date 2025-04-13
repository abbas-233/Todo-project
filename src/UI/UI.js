// This module handles DOM manipulation and rendering.
// It needs references to the DOM elements.

// --- DOM Element References ---
// It's often good practice to grab these once and export or pass them around.
// Or, functions in this module can accept element IDs/selectors or direct references.
// For simplicity here, we'll re-declare them, but in a larger app, manage this carefully.
const projectList = document.getElementById('project-list');
const currentProjectTitle = document.getElementById('current-project-title');
const deleteProjectButton = document.getElementById('delete-project-button');
const todoListContainer = document.getElementById('todo-list');
const todoModal = document.getElementById('todo-modal');
const modalTitle = document.getElementById('modal-title');
const todoForm = document.getElementById('todo-form');
const todoIdInput = document.getElementById('todo-id');
const todoTitleInput = document.getElementById('todo-title');
const todoDescriptionInput = document.getElementById('todo-description');
const todoDueDateInput = document.getElementById('todo-due-date');
const todoPriorityInput = document.getElementById('todo-priority');
const todoNotesInput = document.getElementById('todo-notes');

// --- State (managed externally, passed into functions) ---
// This module doesn't hold the core 'projects' or 'currentProjectId' state.
// It receives data to render.

// --- Exported UI Functions ---

/**
 * Renders the list of projects in the sidebar.
 * @param {object} projects - The projects object from the main state.
 * @param {string} currentProjectId - The ID of the currently selected project.
 * @param {function} onSelect - Callback function when a project is clicked.
 */
export function renderProjects(projects, currentProjectId, onSelect) {
    const projectsList = document.getElementById('projects-list');
    if (!projectsList) return;

    projectsList.innerHTML = '';
    
    // Create "All Projects" option
    const allProjectsElement = document.createElement('div');
    allProjectsElement.className = 'project-item hover:bg-gray-100 rounded-md p-2 cursor-pointer';
    allProjectsElement.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="lucide">&#xe900;</span>
                <span>All Projects</span>
            </div>
            <span class="text-sm text-gray-600">${Object.values(projects).reduce((total, p) => total + p.todos.length, 0)} tasks</span>
        </div>
    `;
    
    if (currentProjectId === 'all') {
        allProjectsElement.classList.add('bg-gray-100');
    }
    
    allProjectsElement.addEventListener('click', () => onSelect('all'));
    projectsList.appendChild(allProjectsElement);
    
    // Create divider
    const divider = document.createElement('div');
    divider.className = 'border-t border-gray-200 my-2';
    projectsList.appendChild(divider);
    
    // Create individual project items
    Object.values(projects).forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-item hover:bg-gray-100 rounded-md p-2 cursor-pointer';
        projectElement.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="lucide">&#xe900;</span>
                    <span>${project.name}</span>
                </div>
                <span class="text-sm text-gray-600">${project.todos.length} tasks</span>
            </div>
        `;
        
        if (project.id === currentProjectId) {
            projectElement.classList.add('bg-gray-100');
        }
        
        projectElement.addEventListener('click', () => onSelect(project.id));
        projectsList.appendChild(projectElement);
    });
}

/**
 * Renders the todos for a given project.
 * @param {Project} project - The project object whose todos need rendering.
 * @param {function} onToggleComplete - Callback for checkbox change.
 * @param {function} onEdit - Callback when edit button is clicked.
 * @param {function} onDelete - Callback when delete button is clicked.
 * @param {number} progress - Progress percentage.
 */
export function renderTodos(project, onToggleComplete, onEdit, onDelete, progress) {
    const todosList = document.getElementById('todos-list');
    const progressElement = document.getElementById('progress-bar');
    
    if (!todosList || !progressElement) return;

    // Update progress bar
    progressElement.style.width = `${progress}%`;
    progressElement.textContent = `${progress}% Complete`;

    todosList.innerHTML = '';
    
    project.todos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        // Determine urgency and importance
        const isUrgent = todo.isUrgent();
        const isImportant = todo.isImportant();
        
        todoElement.innerHTML = `
            <div class="todo-header">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <div class="todo-content">
                    <div class="todo-title">${todo.title}</div>
                    <div class="todo-meta">
                        <span class="priority-badge ${todo.priority}">${todo.priority}</span>
                        ${todo.isRecurring ? '<span class="recurring-badge">Recurring</span>' : ''}
                        ${todo.hasPendingDependencies(projects) ? '<span class="dependencies-badge">Pending</span>' : ''}
                        ${todo.isOverdue() ? '<span class="overdue-badge">Overdue</span>' : ''}
                        ${todo.isDueToday() ? '<span class="due-today-badge">Due Today</span>' : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="edit-button" title="Edit">✏️</button>
                    <button class="delete-button" title="Delete">🗑️</button>
                    ${todo.startTime ? '<button class="timer-button" title="Stop Timer">⏹️</button>' : '<button class="timer-button" title="Start Timer">⏱️</button>'}
                    ${todo.subtasks.length > 0 ? '<button class="subtasks-button" title="View Subtasks">🗂️</button>' : ''}
                </div>
            </div>
            ${todo.notes ? `<div class="todo-notes">${todo.notes}</div>` : ''}
            <div class="todo-footer">
                <span class="todo-date">Due: ${todo.dueDate}</span>
                <span class="todo-time-spent">Time: ${Math.round(todo.timeSpent / 60)} min</span>
                <div class="tags-container">
                    ${todo.tags.map(tag => `<span class="tag-badge">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        todoElement.querySelector('.todo-checkbox').addEventListener('change', () => onToggleComplete(project.id, todo.id));
        todoElement.querySelector('.edit-button').addEventListener('click', () => onEdit(todo));
        todoElement.querySelector('.delete-button').addEventListener('click', () => onDelete(project.id, todo.id));
        todoElement.querySelector('.timer-button').addEventListener('click', () => handleTimer(todo.id));
        todoElement.querySelector('.subtasks-button')?.addEventListener('click', () => handleShowSubtasks(todo));

        todosList.appendChild(todoElement);
    });
}

/**
 * Opens the Add/Edit Todo modal.
 * @param {Todo | null} [todoToEdit=null] - The todo to edit, or null to add a new one.
 */
export function openModal(todoToEdit = null) {
    const modal = document.getElementById('todo-modal');
    const form = document.getElementById('todo-form');
    if (!modal || !form) return;

    // Clear form
    form.reset();

    // Set up form for editing if todo is provided
    if (todoToEdit) {
        form.title.value = todoToEdit.title;
        form.description.value = todoToEdit.description;
        form.dueDate.value = todoToEdit.dueDate;
        form.priority.value = todoToEdit.priority;
        form.notes.value = todoToEdit.notes;
        form.category.value = todoToEdit.category;
        form.isRecurring.checked = todoToEdit.isRecurring;
        form.recurrence.value = todoToEdit.recurrence || '';
        form.tags.value = todoToEdit.tags.join(', ');
        form.dependencies.value = todoToEdit.dependencies.join(', ');
        form.subtasks.value = todoToEdit.subtasks.map(st => st.title).join('\n');
    }

    modal.style.display = 'block';
}

/**
 * Closes the Add/Edit Todo modal.
 */
export function closeModal() {
    const modal = document.getElementById('todo-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Gets the current values from the todo form.
 * @returns {{id: string, title: string, description: string, dueDate: string, priority: string, notes: string}} Form data.
 */
export function getFormData() {
    const form = document.getElementById('todo-form');
    if (!form) return {};

    return {
        id: form.id.value || null,
        title: form.title.value,
        description: form.description.value,
        dueDate: form.dueDate.value,
        priority: form.priority.value,
        notes: form.notes.value,
        category: form.category.value,
        isRecurring: form.isRecurring.checked,
        recurrence: form.recurrence.value,
        tags: form.tags.value,
        dependencies: form.dependencies.value,
        subtasks: form.subtasks.value
    };
}

/**
 * Renders the analytics dashboard.
 * @param {object} analyticsData - Analytics data.
 */
export function renderAnalyticsDashboard(analyticsData) {
    const dashboard = document.getElementById('analytics-dashboard');
    if (!dashboard) return;

    dashboard.innerHTML = `
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
 * Renders the Eisenhower matrix.
 * @param {object} projects - Projects object.
 */
export function renderEisenhowerMatrix(projects) {
    const matrix = document.getElementById('eisenhower-matrix');
    if (!matrix) return;

    const currentProject = projects[currentProjectId];
    if (!currentProject) return;

    const tasks = currentProject.todos;
    const urgentImportant = tasks.filter(t => t.isUrgent() && t.isImportant());
    const urgentNotImportant = tasks.filter(t => t.isUrgent() && !t.isImportant());
    const notUrgentImportant = tasks.filter(t => !t.isUrgent() && t.isImportant());
    const notUrgentNotImportant = tasks.filter(t => !t.isUrgent() && !t.isImportant());

    matrix.innerHTML = `
        <div class="eisenhower-matrix">
            <div class="matrix-row">
                <div class="matrix-cell urgent-important">
                    <h4>Urgent & Important</h4>
                    <ul>
                        ${urgentImportant.map(t => `<li>${t.title}</li>`).join('')}
                    </ul>
                </div>
                <div class="matrix-cell urgent-not-important">
                    <h4>Urgent & Not Important</h4>
                    <ul>
                        ${urgentNotImportant.map(t => `<li>${t.title}</li>`).join('')}
                    </ul>
                </div>
            </div>
            <div class="matrix-row">
                <div class="matrix-cell not-urgent-important">
                    <h4>Not Urgent & Important</h4>
                    <ul>
                        ${notUrgentImportant.map(t => `<li>${t.title}</li>`).join('')}
                    </ul>
                </div>
                <div class="matrix-cell not-urgent-not-important">
                    <h4>Not Urgent & Not Important</h4>
                    <ul>
                        ${notUrgentNotImportant.map(t => `<li>${t.title}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

/**
 * Renders the quick add button.
 */
export function renderQuickAdd() {
    const container = document.getElementById('quick-add-container');
    if (!container) return;

    container.innerHTML = `
        <button class="quick-add-button" onclick="handleQuickAdd()">
            <span>+</span>
            <span>Quick Add</span>
        </button>
    `;
}

/**
 * Renders the task templates.
 * @param {object} templates - Templates object.
 */
export function renderTemplates(templates) {
    const templatesContainer = document.getElementById('templates-container');
    if (!templatesContainer) return;

    templatesContainer.innerHTML = `
        <h3>Task Templates</h3>
        <div class="templates-grid">
            ${Array.from(templates.values()).map(template => `
                <div class="template-card">
                    <h4>${template.title}</h4>
                    <p>${template.description}</p>
                    <button onclick="handleApplyTemplate('${template.id}')">Use Template</button>
                </div>
            `).join('')}
            <div class="template-card new-template">
                <button onclick="handleCreateTemplate()">Create New Template</button>
            </div>
        </div>
    `;
}

// --- Helper Functions (internal to ui.js) ---

function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'border-red-500';
        case 'medium': return 'border-yellow-500';
        case 'low': return 'border-green-500';
        default: return 'border-gray-300';
    }
}

function createTodoElement(todo, projectId, onToggleComplete, onEdit, onDelete) {
    const div = document.createElement('div');
    div.classList.add('p-4', 'border', 'rounded-lg', 'shadow-sm', 'flex', 'items-start', 'gap-4', 'bg-white', getPriorityClass(todo.priority), 'border-l-4', 'transition-opacity', 'duration-300');
    if (todo.completed) {
        div.classList.add('opacity-60', 'bg-gray-50');
    }

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.classList.add('mt-1', 'form-checkbox', 'h-5', 'w-5', 'text-blue-600', 'rounded', 'border-gray-300', 'focus:ring-blue-500', 'cursor-pointer', 'flex-shrink-0');
    checkbox.addEventListener('change', () => onToggleComplete(projectId, todo.id)); // Use callback

    // Content Div
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('flex-grow', 'min-w-0');

    const title = document.createElement('h4');
    title.textContent = todo.title;
    title.classList.add('font-semibold', 'text-lg', 'text-gray-800', 'break-words');
    if (todo.completed) title.classList.add('line-through');

    const description = document.createElement('p');
    description.textContent = todo.description;
    description.classList.add('text-sm', 'text-gray-600', 'mt-1', 'break-words');

    const dueDate = document.createElement('p');
    dueDate.textContent = `Due: ${todo.dueDate || 'Not set'}`;
    dueDate.classList.add('text-xs', 'text-gray-500', 'mt-1');

    const notes = document.createElement('p');
    notes.textContent = `Notes: ${todo.notes || 'None'}`;
    notes.classList.add('text-xs', 'text-gray-500', 'mt-1', 'italic', 'break-words');

    contentDiv.appendChild(title);
    if (todo.description) contentDiv.appendChild(description);
    contentDiv.appendChild(dueDate);
    if (todo.notes) contentDiv.appendChild(notes);

    // Actions Div
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('flex', 'flex-col', 'sm:flex-row', 'items-end', 'sm:items-center', 'gap-1', 'ml-auto', 'flex-shrink-0');

    const editButton = document.createElement('button');
    editButton.innerHTML = '<span class="lucide">&#xef7f;</span>'; // edit / pencil
    editButton.classList.add('text-blue-500', 'hover:text-blue-700', 'p-1', 'rounded', 'hover:bg-blue-100');
    editButton.title = "Edit Task";
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        onEdit(todo); // Use callback
    });

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<span class="lucide">&#xe4cf;</span>'; // trash-2
    deleteButton.classList.add('text-red-500', 'hover:text-red-700', 'p-1', 'rounded', 'hover:bg-red-100');
    deleteButton.title = "Delete Task";
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete the task "${todo.title}"?`)) {
            onDelete(projectId, todo.id); // Use callback
        }
    });

    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);

    // Assemble
    div.appendChild(checkbox);
    div.appendChild(contentDiv);
    div.appendChild(actionsDiv);

    return div;
}
