// This module handles DOM manipulation and rendering.
// It needs references to the DOM elements.

import BasePage from '../components/BasePage.js';

export default class UI extends BasePage {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        // Create navigation
        const navigation = this.createElement('div', 'flex justify-between items-center bg-white shadow-sm');
        
        // Left side: Logo and Project Switcher
        const leftSide = this.createElement('div', 'flex items-center gap-4');
        
        const logo = this.createElement('div', 'text-xl font-bold text-blue-600');
        logo.textContent = 'Todo List';
        
        const projectSwitcher = this.createElement('div', 'relative');
        projectSwitcher.innerHTML = `
            <button id="project-switcher-button" class="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100">
                <span class="lucide">&#xe900;</span>
                <span>Projects</span>
                <span class="lucide">&#xe6c2;</span>
            </button>
            <div id="project-switcher-menu" class="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg hidden">
                <!-- Projects will be added dynamically -->
            </div>
        `;
        
        leftSide.appendChild(logo);
        leftSide.appendChild(projectSwitcher);
        
        // Right side: Search and Settings
        const rightSide = this.createElement('div', 'flex items-center gap-4');
        
        const searchInput = this.createElement('input', 'px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search tasks...';
        
        const settingsButton = this.createElement('button', 'p-2 rounded-md hover:bg-gray-100');
        settingsButton.innerHTML = '<span class="lucide">&#xe897;</span>';
        
        rightSide.appendChild(searchInput);
        rightSide.appendChild(settingsButton);
        
        navigation.appendChild(leftSide);
        navigation.appendChild(rightSide);
        
        // Create footer
        const footer = this.createElement('footer', 'bg-gray-100 mt-12');
        footer.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">About</h3>
                        <p class="text-gray-600">A simple and elegant todo list application to help you stay organized and productive.</p>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-600 hover:text-blue-600">Features</a></li>
                            <li><a href="#" class="text-gray-600 hover:text-blue-600">Documentation</a></li>
                            <li><a href="#" class="text-gray-600 hover:text-blue-600">Support</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Contact</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-600 hover:text-blue-600">Email</a></li>
                            <li><a href="#" class="text-gray-600 hover:text-blue-600">Twitter</a></li>
                            <li><a href="#" class="text-gray-600 hover:text-blue-600">GitHub</a></li>
                        </ul>
                    </div>
                </div>
                <div class="mt-8 border-t border-gray-200 pt-8 text-center text-gray-500">
                    <p>&copy; 2025 Todo List. All rights reserved.</p>
                </div>
            </div>
        `;
        
        // Add elements to document
        document.getElementById('navigation').appendChild(navigation);
        document.getElementById('footer').appendChild(footer);
    }

    // Project Management
    renderProjects(projects, currentProjectId, onSelect) {
        const projectsList = this.createElement('div', 'space-y-4');
        
        // Create "All Projects" option
        const allProjects = this.createElement('div', 'project-item hover:bg-gray-100 rounded-md p-2 cursor-pointer');
        allProjects.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="lucide">&#xe900;</span>
                    <span>All Projects</span>
                </div>
                <span class="text-sm text-gray-600">${Object.values(projects).reduce((total, p) => total + p.todos.length, 0)} tasks</span>
            </div>
        `;
        
        if (currentProjectId === 'all') {
            allProjects.classList.add('bg-gray-100');
        }
        
        allProjects.addEventListener('click', () => onSelect('all'));
        projectsList.appendChild(allProjects);
        
        // Create divider
        const divider = this.createElement('div', 'border-t border-gray-200 my-2');
        projectsList.appendChild(divider);
        
        // Create individual project items
        Object.values(projects).forEach(project => {
            const projectItem = this.createElement('div', 'project-item hover:bg-gray-100 rounded-md p-2 cursor-pointer');
            projectItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="lucide">&#xe900;</span>
                        <span>${project.name}</span>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="text-sm text-gray-600">${project.todos.length} tasks</span>
                        <span class="text-xs text-gray-400">Last modified: ${new Date(project.lastModified).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
            
            if (project.id === currentProjectId) {
                projectItem.classList.add('bg-gray-100');
            }
            
            projectItem.addEventListener('click', () => onSelect(project.id));
            projectsList.appendChild(projectItem);
        });
        
        return projectsList;
    }

    // Todo Management
    renderTodos(project, onToggleComplete, onEdit, onDelete, progress) {
        const todosContainer = this.createElement('div', 'space-y-4');
        
        // Progress bar
        if (progress && progress.total > 0) {
            const progressCard = this.createElement('div', 'bg-white p-4 rounded-lg shadow-md');
            progressCard.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">Project Progress</h3>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${Math.round((progress.completed / progress.total) * 100)}%"></div>
                </div>
                <div class="flex justify-between text-sm text-gray-600 mt-2">
                    <span>${progress.completed} completed</span>
                    <span>${progress.total} total</span>
                </div>
            `;
            todosContainer.appendChild(progressCard);
        }
        
        // Todo items
        project.todos.forEach(todo => {
            const todoElement = this.createTodoElement(todo, project.id, onToggleComplete, onEdit, onDelete);
            todosContainer.appendChild(todoElement);
        });
        
        return todosContainer;
    }

    // Modal Management
    openModal(todoToEdit = null) {
        const modal = document.getElementById('todo-modal');
        if (modal) {
            modal.classList.add('show');
            
            const title = modal.querySelector('#modal-title');
            if (title) {
                title.textContent = todoToEdit ? 'Edit Task' : 'Add New Task';
            }

            // Clear form
            const form = modal.querySelector('#todo-form');
            if (form) {
                form.reset();
                
                if (todoToEdit) {
                    // Populate form with todo data
                    Object.entries(todoToEdit).forEach(([key, value]) => {
                        const field = form.querySelector(`[name="${key}"]`);
                        if (field) {
                            if (field.type === 'checkbox') {
                                field.checked = value;
                            } else {
                                field.value = value;
                            }
                        }
                    });
                }
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('todo-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    // Form Management
    getFormData() {
        const form = document.getElementById('todo-form');
        if (!form) return null;
        
        const formData = {};
        form.querySelectorAll('input, select, textarea').forEach(field => {
            formData[field.name] = field.value;
        });
        
        // Handle checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            formData[checkbox.name] = checkbox.checked;
        });
        
        return formData;
    }

    // Analytics
    renderAnalyticsDashboard(analyticsData) {
        const dashboard = this.createElement('div', 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6');
        
        // Total Tasks
        const totalTasks = this.createElement('div', 'bg-white p-6 rounded-lg shadow-md');
        totalTasks.innerHTML = `
            <div class="text-gray-500 text-sm mb-2">Total Tasks</div>
            <p class="text-2xl font-bold text-blue-600">${analyticsData.totalTasks}</p>
        `;
        dashboard.appendChild(totalTasks);
        
        // Completed Tasks
        const completedTasks = this.createElement('div', 'bg-white p-6 rounded-lg shadow-md');
        completedTasks.innerHTML = `
            <div class="text-gray-500 text-sm mb-2">Completed</div>
            <p class="text-2xl font-bold text-green-600">${analyticsData.completedTasks}</p>
        `;
        dashboard.appendChild(completedTasks);
        
        // Average Time
        const avgTime = this.createElement('div', 'bg-white p-6 rounded-lg shadow-md');
        avgTime.innerHTML = `
            <div class="text-gray-500 text-sm mb-2">Avg Time Spent</div>
            <p class="text-2xl font-bold text-gray-600">${Math.round(analyticsData.averageTimeSpent)} min</p>
        `;
        dashboard.appendChild(avgTime);
        
        // Urgent Tasks
        const urgentTasks = this.createElement('div', 'bg-white p-6 rounded-lg shadow-md');
        urgentTasks.innerHTML = `
            <div class="text-gray-500 text-sm mb-2">Urgent Tasks</div>
            <p class="text-2xl font-bold text-red-600">${analyticsData.urgentTasks}</p>
        `;
        dashboard.appendChild(urgentTasks);
        
        return dashboard;
    }

    // Templates
    renderTemplates(templates) {
        const templatesList = this.createElement('div', 'space-y-4');
        
        templates.forEach(template => {
            const templateCard = this.createElement('div', 'bg-white p-4 rounded-lg shadow-md');
            templateCard.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">${template.title}</h3>
                <p class="text-gray-600">${template.description || 'No description'}</p>
                <div class="mt-2 flex justify-end">
                    <button class="text-blue-500 hover:text-blue-700">Use Template</button>
                </div>
            `;
            templatesList.appendChild(templateCard);
        });
        
        return templatesList;
    }

