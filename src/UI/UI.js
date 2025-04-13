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
 * @param {function} onProjectSelect - Callback function when a project is clicked.
 */
export function renderProjects(projects, currentProjectId, onProjectSelect) {
    projectList.innerHTML = ''; // Clear existing list items

    const sortedProjectIds = Object.keys(projects).sort((a, b) => {
        if (a === 'default') return -1;
        if (b === 'default') return 1;
        return projects[a].name.localeCompare(projects[b].name);
    });

    sortedProjectIds.forEach(projectId => {
        const project = projects[projectId];
        const li = document.createElement('li');
        li.textContent = project.name;
        li.dataset.projectId = project.id;
        li.classList.add('p-2', 'rounded-md', 'cursor-pointer', 'hover:bg-gray-200', 'text-gray-700', 'truncate');

        if (project.id === currentProjectId) {
            li.classList.add('bg-blue-100', 'text-blue-800', 'font-semibold');
            li.classList.remove('hover:bg-gray-200', 'text-gray-700');
        }

        li.addEventListener('click', () => {
            onProjectSelect(project.id); // Call the provided callback
        });

        projectList.appendChild(li);
    });
}

/**
 * Renders the todos for a given project.
 * @param {Project} project - The project object whose todos need rendering.
 * @param {function} onToggleComplete - Callback for checkbox change.
 * @param {function} onEdit - Callback when edit button is clicked.
 * @param {function} onDelete - Callback when delete button is clicked.
 */
export function renderTodos(project, onToggleComplete, onEdit, onDelete) {
    if (!project) {
        console.error("UI: Cannot render todos for a null/undefined project.");
        currentProjectTitle.textContent = "Error";
        todoListContainer.innerHTML = '<p class="text-red-500">Error loading project tasks.</p>';
        deleteProjectButton.disabled = true;
        return;
    }

    currentProjectTitle.textContent = project.name;
    deleteProjectButton.disabled = (project.id === 'default');
    todoListContainer.innerHTML = ''; // Clear existing todos

    if (project.todos.length === 0) {
        todoListContainer.innerHTML = '<p class="text-gray-500 italic">No tasks yet. Add one below!</p>';
        return;
    }

    const sortedTodos = [...project.todos].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateA - dateB;
    });

    sortedTodos.forEach(todo => {
        const todoElement = createTodoElement(todo, project.id, onToggleComplete, onEdit, onDelete);
        todoListContainer.appendChild(todoElement);
    });
}

/**
 * Opens the Add/Edit Todo modal.
 * @param {Todo | null} [todoToEdit=null] - The todo to edit, or null to add a new one.
 */
export function openModal(todoToEdit = null) {
    todoForm.reset();
    if (todoToEdit) {
        // Editing mode
        modalTitle.textContent = 'Edit Task';
        todoIdInput.value = todoToEdit.id;
        todoTitleInput.value = todoToEdit.title;
        todoDescriptionInput.value = todoToEdit.description || '';
        todoDueDateInput.value = todoToEdit.dueDate || '';
        todoPriorityInput.value = todoToEdit.priority || 'medium';
        todoNotesInput.value = todoToEdit.notes || '';
    } else {
        // Adding mode
        modalTitle.textContent = 'Add New Task';
        todoIdInput.value = ''; // Clear ID field
        todoPriorityInput.value = 'medium';
        todoDueDateInput.valueAsDate = new Date(); // Default to today
    }
    todoModal.style.display = 'block';
    todoTitleInput.focus();
}

/**
 * Closes the Add/Edit Todo modal.
 */
export function closeModal() {
    todoModal.style.display = 'none';
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
        notes: todoNotesInput.value.trim()
    };
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
