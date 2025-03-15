import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

interface DocumentScannerProps {
  onImageCaptured: (imageData: any) => void;
}

/**
 * Component for scanning documents using the device camera
 * or selecting from the gallery
 */
const DocumentScanner: React.FC<DocumentScannerProps> = ({ onImageCaptured }) => {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const cameraRef = useRef<Camera>(null);

  // If permissions are still loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Loading camera permissions...</Text>
      </View>
    );
  }

  // If permissions are not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera access is required to scan documents</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
          testID="request-permission-button"
        >
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Takes a photo using the device camera
   */
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const options = { quality: 1, base64: true };
        const data = await cameraRef.current.takePictureAsync(options);
        setCapturedImage(data);
        onImageCaptured(data);
      } catch (error) {
        console.error('Error taking photo:', error);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    }
  };

  /**
   * Picks an image from the device gallery
   */
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 1
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setCapturedImage(selectedImage);
        onImageCaptured(selectedImage);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <View style={styles.container} testID="camera-view">
      <Camera
        style={styles.camera}
        ref={cameraRef}
        type={Camera.Constants.Type.back}
        flashMode={Camera.Constants.FlashMode.on}
      >
        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              Position the shipping document within the frame
            </Text>
            <Text style={styles.instructionText}>
              Hold the device steady for best results
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.captureButton} 
              onPress={takePhoto}
              testID="take-photo-button"
            >
              <MaterialCommunityIcons name="camera-iris" size={60} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.galleryButton} 
              onPress={pickImage}
              testID="gallery-button"
            >
              <Feather name="image" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 20,
  },
  scanFrame: {
    flex: 1,
    margin: 40,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#fff',
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#fff',
  },
  instructions: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  instructionText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButton: {
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    borderRadius: 50,
    padding: 15,
    marginRight: 20,
  },
  galleryButton: {
    backgroundColor: 'rgba(52, 52, 52, 0.8)',
    borderRadius: 30,
    padding: 15,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 5,
  },
  permissionButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default DocumentScanner; 