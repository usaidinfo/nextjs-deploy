// src/components/dashboard/AddSensorSetup.tsx
'use client'
import Image from 'next/image';

interface AddSensorSetupProps {
  onClose: () => void;
}

const AddSensorSetup = ({ onClose }: AddSensorSetupProps) => {

  const handleOk = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="flex flex-col items-center">


          <div className="bg-black/70 backdrop-blur-lg border border-zinc-700/50 rounded-xl max-w-2xl p-8 w-full">
            <div className='w-4/5 mx-auto'>
              <p className="text-gray-400 text-center font-sans text-lg my-5">
                To add a Leaf AI device, open Leaf-MyGrow on your smartphone and use your camera to scan the QR code
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg">
                <Image
                  src="/QR-code.png"
                  alt="QR Code"
                  width={140}
                  height={140}
                  className="rounded-lg"
                />
              </div>
            </div>

            <p className="text-gray-400 text-sm text-center">
              The QR code will take you directly to Leaf-MyGrow on your smartphone.
            </p>
            
            <div className='flex justify-end mt-3'>
              <button
                onClick={handleOk}
                className='px-8 rounded-xl py-2 bg-white hover:bg-gray-100 text-black transition-colors'
              >
                OK
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AddSensorSetup;