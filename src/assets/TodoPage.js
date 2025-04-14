import { openModal, closeModal } from './UI.js';

export default class TodoPage {
    constructor() {
        this.addEventListeners();
        this.initializeDarkMode();
    }

    addEventListeners() {
        // Add project button
        const addProjectButton = document.getElementById('add-project-button');
        if (addProjectButton) {
            addProjectButton.addEventListener('click', () => {
                const name = prompt('Enter project name:');
                if (name !== null && name.trim()) {
                    alert(`Project '${name.trim()}' created!`); // Replace with actual project creation logic
                }
            });
        }

        // Add todo button
        const addTodoButton = document.getElementById('add-todo-button');
        if (addTodoButton) {
            addTodoButton.addEventListener('click', () => {
                openModal();
            });
        }

        // Close modal button
        const closeModalButton = document.getElementById('close-modal-button');
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                closeModal();
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
