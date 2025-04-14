export default class AnalyticsPage {
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
        title.textContent = 'Todo Analytics';
        this.main.appendChild(title);

        // Stats Cards
        const statsGrid = document.createElement('div');
        statsGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8';

        // Task Completion Card
        const completionCard = this.createStatsCard('Task Completion', [
            { label: 'Total Tasks', id: 'total-tasks' },
            { label: 'Completed', id: 'completed-tasks' },
            { type: 'progress', id: 'completion-progress' }
        ]);

        // Time Management Card
        const timeCard = this.createStatsCard('Time Management', [
            { label: 'Total Time', id: 'total-time' },
            { label: 'Average Time', id: 'avg-time' }
        ]);

        // Productivity Card
        const productivityCard = this.createStatsCard('Productivity', [
            { label: 'Daily Tasks', id: 'daily-tasks' },
            { label: 'Success Rate', id: 'success-rate' }
        ]);

        statsGrid.appendChild(completionCard);
        statsGrid.appendChild(timeCard);
        statsGrid.appendChild(productivityCard);
        this.main.appendChild(statsGrid);

        // Charts
        const chartsGrid = document.createElement('div');
        chartsGrid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';

        const completionTimeline = this.createChartCard('Task Completion Timeline', 'completion-timeline');
        const categoryDistribution = this.createChartCard('Category Distribution', 'category-distribution');

        chartsGrid.appendChild(completionTimeline);
        chartsGrid.appendChild(categoryDistribution);
        this.main.appendChild(chartsGrid);
    }

    createStatsCard(title, items) {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md';

        const heading = document.createElement('h2');
        heading.className = 'text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200';
        heading.textContent = title;
        card.appendChild(heading);

        const content = document.createElement('div');
        content.className = 'space-y-4';

        items.forEach(item => {
            if (item.type === 'progress') {
                const progressContainer = document.createElement('div');
                progressContainer.className = 'w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5';
                
                const progress = document.createElement('div');
                progress.id = item.id;
                progress.className = 'bg-blue-600 h-2.5 rounded-full';
                progress.style.width = '0%';
                
                progressContainer.appendChild(progress);
                content.appendChild(progressContainer);
            } else {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'flex justify-between';
                
                const label = document.createElement('span');
                label.className = 'text-gray-600 dark:text-gray-400';
                label.textContent = item.label;
                
                const value = document.createElement('span');
                value.id = item.id;
                value.className = 'font-semibold';
                value.textContent = '0';
                
                itemDiv.appendChild(label);
                itemDiv.appendChild(value);
                content.appendChild(itemDiv);
            }
        });

        card.appendChild(content);
        return card;
    }

    createChartCard(title, canvasId) {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md';

        const heading = document.createElement('h2');
        heading.className = 'text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200';
        heading.textContent = title;
        card.appendChild(heading);

        const canvas = document.createElement('canvas');
        canvas.id = canvasId;
        card.appendChild(canvas);

        return card;
    }

    addEventListeners() {
        // Add any analytics-specific event listeners here
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
