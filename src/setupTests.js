import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  data: {},
  
  getItem: function(key) {
    return this.data[key] || null;
  },
  
  setItem: function(key, value) {
    this.data[key] = String(value);
  },
  
  removeItem: function(key) {
    delete this.data[key];
  },
  
  clear: function() {
    this.data = {};
  }
};

global.localStorage = localStorageMock;

// Mock matchMedia
global.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // deprecated
  removeListener: jest.fn(), // deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
});

// Mock Date for consistent timestamps
const mockDate = new Date('2025-04-13T16:57:06+03:00');
jest.setSystemTime(mockDate);

// Mock DOM elements
document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document
  }
});

// Mock console methods for debugging
const consoleMock = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};

global.console = {
  ...console,
  ...consoleMock
};

// Custom matchers for testing
expect.extend({
  toBeEmptyObject(received) {
    const pass = Object.keys(received).length === 0;
    if (pass) {
      return {
        message: () => `expected ${received} not to be an empty object`,
        pass: true
      };
    }
    return {
      message: () => `expected ${received} to be an empty object`,
      pass: false
    };
  },
  
  toBeValidDate(received) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      };
    }
    return {
      message: () => `expected ${received} to be a valid date`,
      pass: false
    };
  }
});

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.data = {};
  jest.clearAllMocks();
  document.body.innerHTML = '';
});

// Reset system time after all tests
afterAll(() => {
  jest.clearAllTimers();
});
