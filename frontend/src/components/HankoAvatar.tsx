interface HankoAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

export default function HankoAvatar({
  size = 'md',
  text = '印',
  className = '',
}: HankoAvatarProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-base',
    lg: 'w-20 h-20 text-lg',
    xl: 'w-28 h-28 text-2xl',
  };

  return (
    <div
      className={`hanko-stamp rounded-md ${sizeClasses[size]} ${className}`}
    >
      <span
        className="font-serif-jp font-black text-white tracking-wider"
        style={{
          textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
          fontFamily: "'Noto Serif JP', serif",
        }}
      >
        {text}
      </span>
    </div>
  );
}
