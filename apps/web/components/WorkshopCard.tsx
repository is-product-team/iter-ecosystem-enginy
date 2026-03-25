import React from 'react';
import { Workshop } from '../services/workshopService';
import Image from 'next/image';
import WorkshopIcon from './WorkshopIcon';

interface WorkshopCardProps {
  item: Workshop;
  onPress: () => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ item, onPress }) => {
  const imageSource = item.image 
    || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop";

  return (
    <button
      onClick={onPress}
      className="mb-6 border border-gray-300 overflow-hidden cursor-pointer transition-colors hover:border-consorci-lightBlue w-full text-left"
    >
      <div className="h-48 w-full bg-gray-200 relative">
        <Image 
          src={imageSource}
          className="w-full h-full object-cover"
          alt={item.title}
          width={400}
          height={300}
        />
        <div className="absolute top-3 left-3 bg-white px-3 py-1">
          <span className="text-blue-600 text-xs font-bold uppercase">
            {item.modality}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <WorkshopIcon iconName={item.icon || "PUZZLE"} className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-blue-600 font-bold text-xl leading-6">
              {item.title}
            </span>
          </div>
        </div>

        <span className="text-gray-600 text-sm leading-5 mb-4">
          {item.technicalDetails?.description || "No description available."}
        </span>

        <div className="flex items-center justify-between pt-3 border-t border-gray-300">
          <div className="flex items-center">
            <span className="text-blue-400 text-xs mr-1">👥</span>
            <span className="text-gray-600 text-xs font-medium">
              {item.technicalDetails?.maxPlaces ?? "-"} places
            </span>
          </div>

          <div className="bg-blue-600 px-4 py-2 hover:bg-blue-700 transition-colors">
            <span className="text-white text-xs font-bold">Veure Taller</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default WorkshopCard;