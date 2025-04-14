import { Todo } from './Todo.js';
import { saveData, loadData } from '../utils/storage.js';

// Constants
const DEFAULT_PROJECT_NAME = 'Default Project';
const ERROR_PROJECT_NOT_FOUND = 'Project not found';
const ERROR_PROJECT_NAME_EMPTY = 'Project name cannot be empty';
const ERROR_PROJECT_NAME_EXISTS = 'Project with this name already exists';

/**
 * Class representing a Todo List.
 * Handles project and todo management, as well as data persistence.
 */
class TodoList {
    constructor() {
        /** @type {Object} Stores all projects by their ID. */
        this.projects = {};
        /** @type {Object|null} The currently selected project. */
        this.selectedProject = null;
        this.load();
    }

    /**
     * Saves the current state of the TodoList to localStorage.
     */
    save() {
        saveData({
            projects: this.projects,
            selectedProjectId: this.selectedProject?.id
        });
    }

    /**
     * Loads the TodoList state from localStorage.
     */
    load() {
        const data = loadData();
        if (data) {
            this.projects = data.projects || {};
            this.selectedProject = this.getProjectById(data.selectedProjectId);
        } else {
            this.createDefaultProject();
        }
    }

    /**
     * Creates a default project if no projects exist.
     */
    createDefaultProject() {
        try {
            this.createProject(DEFAULT_PROJECT_NAME);
        } catch (error) {
            console.error('Error creating default project:', error);
        }
    }

    /**
     * Creates a new project.
     * @param {string} name - The name of the project.
     * @returns {Object} The created project.
     * @throws Will throw an error if the project name is empty or already exists.
     */
    createProject(name) {
        if (!name || name.trim() === '') {
            throw new Error(ERROR_PROJECT_NAME_EMPTY);
        }
        if (this.getProjectByName(name)) {
            throw new Error(ERROR_PROJECT_NAME_EXISTS);
        }

        const project = {
            id: Date.now().toString(),
            name: name.trim(),
            todos: [],
            createdDate: new Date(),
            lastModified: new Date()
        };

        this.projects[project.id] = project;
        this.save();
        return project;
    }

    /**
     * Retrieves a project by its ID.
     * @param {string} id - The ID of the project.
     * @returns {Object|null} The project, or null if not found.
     */
    getProjectById(id) {
        return this.projects[id];
    }

    /**
     * Retrieves a project by its name.
     * @param {string} name - The name of the project.
     * @returns {Object|null} The project, or null if not found.
     */
    getProjectByName(name) {
        return Object.values(this.projects).find(p => p.name === name);
    }

    /**
     * Adds a new todo to a project.
     * @param {string} projectId - The ID of the project.
     * @param {string} title - The title of the todo.
     * @returns {Object} The created todo.
     * @throws Will throw an error if the project is not found.
     */
    addTodo(projectId, title) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error(ERROR_PROJECT_NOT_FOUND);

        const todo = new Todo(title);
        project.todos.push(todo);
        project.lastModified = new Date();
        this.save();
        return todo;
    }

    /**
     * Deletes a todo from a project.
     * @param {string} projectId - The ID of the project.
     * @param {string} todoId - The ID of the todo.
     * @throws Will throw an error if the project is not found.
     */
    deleteTodo(projectId, todoId) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error(ERROR_PROJECT_NOT_FOUND);

        project.todos = project.todos.filter(t => t.id !== todoId);
        project.lastModified = new Date();
        this.save();
    }

    /**
     * Selects a project by its ID.
     * @param {string} projectId - The ID of the project.
     */
    selectProject(projectId) {
        const project = this.getProjectById(projectId);
        if (project) {
            this.selectedProject = project;
            this.save();
        }
    }
}

export { TodoList };
