import React, { useEffect, useState, useRef } from 'react';
import { BrowserMultiFormatReader, Exception } from '@zxing/library';
import { beepSound } from '@/lib/beepSound';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      onError?.(error as Error);
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const startScanner = async () => {
      try {
        // Initialize the code reader
        codeReaderRef.current = new BrowserMultiFormatReader();
        
        if (!videoRef.current) return;

        // First, stop any existing streams
        if (videoRef.current.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }

        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Available cameras:', videoDevices);
        
        if (videoDevices.length === 0) {
          throw new Error('No camera found');
        }

        // Request camera permission first
        const constraints = {
          video: {
            deviceId: videoDevices[0].deviceId,
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (!mounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
          }

          // Set the stream to video element
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Wait for video to be ready
            await new Promise((resolve) => {
              if (videoRef.current) {
                videoRef.current.onloadedmetadata = () => resolve(true);
              }
            });
            
            await videoRef.current.play();
            if (!mounted) return;
            
            setIsScanning(true);
            setError(null);

            // Start continuous scanning
            while (mounted && videoRef.current && codeReaderRef.current) {
              try {
                const result = await codeReaderRef.current.decodeFromVideoElement(videoRef.current);
                if (result && mounted) {
                  console.log('Barcode detected:', result.getText());
                  // Play the embedded beep sound on successful scan
                  const audio = new Audio(beepSound);
                  audio.play().catch((e) => console.error('Audio play error:', e));
                  onScan(result.getText());
                  // Add a small delay after successful scan
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              } catch (error: any) {
                if (error.name !== 'NotFoundException') {
                  console.error('Scanning error:', error);
                  onError?.(error);
                  if (retryCount < maxRetries) {
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    continue;
                  } else {
                    setError('Camera error. Please refresh the page or try a different browser.');
                    break;
                  }
                }
                // Add a small delay to prevent high CPU usage
                await new Promise(resolve => setTimeout(resolve, 100));
              }
            }
          }
        } catch (err) {
          console.error('Camera access error:', err);
          if (mounted) {
            setIsScanning(false);
            setError('Could not access camera. Please ensure you have granted camera permissions.');
            onError?.(err as Error);
          }
        }
      } catch (err) {
        console.error('Scanner initialization error:', err);
        if (mounted) {
          setIsScanning(false);
          setError('Failed to initialize scanner. Please refresh the page.');
          onError?.(err as Error);
        }
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      mounted = false;
      console.log('Cleaning up scanner...');
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      setIsScanning(false);
    };
  }, [onScan, onError]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />
        {isScanning && !error && (
          <div className="absolute inset-0 border-2 border-blue-500 animate-pulse pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 transform -translate-y-1/2"></div>
          </div>
        )}
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