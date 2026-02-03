
import { Badge as BadgeType } from '@/types/badges';
import Image from 'next/image';

interface BadgeProps {
  badge: BadgeType;
}

export default function Badge({ badge }: BadgeProps) {
  return (
    <div className="relative group">
      <Image
        src={badge.icon}
        alt={badge.name}
        width={40}
        height={40}
        className="rounded-full transition-transform duration-200 group-hover:scale-110"
      />
      <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <p className="font-bold">{badge.name}</p>
        <p>{badge.description}</p>
      </div>
    </div>
  );
}
    