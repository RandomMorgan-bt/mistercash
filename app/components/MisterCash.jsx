'use client'

export default function MisterCash({ expression = 'neutral', size = 140 }) {

  return (
    <svg
      width={size}
      height={size * 1.65}
      viewBox="0 0 200 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="goldBelt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e070"/>
          <stop offset="30%" stopColor="#d4a820"/>
          <stop offset="70%" stopColor="#b88a10"/>
          <stop offset="100%" stopColor="#e0c040"/>
        </linearGradient>
        <linearGradient id="goldBuckle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d050"/>
          <stop offset="50%" stopColor="#c8a020"/>
          <stop offset="100%" stopColor="#a07010"/>
        </linearGradient>
        <linearGradient id="billFront" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d4e4a0"/>
          <stop offset="50%" stopColor="#c8dc90"/>
          <stop offset="100%" stopColor="#b8cc80"/>
        </linearGradient>
        <linearGradient id="billSide" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a8a28"/>
          <stop offset="100%" stopColor="#8aaa38"/>
        </linearGradient>
        <linearGradient id="shoeL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2a0a"/>
          <stop offset="100%" stopColor="#2a1005"/>
        </linearGradient>
        <linearGradient id="watchMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0e0e0"/>
          <stop offset="50%" stopColor="#b8b8b8"/>
          <stop offset="100%" stopColor="#d0d0d0"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
        </filter>
      </defs>

      <style>{`
        @keyframes mc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes mc-blink {
          0%, 84%, 100% { transform: scaleY(1); }
          91% { transform: scaleY(0.04); }
        }
        @keyframes mc-leftarm {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        .mc-float { animation: mc-float 3.5s ease-in-out infinite; transform-origin: 100px 310px; }
        .mc-eyes { animation: mc-blink 5s ease-in-out infinite; transform-origin: 94px 88px; }
        .mc-leftarm { animation: mc-leftarm 3.5s ease-in-out infinite; transform-origin: 58px 148px; }
      `}</style>

      <g className="mc-float" filter="url(#shadow)">

        {/* ========== LEGS ========== */}
        <path d="M72 246 Q70 268 68 285" stroke="#1a2e0a" strokeWidth="20" strokeLinecap="round" fill="none"/>
        <path d="M72 246 Q70 268 68 285" stroke="#2d5010" strokeWidth="16" strokeLinecap="round" fill="none"/>
        <path d="M118 246 Q120 268 122 285" stroke="#1a2e0a" strokeWidth="20" strokeLinecap="round" fill="none"/>
        <path d="M118 246 Q120 268 122 285" stroke="#2d5010" strokeWidth="16" strokeLinecap="round" fill="none"/>

        {/* Left shoe */}
        <ellipse cx="66" cy="289" rx="22" ry="11" fill="url(#shoeL)" stroke="#1a0a02" strokeWidth="2"/>
        <ellipse cx="66" cy="289" rx="20" ry="9" fill="#3d2008"/>
        <path d="M46 292 Q66 298 88 292" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <ellipse cx="58" cy="285" rx="10" ry="4" fill="white" opacity="0.12"/>
        <line x1="56" y1="287" x2="76" y2="287" stroke="#5a3010" strokeWidth="1" opacity="0.5"/>

        {/* Right shoe */}
        <ellipse cx="124" cy="289" rx="22" ry="11" fill="url(#shoeL)" stroke="#1a0a02" strokeWidth="2"/>
        <ellipse cx="124" cy="289" rx="20" ry="9" fill="#3d2008"/>
        <path d="M104 292 Q124 298 146 292" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
        <ellipse cx="116" cy="285" rx="10" ry="4" fill="white" opacity="0.12"/>
        <line x1="114" y1="287" x2="134" y2="287" stroke="#5a3010" strokeWidth="1" opacity="0.5"/>

        {/* ========== LEFT ARM (raised/waving) ========== */}
        <g className="mc-leftarm">
          <path d="M56 148 Q32 130 22 105" stroke="#1a2e0a" strokeWidth="20" strokeLinecap="round" fill="none"/>
          <path d="M56 148 Q32 130 22 105" stroke="#3a6018" strokeWidth="16" strokeLinecap="round" fill="none"/>
          <path d="M22 105 Q18 88 22 72" stroke="#1a2e0a" strokeWidth="18" strokeLinecap="round" fill="none"/>
          <path d="M22 105 Q18 88 22 72" stroke="#3a6018" strokeWidth="14" strokeLinecap="round" fill="none"/>
          <ellipse cx="22" cy="65" rx="14" ry="14" fill="#3a6018" stroke="#1a2e0a" strokeWidth="2"/>
          <ellipse cx="10" cy="55" rx="5.5" ry="9" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1.5" transform="rotate(-30 10 55)"/>
          <ellipse cx="18" cy="50" rx="5.5" ry="10" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1.5" transform="rotate(-10 18 50)"/>
          <ellipse cx="27" cy="50" rx="5.5" ry="10" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1.5" transform="rotate(10 27 50)"/>
          <ellipse cx="35" cy="54" rx="5" ry="9" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1.5" transform="rotate(28 35 54)"/>
          <ellipse cx="8" cy="67" rx="5" ry="7" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1.5" transform="rotate(-50 8 67)"/>
          <line x1="12" y1="58" x2="14" y2="62" stroke="#1a2e0a" strokeWidth="1" opacity="0.4"/>
          <line x1="20" y1="54" x2="22" y2="58" stroke="#1a2e0a" strokeWidth="1" opacity="0.4"/>
          <line x1="29" y1="54" x2="30" y2="58" stroke="#1a2e0a" strokeWidth="1" opacity="0.4"/>
        </g>

        {/* ========== RIGHT ARM ========== */}
        <path d="M142 148 Q164 162 170 188" stroke="#1a2e0a" strokeWidth="20" strokeLinecap="round" fill="none"/>
        <path d="M142 148 Q164 162 170 188" stroke="#3a6018" strokeWidth="16" strokeLinecap="round" fill="none"/>
        <ellipse cx="171" cy="196" rx="14" ry="13" fill="#3a6018" stroke="#1a2e0a" strokeWidth="2"/>
        <rect x="160" y="190" width="22" height="12" rx="6" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1.5"/>
        <ellipse cx="164" cy="190" rx="4" ry="3" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1"/>
        <ellipse cx="171" cy="189" rx="4" ry="3" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1"/>
        <ellipse cx="178" cy="190" rx="4" ry="3" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1"/>
        <ellipse cx="158" cy="197" rx="5" ry="7" fill="#3a6018" stroke="#1a2e0a" strokeWidth="1.5" transform="rotate(20 158 197)"/>

        {/* ========== ROLEX on RIGHT wrist ========== */}
        <rect x="158" y="182" width="22" height="7" rx="3" fill="#a0a0a0" stroke="#808080" strokeWidth="1"/>
        <rect x="160" y="183" width="18" height="5" rx="2" fill="#b8b8b8"/>
        <rect x="155" y="187" width="28" height="20" rx="5" fill="url(#watchMetal)" stroke="#909090" strokeWidth="1.5"/>
        <rect x="157" y="189" width="24" height="16" rx="4" fill="#c0c0c0" stroke="#a0a0a0" strokeWidth="1"/>
        <rect x="159" y="190.5" width="20" height="13" rx="3" fill="#08081a"/>
        <rect x="168.5" y="191.5" width="1.5" height="2.5" rx="0.5" fill="#d0d0d0"/>
        <rect x="168.5" y="200" width="1.5" height="2.5" rx="0.5" fill="#d0d0d0"/>
        <rect x="160" y="196.5" width="2.5" height="1.5" rx="0.5" fill="#d0d0d0"/>
        <rect x="176" y="196.5" width="2.5" height="1.5" rx="0.5" fill="#d0d0d0"/>
        <line x1="169" y1="197" x2="169" y2="193" stroke="#e0e0e0" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="169" y1="197" x2="172" y2="198.5" stroke="#e0e0e0" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="169" y1="197" x2="167" y2="201" stroke="#cc2020" strokeWidth="0.8" strokeLinecap="round"/>
        <circle cx="169" cy="197" r="1" fill="#d0d0d0"/>
        <text x="169" y="199.5" textAnchor="middle" fill="#c0c0c0" fontSize="2.2" fontFamily="serif" letterSpacing="0.4">ROLEX</text>
        <text x="169" y="195" textAnchor="middle" fill="#c0c0c0" fontSize="2.5" fontFamily="serif">♛</text>
        <rect x="183" y="194.5" width="3.5" height="6" rx="1.2" fill="#b8b8b8" stroke="#909090" strokeWidth="0.8"/>
        <rect x="158" y="207" width="22" height="7" rx="3" fill="#a0a0a0" stroke="#808080" strokeWidth="1"/>
        <rect x="160" y="208" width="18" height="5" rx="2" fill="#b8b8b8"/>

        {/* ========== BILL STACK — FULL BODY ========== */}

        {/* Right side bill layers */}
        <rect x="138" y="18" width="10" height="232" rx="3" fill="#4a6818" transform="rotate(2.5 143 134)"/>
        <rect x="138" y="18" width="10" height="232" rx="3" fill="#547520" transform="rotate(1.8 143 134)"/>
        <rect x="138" y="18" width="9" height="232" rx="3" fill="#5e8224" transform="rotate(1.2 143 134)"/>
        <rect x="138" y="18" width="9" height="232" rx="3" fill="#688f28" transform="rotate(0.6 143 134)"/>
        <rect x="138" y="18" width="8" height="232" rx="3" fill="#729c2c"/>

        {/* Left side bill layers */}
        <rect x="52" y="18" width="10" height="232" rx="3" fill="#4a6818" transform="rotate(-2.5 57 134)"/>
        <rect x="52" y="18" width="10" height="232" rx="3" fill="#547520" transform="rotate(-1.8 57 134)"/>
        <rect x="52" y="18" width="9" height="232" rx="3" fill="#5e8224" transform="rotate(-1.2 57 134)"/>
        <rect x="52" y="18" width="9" height="232" rx="3" fill="#688f28" transform="rotate(-0.6 57 134)"/>

        {/* Main front bill */}
        <rect x="52" y="16" width="90" height="234" rx="7" fill="url(#billFront)" stroke="#8a9e50" strokeWidth="1.5"/>

        {/* Outer border */}
        <rect x="55" y="19" width="84" height="228" rx="5" fill="none" stroke="#7a9040" strokeWidth="2" opacity="0.5"/>
        {/* Inner border */}
        <rect x="58" y="22" width="78" height="222" rx="3" fill="none" stroke="#7a9040" strokeWidth="1" opacity="0.3"/>

        {/* ===== BILL TEXTURE DETAILS ===== */}

        {/* Top decorative lines */}
        <rect x="58" y="26" width="78" height="1.2" rx="0.6" fill="#6a8430" opacity="0.35"/>
        <rect x="58" y="28" width="78" height="0.6" rx="0.3" fill="#6a8430" opacity="0.2"/>

        {/* Top corner 1s */}
        <text x="61" y="40" fill="#5a7430" fontSize="13" fontWeight="bold" opacity="0.55" fontFamily="serif">1</text>
        <text x="133" y="40" fill="#5a7430" fontSize="13" fontWeight="bold" opacity="0.55" fontFamily="serif" textAnchor="end">1</text>

        {/* ONE top center */}
        <text x="97" y="34" textAnchor="middle" fill="#5a7430" fontSize="6" fontWeight="bold" opacity="0.3" fontFamily="serif" letterSpacing="2">ONE</text>

        {/* Top fine print — very faint */}
        <text x="97" y="47" textAnchor="middle" fill="#5a7430" fontSize="4.5" opacity="0.25" fontFamily="serif" letterSpacing="0.5">THE UNITED STATES OF AMERICA</text>

        {/* Center oval portrait frame */}
        <ellipse cx="97" cy="100" rx="24" ry="28" fill="none" stroke="#6a8430" strokeWidth="1.5" opacity="0.3"/>
        <ellipse cx="97" cy="100" rx="20" ry="24" fill="none" stroke="#6a8430" strokeWidth="0.8" opacity="0.2"/>

        {/* Bottom decorative lines */}
        <rect x="58" y="218" width="78" height="1.2" rx="0.6" fill="#6a8430" opacity="0.35"/>
        <rect x="58" y="220" width="78" height="0.6" rx="0.3" fill="#6a8430" opacity="0.2"/>

        {/* Bottom corner 1s */}
        <text x="61" y="234" fill="#5a7430" fontSize="13" fontWeight="bold" opacity="0.55" fontFamily="serif">1</text>
        <text x="133" y="234" fill="#5a7430" fontSize="13" fontWeight="bold" opacity="0.55" fontFamily="serif" textAnchor="end">1</text>

        {/* ONE bottom center */}
        <text x="97" y="243" textAnchor="middle" fill="#5a7430" fontSize="6" fontWeight="bold" opacity="0.3" fontFamily="serif" letterSpacing="2">ONE</text>

        {/* Serial number — very subtle */}
        <text x="64" y="215" fill="#5a7430" fontSize="4.5" opacity="0.3" fontFamily="monospace" letterSpacing="0.8">K 48392710 B</text>
        <text x="130" y="215" fill="#5a7430" fontSize="4.5" opacity="0.3" fontFamily="monospace" letterSpacing="0.8" textAnchor="end">K 48392710 B</text>

        {/* Bottom center seal */}
        <ellipse cx="97" cy="200" rx="16" ry="12" fill="none" stroke="#6a8430" strokeWidth="1" opacity="0.25"/>
        <text x="97" y="204" textAnchor="middle" fill="#5a7430" fontSize="9" opacity="0.25" fontFamily="serif">K</text>

        {/* ========== GOLD CLIP BELT ========== */}
        <rect x="50" y="158" width="94" height="26" rx="5" fill="#000" opacity="0.25"/>
        <rect x="50" y="155" width="94" height="26" rx="5" fill="url(#goldBelt)" stroke="#9a7a00" strokeWidth="2"/>
        <rect x="52" y="156.5" width="90" height="7" rx="4" fill="#f8e880" opacity="0.35"/>
        <rect x="52" y="174" width="90" height="5" rx="3" fill="#7a5a00" opacity="0.3"/>

        {/* Buckle */}
        <rect x="74" y="151" width="46" height="34" rx="7" fill="url(#goldBuckle)" stroke="#9a7a00" strokeWidth="2"/>
        <rect x="76" y="153" width="42" height="30" rx="6" fill="#c8a020"/>
        <rect x="78" y="155" width="38" height="26" rx="5" fill="none" stroke="#e0c040" strokeWidth="1" opacity="0.5"/>
        <text x="97" y="172" textAnchor="middle" fill="#f0d060" fontSize="14" fontFamily="serif">♛</text>
        <text x="97" y="180" textAnchor="middle" fill="#e8c840" fontSize="5" fontFamily="serif" letterSpacing="1" opacity="0.8">ROLEX</text>

        {/* Left rivet */}
        <circle cx="63" cy="168" r="7" fill="#c8a020" stroke="#9a7a00" strokeWidth="1.5"/>
        <circle cx="63" cy="168" r="4.5" fill="#e0c040"/>
        <circle cx="63" cy="168" r="2" fill="#c8a020"/>
        <line x1="60.5" y1="168" x2="65.5" y2="168" stroke="#9a7a00" strokeWidth="1.2"/>
        <line x1="63" y1="165.5" x2="63" y2="170.5" stroke="#9a7a00" strokeWidth="1.2"/>

        {/* Right rivet */}
        <circle cx="131" cy="168" r="7" fill="#c8a020" stroke="#9a7a00" strokeWidth="1.5"/>
        <circle cx="131" cy="168" r="4.5" fill="#e0c040"/>
        <circle cx="131" cy="168" r="2" fill="#c8a020"/>
        <line x1="128.5" y1="168" x2="133.5" y2="168" stroke="#9a7a00" strokeWidth="1.2"/>
        <line x1="131" y1="165.5" x2="131" y2="170.5" stroke="#9a7a00" strokeWidth="1.2"/>

        {/* Extra coin details */}
        <circle cx="72" cy="168" r="4" fill="#d4b030" stroke="#9a7a00" strokeWidth="1" opacity="0.7"/>
        <circle cx="122" cy="168" r="4" fill="#d4b030" stroke="#9a7a00" strokeWidth="1" opacity="0.7"/>

        {/* ========== FACE ========== */}

        {/* EYEBROWS */}
        {expression === 'neutral' && <>
          <path d="M65 64 Q76 57 88 62" stroke="#3a2808" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <path d="M106 62 Q118 57 129 64" stroke="#3a2808" strokeWidth="5" strokeLinecap="round" fill="none"/>
        </>}
        {expression === 'thinking' && <>
          <path d="M65 62 Q76 53 88 60" stroke="#3a2808" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <path d="M106 58 Q118 50 129 57" stroke="#3a2808" strokeWidth="5" strokeLinecap="round" fill="none"/>
        </>}
        {expression === 'impressed' && <>
          <path d="M64 59 Q76 50 88 57" stroke="#3a2808" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
          <path d="M106 57 Q118 50 130 59" stroke="#3a2808" strokeWidth="5.5" strokeLinecap="round" fill="none"/>
        </>}
        {expression === 'hyped' && <>
          <path d="M62 56 Q76 45 89 53" stroke="#3a2808" strokeWidth="6" strokeLinecap="round" fill="none"/>
          <path d="M105 53 Q118 45 132 56" stroke="#3a2808" strokeWidth="6" strokeLinecap="round" fill="none"/>
        </>}

        {/* EYES */}
        <g className="mc-eyes">
          {/* Left eye */}
          <ellipse cx="76" cy="82" rx="16" ry="18" fill="white" stroke="#2a1808" strokeWidth="2"/>
          <ellipse cx="77" cy="83" rx="10" ry="12" fill="#2255aa"/>
          <ellipse cx="78" cy="84" rx="6" ry="8" fill="#080808"/>
          <ellipse cx="82" cy="77" rx="5" ry="5" fill="white"/>
          <ellipse cx="72" cy="87" rx="2" ry="2" fill="white" opacity="0.6"/>

          {/* Right eye */}
          <ellipse cx="116" cy="82" rx="16" ry="18" fill="white" stroke="#2a1808" strokeWidth="2"/>
          <ellipse cx="117" cy="83" rx="10" ry="12" fill="#2255aa"/>
          <ellipse cx="118" cy="84" rx="6" ry="8" fill="#080808"/>
          <ellipse cx="122" cy="77" rx="5" ry="5" fill="white"/>
          <ellipse cx="112" cy="87" rx="2" ry="2" fill="white" opacity="0.6"/>

          {expression === 'thinking' && (
            <ellipse cx="116" cy="82" rx="16" ry="10" fill="white" stroke="#2a1808" strokeWidth="2"/>
          )}
        </g>

        {/* NOSE */}
        <path d="M91 100 Q97 107 103 100" stroke="#8a9e50" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5"/>

        {/* CHEEKS */}
        {(expression === 'impressed' || expression === 'hyped') && <>
          <ellipse cx="63" cy="105" rx="12" ry="7" fill="#ff7040" opacity="0.18"/>
          <ellipse cx="129" cy="105" rx="12" ry="7" fill="#ff7040" opacity="0.18"/>
        </>}

        {/* MOUTH */}
        {expression === 'neutral' && <>
          <path d="M70 112 Q97 130 124 112" stroke="#2a1808" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
          <path d="M73 114 Q97 128 121 114 Q97 122 73 114" fill="white" opacity="0.85"/>
          <path d="M76 120 Q97 127 118 120" stroke="#2a1808" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
        </>}
        {expression === 'thinking' && (
          <path d="M75 114 Q97 118 116 112" stroke="#2a1808" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        )}
        {expression === 'impressed' && <>
          <path d="M67 110 Q97 134 127 110" stroke="#2a1808" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
          <path d="M70 112 Q97 132 124 112 Q97 124 70 112" fill="white" opacity="0.9"/>
          <path d="M72 116 Q97 128 122 116 Q97 122 72 116" fill="#cc4040" opacity="0.35"/>
          <path d="M74 120 Q97 127 120 120" stroke="#2a1808" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
        </>}
        {expression === 'hyped' && <>
          <path d="M64 108 Q97 138 130 108" stroke="#2a1808" strokeWidth="4" strokeLinecap="round" fill="none"/>
          <path d="M67 110 Q97 136 127 110 Q97 126 67 110" fill="white" opacity="0.95"/>
          <path d="M70 115 Q97 130 124 115 Q97 124 70 115" fill="#cc4040" opacity="0.5"/>
          <path d="M72 120 Q97 128 122 120" stroke="#2a1808" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
          <path d="M64 108 Q62 106 65 104" stroke="#2a1808" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <path d="M130 108 Q132 106 129 104" stroke="#2a1808" strokeWidth="2" strokeLinecap="round" fill="none"/>
        </>}

        {/* Thinking bubble */}
        {expression === 'thinking' && <>
          <circle cx="140" cy="55" r="4.5" fill="white" opacity="0.9" stroke="#ddd" strokeWidth="0.8"/>
          <circle cx="152" cy="42" r="7" fill="white" opacity="0.9" stroke="#ddd" strokeWidth="0.8"/>
          <circle cx="167" cy="27" r="11" fill="white" opacity="0.92" stroke="#ddd" strokeWidth="0.8"/>
          <text x="167" y="31" textAnchor="middle" fill="#666" fontSize="9" fontWeight="bold">...</text>
        </>}

      </g>
    </svg>
  )
}
