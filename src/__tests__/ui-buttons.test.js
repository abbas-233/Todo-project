import { renderTodos } from '../UI/UI.js';
import { Todo } from '../models/Todo.js';
import { TodoList } from '../models/TodoList.js';

// Mock DOM elements for testing
document.body.innerHTML = `
  <div id="todo-list"></div>
`;

describe('UI Button Functionality', () => {
  let todoList;
  let project;
  let todo;
  
  beforeEach(() => {
    todoList = new TodoList();
    project = {
      id: 'test-project',
      name: 'Test Project',
      todos: []
    };
    todo = new Todo('test-id', 'Test Todo', 'Test description');
    project.todos.push(todo);
    
    // Mock callback functions
    const onToggleComplete = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    
    // Render the todo
    renderTodos(project, onToggleComplete, onEdit, onDelete, 0);
  });

  test('edit button should call onEdit callback', () => {
    const editButton = document.querySelector('.lucide-ef7f');
    expect(editButton).toBeInTheDocument();
    
    editButton.click();
    expect(onEdit).toHaveBeenCalledWith(todo);
  });

  test('delete button should call onDelete callback', () => {
    const deleteButton = document.querySelector('.lucide-e4cf');
    expect(deleteButton).toBeInTheDocument();
    
    deleteButton.click();
    expect(onDelete).toHaveBeenCalledWith('test-project', 'test-id');
  });

  test('toggle complete checkbox should call onToggleComplete callback', () => {
    const checkbox = document.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
    
    checkbox.click();
    expect(onToggleComplete).toHaveBeenCalledWith(todo);
  });

  test('start/stop timing button should toggle timing state', () => {
    const timingButton = document.querySelector('.lucide-e408');
    expect(timingButton).toBeInTheDocument();
    
    // Click to start timing
    timingButton.click();
    expect(timingButton.innerHTML).toBe('<span class="lucide">&#xe409;</span>');
    
    // Click to stop timing
    timingButton.click();
    expect(timingButton.innerHTML).toBe('<span class="lucide">&#xe408;</span>');
  });
});
