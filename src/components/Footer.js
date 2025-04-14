import BasePage from './BasePage.js';

export default class Footer extends BasePage {
    constructor() {
        super();
        this.render();
    }

    render() {
        const footer = this.createElement('footer', 'bg-gray-100 mt-12');
        const container = this.createElement('div', 'max-w-7xl mx-auto px-4 py-8');
        
        // Grid layout
        const grid = this.createElement('div', 'grid grid-cols-1 md:grid-cols-3 gap-8');
        
        // About section
        const about = this.createElement('div');
        about.innerHTML = `
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Todo App</h3>
            <p class="text-gray-600">
                A modern task management application built with simplicity in mind.
            </p>
        `;
        
        // Quick Links section
        const links = this.createElement('div');
        links.innerHTML = `
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
            <ul class="space-y-2">
                <li><a href="#/" class="text-gray-600 hover:text-blue-600">Todos</a></li>
                <li><a href="#/analytics" class="text-gray-600 hover:text-blue-600">Analytics</a></li>
                <li><a href="#/settings" class="text-gray-600 hover:text-blue-600">Settings</a></li>
            </ul>
        `;
        
        // Contact section
        const contact = this.createElement('div');
        contact.innerHTML = `
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Contact</h3>
            <ul class="space-y-2">
                <li class="text-gray-600">
                    <span class="lucide">&#xe4a5;</span> Import/Export
                </li>
                <li class="text-gray-600">
                    <span class="lucide">&#xe408;</span> Add New Task
                </li>
            </ul>
        `;
        
        // Copyright section
        const copyright = this.createElement('div', 'mt-8 border-t border-gray-200 pt-8 text-center text-gray-600');
        copyright.innerHTML = `
            <p>&copy; ${new Date().getFullYear()} Todo App. All rights reserved.</p>
        `;
        
        // Assemble
        grid.appendChild(about);
        grid.appendChild(links);
        grid.appendChild(contact);
        container.appendChild(grid);
        container.appendChild(copyright);
        footer.appendChild(container);
        
        return footer;
    }
}
