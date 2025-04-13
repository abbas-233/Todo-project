import * as ui from '../UI/UI.js';
import { Todo } from '../todo.js';
import { Project } from '../project.js';

describe('UI Components', () => {
  let container;
  let todo;
  let project;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    todo = new Todo('Test Todo', 'Test description', '2025-04-14', 'high', 'Test notes');
    project = new Project('Test Project', 'general');
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('renderTodo', () => {
    test('should render a todo with all its properties', () => {
      const todoElement = ui.renderTodo(todo);
      expect(todoElement).toBeDefined();
      expect(todoElement.querySelector('.todo-title').textContent).toContain('Test Todo');
      expect(todoElement.querySelector('.todo-description').textContent).toContain('Test description');
      expect(todoElement.querySelector('.todo-priority').textContent).toContain('high');
      expect(todoElement.querySelector('.todo-category').textContent).toContain('general');
    });

    test('should show completed state correctly', () => {
      todo.completed = true;
      const todoElement = ui.renderTodo(todo);
      expect(todoElement).toHaveClass('completed');
    });
  });

  describe('renderProject', () => {
    test('should render a project with its name and category', () => {
      const projectElement = ui.renderProject(project);
      expect(projectElement).toBeDefined();
      expect(projectElement.querySelector('.project-name').textContent).toContain('Test Project');
      expect(projectElement.querySelector('.project-category').textContent).toContain('general');
    });

    test('should show project progress', () => {
      const todo1 = new Todo('Todo 1');
      const todo2 = new Todo('Todo 2');
      todo2.completed = true;
      project.addTodo(todo1);
      project.addTodo(todo2);

      const projectElement = ui.renderProject(project);
      expect(projectElement.querySelector('.project-progress').textContent).toContain('50%');
    });
  });

  describe('renderSubtasks', () => {
    test('should render subtasks correctly', () => {
      const subtask1 = new Todo('Subtask 1');
      const subtask2 = new Todo('Subtask 2');
      subtask2.completed = true;
      todo.subtasks = [subtask1, subtask2];

      const subtasksElement = ui.renderSubtasks(todo);
      expect(subtasksElement.querySelectorAll('.subtask').length).toBe(2);
      expect(subtasksElement.querySelector('.subtask.completed')).toBeDefined();
    });
  });

  describe('renderAnalytics', () => {
    test('should render analytics dashboard correctly', () => {
      const analyticsData = {
        totalTasks: 10,
        completedTasks: 5,
        averageTimeSpent: 30,
        urgentTasks: 2,
        importantTasks: 3
      };

      const analyticsElement = ui.renderAnalytics(analyticsData);
      expect(analyticsElement).toBeDefined();
      expect(analyticsElement.querySelector('.total-tasks').textContent).toContain('10');
      expect(analyticsElement.querySelector('.completed-tasks').textContent).toContain('5');
      expect(analyticsElement.querySelector('.average-time').textContent).toContain('30');
    });
  });
});
