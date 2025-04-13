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
        currentProjectId,
        templates: Array.from(templates.values()), // Save templates
        analyticsData // Save analytics data
    };
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("Data saved via storage module:", dataToSave);
    } catch (error) {
        console.error("Error saving data to localStorage:", error);
    }
}

/**
 * Loads the application state from localStorage.
 * Re-hydrates the plain objects back into class instances.
 * @returns {{projects: object, currentProjectId: string, templates: Map, analyticsData: object}} The loaded application state.
 */
export function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    let projects = {};
    let currentProjectId = 'default';
    let templates = new Map();
    let analyticsData = {
        totalTasks: 0,
        completedTasks: 0,
        averageTimeSpent: 0,
        urgentTasks: 0,
        importantTasks: 0
    };

    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            console.log("Data loaded via storage module:", parsedData);

            // Re-hydrate projects and todos
            if (parsedData.projects) {
                Object.values(parsedData.projects).forEach(projData => {
                    const project = new Project(projData.name);
                    project.id = projData.id;
                    project.category = projData.category;
                    project.todos = projData.todos.map(todoData => {
                        const todo = new Todo(
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
                            todoData.dependencies,
                            todoData.subtasks,
                            todoData.timeSpent,
                            todoData.templateId
                        );
                        todo.id = todoData.id;
                        todo.createdDate = new Date(todoData.createdDate);
                        todo.lastModified = new Date(todoData.lastModified);
                        return todo;
                    });
                    projects[project.id] = project;
                });
            }

            // Re-hydrate templates
            if (parsedData.templates) {
                parsedData.templates.forEach(templateData => {
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
                    template.id = templateData.id;
                    templates.set(template.id, template);
                });
            }

            // Load analytics data
            if (parsedData.analyticsData) {
                analyticsData = parsedData.analyticsData;
            }

            // Validate and set current project ID
            currentProjectId = (parsedData.currentProjectId && projects[parsedData.currentProjectId])
                               ? parsedData.currentProjectId
                               : 'default';

        } catch (error) {
            console.error("Error parsing saved data:", error);
            initializeDefaultProject(projects);
            currentProjectId = 'default';
        }
    } else {
        console.log("No saved data found, initializing default project.");
        initializeDefaultProject(projects);
        currentProjectId = 'default';
    }

    return { projects, currentProjectId, templates, analyticsData };
}

/**
 * Initializes the default project if it doesn't exist.
 * Modifies the passed projects object directly.
 * @param {object} projectsObj - The projects object to potentially modify.
 */
function initializeDefaultProject(projectsObj) {
    if (!projectsObj['default']) {
        const defaultProject = new Project('Default');
        defaultProject.id = 'default';
        defaultProject.category = 'general';
        projectsObj['default'] = defaultProject;
        console.log("Initialized default project in storage module.");
    }
}
