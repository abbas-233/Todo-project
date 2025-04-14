export default class BasePage {
    constructor() {
        this.main = document.getElementById('main-content');
        if (!this.main) {
            this.main = document.createElement('div');
            this.main.id = 'main-content';
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.appendChild(this.main);
            }
        }
    }

    // Layout Components
    createGrid(columns = 1, gap = 'gap-4', className = '') {
        return this.createElement('div', `grid grid-cols-${columns} ${gap} ${className}`);
    }

    createCard(title, content, className = '') {
        const card = this.createElement('div', `bg-white p-6 rounded-lg shadow-md ${className}`);
        
        const heading = this.createElement('h2', 'text-xl font-semibold mb-4 text-gray-800');
        heading.textContent = title;
        card.appendChild(heading);

        card.appendChild(content);
        return card;
    }

    createProgress(id, value = 0, className = '') {
        const container = this.createElement('div', `w-full bg-gray-200 rounded-full h-2.5 ${className}`);
        
        const progress = this.createElement('div', 'bg-blue-600 h-2.5 rounded-full');
        progress.id = id;
        progress.style.width = `${value}%`;
        
        container.appendChild(progress);
        return container;
    }

    createStatItem(label, value, className = '') {
        const item = this.createElement('div', `flex justify-between ${className}`);
        
        const labelElement = this.createElement('span', 'text-gray-600');
        labelElement.textContent = label;
        
        const valueElement = this.createElement('span', 'font-semibold');
        valueElement.id = value;
        valueElement.textContent = '0';
        
        item.appendChild(labelElement);
        item.appendChild(valueElement);
        return item;
    }

    createButton(text, className = '') {
        const button = this.createElement('button', className);
        button.textContent = text;
        return button;
    }

    // Event Handling
    addEventListeners() {
        // This will be implemented by child classes
    }

    addEventListener(elementId, event, callback) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener(event, callback);
        }
    }

    // DOM Operations
    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    }

    appendToMain(element) {
        if (this.main) {
            this.main.appendChild(element);
        }
    }

    remove() {
        if (this.main) {
            this.main.remove();
        }
    }

    // Error Handling
    showError(message) {
        const errorDiv = this.createElement('div', 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative');
        errorDiv.innerHTML = `
            <span class="text-red-500">⚠️</span>
            <span class="ml-2">${message}</span>
        `;
        if (this.main) {
            this.main.insertBefore(errorDiv, this.main.firstChild);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    }

    // Initialize Components
    initializeComponents() {
        // Create navigation
        const navigation = document.createElement('div');
        navigation.id = 'navigation';
        navigation.innerHTML = Navigation();
        document.body.appendChild(navigation);

        // Create footer
        const footer = document.createElement('div');
        footer.id = 'footer';
        footer.innerHTML = Footer();
        document.body.appendChild(footer);
    }

    // Render method to be implemented by child classes
    render() {
        throw new Error('render() must be implemented by child classes');
    }
}
