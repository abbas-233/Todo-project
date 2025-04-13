// --- DOM Elements ---
// Select elements from the HTML needed for interaction
const projectList = document.getElementById('project-list');
const addProjectForm = document.getElementById('add-project-form');
const newProjectNameInput = document.getElementById('new-project-name');
const currentProjectTitle = document.getElementById('current-project-title');
const deleteProjectButton = document.getElementById('delete-project-button');
const todoListContainer = document.getElementById('todo-list');
const addTodoButton = document.getElementById('add-todo-button');
const todoModal = document.getElementById('todo-modal');
const closeModalButton = document.getElementById('close-modal-button');
const cancelTodoButton = document.getElementById('cancel-todo-button');
const todoForm = document.getElementById('todo-form');
const modalTitle = document.getElementById('modal-title');
const todoIdInput = document.getElementById('todo-id'); // Hidden input to store ID when editing
const todoTitleInput = document.getElementById('todo-title');
const todoDescriptionInput = document.getElementById('todo-description');
const todoDueDateInput = document.getElementById('todo-due-date');
const todoPriorityInput = document.getElementById('todo-priority');
const todoNotesInput = document.getElementById('todo-notes');

// --- Application State ---
let projects = {}; // Use an object to store projects, keyed by their ID
let currentProjectId = 'default'; // ID of the currently selected project
let editingTodoId = null; // Track the ID of the todo being edited, null if adding new

// --- Classes ---

/**
 * Represents a single task (Todo item).
 */
class Todo {
    /**
     * Creates a new Todo instance.
     * @param {string} title - The title of the task.
     * @param {string} description - A detailed description of the task.
     * @param {string} dueDate - The due date of the task (YYYY-MM-DD).
     * @param {string} priority - The priority level ('low', 'medium', 'high').
     * @param {string} [notes=''] - Additional notes for the task.
     * @param {boolean} [completed=false] - Whether the task is completed.
     */
    constructor(title, description, dueDate, priority, notes = '', completed = false) {
        // Generate a unique ID combining timestamp and random string
        this.id = `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.notes = notes;
        // this.checklist = []; // Placeholder for future checklist feature
        this.completed = completed;
    }
}

/**
 * Represents a project, which contains a collection of Todos.
 */
class Project {
    /**
     * Creates a new Project instance.
     * @param {string} name - The name of the project.
     */
    constructor(name) {
        // Generate a unique ID combining timestamp and random string
        this.id = `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        this.name = name;
        this.todos = []; // Array to hold Todo objects belonging to this project
    }

    /**
     * Adds a Todo object to the project's list.
     * @param {Todo} todo - The Todo instance to add.
     */
    addTodo(todo) {
        this.todos.push(todo);
    }

    /**
     * Removes a Todo from the project by its ID.
     * @param {string} todoId - The ID of the Todo to remove.
     */
    removeTodo(todoId) {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
    }

    /**
     * Finds and returns a Todo object by its ID.
     * @param {string} todoId - The ID of the Todo to find.
     * @returns {Todo|undefined} The found Todo object, or undefined if not found.
     */
    getTodoById(todoId) {
        return this.todos.find(todo => todo.id === todoId);
    }
}

// --- Local Storage Functions ---
const STORAGE_KEY = 'todoAppData'; // Key used to store data in localStorage

/**
 * Saves the current application state (projects and current project ID) to localStorage.
 */
function saveData() {
    const dataToSave = {
        projects,
        currentProjectId
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("Data saved:", dataToSave);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
        alert("Could not save data. Local storage might be full or unavailable.");
    }
}

/**
 * Loads the application state from localStorage.
 * Re-hydrates the plain objects back into class instances.
 */
