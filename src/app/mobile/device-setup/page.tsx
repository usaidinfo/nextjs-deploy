// src/app/mobile/device-setup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { useDeviceStore } from 'lib/store/deviceStore';
import { sensorsService } from 'lib/services/sensor.service';

export default function DeviceSetupPage() {
  const router = useRouter();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanError, setScanError] = useState('');
  const setDeviceSN = useDeviceStore(state => state.setDeviceSN);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
  
    if (showQRScanner) {
      html5QrCode = new Html5Qrcode("qr-reader");
  
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };
  
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          try {
            const validation = await sensorsService.validateQRData(decodedText);
            
            if (validation.isValid && validation.data) {
              html5QrCode.stop();
              setDeviceSN(validation.data.sn);
              setShowQRScanner(false);
              router.push('/mobile/location');
            } else {
              setScanError(validation.error || 'Invalid QR code');
            }
          } catch (err) {
            console.error('Error validating device:', err);
            setScanError('Error validating device');
          }
        },
        (errorMessage) => {
          if (errorMessage?.includes('NotFoundError')) {
            setScanError('Camera not found. Please ensure camera permissions are granted.');
          }
        }
      ).catch((err) => {
        setScanError('Error starting camera. Please try again.');
        console.error('Error starting QR scanner:', err);
      });
    }
  
    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [showQRScanner, router, setDeviceSN]);

  return (
    <div className="min-h-[100dvh] bg-gradient flex flex-col p-4">
      <h1 className="text-white text-2xl font-light mt-12 text-center w-full">
        Scan the QR-Code on your <br />
        <span className='text-green-600'>Leaf-Connect Lite</span>
      </h1>

      {!showQRScanner ? (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <img
              src="/Setup-device.png"
              alt="Leaf Connect Device"
              className="h-[400px] w-auto object-contain"
            />
          </div>
          
          <div className="w-full flex justify-center pb-12">
            <button
              onClick={() => setShowQRScanner(true)}
              className="px-8 bg-white py-2.5 rounded-full text-sm font-medium"
            >
              Scan QR Code
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className='flex-1 flex items-center justify-center'>
            <div className="w-4/5 max-w-[90%] aspect-square relative rounded-lg overflow-hidden">
              <div id="qr-reader" className="w-full h-full" />
              {scanError && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-500/80 text-white p-2 text-sm text-center">
                  {scanError}
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex justify-end pb-12">
            <button
              onClick={() => setShowQRScanner(false)}
              className="px-4 bg-white py-3 rounded-xl text-sm font-medium flex items-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}