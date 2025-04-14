import { Todo } from './Todo.js';
import { saveData, loadData } from './storage.js';

class TodoList {
    constructor() {
        this.projects = {};
        this.selectedProject = null;
        this.load();
    }

    // Project Management
    createProject(name) {
        if (!name || name.trim() === '') {
            throw new Error('Project name cannot be empty');
        }
        if (this.getProjectByName(name)) {
            throw new Error('Project with this name already exists');
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

    getProjectById(id) {
        return this.projects[id];
    }

    getProjectByName(name) {
        return Object.values(this.projects).find(p => p.name === name);
    }

    deleteProject(id) {
        if (this.selectedProject?.id === id) {
            this.selectedProject = null;
        }
        delete this.projects[id];
        this.save();
    }

    // Todo Management
    addTodo(projectId, title) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error('Project not found');

        const todo = new Todo(title);
        project.todos.push(todo);
        project.lastModified = new Date();
        this.save();
        return todo;
    }

    deleteTodo(projectId, todoId) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error('Project not found');

        project.todos = project.todos.filter(t => t.id !== todoId);
        project.lastModified = new Date();
        this.save();
    }

    // Data Management
    save() {
        saveData('todoList', {
            projects: this.projects,
            selectedProjectId: this.selectedProject?.id
        });
    }

    load() {
        const data = loadData('todoList');
        if (data) {
            this.projects = data.projects;
            if (data.selectedProjectId) {
                this.selectedProject = this.getProjectById(data.selectedProjectId);
            }
        } else {
            this.createDefaultProject();
        }
    }

    createDefaultProject() {
        try {
            this.createProject('Default Project');
        } catch (error) {
            console.error('Error creating default project:', error);
        }
    }

    selectProject(projectId) {
        const project = this.getProjectById(projectId);
        if (project) {
            this.selectedProject = project;
            this.save();
        }
    }
}

export { TodoList };