    // Helper Methods
    createTodoElement(todo, projectId, onToggleComplete, onEdit, onDelete) {
        const div = this.createElement('div', 'bg-white p-4 rounded-lg shadow-sm');
        
        // Checkbox
        const checkbox = this.createElement('input', 'mr-2');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => onToggleComplete(projectId, todo.id));
        
        // Content
        const contentDiv = this.createElement('div', 'flex-1');
        
        // Title and Description
        const titleDiv = this.createElement('div', 'flex justify-between items-start');
        const title = this.createElement('h3', 'text-lg font-semibold');
        title.textContent = todo.title;
        
        // Due Date
        const dueDate = this.createElement('div', 'text-sm text-gray-500');
        dueDate.textContent = `Due: ${todo.dueDate || 'No date'}`;
        
        if (todo.isUrgent()) {
            const urgencyBadge = this.createElement('span', 'ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full');
            urgencyBadge.textContent = 'URGENT';
            dueDate.appendChild(urgencyBadge);
        }

        // Progress bar for subtasks
        if (todo.subtasks && todo.subtasks.length > 0) {
            const progressDiv = this.createElement('div', 'mt-2');
            progressDiv.innerHTML = `
                <div class="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>${todo.getSubtaskProgress()}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${todo.getSubtaskProgress()}%"></div>
                </div>
            `;
            contentDiv.appendChild(progressDiv);
        }

        // Actions
        const actionsDiv = this.createElement('div', 'flex items-center gap-2 ml-auto');
        
        // Edit button
        const editButton = this.createElement('button', 'text-blue-500 hover:text-blue-700');
        editButton.innerHTML = '<span class="lucide">&#xef7f;</span>';
        editButton.title = "Edit Task";
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            onEdit(todo);
        });

        // Delete button
        const deleteButton = this.createElement('button', 'text-red-500 hover:text-red-700');
        deleteButton.innerHTML = '<span class="lucide">&#xe4cf;</span>';
        deleteButton.title = "Delete Task";
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete the task "${todo.title}"?`)) {
                onDelete(projectId, todo.id);
            }
        });

        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);

        div.appendChild(checkbox);
        div.appendChild(contentDiv);
        div.appendChild(actionsDiv);
        
        return div;
    }

    // Error Handling
    showError(message) {
        const errorDiv = this.createElement('div', 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative');
        errorDiv.innerHTML = `
            <span class="text-red-500">⚠️</span>
            <span class="ml-2">${message}</span>
        `;
        const container = document.querySelector('.main-content');
        if (container) {
            container.insertBefore(errorDiv, container.firstChild);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }
}
