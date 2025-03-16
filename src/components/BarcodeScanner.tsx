import { beepSound } from '@/lib/beepSound';
import { BrowserMultiFormatReader, Result } from '@zxing/library';
import React, { useEffect, useRef, useState } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError: (error: Error) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image upload and barcode detection function
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    setIsProcessingImage(true);
    setError(null);

    try {
      // Create an optimized image object
      const img = new Image();
      img.src = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });

      // Initialize barcode reader if needed
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      // Create a canvas with optimal size for barcode detection
      const canvas = document.createElement('canvas');
      const maxSize = 1024; // Maximum dimension while maintaining aspect ratio
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Draw image to canvas with smoothing disabled for better barcode detection
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image for scanning
      const processedImage = new Image();
      processedImage.src = canvas.toDataURL('image/png', 1.0);
      await new Promise((resolve) => { processedImage.onload = resolve; });

      // Attempt to detect barcode
      const result = await codeReaderRef.current.decode(processedImage);

      if (result) {
        // Play success sound
        const audio = new Audio(beepSound);
        await audio.play().catch(console.error);

        // Call the onScan callback with the result
        onScan(result.getText());
      }

      // Cleanup
      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error('Error processing image:', error);
      let errorMessage = 'Could not detect barcode in image. Please try again with a clearer image.';

      if (error instanceof Exception && error.name === 'NotFoundException') {
        errorMessage = 'No barcode found in the image. Please try a different image or ensure the barcode is clearly visible.';
      }

      setError(errorMessage);
      onError(error as Error);
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let mounted = true;

    const startScanning = async () => {
      try {
        setIsScanning(true);
        const videoInputDevices = await codeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          throw new Error('No video input devices found');
        }

        const selectedDeviceId = videoInputDevices[0].deviceId;

        if (videoRef.current) {
          await codeReader.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result: Result | null, error?: Error) => {
              if (mounted) {
                if (result) {
                  onScan(result.getText());
                }
                if (error && error?.name !== 'NotFoundException') {
                  onError(error);
                }
              }
            }
          );
        }
      } catch (err) {
        if (mounted) {
          onError(err instanceof Error ? err : new Error('Failed to initialize scanner'));
          setIsScanning(false);
        }
      }
    };

    startScanning();

    return () => {
      mounted = false;
      codeReader.reset();
      setIsScanning(false);
    };
  }, [onScan, onError]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full h-[300px] object-cover rounded-lg"
      />
      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-blue-500 rounded-lg animate-pulse" />
        </div>
      )}
      <div className="mt-2 text-center text-sm text-gray-600">
        {isScanning ? 'Scanning for barcode...' : 'Starting camera...'}
      </div>

      {/* Image upload section */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="relative w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
            disabled={isProcessingImage}
          />
          <label
            htmlFor="image-upload"
            className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors ${
              isProcessingImage ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {isProcessingImage ? 'Processing...' : 'Upload Image'}
          </label>
        </div>
        <p className="text-xs text-gray-500 text-center">
          Upload an image containing a barcode to scan
        </p>
      </div>

      <div className="mt-2 text-sm text-center">
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : isScanning ? (
          <span className="text-green-600">Point your camera at a barcode to scan</span>
        ) : (
          <span className="text-blue-600">Initializing camera...</span>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
