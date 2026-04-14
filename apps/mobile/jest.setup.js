// Mocking native modules
jest.mock('expo-font');
jest.mock('expo-asset');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      API_URL: 'http://localhost:3000',
    },
  },
}));

// Use automatic mocks from __mocks__ directory
jest.mock('expo-secure-store');
jest.mock('expo-router');

// Mock react-native-reanimated
require('react-native-reanimated').default;
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence Animated warning
import { NativeModules } from 'react-native';
NativeModules.NativeAnimatedModule = {
  startListeningConfigurableProps: jest.fn(),
  stopListeningConfigurableProps: jest.fn(),
  connectAnimatedNodes: jest.fn(),
  disconnectAnimatedNodes: jest.fn(),
  startAnimatingNode: jest.fn(),
  stopAnimation: jest.fn(),
  setAnimatedNodeValue: jest.fn(),
  setAnimatedNodeOffset: jest.fn(),
  flattenAnimatedNodeOffset: jest.fn(),
  extractAnimatedNodeOffset: jest.fn(),
  connectAnimatedNodeToView: jest.fn(),
  disconnectAnimatedNodeFromView: jest.fn(),
  restoreDefaultValues: jest.fn(),
  dropAnimatedNode: jest.fn(),
  addAnimatedEventToView: jest.fn(),
  removeAnimatedEventFromView: jest.fn(),
  addListener: jest.fn(),
  removeListeners: jest.fn(),
};
