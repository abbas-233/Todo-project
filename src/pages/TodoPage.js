import UI from '../UI/UI.js';

export default class TodoPage {
    constructor() {
        this.initializeComponents();
        this.render();
        this.addEventListeners();
        this.initializeDarkMode();
    }

    initializeComponents() {
        // Create navigation
        const navigation = document.createElement('div');
        navigation.id = 'navigation';
        navigation.innerHTML = `
            <nav>
                <!-- Navigation content here -->
            </nav>
        `;
        document.body.appendChild(navigation);

        // Create footer
        const footer = document.createElement('div');
        footer.id = 'footer';
        footer.innerHTML = `
            <footer>
                <!-- Footer content here -->
            </footer>
        `;
        document.body.appendChild(footer);

        // Create main content container
        this.main = document.createElement('main');
        this.main.className = 'max-w-7xl mx-auto px-4 py-8';
        document.body.appendChild(this.main);
    }

    render() {
        // Project Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-6';
        
        const title = document.createElement('h1');
        title.id = 'current-project-title';
        title.className = 'text-3xl font-bold text-gray-800 dark:text-gray-200';
        title.textContent = 'Default';
        
        const buttons = document.createElement('div');
        buttons.className = 'flex items-center gap-4';

        const addProjectButton = document.createElement('button');
        addProjectButton.id = 'add-project-button';
        addProjectButton.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2';
        addProjectButton.innerHTML = `
            <span class="lucide">&#xe408;</span> New Project
        `;

        const addTodoButton = document.createElement('button');
        addTodoButton.id = 'add-todo-button';
        addTodoButton.className = 'bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2';
        addTodoButton.innerHTML = `
            <span class="lucide">&#xe408;</span> Add Task
        `;

        buttons.appendChild(addProjectButton);
        buttons.appendChild(addTodoButton);
        header.appendChild(title);
        header.appendChild(buttons);

        // Todo List Container
        const todoList = document.createElement('div');
        todoList.id = 'todo-list';
        todoList.className = 'space-y-4';

        this.main.appendChild(header);
        this.main.appendChild(todoList);

        // Todo Modal
        const modal = document.createElement('div');
        modal.id = 'todo-modal';
        modal.className = 'modal hidden';

        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl';

        const closeButton = document.createElement('span');
        closeButton.id = 'close-modal-button';
        closeButton.className = 'close-button lucide';
        closeButton.innerHTML = '&#xea13;';

        const modalTitle = document.createElement('h2');
        modalTitle.id = 'modal-title';
        modalTitle.className = 'text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200';
        modalTitle.textContent = 'Add New Task';

        const todoForm = document.createElement('form');
        todoForm.id = 'todo-form';
        todoForm.className = 'space-y-4';

        modalContent.appendChild(closeButton);
        modalContent.appendChild(modalTitle);
        modalContent.appendChild(todoForm);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    addEventListeners() {
        // Add project button
        const addProjectButton = document.getElementById('add-project-button');
        if (addProjectButton) {
            addProjectButton.addEventListener('click', () => {
                const name = prompt('Enter project name:');
                if (name !== null && name.trim()) {
                    try {
                        UI.createProject(name.trim());
                    } catch (error) {
                        alert(error.message);
                    }
                }
            });
        }

        // Add todo button
        const addTodoButton = document.getElementById('add-todo-button');
        if (addTodoButton) {
            addTodoButton.addEventListener('click', () => {
                UI.openModal();
            });
        }

        // Close modal button
        const closeModalButton = document.getElementById('close-modal-button');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                document.getElementById('todo-modal').classList.add('hidden');
            });
        }
    }

    initializeDarkMode() {
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
                localStorage.setItem('isDarkMode', document.body.classList.contains('dark'));
            });
        }

        // Apply saved dark mode preference
        const isDark = localStorage.getItem('isDarkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark');
        }
    }
}
