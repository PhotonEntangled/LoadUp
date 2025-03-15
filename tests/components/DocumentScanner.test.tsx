import { describe, it, expect, jest } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DocumentScanner from '../../components/document/DocumentScanner';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';

// Mock the expo-camera and expo-image-picker modules
jest.mock('expo-camera', () => ({
  Camera: {
    useCameraPermissions: jest.fn().mockReturnValue([
      { granted: true },
      jest.fn()
    ]),
    Constants: {
      Type: {
        back: 'back'
      },
      FlashMode: {
        on: 'on'
      }
    }
  }
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'images'
  }
}));

describe('DocumentScanner', () => {
  const mockOnImageCaptured = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the camera view when permissions are granted', () => {
    const { getByTestId } = render(
      <DocumentScanner onImageCaptured={mockOnImageCaptured} />
    );

    expect(getByTestId('camera-view')).toBeDefined();
  });

  it('should show permission request when camera permissions are not granted', () => {
    // Override the mock to return not granted
    (Camera.useCameraPermissions as jest.Mock).mockReturnValueOnce([
      { granted: false },
      jest.fn()
    ]);

    const { getByText, getByTestId } = render(
      <DocumentScanner onImageCaptured={mockOnImageCaptured} />
    );

    expect(getByText('Camera access is required')).toBeDefined();
    expect(getByTestId('request-permission-button')).toBeDefined();
  });

  it('should call onImageCaptured when a photo is taken', async () => {
    const mockCameraRef = {
      takePictureAsync: jest.fn().mockResolvedValue({
        uri: 'file://test-image.jpg',
        base64: 'test-base64-data',
        width: 1000,
        height: 1000
      })
    };

    const { getByTestId } = render(
      <DocumentScanner onImageCaptured={mockOnImageCaptured} />
    );

    // Set the camera ref
    const cameraView = getByTestId('camera-view');
    (cameraView as any).ref = mockCameraRef;

    // Press the take photo button
    fireEvent.press(getByTestId('take-photo-button'));

    await waitFor(() => {
      expect(mockCameraRef.takePictureAsync).toHaveBeenCalledWith({
        quality: 1,
        base64: true
      });
      expect(mockOnImageCaptured).toHaveBeenCalledWith({
        uri: 'file://test-image.jpg',
        base64: 'test-base64-data',
        width: 1000,
        height: 1000
      });
    });
  });

  it('should call onImageCaptured when an image is picked from gallery', async () => {
    const mockImageResult = {
      canceled: false,
      assets: [
        {
          uri: 'file://gallery-image.jpg',
          base64: 'gallery-base64-data',
          width: 1200,
          height: 1200
        }
      ]
    };

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockImageResult);

    const { getByTestId } = render(
      <DocumentScanner onImageCaptured={mockOnImageCaptured} />
    );

    // Press the gallery button
    fireEvent.press(getByTestId('gallery-button'));

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: 'images',
        base64: true,
        quality: 1
      });
      expect(mockOnImageCaptured).toHaveBeenCalledWith({
        uri: 'file://gallery-image.jpg',
        base64: 'gallery-base64-data',
        width: 1200,
        height: 1200
      });
    });
  });

  it('should not call onImageCaptured when image picking is canceled', async () => {
    const mockImageResult = {
      canceled: true,
      assets: []
    };

    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(mockImageResult);

    const { getByTestId } = render(
      <DocumentScanner onImageCaptured={mockOnImageCaptured} />
    );

    // Press the gallery button
    fireEvent.press(getByTestId('gallery-button'));

    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(mockOnImageCaptured).not.toHaveBeenCalled();
    });
  });
}); 