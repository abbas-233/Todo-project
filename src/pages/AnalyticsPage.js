import BasePage from '../components/BasePage.js';

export default class AnalyticsPage extends BasePage {
    constructor() {
        super();
        this.render();
        this.addEventListeners();
    }

    render() {
        // Main title
        const title = this.createElement('h1', 'text-3xl font-bold text-gray-800 mb-8');
        title.textContent = 'Todo Analytics';
        this.appendToMain(title);

        // Stats Grid
        const statsGrid = this.createGrid(1, 'gap-6 mb-8');
        
        // Stats Cards
        const completionCard = this.createCard('Task Completion', this.createStatsContent([
            { label: 'Total Tasks', id: 'total-tasks' },
            { label: 'Completed', id: 'completed-tasks' },
            { type: 'progress', id: 'completion-progress' }
        ]));

        const timeCard = this.createCard('Time Management', this.createStatsContent([
            { label: 'Total Time', id: 'total-time' },
            { label: 'Average Time', id: 'avg-time' }
        ]));

        const productivityCard = this.createCard('Productivity', this.createStatsContent([
            { label: 'Daily Tasks', id: 'daily-tasks' },
            { label: 'Success Rate', id: 'success-rate' }
        ]));

        statsGrid.appendChild(completionCard);
        statsGrid.appendChild(timeCard);
        statsGrid.appendChild(productivityCard);
        this.appendToMain(statsGrid);

        // Charts Grid
        const chartsGrid = this.createGrid(1, 'gap-6');
        
        // Chart Cards
        const completionTimeline = this.createCard('Task Completion Timeline', this.createChartContent('completion-timeline'));
        const categoryDistribution = this.createCard('Category Distribution', this.createChartContent('category-distribution'));

        chartsGrid.appendChild(completionTimeline);
        chartsGrid.appendChild(categoryDistribution);
        this.appendToMain(chartsGrid);
    }

    createStatsContent(items) {
        const content = this.createElement('div', 'space-y-4');
        items.forEach(item => {
            if (item.type === 'progress') {
                content.appendChild(this.createProgress(item.id));
            } else {
                content.appendChild(this.createStatItem(item.label, item.id));
            }
        });
        return content;
    }

    createChartContent(canvasId) {
        const canvas = this.createElement('canvas');
        canvas.id = canvasId;
        return canvas;
    }

    addEventListeners() {
        // Add analytics-specific event listeners here
    }
}
