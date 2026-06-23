export default function LogoGSL({ className = "w-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arc */}
      <path d="M 85 8 A 77 77 0 1 0 155 80 L 155 105 L 125 105"
        stroke="#3dbdb4" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Middle arc */}
      <path d="M 85 26 A 59 59 0 1 0 137 80 L 137 105 L 112 105"
        stroke="#3dbdb4" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Inner arc */}
      <path d="M 85 44 A 41 41 0 1 0 119 80 L 119 105 L 100 105"
        stroke="#3dbdb4" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
