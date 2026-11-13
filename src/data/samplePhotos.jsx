import React from 'react';

export const SAMPLE_PRESETS = [
  {
    id: 'preset:flowers',
    name: 'Bó Hoa Thảo Mộc',
    subtitle: 'Hoa cúc họa mi & cành khô vintage',
    caption: 'Ngát hương tuổi mới ✨',
    render: () => (
      <svg
        viewBox="0 0 320 240"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #F9F6F0 0%, #EDE6D8 100%)' }}
      >
        <defs>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Warm Circle */}
        <circle cx="160" cy="120" r="75" fill="#F4E9DC" opacity="0.8" />
        <circle cx="160" cy="120" r="50" fill="#E8D9C5" opacity="0.5" />

        {/* Kraft Paper Flower Wrap */}
        <polygon points="120,185 200,185 180,225 140,225" fill="#D4B996" stroke="#B89B74" strokeWidth="1.5" />
        <path d="M110,135 Q160,195 210,135 L190,205 L130,205 Z" fill="#E2CEB5" stroke="#C4A887" strokeWidth="1.5" />
        {/* Twine Bow */}
        <ellipse cx="160" cy="190" rx="14" ry="5" fill="none" stroke="#8C6D53" strokeWidth="1.8" />
        <path d="M152,192 C145,205 140,215 142,220" stroke="#8C6D53" strokeWidth="1.5" fill="none" />
        <path d="M168,192 C175,205 180,215 178,220" stroke="#8C6D53" strokeWidth="1.5" fill="none" />

        {/* Stems & Leaves */}
        <path d="M160,180 Q145,120 125,75" stroke="#6F8062" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M160,180 Q162,110 160,60" stroke="#6F8062" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M160,180 Q175,125 195,80" stroke="#6F8062" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M160,180 Q130,140 100,115" stroke="#5A6B4E" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M160,180 Q190,140 220,120" stroke="#5A6B4E" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Eucalyptus & Sage Leaves */}
        <ellipse cx="115" cy="98" rx="8" ry="14" transform="rotate(-35 115 98)" fill="#8A9E7E" opacity="0.9" />
        <ellipse cx="205" cy="102" rx="8" ry="14" transform="rotate(35 205 102)" fill="#8A9E7E" opacity="0.9" />
        <ellipse cx="138" cy="130" rx="7" ry="12" transform="rotate(-25 138 130)" fill="#738967" opacity="0.8" />
        <ellipse cx="182" cy="135" rx="7" ry="12" transform="rotate(25 182 135)" fill="#738967" opacity="0.8" />

        {/* Chamomile Flower Left */}
        <g transform="translate(125, 75)">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <ellipse key={deg} cx="0" cy="-14" rx="3.5" ry="9" transform={`rotate(${deg})`} fill="#FFFFFF" stroke="#E3DACD" strokeWidth="0.6" />
          ))}
          <circle cx="0" cy="0" r="7" fill="#E8B042" stroke="#C9942A" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="4.5" fill="#F4CA64" />
        </g>

        {/* Big Peony / Rose Center */}
        <g transform="translate(160, 60)">
          <circle cx="0" cy="0" r="22" fill="#EAC4C1" stroke="#D39F9B" strokeWidth="0.8" />
          <circle cx="-2" cy="-2" r="16" fill="#F2D7D5" stroke="#D39F9B" strokeWidth="0.8" />
          <circle cx="1" cy="1" r="11" fill="#DF9F99" stroke="#BF7D77" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="6" fill="#9E2A2B" opacity="0.6" />
        </g>

        {/* Lavender Spikes Right */}
        <g transform="translate(195, 80)">
          {[-18, -10, -2, 6, 14].map((y, idx) => (
            <g key={idx}>
              <ellipse cx="-4" cy={y} rx="3" ry="5" transform="rotate(-25)" fill="#9B8BA8" />
              <ellipse cx="4" cy={y - 2} rx="3" ry="5" transform="rotate(25)" fill="#B5A6C2" />
            </g>
          ))}
          <circle cx="0" cy="-24" r="3" fill="#D3C7DE" />
        </g>

        {/* Floating Delicate Seed Fluffs & Golden Specks */}
        <circle cx="85" cy="65" r="2" fill="#C9A66B" opacity="0.6" />
        <circle cx="235" cy="55" r="1.5" fill="#C9A66B" opacity="0.6" />
        <circle cx="245" cy="155" r="2" fill="#C9A66B" opacity="0.5" />
        <circle cx="75" cy="150" r="1.5" fill="#C9A66B" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'preset:cake',
    name: 'Bánh Kem Nghệ Nhân',
    subtitle: 'Bánh nướng bơ sữa & nến lung linh',
    caption: 'Ngọt ngào tuổi mới 🎂',
    render: () => (
      <svg
        viewBox="0 0 320 240"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #FBF8F2 0%, #EDE6DC 100%)' }}
      >
        {/* Soft Warm Halo */}
        <circle cx="160" cy="90" r="55" fill="#FCEBD2" opacity="0.7" />

        {/* Cake Stand Plate */}
        <ellipse cx="160" cy="195" rx="72" ry="12" fill="#E5DFD5" stroke="#C2BBB0" strokeWidth="1.5" />
        <path d="M150,195 L145,225 L175,225 L170,195 Z" fill="#D8D1C5" stroke="#B4ADA2" strokeWidth="1.2" />
        <ellipse cx="160" cy="225" rx="26" ry="6" fill="#C8C0B2" stroke="#9E9688" strokeWidth="1.2" />

        {/* Lower Cake Tier */}
        <path d="M105,150 C105,140 215,140 215,150 L215,185 C215,195 105,195 105,185 Z" fill="#F4EEE4" stroke="#D3C9BC" strokeWidth="1.4" />
        <ellipse cx="160" cy="150" rx="55" ry="11" fill="#EAE2D5" stroke="#D3C9BC" strokeWidth="1.2" />

        {/* Dripping Vanilla Buttercream */}
        <path
          d="M105,150 C115,162 120,154 128,165 C136,155 142,168 150,158 C158,167 165,156 172,166 C180,157 186,169 194,159 C202,168 208,154 215,150"
          stroke="#FAF7F2"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Top Cake Tier */}
        <path d="M120,115 C120,107 200,107 200,115 L200,145 C200,153 120,153 120,145 Z" fill="#FBF8F2" stroke="#D8CFC2" strokeWidth="1.4" />
        <ellipse cx="160" cy="115" rx="40" ry="9" fill="#F4EEE4" stroke="#D8CFC2" strokeWidth="1.2" />

        {/* Strawberries / Cherries on Top */}
        <circle cx="138" cy="112" r="5" fill="#9E2A2B" stroke="#7A1D1E" strokeWidth="0.8" />
        <circle cx="150" cy="116" r="4.5" fill="#BA3233" stroke="#7A1D1E" strokeWidth="0.8" />
        <circle cx="170" cy="116" r="4.5" fill="#BA3233" stroke="#7A1D1E" strokeWidth="0.8" />
        <circle cx="182" cy="112" r="5" fill="#9E2A2B" stroke="#7A1D1E" strokeWidth="0.8" />

        {/* Birthday Candle in Center */}
        <rect x="157" y="80" width="6" height="28" rx="1" fill="#F3E5D8" stroke="#B89B74" strokeWidth="1" />
        <line x1="160" y1="80" x2="160" y2="73" stroke="#2B2523" strokeWidth="1.4" />

        {/* Glowing Flame */}
        <ellipse cx="160" cy="65" rx="14" ry="18" fill="#FCE3A1" opacity="0.3" />
        <path d="M160,54 C154,64 154,71 160,73 C166,71 166,64 160,54 Z" fill="#F97316" />
        <path d="M160,60 C157,65 157,70 160,71 C163,70 163,65 160,60 Z" fill="#FDE047" />

        {/* Golden Confetti Specks */}
        <circle cx="95" cy="85" r="2" fill="#D4AF37" opacity="0.7" />
        <circle cx="225" cy="75" r="2.5" fill="#D4AF37" opacity="0.7" />
        <circle cx="230" cy="155" r="1.8" fill="#D4AF37" opacity="0.6" />
        <circle cx="85" cy="165" r="1.5" fill="#D4AF37" opacity="0.6" />
      </svg>
    ),
  },
  {
    id: 'preset:gift',
    name: 'Hộp Quà Mộc Mạc',
    subtitle: 'Gói giấy craft thắt dây gai & lá khô',
    caption: 'Món quà trân quý 🎁',
    render: () => (
      <svg
        viewBox="0 0 320 240"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #F7F3EB 0%, #E8DFC8 100%)' }}
      >
        <circle cx="160" cy="120" r="70" fill="#EFE8D6" opacity="0.6" />

        {/* Gift Box Body */}
        <rect x="105" y="115" width="110" height="90" rx="3" fill="#D9C2A7" stroke="#BFA588" strokeWidth="1.8" />
        {/* Gift Box Lid */}
        <rect x="98" y="98" width="124" height="22" rx="2" fill="#E5D2BC" stroke="#BFA588" strokeWidth="1.8" />

        {/* Ribbon Vertical */}
        <rect x="151" y="98" width="18" height="107" fill="#8C4A48" opacity="0.9" />
        <line x1="151" y1="98" x2="151" y2="205" stroke="#683432" strokeWidth="0.8" />
        <line x1="169" y1="98" x2="169" y2="205" stroke="#683432" strokeWidth="0.8" />

        {/* Ribbon Horizontal */}
        <rect x="105" y="150" width="110" height="18" fill="#8C4A48" opacity="0.9" />
        <line x1="105" y1="150" x2="215" y2="150" stroke="#683432" strokeWidth="0.8" />
        <line x1="105" y1="168" x2="215" y2="168" stroke="#683432" strokeWidth="0.8" />

        {/* Dried Eucalyptus Sprig Tucked Under Bow */}
        <path d="M160,98 Q140,75 118,55" stroke="#5E7052" strokeWidth="1.8" fill="none" />
        <ellipse cx="132" cy="74" rx="7" ry="12" transform="rotate(-35 132 74)" fill="#788C6B" />
        <ellipse cx="120" cy="58" rx="6" ry="10" transform="rotate(-40 120 58)" fill="#8A9E7E" />

        {/* Ribbon Bow on Top */}
        <path d="M160,98 C140,82 125,82 135,95 C142,102 155,99 160,98 Z" fill="#A85856" stroke="#683432" strokeWidth="1" />
        <path d="M160,98 C180,82 195,82 185,95 C178,102 165,99 160,98 Z" fill="#A85856" stroke="#683432" strokeWidth="1" />
        <circle cx="160" cy="98" r="5" fill="#8C4A48" stroke="#683432" strokeWidth="1" />
        {/* Trailing Ribbon Ends */}
        <path d="M158,102 C150,115 142,122 138,126" stroke="#8C4A48" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M162,102 C170,115 178,122 182,126" stroke="#8C4A48" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Gift Tag */}
        <polygon points="175,125 205,140 198,154 168,139" fill="#FAF7F2" stroke="#C5BDB0" strokeWidth="1" />
        <circle cx="174" cy="130" r="2" fill="#BFA588" />
        <line x1="174" y1="130" x2="162" y2="105" stroke="#8C6D53" strokeWidth="1" strokeDasharray="2,2" />
      </svg>
    ),
  },
  {
    id: 'preset:toast',
    name: 'Nâng Ly Chúc Mừng',
    subtitle: 'Champagne sủi bọt & ánh đèn ấm cúng',
    caption: 'Chúc mừng tuổi mới rực rỡ 🥂',
    render: () => (
      <svg
        viewBox="0 0 320 240"
        className="w-full h-full"
        style={{ background: 'linear-gradient(135deg, #FBF8F4 0%, #E9E1D2 100%)' }}
      >
        {/* Soft Golden Sparkle Glow */}
        <circle cx="160" cy="110" r="65" fill="#FCEAC7" opacity="0.6" />

        {/* String Lights on Top */}
        <path d="M20,30 Q160,60 300,30" stroke="#D1C3B2" strokeWidth="1.2" fill="none" />
        {[60, 110, 160, 210, 260].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={35 + (i === 2 ? 10 : i === 1 || i === 3 ? 8 : 4)} r="7" fill="#FCE09B" opacity="0.4" />
            <circle cx={x} cy={35 + (i === 2 ? 10 : i === 1 || i === 3 ? 8 : 4)} r="4" fill="#FBBF24" />
          </g>
        ))}

        {/* Left Champagne Coupe */}
        <g transform="translate(135, 135) rotate(-14)">
          <path d="M-22,-45 Q0,-5 22,-45 Z" fill="#FDF7EA" stroke="#B8A892" strokeWidth="1.6" />
          {/* Champagne Liquid */}
          <path d="M-18,-35 Q0,-8 18,-35 Z" fill="#FCD34D" opacity="0.6" />
          {/* Bubbles */}
          <circle cx="-5" cy="-25" r="1.5" fill="#FFFFFF" />
          <circle cx="4" cy="-28" r="1.2" fill="#FFFFFF" />
          <circle cx="0" cy="-18" r="1.5" fill="#FFFFFF" />
          {/* Stem & Base */}
          <line x1="0" y1="-5" x2="0" y2="45" stroke="#B8A892" strokeWidth="2.2" />
          <ellipse cx="0" cy="45" rx="16" ry="4" fill="#E8DEC9" stroke="#B8A892" strokeWidth="1.4" />
        </g>

        {/* Right Champagne Coupe */}
        <g transform="translate(185, 135) rotate(14)">
          <path d="M-22,-45 Q0,-5 22,-45 Z" fill="#FDF7EA" stroke="#B8A892" strokeWidth="1.6" />
          <path d="M-18,-35 Q0,-8 18,-35 Z" fill="#FCD34D" opacity="0.6" />
          <circle cx="-4" cy="-26" r="1.4" fill="#FFFFFF" />
          <circle cx="5" cy="-22" r="1.2" fill="#FFFFFF" />
          <line x1="0" y1="-5" x2="0" y2="45" stroke="#B8A892" strokeWidth="2.2" />
          <ellipse cx="0" cy="45" rx="16" ry="4" fill="#E8DEC9" stroke="#B8A892" strokeWidth="1.4" />
        </g>

        {/* Clinking Spark at Touch Point */}
        <g transform="translate(160, 92)">
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-8" y1="-8" x2="8" y2="8" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-8" y1="8" x2="8" y2="-8" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
        </g>
      </svg>
    ),
  },
];

export function getPresetById(id) {
  return SAMPLE_PRESETS.find((p) => p.id === id) || SAMPLE_PRESETS[0];
}

