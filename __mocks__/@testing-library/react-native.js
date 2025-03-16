// Mock for React Native Testing Library
const reactTestingLibrary = require('@testing-library/react');

module.exports = {
  ...reactTestingLibrary,
  render: reactTestingLibrary.render,
  fireEvent: reactTestingLibrary.fireEvent,
  waitFor: reactTestingLibrary.waitFor,
  act: reactTestingLibrary.act,
}; 