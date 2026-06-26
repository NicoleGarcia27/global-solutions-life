export default function LogoGSL({ className = "w-20" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arc — large C shape opening lower-right */}
      <path d="M 100 12 A 88 88 0 1 0 175 95" stroke="#3dbdb4" strokeWidth="11" fill="none" strokeLinecap="round"/>
      {/* Outer crossbar */}
      <line x1="175" y1="95" x2="130" y2="95" stroke="#3dbdb4" strokeWidth="11" strokeLinecap="round"/>

      {/* Middle arc */}
      <path d="M 100 32 A 68 68 0 1 0 155 95" stroke="#3dbdb4" strokeWidth="10" fill="none" strokeLinecap="round"/>
      {/* Middle crossbar */}
      <line x1="155" y1="95" x2="118" y2="95" stroke="#3dbdb4" strokeWidth="10" strokeLinecap="round"/>

      {/* Inner arc — full G with crossbar */}
      <path d="M 100 52 A 48 48 0 1 0 135 95" stroke="#3dbdb4" strokeWidth="9" fill="none" strokeLinecap="round"/>
      {/* Inner crossbar + small downward hook */}
      <line x1="135" y1="95" x2="108" y2="95" stroke="#3dbdb4" strokeWidth="9" strokeLinecap="round"/>
      <line x1="108" y1="95" x2="108" y2="115" stroke="#3dbdb4" strokeWidth="9" strokeLinecap="round"/>
    </svg>
  );
}
