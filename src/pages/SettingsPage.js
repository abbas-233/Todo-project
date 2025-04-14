import BasePage from '../components/BasePage.js';
import UI from '../UI/UI.js';

export default class SettingsPage extends BasePage {
    constructor() {
        super();
        this.render();
        this.addEventListeners();
    }

    render() {
        // Main title
        const title = this.createElement('h1', 'text-3xl font-bold text-gray-800 mb-8');
        title.textContent = 'Settings';
        this.appendToMain(title);

        // Appearance Settings
        this.createSettingsSection('Appearance', [
            this.createThemeSelect()
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
        const section = this.createElement('div', 'bg-white p-6 rounded-lg shadow-md mb-6');
        
        const heading = this.createElement('h2', 'text-xl font-semibold mb-4 text-gray-800');
        heading.textContent = title;
        section.appendChild(heading);

        const content = this.createElement('div', 'space-y-4');
        items.forEach(item => content.appendChild(item));
        section.appendChild(content);

        this.appendToMain(section);
    }

    createThemeSelect() {
        const container = this.createElement('div', 'space-y-2');

        const label = this.createElement('label', 'block text-sm font-medium text-gray-700 mb-1');
        label.textContent = 'Theme';

        const select = this.createElement('select', 'w-full p-2 border rounded-md');
        select.id = 'theme-select';
        
        const options = [
            { value: 'light', text: 'Light' }
        ];

        options.forEach(option => {
            const opt = this.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });

        container.appendChild(label);
        container.appendChild(select);
        return container;
    }

    createCheckbox(id, label) {
        const container = this.createElement('div', 'flex items-center');

        const input = this.createElement('input');
        input.type = 'checkbox';
        input.id = id;
        input.className = 'mr-2';

        const labelElement = this.createElement('span', 'text-gray-700');
        labelElement.textContent = label;

        container.appendChild(input);
        container.appendChild(labelElement);
        return container;
    }

    createSelect(id, label, options) {
        const container = this.createElement('div', 'space-y-2');

        const labelElement = this.createElement('label', 'block text-sm font-medium text-gray-700 mb-1');
        labelElement.textContent = label;

        const select = this.createElement('select', 'w-full p-2 border rounded-md');
        select.id = id;

        options.forEach(option => {
            const opt = this.createElement('option');
            opt.value = option.value;
            opt.textContent = option.text;
            select.appendChild(opt);
        });

        container.appendChild(labelElement);
        container.appendChild(select);
        return container;
    }

    createExportButton() {
        const button = this.createElement('button', 'w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md');
        button.id = 'export-button';
        button.textContent = 'Export Data';
        return button;
    }

    createImportButton() {
        const container = this.createElement('label', 'cursor-pointer w-full');

        const input = this.createElement('input');
        input.type = 'file';
        input.id = 'import-button';
        input.className = 'hidden';

        const button = this.createElement('span', 'w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md');
        button.textContent = 'Import Data';

        container.appendChild(input);
        container.appendChild(button);
        return container;
    }

    addEventListeners() {
        // Export button
        this.addEventListener('export-button', 'click', () => {
            try {
                const data = UI.exportData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'todo-data.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (error) {
                this.showError('Error exporting data: ' + error.message);
            }
        });

        // Import button
        this.addEventListener('import-button', 'change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        UI.importData(data);
                    } catch (error) {
                        this.showError('Error importing data: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });
    }
}