function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            console.log("Data loaded:", parsedData);

            // --- Re-hydration ---
            // It's crucial to recreate class instances from the loaded plain objects
            // so that the objects have access to their methods (like addTodo, getTodoById).
            projects = {}; // Clear existing state before loading
            if (parsedData.projects) {
                Object.values(parsedData.projects).forEach(projData => {
                    // Create a new Project instance
                    const project = new Project(projData.name);
                    project.id = projData.id; // Restore the original ID

                    // Recreate Todo instances within the project
                    project.todos = projData.todos.map(todoData => {
                        const todo = new Todo(
                            todoData.title,
                            todoData.description,
                            todoData.dueDate,
                            todoData.priority,
                            todoData.notes || '', // Ensure notes is at least an empty string
                            todoData.completed || false // Ensure completed is boolean
                        );
                        todo.id = todoData.id; // Restore the original Todo ID
                        return todo;
                    });
                    projects[project.id] = project; // Add the rehydrated project to our state
                });
            }

            // Ensure the 'default' project exists after loading
            if (!projects['default']) {
                projects['default'] = new Project('Default');
                projects['default'].id = 'default'; // Assign the stable 'default' ID
            }

            // Validate and set the current project ID
            currentProjectId = (parsedData.currentProjectId && projects[parsedData.currentProjectId])
                               ? parsedData.currentProjectId
                               : 'default'; // Fallback to default if saved ID is invalid or missing

        } catch (error) {
            console.error("Error parsing saved data:", error);
            // If loading fails, initialize with a fresh default state
            initializeDefaultProject();
        }
    } else {
        // No saved data found, initialize with a fresh default state
        console.log("No saved data found, initializing default project.");
        initializeDefaultProject();
    }
}

/**
 * Initializes the application state with a single 'Default' project.
 * Used when no saved data exists or loading fails.
 */
function initializeDefaultProject() {
    projects = {}; // Clear any potential remnants
    const defaultProject = new Project('Default');
    defaultProject.id = 'default'; // Assign the stable 'default' ID
    projects['default'] = defaultProject;
    currentProjectId = 'default';
}


// --- UI Rendering Functions ---

/**
 * Renders the list of projects in the sidebar.
 * Highlights the currently selected project.
 */
function renderProjects() {
    projectList.innerHTML = ''; // Clear existing list items

    // Sort projects: 'Default' first, then alphabetically by name
    const sortedProjectIds = Object.keys(projects).sort((a, b) => {
        if (a === 'default') return -1; // 'default' always comes first
        if (b === 'default') return 1;
        // Compare names alphabetically for non-default projects
        return projects[a].name.localeCompare(projects[b].name);
    });

    // Create list items for each project
    sortedProjectIds.forEach(projectId => {
        const project = projects[projectId];
        const li = document.createElement('li');
        li.textContent = project.name;
        li.dataset.projectId = project.id; // Store project ID for event listeners
        // Base classes for all project list items
        li.classList.add('p-2', 'rounded-md', 'cursor-pointer', 'hover:bg-gray-200', 'text-gray-700', 'truncate'); // Added truncate

        // Apply special styling for the currently selected project
        if (project.id === currentProjectId) {
            li.classList.add('bg-blue-100', 'text-blue-800', 'font-semibold');
            li.classList.remove('hover:bg-gray-200', 'text-gray-700'); // Remove hover effect for active item
        }

        // Add click listener to switch to this project
        li.addEventListener('click', () => {
            currentProjectId = project.id;
            renderUI(); // Re-render the entire UI when project changes
        });

        projectList.appendChild(li);
    });
}

/**
 * Renders the todos for the currently selected project.
 * Updates the main area title and handles the empty state.
 */
function renderTodos() {
    const currentProject = projects[currentProjectId];

    // Safety check: If the current project doesn't exist (e.g., after deletion), switch to default.
    if (!currentProject) {
        console.warn("Current project not found:", currentProjectId, ". Switching to default.");
        currentProjectId = 'default';
        renderUI(); // Re-render with the default project selected
        return;
    }

    // Update the main area title and delete button state
    currentProjectTitle.textContent = currentProject.name;
    deleteProjectButton.disabled = (currentProjectId === 'default'); // Can't delete the default project

    todoListContainer.innerHTML = ''; // Clear existing todo items

    // Display a message if the project has no todos
    if (currentProject.todos.length === 0) {
        todoListContainer.innerHTML = '<p class="text-gray-500 italic">No tasks yet. Add one below!</p>';
        return;
    }

    // Sort todos: Incomplete first, then by due date (earliest first)
    const sortedTodos = [...currentProject.todos].sort((a, b) => {
        // Primary sort: completed status (false comes first)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1; // Incomplete tasks (false) should appear before completed (true)
        }
        // Secondary sort: due date (earliest first)
        // Handle potentially missing or invalid dates gracefully
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000); // Treat invalid/missing as very far in the future
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
        if (isNaN(dateA.getTime())) return 1; // Invalid dates go last
        if (isNaN(dateB.getTime())) return -1;
        return dateA - dateB; // Sort by date ascending
    });

    // Create and append HTML elements for each sorted todo
    sortedTodos.forEach(todo => {
        const todoElement = createTodoElement(todo, currentProject.id);
        todoListContainer.appendChild(todoElement);
    });
}

