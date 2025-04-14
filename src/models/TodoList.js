import { Todo } from './Todo.js';
import { saveData, loadData } from '../storage.js';

class TodoList {
    constructor() {
        this.projects = {};
        this.selectedProject = null;
        this.categories = Todo.getCategories();
        this.priorities = Todo.getPriorities();
        this.recurrences = Todo.getRecurrences();
        this.templates = new Map();
        this.analyticsData = {
            totalTasks: 0,
            completedTasks: 0,
            averageTimeSpent: 0,
            urgentTasks: 0,
            importantTasks: 0
        };
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

    getAllProjects() {
        return Object.values(this.projects);
    }

    deleteProject(id) {
        if (this.selectedProject?.id === id) {
            this.selectedProject = null;
        }
        delete this.projects[id];
        this.save();
    }

    // Todo Management
    addTodo(projectId, todoData) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error('Project not found');

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

        project.todos.push(todo);
        project.lastModified = new Date();
        this.updateAnalytics();
        this.save();
        return todo;
    }

    updateTodo(projectId, todoId, updates) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error('Project not found');

        const todo = project.todos.find(t => t.id === todoId);
        if (!todo) throw new Error('Todo not found');

        Object.assign(todo, updates);
        todo.lastModified = new Date();
        project.lastModified = new Date();
        this.updateAnalytics();
        this.save();
    }

    deleteTodo(projectId, todoId) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error('Project not found');

        project.todos = project.todos.filter(t => t.id !== todoId);
        project.lastModified = new Date();
        this.updateAnalytics();
        this.save();
    }

    // Template Management
    createTemplate(todo) {
        const template = {
            ...todo,
            templateId: Date.now().toString()
        };
        this.templates.set(template.templateId, template);
        this.save();
        return template;
    }

    getTemplateById(templateId) {
        return this.templates.get(templateId);
    }

    deleteTemplate(templateId) {
        this.templates.delete(templateId);
        this.save();
    }

    // Analytics
    updateAnalytics() {
        this.analyticsData = {
            totalTasks: 0,
            completedTasks: 0,
            averageTimeSpent: 0,
            urgentTasks: 0,
            importantTasks: 0
        };

        Object.values(this.projects).forEach(project => {
            project.todos.forEach(todo => {
                this.analyticsData.totalTasks++;
                if (todo.completed) this.analyticsData.completedTasks++;
                if (todo.isUrgent()) this.analyticsData.urgentTasks++;
                if (todo.isImportant()) this.analyticsData.importantTasks++;
                this.analyticsData.averageTimeSpent += todo.timeSpent;
            });
        });

        if (this.analyticsData.totalTasks > 0) {
            this.analyticsData.averageTimeSpent /= this.analyticsData.totalTasks;
        }
    }

    // Data Management
    save() {
        saveData('todoList', {
            projects: this.projects,
            selectedProjectId: this.selectedProject?.id,
            analyticsData: this.analyticsData,
            templates: Array.from(this.templates.entries())
        });
    }

    load() {
        const data = loadData('todoList');
        if (data) {
            this.projects = data.projects;
            this.analyticsData = data.analyticsData;
            
            // Rebuild templates Map
            this.templates = new Map(data.templates);
            
            // Rebuild Todo instances
            this.projects = Object.fromEntries(
                Object.entries(this.projects).map(([id, proj]) => {
                    proj.todos = proj.todos.map(todo => {
                        const t = new Todo(
                            todo.title,
                            todo.description,
                            todo.dueDate,
                            todo.priority,
                            todo.notes,
                            todo.completed,
                            todo.category,
                            todo.isRecurring,
                            todo.recurrence,
                            todo.tags,
                            todo.dependencies,
                            todo.subtasks,
                            todo.timeSpent,
                            todo.templateId
                        );
                        t.id = todo.id;
                        t.lastModified = todo.lastModified;
                        t.createdDate = todo.createdDate;
                        return t;
                    });
                    return [id, proj];
                })
            );
            
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

    // Project Selection
    selectProject(projectId) {
        const project = this.getProjectById(projectId);
        if (project) {
            this.selectedProject = project;
            this.save();
        }
    }

    // Search and Filtering
    searchTodos(query = '') {
        const terms = query.toLowerCase().split(' ');
        return Object.values(this.projects)
            .flatMap(project => project.todos)
            .filter(todo => {
                const text = `${todo.title} ${todo.description} ${todo.notes}`.toLowerCase();
                return terms.every(term => text.includes(term));
            });
    }

    filterTodos(filter = 'all') {
        return Object.values(this.projects)
            .flatMap(project => project.todos)
            .filter(todo => {
                switch (filter) {
                    case 'completed':
                        return todo.completed;
                    case 'active':
                        return !todo.completed;
                    case 'urgent':
                        return todo.isUrgent();
                    case 'important':
                        return todo.isImportant();
                    default:
                        return true;
                }
            });
    }

    // Sorting
    sortTodos(sortBy = 'priority') {
        return Object.values(this.projects)
            .flatMap(project => project.todos)
            .sort((a, b) => {
                switch (sortBy) {
                    case 'priority':
                        return Todo.getPriorities().indexOf(b.priority) - Todo.getPriorities().indexOf(a.priority);
                    case 'dueDate':
                        return new Date(a.dueDate) - new Date(b.dueDate);
                    case 'created':
                        return new Date(b.createdDate) - new Date(a.createdDate);
                    case 'modified':
                        return new Date(b.lastModified) - new Date(a.lastModified);
                    default:
                        return 0;
                }
            });
    }
}

export { TodoList };
