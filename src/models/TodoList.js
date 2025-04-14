import { Todo } from './Todo.js';
import { saveData, loadData } from '../storage.js';

class TodoList {
    constructor() {
        this.projects = {};
        this.selectedProject = null;
        this.categories = Todo.getCategories();
        this.priorities = Todo.getPriorities();
        this.recurrences = Todo.getRecurrences();
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
            todoData.timeSpent
        );

        project.todos.push(todo);
        project.lastModified = new Date();
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
        this.save();
    }

    deleteTodo(projectId, todoId) {
        const project = this.getProjectById(projectId);
        if (!project) throw new Error('Project not found');

        project.todos = project.todos.filter(t => t.id !== todoId);
        project.lastModified = new Date();
        this.save();
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
                        return todo.priority === 'high';
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

    // Analytics
    getAnalytics() {
        const analytics = {
            totalTasks: 0,
            completedTasks: 0,
            averageTimeSpent: 0,
            urgentTasks: 0,
            importantTasks: 0,
            byCategory: {},
            byPriority: {},
            byStatus: {
                completed: 0,
                active: 0
            }
        };

        Object.values(this.projects).forEach(project => {
            project.todos.forEach(todo => {
                analytics.totalTasks++;
                if (todo.completed) {
                    analytics.completedTasks++;
                    analytics.byStatus.completed++;
                } else {
                    analytics.byStatus.active++;
                }
                
                analytics.averageTimeSpent += todo.timeSpent;
                
                if (todo.isUrgent()) {
                    analytics.urgentTasks++;
                }
                
                if (todo.priority === 'high') {
                    analytics.importantTasks++;
                }
                
                // Update category counts
                if (todo.category) {
                    analytics.byCategory[todo.category] = 
                        (analytics.byCategory[todo.category] || 0) + 1;
                }
                
                // Update priority counts
                analytics.byPriority[todo.priority] =
                    (analytics.byPriority[todo.priority] || 0) + 1;
            });
        });

        // Calculate average time spent
        if (analytics.totalTasks > 0) {
            analytics.averageTimeSpent /= analytics.totalTasks;
        }

        return analytics;
    }

    // Progress
    getProjectProgress(projectId) {
        const project = this.getProjectById(projectId);
        if (!project) return { completed: 0, total: 0 };

        const completed = project.todos.filter(todo => todo.completed).length;
        const total = project.todos.length;
        return { completed, total };
    }
}

export { TodoList };
