// Mock for React Native components
module.exports = {
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: jest.fn().mockReturnValue({ width: 375, height: 812 }),
  },
  Platform: {
    OS: 'web',
    select: jest.fn().mockImplementation((obj) => obj.web || obj.default),
  },
  Image: 'Image',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  ActivityIndicator: 'ActivityIndicator',
  TextInput: 'TextInput',
  Button: 'Button',
  Alert: {
    alert: jest.fn(),
  },
  Animated: {
    View: 'Animated.View',
    createAnimatedComponent: (component) => `Animated.${component}`,
    timing: jest.fn().mockReturnValue({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    }),
    spring: jest.fn().mockReturnValue({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    }),
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn().mockReturnValue({
        interpolate: jest.fn(),
      }),
    })),
  },
}; 