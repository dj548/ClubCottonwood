interface DuckIconProps {
  className?: string;
  size?: number;
}

export default function DuckIcon({ className = '', size = 24 }: DuckIconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Duck body */}
      <ellipse cx="12" cy="14" rx="7" ry="5" />
      {/* Duck head */}
      <circle cx="17" cy="8" r="3" />
      {/* Duck beak */}
      <path d="M20 8h3" />
      {/* Duck eye */}
      <circle cx="18" cy="7.5" r="0.5" fill="currentColor" />
      {/* Duck neck */}
      <path d="M14 10c1-1 2-1.5 3-1.5" />
      {/* Duck tail */}
      <path d="M5 12c-1-1-1-2 0-3" />
      {/* Duck wing */}
      <path d="M9 13c1 0 2 1 3 1" />
    </svg>
  );
}
