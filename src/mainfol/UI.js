// Simplified UI.js to focus on rendering projects and todos

// --- DOM Element References ---
const projectList = document.getElementById('project-list');
const todoListContainer = document.getElementById('todo-list');
const todoModal = document.getElementById('todo-modal');
const modalTitle = document.getElementById('modal-title');
const todoForm = document.getElementById('todo-form');
const todoTitleInput = document.getElementById('todo-title');

// --- Exported UI Functions ---

/**
 * Renders the list of projects in the sidebar.
 * @param {object} projects - The projects object from the main state.
 * @param {string} currentProjectId - The ID of the currently selected project.
 * @param {function} onSelect - Callback function when a project is clicked.
 */
export function renderProjects(projects, currentProjectId, onSelect) {
    projectList.innerHTML = '';

    Object.values(projects).forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-item';
        projectElement.textContent = project.name;
        if (project.id === currentProjectId) {
            projectElement.classList.add('active');
        }
        projectElement.addEventListener('click', () => onSelect(project.id));
        projectList.appendChild(projectElement);
    });
}

/**
 * Renders the todos for a given project.
 * @param {object} project - The project object whose todos need rendering.
 * @param {function} onToggleComplete - Callback for checkbox change.
 */
export function renderTodos(project, onToggleComplete) {
    todoListContainer.innerHTML = '';

    if (!project || !project.todos || project.todos.length === 0) {
        todoListContainer.innerHTML = '<p>No tasks in this project</p>';
        return;
    }

    project.todos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = 'todo-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => onToggleComplete(project.id, todo.id));

        const title = document.createElement('span');
        title.textContent = todo.title;

        todoElement.appendChild(checkbox);
        todoElement.appendChild(title);
        todoListContainer.appendChild(todoElement);
    });
}

/**
 * Opens the Add/Edit Todo modal.
 * @param {string} [todoTitle=''] - The title of the todo to edit, or empty for a new todo.
 */
export function openModal(todoTitle = '') {
    modalTitle.textContent = todoTitle ? 'Edit Task' : 'Add New Task';
    todoTitleInput.value = todoTitle;
    todoModal.classList.remove('hidden');
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
 * @returns {{title: string}} Form data.
 */
export function getFormData() {
    return {
        title: todoTitleInput.value.trim()
    };
}
