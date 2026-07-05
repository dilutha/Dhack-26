import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-dhack-teal/10 border border-dhack-teal/20',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
