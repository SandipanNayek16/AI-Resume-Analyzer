import { cn } from "~/lib/utils";

interface BorderGlowProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
}

export function BorderGlow({ 
  children, 
  className, 
  glowColor = "#8b5cf6",
  ...props 
}: BorderGlowProps) {
  return (
    <div className={cn("relative group rounded-xl p-[1px] overflow-hidden", className)} {...props}>
      {/* Animated glowing gradient border */}
      <div 
        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite]"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0%, ${glowColor} 50%, transparent 100%)`
        }}
      />
      
      {/* Inner Content Container */}
      <div className="relative w-full h-full bg-surface-0 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
