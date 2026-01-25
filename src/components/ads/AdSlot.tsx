import { useActiveAdSlot, AdPosition } from '@/hooks/useAdSlots';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  position: AdPosition;
  className?: string;
}

const AdSlot = ({ position, className }: AdSlotProps) => {
  const { data: adSlot, isLoading } = useActiveAdSlot(position);

  // Don't render anything if no active ad slot or still loading
  if (isLoading || !adSlot) {
    return null;
  }

  const getPositionStyles = () => {
    switch (position) {
      case 'header':
        return 'w-full min-h-[90px] flex items-center justify-center';
      case 'sidebar':
        return 'w-full min-h-[250px] flex items-center justify-center';
      case 'in-article':
        return 'w-full min-h-[280px] my-6 flex items-center justify-center';
      case 'footer':
        return 'w-full min-h-[90px] flex items-center justify-center';
      case 'between-posts':
        return 'w-full min-h-[250px] my-4 flex items-center justify-center';
      default:
        return 'w-full min-h-[90px] flex items-center justify-center';
    }
  };

  return (
    <div 
      className={cn(
        'bg-muted/30 border border-dashed border-muted-foreground/20 rounded-lg overflow-hidden',
        getPositionStyles(),
        className
      )}
      data-ad-slot={adSlot.slot_id}
      data-ad-position={position}
    >
      {/* Google AdSense Script - Replace with actual ad code in production */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXX" // Replace with your AdSense publisher ID
        data-ad-slot={adSlot.slot_id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      
      {/* Placeholder for development */}
      <div className="text-center text-muted-foreground text-sm p-4">
        <p className="font-medium">{adSlot.name}</p>
        <p className="text-xs opacity-70">Ad Slot: {adSlot.slot_id}</p>
        <p className="text-xs opacity-50 mt-1">Position: {position}</p>
      </div>
    </div>
  );
};

export default AdSlot;
