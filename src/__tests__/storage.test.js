import { saveData, loadData } from '../storage.js';

describe('Storage', () => {
  let mockProjects;
  let mockCurrentProjectId;

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      }
    });

    mockProjects = {
      default: {
        id: 'default',
        name: 'Default Project',
        todos: []
      }
    };
    mockCurrentProjectId = 'default';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should save data to localStorage', () => {
    saveData(mockProjects, mockCurrentProjectId);
    expect(localStorage.setItem).toHaveBeenCalledWith('todoData', expect.any(String));
  });

  test('should load data from localStorage', () => {
    const mockData = JSON.stringify({
      projects: mockProjects,
      currentProjectId: mockCurrentProjectId
    });
    localStorage.getItem.mockReturnValue(mockData);

    const result = loadData();
    expect(result.projects).toEqual(mockProjects);
    expect(result.currentProjectId).toBe(mockCurrentProjectId);
  });

  test('should handle empty localStorage', () => {
    localStorage.getItem.mockReturnValue(null);
    const result = loadData();
    expect(result.projects).toEqual({});
    expect(result.currentProjectId).toBe('default');
  });
});
