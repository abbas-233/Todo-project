export default function Navigation() {
    return `
        <nav class="bg-white dark:bg-gray-800 shadow-lg">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <a href="index.html" class="text-xl font-bold text-gray-800 dark:text-gray-200">Todo App</a>
                    </div>
                    
                    <div class="hidden md:flex items-center space-x-4">
                        <a href="index.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">Todos</a>
                        <a href="analytics.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">Analytics</a>
                        <a href="settings.html" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600">Settings</a>
                    </div>

                    <div class="flex items-center">
                        <button id="dark-mode-toggle" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" title="Toggle Dark Mode">
                            <span class="lucide">&#xe9b1;</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;
}
