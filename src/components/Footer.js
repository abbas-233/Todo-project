export default function Footer() {
    return `
        <footer class="bg-gray-100 dark:bg-gray-900 mt-12">
            <div class="max-w-7xl mx-auto px-4 py-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- About -->
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Todo App</h3>
                        <p class="text-gray-600 dark:text-gray-400">
                            A modern task management application built with simplicity in mind.
                        </p>
                    </div>

                    <!-- Quick Links -->
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Quick Links</h3>
                        <ul class="space-y-2">
                            <li><a href="index.html" class="text-gray-600 dark:text-gray-400 hover:text-blue-600">Todos</a></li>
                            <li><a href="analytics.html" class="text-gray-600 dark:text-gray-400 hover:text-blue-600">Analytics</a></li>
                            <li><a href="settings.html" class="text-gray-600 dark:text-gray-400 hover:text-blue-600">Settings</a></li>
                        </ul>
                    </div>

                    <!-- Contact -->
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact</h3>
                        <ul class="space-y-2">
                            <li class="text-gray-600 dark:text-gray-400">
                                <span class="lucide">&#xe4a5;</span> Import/Export
                            </li>
                            <li class="text-gray-600 dark:text-gray-400">
                                <span class="lucide">&#xe408;</span> Add New Task
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-gray-600 dark:text-gray-400">
                    <p>&copy; ${new Date().getFullYear()} Todo App. All rights reserved.</p>
                </div>
            </div>
        </footer>
    `;
}
