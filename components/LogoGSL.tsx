export default function LogoGSL({ className = "w-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arc - full G with crossbar and hook */}
      <path d="M 100 8 A 92 92 0 1 0 175 145 L 175 100 L 130 100" stroke="#3dbdb4" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Middle arc */}
      <path d="M 100 26 A 74 74 0 1 0 157 145 L 157 100 L 118 100" stroke="#3dbdb4" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Inner arc */}
      <path d="M 100 44 A 56 56 0 1 0 139 145 L 139 100 L 107 100" stroke="#3dbdb4" strokeWidth="8.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
