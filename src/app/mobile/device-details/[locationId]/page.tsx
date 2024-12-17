// src/app/mobile/device-details/[locationId]/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDeviceStore } from 'lib/store/deviceStore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { SENSOR_IMAGES } from 'lib/constants/sensor-types';
import { sensorsService } from 'lib/services/sensor.service';


export default function DeviceDetailsPage() {
  const router = useRouter();
  const selectedLocation = useDeviceStore(state => state.selectedLocation);
  const deviceSN = useDeviceStore(state => state.deviceSN);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanError, setScanError] = useState('');
  const sensors = useDeviceStore(state => state.sensors);
  const setScannedSensor = useDeviceStore(state => state.setScannedSensor);
  const [isNavigating, setIsNavigating] = useState(false);



 const deviceDetails = {
   location: selectedLocation?.location_name || '',
   deviceName: 'Leaf-Connect Lite',
   serialNumber: deviceSN || 'SN-12345-ABC'
 };

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
          const validation = await sensorsService.validateAddSensorQRData(decodedText);
          
          if (validation.isValid && validation.data) {
            html5QrCode.stop();
            setScannedSensor({
              type: validation.data.type,
              sn: validation.data.sn,
              image: SENSOR_IMAGES['VWC Soil Moisture Sensor'],
              measurements: [],
              hasSubstrate: false
            });
            setShowQRScanner(false);
            router.push('/mobile/select-sensor');
          } else {
            setScanError(validation.error || 'Invalid QR code');
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          setScanError('Error validating sensor');
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
}, [showQRScanner, setScannedSensor]);

const handleLetsGrow = async () => {
  if (isNavigating) return;
  setIsNavigating(true);
  router.push('/mobile/dashboard');
};

if (showQRScanner) {
  return (
    <div className="min-h-[100dvh] bg-gradient flex flex-col p-4">
      <h1 className="text-white text-2xl font-light mt-12 text-center w-full">
        Scan the QR-Code on your <br />
        <span className='text-green-600'>Sensor</span>
      </h1>

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
    </div>
  );
}

 return (
   <div className="min-h-[100dvh] bg-gradient flex flex-col p-4">
     <h1 className="text-white text-xl font-light mt-12 mb-8 text-center">
       You added:
     </h1>

     <div className="flex-1 flex flex-col gap-5">
       <div className="bg-[rgba(24,24,27,0.5)] rounded-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)] p-6">
         <div className="flex gap-6">
           <div className="w-1/3">
             <img
               src="/Setup-device.png"
               alt="Leaf Connect Device"
               className="w-full h-auto object-contain"
             />
           </div>
           <div className="w-2/3 text-white">
             <div className="space-y-4">
               <div>
                 <p className="text-gray-400 text-sm">Location</p>
                 <p className="font-medium">{deviceDetails.location}</p>
               </div>
               <div>
                 <p className="text-gray-400 text-sm">Device</p>
                 <p className="font-medium">{deviceDetails.deviceName}</p>
               </div>
               <div>
                 <p className="text-gray-400 text-sm">SN Number</p>
                 <p className="font-medium">{deviceDetails.serialNumber}</p>
               </div>
             </div>
           </div>
         </div>
       </div>

       {sensors.map((sensor, index) => (
         <div key={index} className="bg-[rgba(24,24,27,0.5)] rounded-3xl shadow-[0_0_15px_rgba(255,255,255,0.1)] p-6">
           <div className="flex gap-6">
             <div className="w-1/3">
               <img
                 src={sensor.image}
                 alt={sensor.type}
                 className="w-full h-auto object-contain"
               />
             </div>
             <div className="w-2/3 text-white">
               <div className="space-y-4">
                 <div>
                   <p className="text-gray-400 text-sm">Sensor Type</p>
                   <p className="font-medium">{sensor.type}</p>
                 </div>
                 <div>
                   <p className="text-gray-400 text-sm">SN Number</p>
                   <p className="font-medium">{sensor.sn}</p>
                 </div>
                 {sensor.plantName && (
                   <div>
                     <p className="text-gray-400 text-sm">Plant</p>
                     <div className="flex items-center gap-2">
                       <p className="font-medium">{sensor.plantName}</p>
                     </div>
                   </div>
                 )}
                 {sensor.substrate && (
                   <div>
                     <p className="text-gray-400 text-sm">Substrate</p>
                     <p className="font-medium">{sensor.substrate}</p>
                   </div>
                 )}
               </div>
             </div>
           </div>
         </div>
       ))}
       

       <div className="flex-1 flex flex-col items-center justify-center">
         <p className="text-white font-light text-2xl text-center px-4 mb-6">Would you like to add a sensor?</p>
         <div className="flex gap-4">
           <button
             onClick={handleLetsGrow}
             disabled={isNavigating}
             className={`px-8 py-3 rounded-xl text-black bg-white text-sm font-medium ${isNavigating ? 'opacity-75 cursor-not-allowed' : ''
               }`}
           >
             {isNavigating ? 'Loading...' : 'Let\'s Grow'}
           </button>
           <button
             onClick={() => setShowQRScanner(true)}
             className="px-6 py-3 rounded-xl text-black bg-white text-sm font-medium flex items-center"
           >
             Add Sensor &nbsp;
             <ArrowForwardIcon sx={{ fontSize: 18, fontWeight: 300 }} />
           </button>
         </div>
       </div>
     </div>

     <div className="pb-6 mt-5">
       <button
         onClick={() => router.back()}
         className="w-12 h-12 flex items-center justify-center text-black rounded-full bg-white"
       >
         <ArrowBackIcon sx={{ fontSize: 18, fontWeight: 300 }}/>
       </button>
     </div>
   </div>
 );
}