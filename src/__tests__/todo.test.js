import { Todo } from '../todo.js';

describe('Todo', () => {
  let todo;

  beforeEach(() => {
    todo = new Todo('Test Task', 'Test description', '2025-04-14', 'high', 'Test notes');
  });

  test('should create a new Todo with correct properties', () => {
    expect(todo.title).toBe('Test Task');
    expect(todo.description).toBe('Test description');
    expect(todo.dueDate).toBe('2025-04-14');
    expect(todo.priority).toBe('high');
    expect(todo.notes).toBe('Test notes');
    expect(todo.completed).toBe(false);
  });

  test('should mark task as completed', () => {
    todo.completed = true;
    expect(todo.completed).toBe(true);
  });

  test('should add subtasks', () => {
    const subtask = new Todo('Subtask 1');
    todo.subtasks.push(subtask);
    expect(todo.subtasks.length).toBe(1);
  });

  test('should calculate time spent', () => {
    todo.timeSpent = 30;
    expect(todo.timeSpent).toBe(30);
  });
});
