import { Todo } from '../models/Todo.js';

class UI {
    constructor(todoList) {
        this.todoList = todoList;
        this.projectContainer = document.getElementById('projects');
        this.todoContainer = document.getElementById('todos');
        this.todoForm = document.getElementById('todo-form');
        this.projectForm = document.getElementById('project-form');
        
        this.setupEventListeners();
    }

    initialize() {
        this.renderProjects();
        if (this.todoList.selectedProject) {
            this.renderTodos(this.todoList.selectedProject);
        }
    }

    setupEventListeners() {
        // Project form submission
        this.projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const projectName = this.projectForm['project-name'].value;
            if (projectName) {
                const project = this.todoList.createProject(projectName);
                this.todoList.saveToStorage();
                this.renderProjects();
                this.projectForm.reset();
            }
        });

        // Todo form submission
        this.todoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = this.todoForm['todo-title'].value;
            const description = this.todoForm['todo-description'].value;
            const dueDate = this.todoForm['todo-due-date'].value;
            const priority = this.todoForm['todo-priority'].value;

            if (title && this.todoList.selectedProject) {
                const todo = new Todo(title, description, dueDate, priority);
                this.todoList.selectedProject.addTodo(todo);
                this.todoList.saveToStorage();
                this.renderTodos(this.todoList.selectedProject);
                this.todoForm.reset();
            }
        });

        // Project selection
        this.projectContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('project-item')) {
                const projectId = e.target.dataset.projectId;
                this.todoList.selectProject(projectId);
                this.renderTodos(this.todoList.selectedProject);
            }
        });

        // Todo actions (complete, delete)
        this.todoContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('todo-complete')) {
                const todoId = e.target.closest('.todo-item').dataset.todoId;
                const todo = this.todoList.selectedProject.todos.find(t => t.id === todoId);
                todo.toggleComplete();
                this.todoList.saveToStorage();
                this.renderTodos(this.todoList.selectedProject);
            }

            if (e.target.classList.contains('todo-delete')) {
                const todoId = e.target.closest('.todo-item').dataset.todoId;
                this.todoList.selectedProject.removeTodo(todoId);
                this.todoList.saveToStorage();
                this.renderTodos(this.todoList.selectedProject);
            }
        });
    }

    renderProjects() {
        this.projectContainer.innerHTML = '';
        this.todoList.projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'project-item';
            div.dataset.projectId = project.id;
            div.innerHTML = `
                <span>${project.name}</span>
                <span class="project-count">${project.todos.length}</span>
            `;
            if (project === this.todoList.selectedProject) {
                div.classList.add('selected');
            }
            this.projectContainer.appendChild(div);
        });
    }

    renderTodos(project) {
        this.todoContainer.innerHTML = '';
        project.todos.forEach(todo => {
            const div = document.createElement('div');
            div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            div.dataset.todoId = todo.id;
            div.innerHTML = `
                <div class="todo-header">
                    <input type="checkbox" class="todo-complete" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-title">${todo.title}</span>
                    <span class="todo-priority ${todo.priority}">${todo.priority}</span>
                    <span class="todo-date">${todo.formattedDueDate}</span>
                </div>
                <div class="todo-details">
                    <p>${todo.description}</p>
                </div>
                <button class="todo-delete">Delete</button>
            `;
            this.todoContainer.appendChild(div);
        });
    }
}

export { UI };
