// Jest setup file to make global functions available

// Make fail function available globally
/* global global */
global.fail = (message) => {
  throw new Error(message);
};
