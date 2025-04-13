// This module handles DOM manipulation and rendering.
// It needs references to the DOM elements.

// --- DOM Element References ---
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
const todoCategoryInput = document.getElementById('todo-category');
const todoTagsInput = document.getElementById('todo-tags');
const todoDependenciesInput = document.getElementById('todo-dependencies');
const todoSubtasksInput = document.getElementById('todo-subtasks');
const todoRecurringInput = document.getElementById('todo-recurring');
const todoRecurrenceInput = document.getElementById('todo-recurrence');
const todoTimeSpentInput = document.getElementById('todo-time-spent');
const todoTemplateInput = document.getElementById('todo-template');

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
                <div class="flex flex-col items-end">
                    <span class="text-sm text-gray-600">${project.todos.length} tasks</span>
                    <span class="text-xs text-gray-400">Last modified: ${new Date(project.lastModified).toLocaleDateString()}</span>
                </div>
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
 * @param {object} project - The project object whose todos need rendering.
 * @param {function} onToggleComplete - Callback for checkbox change.
 * @param {function} onEdit - Callback when edit button is clicked.
 * @param {function} onDelete - Callback when delete button is clicked.
 * @param {number} progress - Progress percentage.
 */
export function renderTodos(project, onToggleComplete, onEdit, onDelete, progress) {
    todoListContainer.innerHTML = '';
    
    if (!project || !project.todos || project.todos.length === 0) {
        todoListContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                No tasks in this project
            </div>
        `;
        return;
    }

    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'mb-4';
    progressBar.innerHTML = `
        <div class="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>${progress}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div>
        </div>
    `;
    todoListContainer.appendChild(progressBar);

    // Create filter section
    const filterSection = document.createElement('div');
    filterSection.className = 'flex gap-4 mb-4';
    filterSection.innerHTML = `
        <select id="todo-filter" class="border rounded px-3 py-1">
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="active">Active</option>
            <option value="urgent">Urgent</option>
            <option value="important">Important</option>
        </select>
        <select id="todo-sort" class="border rounded px-3 py-1">
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
            <option value="created">Created</option>
            <option value="modified">Modified</option>
        </select>
    `;
    todoListContainer.appendChild(filterSection);

    // Create search input
    const searchInput = document.createElement('input');
    searchInput.className = 'w-full border rounded px-3 py-1 mb-4';
    searchInput.placeholder = 'Search tasks...';
    todoListContainer.appendChild(searchInput);

    // Create todos list
    const todosList = document.createElement('div');
    todosList.className = 'space-y-4';

    project.todos.forEach(todo => {
        const todoElement = createTodoElement(todo, project.id, onToggleComplete, onEdit, onDelete);
        todosList.appendChild(todoElement);
    });

    todoListContainer.appendChild(todosList);
}

/**
 * Opens the Add/Edit Todo modal.
 * @param {Todo | null} [todoToEdit=null] - The todo to edit, or null to add a new one.
 */
export function openModal(todoToEdit = null) {
    todoModal.classList.remove('hidden');
    
    if (todoToEdit) {
        modalTitle.textContent = 'Edit Task';
        todoIdInput.value = todoToEdit.id;
        todoTitleInput.value = todoToEdit.title;
        todoDescriptionInput.value = todoToEdit.description;
        todoDueDateInput.value = todoToEdit.dueDate;
        todoPriorityInput.value = todoToEdit.priority;
        todoNotesInput.value = todoToEdit.notes;
        todoCategoryInput.value = todoToEdit.category;
        todoTagsInput.value = todoToEdit.tags.join(', ');
        todoDependenciesInput.value = todoToEdit.dependencies.join(', ');
        todoRecurringInput.checked = todoToEdit.isRecurring;
        todoRecurrenceInput.value = todoToEdit.recurrence;
        todoTimeSpentInput.value = todoToEdit.timeSpent;
        todoTemplateInput.value = todoToEdit.templateId || '';
    } else {
        modalTitle.textContent = 'Add New Task';
        todoForm.reset();
    }
}

/**
 * Closes the Add/Edit Todo modal.
 */
export function closeModal() {
    todoModal.classList.add('hidden');
    todoForm.reset();
}

/**
 * Gets the current values from the todo form.
 * @returns {{id: string, title: string, description: string, dueDate: string, priority: string, notes: string}} Form data.
 */
export function getFormData() {
    return {
        id: todoIdInput.value,
        title: todoTitleInput.value.trim(),
        description: todoDescriptionInput.value.trim(),
        dueDate: todoDueDateInput.value,
        priority: todoPriorityInput.value,
        notes: todoNotesInput.value.trim(),
        category: todoCategoryInput.value,
        tags: todoTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag),
        dependencies: todoDependenciesInput.value.split(',').map(id => id.trim()).filter(id => id),
        isRecurring: todoRecurringInput.checked,
        recurrence: todoRecurrenceInput.value,
        timeSpent: parseFloat(todoTimeSpentInput.value) || 0,
        templateId: todoTemplateInput.value || null
    };
}

/**
 * Renders the analytics dashboard.
 * @param {object} analyticsData - Analytics data.
 */
export function renderAnalyticsDashboard(analyticsData) {
    const analyticsContainer = document.getElementById('analytics-dashboard');
    if (!analyticsContainer) return;

    analyticsContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Total Tasks</h3>
                <p class="text-3xl font-bold">${analyticsData.totalTasks}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Completed Tasks</h3>
                <p class="text-3xl font-bold">${analyticsData.completedTasks}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Average Time Spent</h3>
                <p class="text-3xl font-bold">${Math.round(analyticsData.averageTimeSpent / 3600)}h ${Math.round((analyticsData.averageTimeSpent % 3600) / 60)}m</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Urgent Tasks</h3>
                <p class="text-3xl font-bold">${analyticsData.urgentTasks}</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Important Tasks</h3>
                <p class="text-3xl font-bold">${analyticsData.importantTasks}</p>
            </div>
        </div>
    `;
}

/**
 * Renders the Eisenhower matrix.
 * @param {object} projects - Projects object.
 */
export function renderEisenhowerMatrix(projects) {
    const matrixContainer = document.getElementById('eisenhower-matrix');
    if (!matrixContainer) return;

    const todos = Object.values(projects).flatMap(project => project.todos);
    const matrix = {
        important: {
            urgent: [],
            notUrgent: []
        },
        notImportant: {
            urgent: [],
            notUrgent: []
        }
    };

    todos.forEach(todo => {
        const isImportant = todo.priority === 'high';
        const isUrgent = todo.isUrgent();
        
        matrix[isImportant ? 'important' : 'notImportant'][isUrgent ? 'urgent' : 'notUrgent'].push(todo);
    });

    matrixContainer.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow">
            <h2 class="text-xl font-semibold mb-4">Eisenhower Matrix</h2>
            <div class="grid grid-cols-2 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Important & Urgent</h3>
                    <ul class="space-y-2">
                        ${matrix.important.urgent.map(todo => `<li class="flex items-center gap-2">${todo.title}</li>`).join('')}
                    </ul>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Important & Not Urgent</h3>
                    <ul class="space-y-2">
                        ${matrix.important.notUrgent.map(todo => `<li class="flex items-center gap-2">${todo.title}</li>`).join('')}
                    </ul>
                </div>
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Not Important & Urgent</h3>
                    <ul class="space-y-2">
                        ${matrix.notImportant.urgent.map(todo => `<li class="flex items-center gap-2">${todo.title}</li>`).join('')}
                    </ul>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold mb-2">Not Important & Not Urgent</h3>
                    <ul class="space-y-2">
                        ${matrix.notImportant.notUrgent.map(todo => `<li class="flex items-center gap-2">${todo.title}</li>`).join('')}
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
    const quickAddContainer = document.getElementById('quick-add');
    if (!quickAddContainer) return;

    quickAddContainer.innerHTML = `
        <button id="quick-add-btn" class="fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
            <span class="lucide">&#xe408;</span>
        </button>
    `;

    const quickAddBtn = document.getElementById('quick-add-btn');
    quickAddBtn.addEventListener('click', () => {
        openModal();
    });
}

/**
 * Renders the task templates.
 * @param {object} templates - Templates object.
 */
export function renderTemplates(templates) {
    const templatesContainer = document.getElementById('templates');
    if (!templatesContainer) return;

    templatesContainer.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            ${Array.from(templates.entries())
                .map(([id, template]) => `
                    <div class="template-card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                        <h4 class="font-semibold mb-2">${template.title}</h4>
                        <p class="text-sm text-gray-600 mb-2">${template.description}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-xs text-gray-500">${template.category}</span>
                            <button 
                                onclick="handleApplyTemplate('${id}')" 
                                class="text-blue-500 hover:text-blue-700 text-sm"
                            >
                                Use Template
                            </button>
                        </div>
                    </div>
                `).join('')}
            <div class="template-card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                <button 
                    onclick="handleCreateTemplate()" 
                    class="w-full bg-blue-100 text-blue-600 p-4 rounded-lg hover:bg-blue-200 transition-colors"
                >
                    <span class="lucide">&#xe408;</span>
                    Create New Template
                </button>
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
    div.classList.add(
        'p-4',
        'border',
        'rounded-lg',
        'shadow-sm',
        'flex',
        'items-start',
        'gap-4',
        'bg-white',
        getPriorityClass(todo.priority),
        'border-l-4',
        'transition-opacity',
        'duration-300'
    );
    
    if (todo.completed) {
        div.classList.add('opacity-60', 'bg-gray-50');
    }

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.classList.add(
        'mt-1',
        'form-checkbox',
        'h-5',
        'w-5',
        'text-blue-600',
        'rounded',
        'border-gray-300',
        'focus:ring-blue-500',
        'cursor-pointer',
        'flex-shrink-0'
    );
    checkbox.addEventListener('change', () => onToggleComplete(projectId, todo.id));

    // Content Div
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('flex-grow', 'min-w-0');

    // Title with priority indicator
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('flex', 'items-center', 'gap-2');

    const priorityIcon = document.createElement('span');
    priorityIcon.className = 'lucide text-sm';
    priorityIcon.innerHTML = {
        high: '&#xe417;', // flag
        medium: '&#xe409;', // alert-triangle
        low: '&#xe408;' // check-circle
    }[todo.priority];
    priorityIcon.style.color = {
        high: 'red',
        medium: 'yellow',
        low: 'green'
    }[todo.priority];

    const title = document.createElement('h4');
    title.textContent = todo.title;
    title.classList.add('font-semibold', 'text-lg', 'text-gray-800', 'break-words');
    if (todo.completed) title.classList.add('line-through');

    titleDiv.appendChild(priorityIcon);
    titleDiv.appendChild(title);

    // Description
    const description = document.createElement('p');
    description.textContent = todo.description;
    description.classList.add('text-sm', 'text-gray-600', 'mt-1', 'break-words');

    // Due Date with urgency indicator
    const dueDate = document.createElement('p');
    dueDate.textContent = `Due: ${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'Not set'}`;
    dueDate.classList.add('text-xs', 'text-gray-500', 'mt-1');
    
    if (todo.isUrgent()) {
        const urgencyBadge = document.createElement('span');
        urgencyBadge.textContent = 'URGENT';
        urgencyBadge.classList.add('ml-2', 'px-2', 'py-1', 'text-xs', 'bg-red-100', 'text-red-800', 'rounded-full');
        dueDate.appendChild(urgencyBadge);
    }

    // Notes
    const notes = document.createElement('p');
    notes.textContent = `Notes: ${todo.notes || 'None'}`;
    notes.classList.add('text-xs', 'text-gray-500', 'mt-1', 'italic', 'break-words');

    // Progress bar for subtasks
    if (todo.subtasks && todo.subtasks.length > 0) {
        const progressDiv = document.createElement('div');
        progressDiv.className = 'mt-2';
        progressDiv.innerHTML = `
            <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>${todo.getSubtaskProgress()}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${todo.getSubtaskProgress()}%"></div>
            </div>
        `;
        contentDiv.appendChild(progressDiv);
    }

    // Time tracking
    const timeSpent = document.createElement('p');
    timeSpent.textContent = `Time Spent: ${todo.getFormattedTimeSpent()}`;
    timeSpent.classList.add('text-xs', 'text-gray-500', 'mt-1');

    contentDiv.appendChild(titleDiv);
    if (todo.description) contentDiv.appendChild(description);
    contentDiv.appendChild(dueDate);
    if (todo.notes) contentDiv.appendChild(notes);
    contentDiv.appendChild(timeSpent);

    // Actions Div
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('flex', 'flex-col', 'sm:flex-row', 'items-end', 'sm:items-center', 'gap-1', 'ml-auto', 'flex-shrink-0');

    // Start/Stop timing button
    const timingButton = document.createElement('button');
    timingButton.innerHTML = todo.isBeingTimed() ? '<span class="lucide">&#xe409;</span>' : '<span class="lucide">&#xe408;</span>';
    timingButton.classList.add(
        'text-orange-500',
        'hover:text-orange-700',
        'p-1',
        'rounded',
        'hover:bg-orange-100',
        'flex-shrink-0'
    );
    timingButton.title = todo.isBeingTimed() ? 'Stop Timing' : 'Start Timing';
    timingButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (todo.isBeingTimed()) {
            todo.stopTiming();
        } else {
            todo.startTiming();
        }
        timingButton.innerHTML = todo.isBeingTimed() ? '<span class="lucide">&#xe409;</span>' : '<span class="lucide">&#xe408;</span>';
        timingButton.title = todo.isBeingTimed() ? 'Stop Timing' : 'Start Timing';
    });

    // Edit button
    const editButton = document.createElement('button');
    editButton.innerHTML = '<span class="lucide">&#xef7f;</span>';
    editButton.classList.add(
        'text-blue-500',
        'hover:text-blue-700',
        'p-1',
        'rounded',
        'hover:bg-blue-100',
        'flex-shrink-0'
    );
    editButton.title = "Edit Task";
    editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        onEdit(todo);
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<span class="lucide">&#xe4cf;</span>';
    deleteButton.classList.add(
        'text-red-500',
        'hover:text-red-700',
        'p-1',
        'rounded',
        'hover:bg-red-100',
        'flex-shrink-0'
    );
    deleteButton.title = "Delete Task";
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete the task "${todo.title}"?`)) {
            onDelete(projectId, todo.id);
        }
    });

    actionsDiv.appendChild(timingButton);
    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);

    // Assemble
    div.appendChild(checkbox);
    div.appendChild(contentDiv);
    div.appendChild(actionsDiv);

    return div;
}
