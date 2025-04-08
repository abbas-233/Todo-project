import { Project } from './Project.js';

class TodoList {
    constructor() {
        this.projects = [];
        this.selectedProject = null;
        
        // Create default project
        this.createDefaultProject();
    }

    createDefaultProject() {
        const defaultProject = new Project('Default');
        this.projects.push(defaultProject);
        this.selectedProject = defaultProject;
    }

    createProject(name) {
        const project = new Project(name);
        this.projects.push(project);
        return project;
    }

    removeProject(projectId) {
        this.projects = this.projects.filter(project => project.id !== projectId);
    }

    getProjectById(id) {
        return this.projects.find(project => project.id === id);
    }

    saveToStorage() {
        localStorage.setItem('todoProjects', JSON.stringify(this.projects));
        localStorage.setItem('selectedProject', this.selectedProject?.id || '');
    }

    loadFromStorage() {
        const savedProjects = localStorage.getItem('todoProjects');
        const selectedProjectId = localStorage.getItem('selectedProject');
        
        if (savedProjects) {
            this.projects = JSON.parse(savedProjects).map(project => {
                const proj = new Project(project.name);
                proj.id = project.id;
                proj.todos = project.todos.map(todo => {
                    const t = new Todo(todo.title, todo.description, todo.dueDate, todo.priority);
                    t.id = todo.id;
                    t.completed = todo.completed;
                    return t;
                });
                return proj;
            });
            
            if (selectedProjectId) {
                this.selectedProject = this.getProjectById(selectedProjectId);
            }
        } else {
            this.createDefaultProject();
        }
    }

    selectProject(projectId) {
        this.selectedProject = this.getProjectById(projectId);
    }
}

export { TodoList };