/**
 * Returns the Tailwind border color class based on todo priority.
 * @param {string} priority - The priority ('low', 'medium', 'high').
 * @returns {string} Tailwind class for the left border color.
 */
function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'border-red-500';
        case 'medium': return 'border-yellow-500'; // Changed to yellow for medium
        case 'low': return 'border-green-500';
        default: return 'border-gray-300'; // Fallback
    }
}

/**
 * Creates the HTML element for a single todo item.
 * @param {Todo} todo - The todo object to render.
 * @param {string} projectId - The ID of the project this todo belongs to.
 * @returns {HTMLElement} The created div element representing the todo.
 */
function createTodoElement(todo, projectId) {
    const div = document.createElement('div');
    // Base classes + priority border + completed styling
    div.classList.add('p-4', 'border', 'rounded-lg', 'shadow-sm', 'flex', 'items-start', 'gap-4', 'bg-white', getPriorityClass(todo.priority), 'border-l-4', 'transition-opacity', 'duration-300');
    if (todo.completed) {
        div.classList.add('opacity-60', 'bg-gray-50'); // Dim completed tasks
    }

    // --- Checkbox ---
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.classList.add('mt-1', 'form-checkbox', 'h-5', 'w-5', 'text-blue-600', 'rounded', 'border-gray-300', 'focus:ring-blue-500', 'cursor-pointer', 'flex-shrink-0'); // Added flex-shrink-0
    checkbox.addEventListener('change', () => {
        toggleTodoComplete(projectId, todo.id); // Toggle completion status on change
    });

    // --- Todo Content Area ---
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('flex-grow', 'min-w-0'); // Added min-w-0 to help with flex truncation

    // Title
    const title = document.createElement('h4');
    title.textContent = todo.title;
    title.classList.add('font-semibold', 'text-lg', 'text-gray-800', 'break-words'); // Added break-words
    if (todo.completed) {
        title.classList.add('line-through'); // Strikethrough completed titles
    }

    // Description (optional)
    const description = document.createElement('p');
    description.textContent = todo.description;
    description.classList.add('text-sm', 'text-gray-600', 'mt-1', 'break-words'); // Added break-words

    // Due Date
    const dueDate = document.createElement('p');
    dueDate.textContent = `Due: ${todo.dueDate || 'Not set'}`;
    dueDate.classList.add('text-xs', 'text-gray-500', 'mt-1');

    // Notes (optional)
    const notes = document.createElement('p');
    notes.textContent = `Notes: ${todo.notes || 'None'}`;
    notes.classList.add('text-xs', 'text-gray-500', 'mt-1', 'italic', 'break-words'); // Added break-words


    // Append content elements
    contentDiv.appendChild(title);
    if (todo.description) contentDiv.appendChild(description); // Only add if description exists
    contentDiv.appendChild(dueDate);
    if (todo.notes) contentDiv.appendChild(notes); // Only add if notes exist

    // --- Action Buttons Area ---
    const actionsDiv = document.createElement('div');
    actionsDiv.classList.add('flex', 'flex-col', 'sm:flex-row', 'items-end', 'sm:items-center', 'gap-1', 'ml-auto', 'flex-shrink-0'); // Adjusted responsiveness and shrinking

    // Edit Button
    const editButton = document.createElement('button');
    editButton.innerHTML = '<span class="lucide">&#xef7f;</span>'; // Lucide icon: edit / pencil
    editButton.classList.add('text-blue-500', 'hover:text-blue-700', 'p-1', 'rounded', 'hover:bg-blue-100');
    editButton.title = "Edit Task";
    editButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering other clicks if needed
        openEditModal(todo); // Open modal pre-filled with this todo's data
    });

    // Delete Button
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<span class="lucide">&#xe4cf;</span>'; // Lucide icon: trash-2
    deleteButton.classList.add('text-red-500', 'hover:text-red-700', 'p-1', 'rounded', 'hover:bg-red-100');
    deleteButton.title = "Delete Task";
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        // Confirmation dialog before deleting
        if (confirm(`Are you sure you want to delete the task "${todo.title}"?`)) {
            deleteTodo(projectId, todo.id);
        }
    });

    // Append buttons to actions area
    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);

    // --- Assemble Todo Element ---
    div.appendChild(checkbox);
    div.appendChild(contentDiv);
    div.appendChild(actionsDiv);

    return div; // Return the fully constructed todo element
}

