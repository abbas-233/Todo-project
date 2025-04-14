import BasePage from '../components/BasePage.js';
import UI from '../UI/UI.js';

export default class TodoPage extends BasePage {
    constructor() {
        super();
        this.render();
        this.addEventListeners();
    }

    render() {
        const container = this.createElement('div', 'space-y-6');
        
        // Project selector
        const projectSelector = this.createElement('div', 'flex justify-between items-center mb-4');
        const projectSelect = this.createElement('select', 'bg-white border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500');
        projectSelect.id = 'project-select';
        projectSelect.innerHTML = `
            <option value="default">Select Project</option>
        `;
        
        // Add project button
        const addProjectButton = this.createButton('Add Project', 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md');
        addProjectButton.id = 'add-project-button';
        addProjectButton.innerHTML = `
            <span class="lucide">&#xe408;</span> Add Project
        `;
        
        projectSelector.appendChild(projectSelect);
        projectSelector.appendChild(addProjectButton);
        container.appendChild(projectSelector);

        // Todo list container
        const todoList = this.createElement('div', 'space-y-4');
        todoList.id = 'todo-list';
        container.appendChild(todoList);

        this.appendToMain(container);
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
                        UI.showError(error.message);
                    }
                } else {
                    UI.showError('Please enter a valid project name');
                }
            });
        }

        // Project selector
        const projectSelect = document.getElementById('project-select');
        if (projectSelect) {
            projectSelect.addEventListener('change', (e) => {
                const projectId = e.target.value;
                if (projectId && projectId !== 'default') {
                    UI.selectProject(projectId);
                }
            });
        }
    }

    remove() {
        const container = document.querySelector('.space-y-6');
        if (container) {
            container.remove();
        }
    }
}
