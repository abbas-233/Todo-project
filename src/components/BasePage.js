export default class BasePage {
    constructor() {
        this.initializeComponents();
    }

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

        // Create main content container
        this.main = document.createElement('main');
        this.main.className = 'max-w-7xl mx-auto px-4 py-8';
        document.body.appendChild(this.main);
    }

    render() {
        // This will be implemented by child classes
        throw new Error('render() must be implemented by child classes');
    }

    addEventListeners() {
        // This will be implemented by child classes
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
