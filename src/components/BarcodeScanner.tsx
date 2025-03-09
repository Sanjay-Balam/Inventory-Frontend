import React, { useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { beepSound } from '@/lib/beepSound';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          throw new Error('No camera found');
        }
        
        setIsScanning(true);
        await codeReader.decodeFromVideoDevice(
          undefined, // Let the library choose the best camera
          'video',
          (result, error) => {
            if (result) {
              // Play the embedded beep sound on successful scan
              const audio = new Audio(beepSound);
              audio.play().catch(() => {}); // Ignore if sound fails
              
              onScan(result.getText());
            }
            if (error && error !== undefined) {
              // Only report non-null errors
              if (error.name !== 'NotFoundException') {
                onError?.(error);
              }
            }
          }
        );
      } catch (err) {
        setIsScanning(false);
        onError?.(err as Error);
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      codeReader.reset();
      setIsScanning(false);
    };
  }, [onScan, onError]);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
        <video
          id="video"
          className="w-full h-full object-cover"
        />
        {isScanning && (
          <div className="absolute inset-0 border-2 border-blue-500 animate-pulse pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 transform -translate-y-1/2"></div>
          </div>
        )}
      </div>
      <div className="mt-2 text-sm text-center">
        {isScanning ? (
          <span className="text-green-600">Point your camera at a barcode to scan</span>
        ) : (
          <span className="text-red-600">Initializing camera...</span>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;