/**
 * Renders the entire UI by calling renderProjects and renderTodos.
 * Also saves the current state to localStorage.
 */
function renderUI() {
    console.log("Rendering UI for project:", currentProjectId);
    renderProjects(); // Update the project list sidebar
    renderTodos();    // Update the todo list for the current project
    saveData();       // Persist the current state after rendering
}

// --- Modal Handling ---

/**
 * Opens the modal for adding a new task.
 * Clears the form and sets the modal title.
 */
function openAddModal() {
    editingTodoId = null; // Ensure we are in 'add' mode
    modalTitle.textContent = 'Add New Task';
    todoForm.reset(); // Clear any previous input
    todoIdInput.value = ''; // Ensure hidden ID field is empty
    todoPriorityInput.value = 'medium'; // Set default priority
    todoDueDateInput.valueAsDate = new Date(); // Default due date to today
    todoModal.style.display = 'block'; // Show the modal
    todoTitleInput.focus(); // Focus the title field for convenience
}

/**
 * Opens the modal for editing an existing task.
 * Populates the form with the task's current data.
 * @param {Todo} todo - The todo object to edit.
 */
function openEditModal(todo) {
    editingTodoId = todo.id; // Set the ID of the todo being edited
    modalTitle.textContent = 'Edit Task';
    todoForm.reset(); // Clear form first

    // Populate form fields with todo data
    todoIdInput.value = todo.id; // Set the hidden ID field
    todoTitleInput.value = todo.title;
    todoDescriptionInput.value = todo.description || '';
    todoDueDateInput.value = todo.dueDate || '';
    todoPriorityInput.value = todo.priority || 'medium';
    todoNotesInput.value = todo.notes || '';

    todoModal.style.display = 'block'; // Show the modal
    todoTitleInput.focus(); // Focus the title field
}

/**
 * Closes the add/edit task modal.
 * Resets the editing state.
 */
function closeModal() {
    todoModal.style.display = 'none'; // Hide the modal
    editingTodoId = null; // Clear the editing state
}

// --- Event Listeners ---

/**
 * Handles the submission of the 'Add Project' form.
 */
addProjectForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const projectName = newProjectNameInput.value.trim(); // Get and clean the input value
    if (projectName) {
        // Create and add the new project
        const newProject = new Project(projectName);
        projects[newProject.id] = newProject;
        currentProjectId = newProject.id; // Automatically switch to the new project
        newProjectNameInput.value = ''; // Clear the input field
        renderUI(); // Update the UI to show the new project
    } else {
        alert("Project name cannot be empty."); // Basic validation
    }
});

/**
 * Handles clicks on the 'Delete Project' button.
 */
deleteProjectButton.addEventListener('click', () => {
    // Prevent deleting the default project
    if (currentProjectId === 'default') {
        alert("Cannot delete the default project.");
        return;
    }

    const projectToDelete = projects[currentProjectId];
    // Confirm deletion with the user
    if (projectToDelete && confirm(`Are you sure you want to delete the project "${projectToDelete.name}" and all its tasks? This cannot be undone.`)) {
        delete projects[currentProjectId]; // Remove the project from the state object
        currentProjectId = 'default'; // Switch back to the default project
        renderUI(); // Update the UI
    }
});


