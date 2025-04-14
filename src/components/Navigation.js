export default function Navigation() {
    return `
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <span class="text-xl font-bold text-gray-800">Todo App</span>
                    </div>
                    
                    <div class="hidden md:flex items-center space-x-4">
                        <button data-page="todo" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">Todos</button>
                        <button data-page="analytics" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">Analytics</button>
                        <button data-page="settings" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600">Settings</button>
                    </div>

                    <div class="flex items-center">
                        <button id="dark-mode-toggle" class="p-2 rounded-md hover:bg-gray-100" title="Toggle Dark Mode">
                            <span class="lucide">&#xe9b1;</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    `;
}

// Add initialization for navigation
export function initialize() {
    // Add active class to current page button
    const currentPage = document.querySelector(`[data-page="${window.location.hash.slice(1) || 'todo'}"]`);
    if (currentPage) {
        currentPage.classList.add('text-blue-600');
    }

    // Add click handlers for mobile menu
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}
