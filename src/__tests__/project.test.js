import { Project } from '../project.js';
import { Todo } from '../todo.js';

describe('Project', () => {
  let project;

  beforeEach(() => {
    project = new Project('Test Project', 'general');
  });

  test('should create a new project with correct properties', () => {
    expect(project.name).toBe('Test Project');
    expect(project.category).toBe('general');
    expect(project.todos).toEqual([]);
    expect(project.id).toBeDefined();
  });

  test('should add a todo to the project', () => {
    const todo = new Todo('Test Todo');
    project.addTodo(todo);
    expect(project.todos.length).toBe(1);
    expect(project.todos[0]).toBe(todo);
  });

  test('should remove a todo from the project', () => {
    const todo = new Todo('Test Todo');
    project.addTodo(todo);
    project.removeTodo(todo.id);
    expect(project.todos.length).toBe(0);
  });

  test('should get todo by id', () => {
    const todo = new Todo('Test Todo');
    project.addTodo(todo);
    const foundTodo = project.getTodoById(todo.id);
    expect(foundTodo).toBe(todo);
  });

  test('should calculate project progress', () => {
    const todo1 = new Todo('Todo 1');
    const todo2 = new Todo('Todo 2');
    todo2.completed = true;
    
    project.addTodo(todo1);
    project.addTodo(todo2);
    
    const progress = project.calculateProgress();
    expect(progress).toBe(50);
  });

  test('should filter todos by category', () => {
    const workTodo = new Todo('Work Todo', '', '', '', '', false, 'work');
    const personalTodo = new Todo('Personal Todo', '', '', '', '', false, 'personal');
    
    project.addTodo(workTodo);
    project.addTodo(personalTodo);
    
    const filteredTodos = project.filterTodos('work');
    expect(filteredTodos.length).toBe(1);
    expect(filteredTodos[0]).toBe(workTodo);
  });
});