// Open Add Todo Modal Button
addTodoButton.addEventListener('click', openAddModal);

// Modal Close Buttons
closeModalButton.addEventListener('click', closeModal);
cancelTodoButton.addEventListener('click', closeModal);

// Close Modal if user clicks outside the modal content
window.addEventListener('click', (event) => {
    if (event.target === todoModal) { // Check if the click was directly on the modal backdrop
        closeModal();
    }
});

/**
 * Handles the submission of the Add/Edit Todo form.
 * Either creates a new todo or updates an existing one.
 */
todoForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    // Get values from form fields
    const title = todoTitleInput.value.trim();
    const description = todoDescriptionInput.value.trim();
    const dueDate = todoDueDateInput.value; // Format: YYYY-MM-DD
    const priority = todoPriorityInput.value;
    const notes = todoNotesInput.value.trim();
    const todoId = todoIdInput.value; // Get ID from hidden input (will be empty if adding)

    // Basic validation
    if (!title || !dueDate) {
        alert("Task title and due date are required.");
        return;
    }

    const currentProject = projects[currentProjectId];
    // Safety check for current project existence
    if (!currentProject) {
        alert("Error: Could not find the current project. Please select a project.");
        closeModal(); // Close modal as operation can't proceed
        return;
    }

    // --- Determine if Adding or Editing ---
    if (todoId && editingTodoId === todoId) {
        // --- Editing existing todo ---
        const todoToUpdate = currentProject.getTodoById(todoId);
        if (todoToUpdate) {
            // Update the properties of the existing todo object
            todoToUpdate.title = title;
            todoToUpdate.description = description;
            todoToUpdate.dueDate = dueDate;
            todoToUpdate.priority = priority;
            todoToUpdate.notes = notes;
            console.log("Todo updated:", todoToUpdate);
        } else {
             // This case should ideally not happen if UI is consistent
             console.error("Error: Tried to edit a todo that doesn't exist in the current project.", todoId);
             alert("Error updating task. Task not found. Please refresh.");
             closeModal();
             renderUI(); // Re-render to ensure consistency
             return;
        }
    } else {
        // --- Adding new todo ---
        const newTodo = new Todo(title, description, dueDate, priority, notes);
        currentProject.addTodo(newTodo); // Add the new todo to the current project
        console.log("Todo added:", newTodo);
    }

    // Close the modal and refresh the UI
    closeModal();
    renderUI();
});


// --- Core Action Functions (called by event handlers or other functions) ---

/**
 * Deletes a specific todo from a specific project.
 * @param {string} projectId - The ID of the project containing the todo.
 * @param {string} todoId - The ID of the todo to delete.
 */
function deleteTodo(projectId, todoId) {
    const project = projects[projectId];
    if (project) {
        project.removeTodo(todoId); // Use the Project class method
        console.log(`Todo ${todoId} deleted from project ${projectId}`);
        renderUI(); // Re-render the UI to reflect the deletion
    } else {
        console.error(`Project with ID ${projectId} not found when trying to delete todo ${todoId}`);
    }
}

/**
 * Toggles the completion status of a specific todo.
 * @param {string} projectId - The ID of the project containing the todo.
 * @param {string} todoId - The ID of the todo to toggle.
 */
function toggleTodoComplete(projectId, todoId) {
    const project = projects[projectId];
    const todo = project?.getTodoById(todoId); // Safely access getTodoById
    if (todo) {
        todo.completed = !todo.completed; // Flip the boolean status
        console.log(`Todo "${todo.title}" marked as ${todo.completed ? 'complete' : 'incomplete'}`);
        renderUI(); // Re-render the UI to show the change (strikethrough, opacity)
    } else {
         console.error(`Could not find todo ${todoId} in project ${projectId} to toggle complete status.`);
    }
}


// --- Initial Load ---
// Set up the application when the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. Initializing application.");
    loadData(); // Load data from localStorage (or initialize defaults)
    renderUI(); // Render the initial user interface based on loaded data
});
