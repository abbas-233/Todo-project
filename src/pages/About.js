export default function About() {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">About Todo App</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <p className="text-gray-800 dark:text-gray-200 mb-4">
                    Welcome to your advanced Todo App! This application helps you manage your tasks efficiently with features like:
                </p>
                <ul className="list-disc pl-6 mb-4">
                    <li>Project Management</li>
                    <li>Eisenhower Matrix</li>
                    <li>Task Templates</li>
                    <li>Analytics Dashboard</li>
                </ul>
                <p className="text-gray-800 dark:text-gray-200">
                    Built with modern web technologies and designed to be both functional and beautiful.
                </p>
            </div>
        </div>
    );
}
