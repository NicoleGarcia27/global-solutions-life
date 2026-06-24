export default function LogoGSL({ className = "w-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arc - starts top-left, goes clockwise, ends middle-right with crossbar */}
      <path d="M 80 8 A 72 72 0 1 0 152 80" stroke="#3dbdb4" strokeWidth="9" fill="none" strokeLinecap="round"/>
      <line x1="152" y1="80" x2="115" y2="80" stroke="#3dbdb4" strokeWidth="9" strokeLinecap="round"/>
      {/* Middle arc */}
      <path d="M 80 26 A 54 54 0 1 0 134 80" stroke="#3dbdb4" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <line x1="134" y1="80" x2="105" y2="80" stroke="#3dbdb4" strokeWidth="8" strokeLinecap="round"/>
      {/* Inner arc */}
      <path d="M 80 44 A 36 36 0 1 0 116 80" stroke="#3dbdb4" strokeWidth="7" fill="none" strokeLinecap="round"/>
      <line x1="116" y1="80" x2="96" y2="80" stroke="#3dbdb4" strokeWidth="7" strokeLinecap="round"/>
    </svg>
  );
}
