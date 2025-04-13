describe('Todo Application', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the application title', () => {
    cy.get('h1').should('contain', 'Todo List');
  });

  it('should add a new todo with all details', () => {
    // Click add todo button
    cy.get('#add-todo-button').click();

    // Fill in all form fields
    cy.get('#todo-title').type('Test Todo');
    cy.get('#todo-description').type('This is a test todo');
    cy.get('#todo-priority').select('high');
    cy.get('#todo-category').select('work');
    cy.get('#todo-tags').type('work,urgent');
    cy.get('#todo-due-date').type('2025-04-15');
    cy.get('#todo-notes').type('Important notes for this task');

    // Submit the form
    cy.get('form').submit();

    // Verify the todo was added with all details
    cy.get('.todo-item').should('contain', 'Test Todo');
    cy.get('.todo-item').should('contain', 'high');
    cy.get('.todo-item').should('contain', 'work');
    cy.get('.todo-item').should('contain', '2025-04-15');
  });

  it('should handle subtasks', () => {
    // Add a parent task
    cy.get('#add-todo-button').click();
    cy.get('#todo-title').type('Parent Task');
    cy.get('form').submit();

    // Add a subtask
    cy.get('.todo-item').contains('Parent Task').find('.add-subtask-button').click();
    cy.get('#subtask-title').type('Subtask 1');
    cy.get('#subtask-form').submit();

    // Verify subtask was added
    cy.get('.todo-item').contains('Parent Task').find('.subtask').should('contain', 'Subtask 1');

    // Mark subtask as complete
    cy.get('.todo-item').contains('Parent Task').find('.subtask').find('.complete-checkbox').click();
    cy.get('.todo-item').contains('Parent Task').find('.subtask.completed').should('exist');
  });

  it('should use templates', () => {
    // Create a template
    cy.get('#create-template-button').click();
    cy.get('#template-title').type('Meeting Template');
    cy.get('#template-description').type('Template for meetings');
    cy.get('#template-category').select('work');
    cy.get('#template-form').submit();

    // Use template to create a new task
    cy.get('#add-todo-button').click();
    cy.get('#todo-title').type('Team Meeting');
    cy.get('#todo-template-select').select('Meeting Template');
    cy.get('form').submit();

    // Verify template was applied
    cy.get('.todo-item').should('contain', 'Team Meeting');
    cy.get('.todo-item').should('contain', 'Template for meetings');
    cy.get('.todo-item').should('contain', 'work');
  });

  it('should handle time tracking', () => {
    // Add a task
    cy.get('#add-todo-button').click();
    cy.get('#todo-title').type('Time Tracking Test');
    cy.get('form').submit();

    // Start timer
    cy.get('.todo-item').contains('Time Tracking Test').find('.timer-button').click();
    cy.get('.todo-item').contains('Time Tracking Test').find('.timer').should('exist');

    // Stop timer
    cy.get('.todo-item').contains('Time Tracking Test').find('.timer-button').click();
    cy.get('.todo-item').contains('Time Tracking Test').find('.time-spent').should('exist');
  });

  it('should show analytics dashboard', () => {
    // Add some tasks
    cy.get('#add-todo-button').click();
    cy.get('#todo-title').type('Task 1');
    cy.get('form').submit();

    cy.get('#add-todo-button').click();
    cy.get('#todo-title').type('Task 2');
    cy.get('form').submit();

    // Navigate to analytics
    cy.get('#analytics-tab').click();

    // Verify analytics are displayed
    cy.get('.analytics-dashboard').should('be.visible');
    cy.get('.total-tasks').should('contain', '2');
  });

  it('should handle dark mode toggle', () => {
    // Toggle dark mode
    cy.get('#dark-mode-toggle').click();
    cy.get('body').should('have.class', 'dark-mode');

    // Toggle back to light mode
    cy.get('#dark-mode-toggle').click();
    cy.get('body').should('not.have.class', 'dark-mode');
  });

  it('should handle project management', () => {
    // Add a new project
    cy.get('#add-project-button').click();
    cy.get('#project-name').type('New Project');
    cy.get('#project-category').select('work');
    cy.get('#project-form').submit();

    // Verify project was added
    cy.get('.project-item').should('contain', 'New Project');

    // Add a task to the project
    cy.get('.project-item').contains('New Project').click();
    cy.get('#add-todo-button').click();
    cy.get('#todo-title').type('Project Task');
    cy.get('form').submit();

    // Verify task is in the project
    cy.get('.todo-item').should('contain', 'Project Task');
  });
});
