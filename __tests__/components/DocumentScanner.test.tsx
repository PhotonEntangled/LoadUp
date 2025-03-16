import { describe, it, expect, jest, beforeEach } from '@jest/globals';
// @ts-ignore - Using react-testing-library for React Native components
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
// @ts-ignore - Module resolution issue with file extensions
import DocumentScanner from '../../components/document/DocumentScanner.tsx';
// @ts-ignore - Missing type declarations for expo-camera
import { Camera } from 'expo-camera';
// @ts-ignore - Missing type declarations for expo-image-picker
import * as ImagePicker from 'expo-image-picker';

// Mock the expo-camera module
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: {
        back: 'back',
      },
      FlashMode: {
        on: 'on',
      },
    },
    useCameraPermissions: jest.fn(),
  },
}));

// Mock the expo-image-picker module
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
}));

// Mock the Alert module
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('DocumentScanner Component', () => {
  const mockOnImageCaptured = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when permissions are loading', () => {
    // Mock permissions loading
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([null, jest.fn()]);
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    expect(screen.getByText('Loading camera permissions...')).toBeTruthy();
  });

  it('renders permission request when permissions are not granted', () => {
    // Mock permissions not granted
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: false }, jest.fn()]);
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    expect(screen.getByText('Camera access is required to scan documents')).toBeTruthy();
    expect(screen.getByTestId('request-permission-button')).toBeTruthy();
  });

  it('calls requestPermission when permission button is pressed', () => {
    const mockRequestPermission = jest.fn();
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: false }, mockRequestPermission]);
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    const permissionButton = screen.getByTestId('request-permission-button');
    fireEvent.press(permissionButton);
    
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('renders camera view when permissions are granted', () => {
    // Mock permissions granted
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    expect(screen.getByTestId('camera-view')).toBeTruthy();
    expect(screen.getByTestId('take-photo-button')).toBeTruthy();
    expect(screen.getByTestId('gallery-button')).toBeTruthy();
    expect(screen.getByText('Position the shipping document within the frame')).toBeTruthy();
    expect(screen.getByText('Hold the device steady for best results')).toBeTruthy();
  });

  it('calls onImageCaptured when a photo is taken successfully', async () => {
    // Mock permissions granted
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    
    // Mock camera reference and takePictureAsync
    // @ts-ignore - Type issues with mocked function
    const mockTakePictureAsync = jest.fn().mockResolvedValue({
      uri: 'file://test-image.jpg',
      base64: 'test-base64-data',
    });
    
    // Mock useRef to return our mock camera
    // @ts-ignore - Type issues with mocked function
    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        takePictureAsync: mockTakePictureAsync,
      },
    });
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    const takePhotoButton = screen.getByTestId('take-photo-button');
    fireEvent.press(takePhotoButton);
    
    await waitFor(() => {
      expect(mockTakePictureAsync).toHaveBeenCalledWith({ quality: 1, base64: true });
      expect(mockOnImageCaptured).toHaveBeenCalledWith({
        uri: 'file://test-image.jpg',
        base64: 'test-base64-data',
      });
    });
  });

  it('handles errors when taking a photo fails', async () => {
    // Mock permissions granted
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Alert.alert
    const mockAlert = require('react-native/Libraries/Alert/Alert').alert;
    
    // Mock camera reference and takePictureAsync that throws an error
    // @ts-ignore - Type issues with mocked function
    const mockTakePictureAsync = jest.fn().mockRejectedValue(new Error('Camera error'));
    
    // Mock useRef to return our mock camera
    // @ts-ignore - Type issues with mocked function
    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        takePictureAsync: mockTakePictureAsync,
      },
    });
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    const takePhotoButton = screen.getByTestId('take-photo-button');
    fireEvent.press(takePhotoButton);
    
    await waitFor(() => {
      expect(mockTakePictureAsync).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error taking photo:', expect.any(Error));
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to take photo. Please try again.');
      expect(mockOnImageCaptured).not.toHaveBeenCalled();
    });
  });

  it('calls onImageCaptured when an image is picked from gallery', async () => {
    // Mock permissions granted
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    
    // Mock image picker result
    const mockImageResult = {
      canceled: false,
      assets: [
        {
          uri: 'file://gallery-image.jpg',
          base64: 'gallery-base64-data',
        },
      ],
    };
    
    // @ts-ignore - Type issues with mocked function
    ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockImageResult);
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    const galleryButton = screen.getByTestId('gallery-button');
    fireEvent.press(galleryButton);
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
        mediaTypes: 'Images',
        base64: true,
        quality: 1,
      });
      expect(mockOnImageCaptured).toHaveBeenCalledWith(mockImageResult.assets[0]);
    });
  });

  it('handles when user cancels image picking', async () => {
    // Mock permissions granted
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    
    // Mock image picker result for canceled selection
    const mockCanceledResult = {
      canceled: true,
      assets: [],
    };
    
    // @ts-ignore - Type issues with mocked function
    ImagePicker.launchImageLibraryAsync.mockResolvedValue(mockCanceledResult);
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    const galleryButton = screen.getByTestId('gallery-button');
    fireEvent.press(galleryButton);
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(mockOnImageCaptured).not.toHaveBeenCalled();
    });
  });

  it('handles errors when picking an image fails', async () => {
    // Mock permissions granted
    // @ts-ignore - Type issues with mocked function
    Camera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Alert.alert
    const mockAlert = require('react-native/Libraries/Alert/Alert').alert;
    
    // Mock image picker that throws an error
    // @ts-ignore - Type issues with mocked function
    ImagePicker.launchImageLibraryAsync.mockRejectedValue(new Error('Gallery error'));
    
    render(<DocumentScanner onImageCaptured={mockOnImageCaptured} />);
    
    const galleryButton = screen.getByTestId('gallery-button');
    fireEvent.press(galleryButton);
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error picking image:', expect.any(Error));
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to pick image. Please try again.');
      expect(mockOnImageCaptured).not.toHaveBeenCalled();
    });
  });
}); 