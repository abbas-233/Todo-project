import { Project } from './project.js';
import { Todo } from './todo.js';

const STORAGE_KEY = 'todoAppData'; // Key used to store data in localStorage

/**
 * Saves the provided application state to localStorage.
 * @param {object} projects - The projects object.
 * @param {string} currentProjectId - The ID of the currently active project.
 */
export function saveData(projects, currentProjectId) {
    const dataToSave = {
        projects,
        currentProjectId
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("Data saved via storage module:", dataToSave);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
        // In a real app, might show a user-facing error message
    }
}

/**
 * Loads the application state from localStorage.
 * Re-hydrates the plain objects back into class instances.
 * @returns {{projects: object, currentProjectId: string}} The loaded application state.
 */
export function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    let projects = {};
    let currentProjectId = 'default';

    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            console.log("Data loaded via storage module:", parsedData);

            // Re-hydrate projects and todos
            if (parsedData.projects) {
                Object.values(parsedData.projects).forEach(projData => {
                    const project = new Project(projData.name);
                    project.id = projData.id; // Restore original ID
                    project.todos = projData.todos.map(todoData => {
                        const todo = new Todo(
                            todoData.title,
                            todoData.description,
                            todoData.dueDate,
                            todoData.priority,
                            todoData.notes || '',
                            todoData.completed || false
                        );
                        todo.id = todoData.id; // Restore original ID
                        return todo;
                    });
                    projects[project.id] = project;
                });
            }

            // Ensure default project exists
            if (!projects['default']) {
                initializeDefaultProject(projects); // Pass projects to modify
            }

            // Validate and set current project ID
            currentProjectId = (parsedData.currentProjectId && projects[parsedData.currentProjectId])
                               ? parsedData.currentProjectId
                               : 'default';

        } catch (error) {
            console.error("Error parsing saved data:", error);
            initializeDefaultProject(projects); // Initialize fresh if loading fails
            currentProjectId = 'default';
        }
    } else {
        console.log("No saved data found, initializing default project.");
        initializeDefaultProject(projects); // Initialize fresh if no data found
        currentProjectId = 'default';
    }

    return { projects, currentProjectId };
}

/**
 * Initializes the default project if it doesn't exist.
 * Modifies the passed projects object directly.
 * @param {object} projectsObj - The projects object to potentially modify.
 */
function initializeDefaultProject(projectsObj) {
    if (!projectsObj['default']) {
        const defaultProject = new Project('Default');
        defaultProject.id = 'default'; // Assign the stable 'default' ID
        projectsObj['default'] = defaultProject;
        console.log("Initialized default project in storage module.");
    }
}
