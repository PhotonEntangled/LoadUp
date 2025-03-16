// Mock for Expo Camera
module.exports = {
  Camera: {
    useCameraPermissions: jest.fn(),
    Constants: {
      Type: {
        back: 'back'
      },
      FlashMode: {
        on: 'on'
      }
    }
  }
}; 