export default class SettingsPage {
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
        // Main title
        const title = document.createElement('h1');
        title.className = 'text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8';
        title.textContent = 'Settings';
        this.main.appendChild(title);

        // Appearance Settings
        this.createSettingsSection('Appearance', [
            this.createDarkModeToggle()
        ]);

        // Notifications Settings
        this.createSettingsSection('Notifications', [
            this.createCheckbox('urgent-notifications', 'Notify for urgent tasks'),
            this.createCheckbox('due-date-notifications', 'Notify for upcoming due dates')
        ]);

        // Default Settings
        this.createSettingsSection('Default Task Settings', [
            this.createSelect('default-priority', 'Default Priority', [
                { value: 'low', text: 'Low' },
                { value: 'medium', text: 'Medium' },
                { value: 'high', text: 'High' }
            ]),
            this.createSelect('default-category', 'Default Category', [
                { value: 'general', text: 'General' },
                { value: 'work', text: 'Work' },
                { value: 'personal', text: 'Personal' }
            ])
        ]);

        // Import/Export Settings
        this.createSettingsSection('Import/Export', [
            this.createExportButton(),
            this.createImportButton()
        ]);
    }

    createSettingsSection(title, items) {
        const section = document.createElement('div');
        section.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6';

        const heading = document.createElement('h2');
        heading.className = 'text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200';
        heading.textContent = title;
        section.appendChild(heading);

        const content = document.createElement('div');
        content.className = 'space-y-4';
        items.forEach(item => content.appendChild(item));
        section.appendChild(content);

        this.main.appendChild(section);
    }

    createDarkModeToggle() {
        const container = document.createElement('div');
        container.className = 'space-y-2';

        const label = document.createElement('label');
        label.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
        label.textContent = 'Dark Mode';

        const button = document.createElement('button');
        button.id = 'dark-mode-toggle';
        button.className = 'w-full flex items-center justify-between px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700';
        button.innerHTML = `
            <span class="text-gray-700 dark:text-gray-300">Toggle Dark Mode</span>
            <span class="lucide">&#xe9b1;</span>
        `;

        container.appendChild(label);
        container.appendChild(button);
        return container;
    }

    createCheckbox(id, label) {
        const container = document.createElement('div');
        container.className = 'flex items-center';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.className = 'mr-2';

        const labelElement = document.createElement('span');
        labelElement.className = 'text-gray-700 dark:text-gray-300';
        labelElement.textContent = label;

        container.appendChild(input);
        container.appendChild(labelElement);
        return container;
    }

    createSelect(id, label, options) {
        const container = document.createElement('div');
        container.className = 'space-y-2';

        const labelElement = document.createElement('label');
        labelElement.className = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';
        labelElement.textContent = label;

        const select = document.createElement('select');
        select.id = id;
        select.className = 'w-full p-2 border rounded-md';

        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });

        container.appendChild(labelElement);
        container.appendChild(select);
        return container;
    }

    createExportButton() {
        const button = document.createElement('button');
        button.id = 'export-button';
        button.className = 'w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md';
        button.textContent = 'Export Data';
        return button;
    }

    createImportButton() {
        const container = document.createElement('label');
        container.className = 'cursor-pointer w-full';

        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'import-button';
        input.className = 'hidden';

        const button = document.createElement('span');
        button.className = 'w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md';
        button.textContent = 'Import Data';

        container.appendChild(input);
        container.appendChild(button);
        return container;
    }

    addEventListeners() {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark');
                localStorage.setItem('isDarkMode', document.body.classList.contains('dark'));
            });
        }

        // Export button
        const exportButton = document.getElementById('export-button');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                // Add export functionality here
            });
        }

        // Import button
        const importButton = document.getElementById('import-button');
        if (importButton) {
            importButton.addEventListener('change', (e) => {
                // Add import functionality here
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
