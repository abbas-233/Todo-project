import { TodoList } from '../models/TodoList.js';
import { Todo } from '../models/Todo.js';
import { renderProjects, renderTodos, openModal, getFormData } from '../UI/UI.js';
import { saveData, loadData } from '../storage.js';

// Mock DOM elements for testing
document.body.innerHTML = `
  <div id="project-list"></div>
  <div id="todo-list"></div>
  <div id="todo-modal">
    <form id="todo-form">
      <input type="text" id="todo-title">
      <textarea id="todo-description"></textarea>
      <input type="date" id="todo-due-date">
      <select id="todo-priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <textarea id="todo-notes"></textarea>
      <input type="submit">
    </form>
  </div>
`;

describe('Project and Task Creation', () => {
  let todoList;
  
  beforeEach(() => {
    todoList = new TodoList();
    localStorage.clear();
  });

  test('should create new project and render it', () => {
    // Create new project
    const projectName = 'Test Project';
    todoList.createProject(projectName);
    
    // Render projects
    renderProjects(todoList.getProjects(), 'default', () => {});
    
    // Check project is rendered
    const projectElement = document.querySelector(`[data-project-name="${projectName}"]`);
    expect(projectElement).toBeInTheDocument();
    expect(projectElement.textContent).toContain(projectName);
  });

  test('should create new task and render it', () => {
    // Create project
    const project = todoList.createProject('Test Project');
    
    // Open modal and fill form
    openModal();
    const form = document.getElementById('todo-form');
    const titleInput = document.getElementById('todo-title');
    const descriptionInput = document.getElementById('todo-description');
    const dueDateInput = document.getElementById('todo-due-date');
    const priorityInput = document.getElementById('todo-priority');
    
    titleInput.value = 'Test Task';
    descriptionInput.value = 'This is a test task';
    dueDateInput.value = '2025-04-15';
    priorityInput.value = 'high';
    
    // Submit form
    form.dispatchEvent(new Event('submit', { bubbles: true }));
    
    // Check task exists in project
    expect(project.todos.length).toBe(1);
    const task = project.todos[0];
    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('This is a test task');
    expect(task.dueDate).toBe('2025-04-15');
    expect(task.priority).toBe('high');
    
    // Render todos
    renderTodos(project, () => {}, () => {}, () => {}, 0);
    
    // Check task is rendered
    const taskElement = document.querySelector('.todo-item');
    expect(taskElement).toBeInTheDocument();
    expect(taskElement.textContent).toContain('Test Task');
  });

  test('should persist project and task data', () => {
    // Create project and task
    const project = todoList.createProject('Test Project');
    project.addTodo('Test Task', 'Test description', '2025-04-15', 'high');
    
    // Save data
    saveData(todoList);
    
    // Clear todoList and load data
    todoList = new TodoList();
    todoList = new TodoList(loadData());
    
    // Check data is loaded correctly
    const loadedProject = todoList.getProjectById('Test Project');
    expect(loadedProject).toBeDefined();
    expect(loadedProject.todos.length).toBe(1);
    const loadedTask = loadedProject.todos[0];
    expect(loadedTask.title).toBe('Test Task');
    expect(loadedTask.description).toBe('Test description');
    expect(loadedTask.dueDate).toBe('2025-04-15');
    expect(loadedTask.priority).toBe('high');
  });

  test('should handle invalid project name', () => {
    // Try to create project with empty name
    expect(() => todoList.createProject('')).toThrow('Project name cannot be empty');
    
    // Try to create duplicate project
    todoList.createProject('Duplicate Project');
    expect(() => todoList.createProject('Duplicate Project'))
      .toThrow('Project with this name already exists');
  });

  test('should handle invalid task data', () => {
    // Try to create task with empty title
    const project = todoList.createProject('Test Project');
    expect(() => project.addTodo('', 'Test description', '2025-04-15', 'high'))
      .toThrow('Task title cannot be empty');
    
    // Try to create task with invalid priority
    expect(() => project.addTodo('Test Task', 'Test description', '2025-04-15', 'invalid'))
      .toThrow('Invalid priority level');
  });
});
