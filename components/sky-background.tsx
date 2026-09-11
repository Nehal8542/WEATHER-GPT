'use client'

/**
 * Vibrant daytime blue & cream sky background.
 * Large visible clouds, golden sun with glow, birds, meadow, wildflowers.
 * Fully deterministic — no Math.random() to avoid hydration errors.
 */
export function SkyBackground() {
  // Cloud configs: [left%, top%, scaleX, scaleY, duration, delay]
  const clouds = [
    { left:  '2%', top:  '7%', sx: 1.0, sy: 1.0, dur:  38, delay:    0 },
    { left: '18%', top:  '9%', sx: 0.65,sy: 0.65,dur:  32, delay:  -10 },
    { left: '38%', top:  '7.5%', sx: 0.8, sy: 0.8, dur:  36, delay: -18 },
    { left: '26%', top:  '4%', sx: 0.72,sy: 0.72,dur:  46, delay:  -15 },
    { left: '52%', top: '12%', sx: 0.9, sy: 0.9, dur:  40, delay:  -26 },
    { left: '72%', top:  '3%', sx: 0.62,sy: 0.62,dur:  50, delay:  -32 },
    { left: '10%', top: '21%', sx: 0.52,sy: 0.52,dur:  36, delay:   -8 },
    { left: '44%', top: '25%', sx: 0.68,sy: 0.68,dur:  44, delay:  -22 },
  ]

  const birds = [
    { top: '8%',   dur: 15, delay:   0 },
    { top: '10.5%',dur: 18, delay:  -7 },
    { top: '14%',  dur: 17, delay:  -4 },
    { top: '19%',  dur: 21, delay: -11 },
  ]

  const pollens = [
    { left: '8%',  dur:  9, delay:   0 },
    { left: '22%', dur: 12, delay:  -4 },
    { left: '38%', dur:  8, delay:  -6 },
    { left: '55%', dur: 13, delay:  -2 },
    { left: '70%', dur: 10, delay:  -8 },
    { left: '84%', dur: 14, delay:  -5 },
  ]

  const driftLeaves = [
    { bottom: '16%', dur: 18, delay: 0, scale: 0.9 },
    { bottom: '24%', dur: 22, delay: -7, scale: 0.75 },
    { bottom: '11%', dur: 26, delay: -14, scale: 0.85 },
    { bottom: '20%', dur: 16, delay: -10, scale: 0.7 },
  ]

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

      {/* ── Sky gradient: deep vibrant blue → clear azure ── */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #0284c7 0%, #0ea5e9 25%, #38bdf8 60%, #7dd3fc 85%, #bae6fd 100%)' }}
      />

      {/* ── Sun glow backdrop ── */}
      <div
        className="animate-sun-shimmer absolute"
        style={{
          width: 260, height: 260,
          right: '8%', top: '2%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,245,150,0.55) 0%, rgba(255,210,60,0.25) 50%, transparent 75%)',
          filter: 'blur(8px)',
        }}
      />

      {/* ── Sun ── */}
      <div
        className="animate-sun-shimmer absolute rounded-full"
        style={{
          width: 90, height: 90,
          right: 'calc(8% + 85px)', top: 'calc(2% + 85px)',
          background: 'radial-gradient(circle, #fffde7 0%, #ffe082 45%, #ffb300 100%)',
          boxShadow: '0 0 40px 20px rgba(255,200,30,0.5), 0 0 80px 40px rgba(255,180,0,0.2)',
        }}
      />
      {/* Sun rays ring */}
      <div
        className="animate-sun-spin absolute rounded-full"
        style={{
          width: 160, height: 160,
          right: 'calc(8% + 50px)', top: 'calc(2% + 50px)',
          opacity: 0.28,
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,220,50,0.6) 4%, transparent 8%, transparent 46%, rgba(255,220,50,0.6) 50%, transparent 54%)',
        }}
      />

      {/* ── Fluffy clouds ── */}
      {clouds.map((c, i) => (
        <div
          key={i}
          className="animate-cloud-drift absolute"
          style={{
            left: c.left,
            top: c.top,
            transform: `scale(${c.sx}, ${c.sy})`,
            transformOrigin: 'left top',
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          {/* SVG cloud — large & fluffy */}
          <svg width="340" height="130" viewBox="0 0 340 130" fill="none">
            {/* Shadow base */}
            <ellipse cx="170" cy="118" rx="155" ry="14" fill="#c9dff0" opacity="0.3" />
            {/* Cloud body */}
            <ellipse cx="170" cy="92"  rx="158" ry="40"  fill="white"   opacity="0.94" />
            <ellipse cx="100" cy="72"  rx="80"  ry="60"  fill="white"   opacity="0.92" />
            <ellipse cx="172" cy="58"  rx="95"  ry="72"  fill="white"   opacity="0.96" />
            <ellipse cx="248" cy="68"  rx="72"  ry="54"  fill="white"   opacity="0.90" />
            <ellipse cx="56"  cy="84"  rx="52"  ry="38"  fill="#f0f8ff" opacity="0.85" />
            <ellipse cx="294" cy="82"  rx="46"  ry="34"  fill="#f0f8ff" opacity="0.83" />
            {/* Cream shadow underside */}
            <ellipse cx="170" cy="104" rx="148" ry="20"  fill="#dceefb" opacity="0.35" />
          </svg>
        </div>
      ))}

      {/* ── Birds ── */}
      {birds.map((b, i) => (
        <div
          key={i}
          className="animate-bird-fly absolute"
          style={{
            top: b.top,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
            <path d="M18 8 Q9 1 0 5"  stroke="#1a3a6c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M18 8 Q27 1 36 5" stroke="#1a3a6c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      ))}

      {/* ── Realistic Mountain Ranges (Dramatic Black Snow-Capped Peaks) ── */}
      <div className="absolute bottom-[40px] sm:bottom-[60px] lg:bottom-[80px] left-0 right-0 h-[300px] sm:h-[360px] lg:h-[400px] pointer-events-none">
        {/* Layer 1: Distant Majestic Snow-Capped Black Mountain Peaks */}
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 340" preserveAspectRatio="none" fill="none">
          <defs>
            {/* Deep Dramatic Black Mountain Body Gradient */}
            <linearGradient id="mount-far-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22252a" />
              <stop offset="40%" stopColor="#14171c" />
              <stop offset="100%" stopColor="#090a0d" />
            </linearGradient>
            {/* Pristine snow cap gradient */}
            <linearGradient id="snow-cap-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>

          {/* Far Mountain Range Silhouette & Main Body */}
          <path
            d="M0 340 L0 180 L80 145 L150 160 L240 110 L310 135 L420 50 L530 140 L620 95 L720 130 L840 65 L940 120 L1040 85 L1160 145 L1260 100 L1360 130 L1440 115 L1440 340 Z"
            fill="url(#mount-far-grad)"
            opacity="1"
          />

          {/* ── Majestic Snow Caps on Mountain Summits ── */}
          {/* Summit 1: x=240, y=110 */}
          <path
            d="M240 110 L260 135 L252 138 L268 152 L238 145 L222 150 L230 138 L218 132 Z"
            fill="url(#snow-cap-grad)"
          />
          {/* Main Peak 2 (Highest Himalayan Crown): x=420, y=50 */}
          <path
            d="M420 50 L450 85 L438 90 L465 118 L445 112 L455 130 L418 120 L400 132 L408 115 L382 120 L402 92 L392 88 Z"
            fill="url(#snow-cap-grad)"
          />
          {/* Summit 3: x=620, y=95 */}
          <path
            d="M620 95 L642 122 L634 126 L650 142 L622 135 L605 140 L612 125 L598 120 Z"
            fill="url(#snow-cap-grad)"
          />
          {/* Summit 4: x=840, y=65 */}
          <path
            d="M840 65 L868 98 L858 102 L882 128 L858 122 L868 140 L838 130 L818 140 L828 122 L808 126 L824 98 L816 94 Z"
            fill="url(#snow-cap-grad)"
          />
          {/* Summit 5: x=1040, y=85 */}
          <path
            d="M1040 85 L1062 112 L1054 116 L1070 132 L1042 125 L1025 130 L1032 118 L1018 112 Z"
            fill="url(#snow-cap-grad)"
          />
          {/* Summit 6: x=1260, y=100 */}
          <path
            d="M1260 100 L1280 125 L1272 128 L1288 142 L1258 135 L1242 140 L1250 128 L1238 122 Z"
            fill="url(#snow-cap-grad)"
          />

          {/* Snow Couloirs running down ridges */}
          <path d="M420 50 Q430 85 435 125 Q438 160 442 200" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
          <path d="M840 65 Q848 98 854 135 Q858 168 862 205" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        </svg>

        {/* Layer 2: Mid-Distance Rugged Mountain Ridge (Pure Solid Black) */}
        <svg className="absolute bottom-0 left-0 w-full h-[180px] sm:h-[220px]" viewBox="0 0 1440 220" preserveAspectRatio="none" fill="none">
          <defs>
            <linearGradient id="mount-mid-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#181a1f" />
              <stop offset="45%" stopColor="#0d0e12" />
              <stop offset="100%" stopColor="#030405" />
            </linearGradient>
          </defs>

          {/* Mid Mountain Ridge Silhouette */}
          <path
            d="M0 220 L0 100 Q120 70 260 90 Q380 110 500 65 Q620 95 760 70 Q900 115 1060 60 Q1200 85 1320 65 Q1390 80 1440 70 L1440 220 Z"
            fill="url(#mount-mid-grad)"
            opacity="1"
          />

          {/* Deep black pine forest ridges on mid mountains */}
          <path
            d="M0 220 L0 120 Q140 95 300 110 Q460 125 580 85 Q720 110 880 85 Q1040 125 1200 80 Q1340 100 1440 90 L1440 220 Z"
            fill="#050608"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* ── Green meadow ground & wind-swaying trees ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[280px] sm:h-[330px] lg:h-[380px] pointer-events-none">
        {/* Rolling hills with rich layered grass extending up to the mountains */}
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 380" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grass-slope-back" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8cc752" />
              <stop offset="50%" stopColor="#76b83b" />
              <stop offset="100%" stopColor="#5ea028" />
            </linearGradient>
            <linearGradient id="grass-slope-mid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#68ad33" />
              <stop offset="60%" stopColor="#4f9620" />
              <stop offset="100%" stopColor="#3c7e14" />
            </linearGradient>
            <linearGradient id="grass-slope-front" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#559925" />
              <stop offset="70%" stopColor="#3c7e14" />
              <stop offset="100%" stopColor="#295c0c" />
            </linearGradient>
            {/* Crystal-clear Alpine Glacial Water Gradient */}
            <linearGradient id="alpine-water-grad" x1="0" y1="0" x2="1" y2="0.6">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="25%" stopColor="#0891b2" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="85%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            {/* Riverbank Pebble & Wet Sand Shoreline */}
            <linearGradient id="riverbank-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9cb87c" />
              <stop offset="50%" stopColor="#7a9a56" />
              <stop offset="100%" stopColor="#557c36" />
            </linearGradient>
          </defs>

          {/* Layer 1: High Rolling Highland Meadow Slope */}
          <path
            d="M0 380 L0 80 Q180 30 380 70 Q580 110 800 50 Q1020 20 1240 60 Q1360 80 1440 70 L1440 380 Z"
            fill="url(#grass-slope-back)"
          />

          {/* ── Shimmering Alpine River / Lake (Winding from Mountain Base through the Meadow) ── */}
          {/* Riverbank Shoreline Bed */}
          <path
            d="M 760 52 C 730 75, 680 90, 580 102 C 480 114, 380 125, 240 148 C 360 162, 500 148, 640 134 C 760 122, 880 110, 1020 118 C 1140 126, 1280 148, 1440 138 L 1440 155 C 1260 165, 1120 140, 1000 132 C 860 124, 730 136, 610 150 C 470 166, 330 180, 200 165 C 190 145, 340 132, 460 118 C 570 106, 660 92, 720 72 Z"
            fill="url(#riverbank-grad)"
            opacity="0.8"
          />

          {/* Winding Glacial Alpine River Stream */}
          <path
            d="M 755 56 C 725 78, 675 92, 578 105 C 476 117, 375 128, 245 150 C 370 160, 505 146, 642 132 C 762 120, 882 108, 1020 116 C 1140 124, 1275 145, 1440 136 L 1440 148 C 1265 158, 1125 134, 1005 126 C 865 118, 735 130, 615 144 C 475 160, 335 174, 210 160 C 205 146, 348 134, 465 120 C 575 108, 662 94, 725 74 Z"
            fill="url(#alpine-water-grad)"
          />

          {/* Animated Sunlight Water Reflections & Shimmering Wave Glints */}
          <g className="animate-water-shimmer">
            {/* Upstream shimmer ripples */}
            <path d="M 700 76 Q 715 72 730 74" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
            <path d="M 640 88 Q 660 84 675 87" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
            <path d="M 570 102 Q 595 98 620 101" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />

            {/* Midstream glistening ripple curves */}
            <path d="M 450 120 Q 485 114 520 118" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" opacity="0.92" />
            <path d="M 360 134 Q 400 127 440 132" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <path d="M 280 148 Q 320 141 360 146" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

            {/* Downstream shimmer reflections */}
            <path d="M 680 128 Q 720 122 760 126" stroke="#e0f2fe" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
            <path d="M 800 118 Q 845 112 890 116" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
            <path d="M 930 115 Q 975 110 1020 114" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
            <path d="M 1060 120 Q 1110 116 1160 122" stroke="#e0f2fe" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <path d="M 1200 132 Q 1255 128 1310 135" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M 1340 140 Q 1390 136 1435 142" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />

            {/* Sparkle sun glints on water */}
            <circle cx="510" cy="116" r="1.8" fill="#ffffff" opacity="0.95" />
            <circle cx="840" cy="114" r="2.2" fill="#ffffff" opacity="1" />
            <circle cx="1010" cy="113" r="1.8" fill="#ffffff" opacity="0.95" />
            <circle cx="1180" cy="120" r="1.6" fill="#ffffff" opacity="0.9" />
          </g>

          {/* Riverbank Reeds & Water Pebble Details */}
          <ellipse cx="610" cy="148" rx="7" ry="3" fill="#4a5f42" opacity="0.7" />
          <ellipse cx="915" cy="122" rx="6" ry="2.8" fill="#4a5f42" opacity="0.65" />
          <path d="M 605 148 Q 602 136 598 128" stroke="#365314" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 608 148 Q 609 134 612 124" stroke="#4d7c0f" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M 918 122 Q 915 112 911 106" stroke="#365314" strokeWidth="1.5" strokeLinecap="round" />

          {/* Layer 2: Rolling Green Ridge */}
          <path
            d="M0 380 L0 150 Q220 100 460 145 Q700 190 940 130 Q1180 95 1360 135 L1440 125 L1440 380 Z"
            fill="url(#grass-slope-mid)"
            opacity="0.95"
          />

          {/* Layer 3: Mid Meadow Hill with Grass Tufts */}
          <path
            d="M0 380 L0 220 Q200 170 420 195 Q640 220 860 180 Q1080 150 1300 190 Q1390 205 1440 195 L1440 380 Z"
            fill="url(#grass-slope-front)"
          />

          {/* Layer 4: Front Meadow Ground Rim */}
          <path
            d="M0 380 L0 300 Q360 280 720 285 Q1080 290 1440 280 L1440 380 Z"
            fill="#234e09"
          />

          {/* ── Scattered Natural Grass Blades & Tufts Across Meadow Slopes ── */}
          {/* Grass cluster 1 (Left slope) */}
          <path d="M160 70 L158 52 M163 70 L165 50 M166 71 L171 54 M160 70 L154 55" stroke="#68a82d" strokeWidth="2" strokeLinecap="round" />
          <path d="M280 65 L278 48 M283 65 L285 45 M287 66 L292 49 M280 65 L275 50" stroke="#68a82d" strokeWidth="2" strokeLinecap="round" />
          {/* Grass cluster 2 (Mid slope) */}
          <path d="M540 105 L538 88 M544 105 L546 85 M548 106 L554 90 M540 105 L534 91" stroke="#529420" strokeWidth="2" strokeLinecap="round" />
          <path d="M720 70 L718 52 M724 70 L726 49 M728 71 L734 54 M720 70 L714 55" stroke="#68a82d" strokeWidth="2" strokeLinecap="round" />
          <path d="M900 60 L898 42 M904 60 L906 40 M908 61 L914 44 M900 60 L894 45" stroke="#68a82d" strokeWidth="2" strokeLinecap="round" />
          {/* Grass cluster 3 (Right slope) */}
          <path d="M1120 45 L1118 28 M1124 45 L1126 25 M1128 46 L1134 30 M1120 45 L1114 31" stroke="#68a82d" strokeWidth="2" strokeLinecap="round" />
          <path d="M1300 80 L1298 62 M1304 80 L1306 60 M1308 81 L1314 65 M1300 80 L1294 66" stroke="#529420" strokeWidth="2" strokeLinecap="round" />

          {/* Mid-ground grass blades */}
          <path d="M340 180 L337 160 M343 180 L346 157 M347 181 L353 162" stroke="#417c17" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M620 205 L617 185 M623 205 L626 182 M627 206 L633 187" stroke="#417c17" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M980 165 L977 145 M983 165 L986 142 M987 166 L993 147" stroke="#417c17" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M1220 185 L1217 165 M1223 185 L1226 162 M1227 186 L1233 167" stroke="#417c17" strokeWidth="2.2" strokeLinecap="round" />
        </svg>

        {/* ── Left Wind-Tilted Realistic Christmas Pine Tree (Seamless & Rooted in the Earth) ── */}
        <div className="absolute bottom-0 left-0 sm:left-4 lg:left-8 w-48 sm:w-64 lg:w-76 h-72 sm:h-96 lg:h-[430px] pointer-events-none z-0">
          <svg viewBox="0 0 240 360" className="w-full h-full overflow-visible" fill="none">
            <defs>
              <linearGradient id="pine-bark-left" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#241306" />
                <stop offset="35%" stopColor="#462712" />
                <stop offset="70%" stopColor="#583218" />
                <stop offset="100%" stopColor="#1e0e04" />
              </linearGradient>
              <linearGradient id="needle-sunlit-l" x1="0" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="#5ecb77" />
                <stop offset="50%" stopColor="#35984c" />
                <stop offset="100%" stopColor="#1a5a2b" />
              </linearGradient>
            </defs>

            {/* ── Entire Tree Sways as ONE Unified Organic Body (Never separates or breaks apart) ── */}
            <g className="animate-pine-sway" style={{ transformOrigin: '118px 345px' }}>

              {/* Wooden Trunk going straight down into the subterranean soil (NO exposed root sticks) */}
              <path d="M106 350 C109 295 111 245 115 175 C119 245 122 295 125 350 Z"
                fill="url(#pine-bark-left)" />
              <path d="M114 345 C115 295 116 245 117 180" stroke="#1c0d04" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M120 340 C119 290 118 240 119 185" stroke="#6e4222" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

              {/* ── Continuous Solid Evergreen Core (Ensures NO background gap or sky can EVER show through) ── */}
              <path d="M123 12 C128 35 152 75 168 118 C150 114 135 118 120 116 C140 135 165 155 182 170 C162 165 140 168 120 166 C142 185 175 205 200 216 C176 210 148 215 120 212 C146 230 185 248 216 264 C184 256 150 262 118 259 C86 262 52 256 20 264 C51 248 90 230 116 212 C88 215 60 210 36 216 C61 205 94 185 116 166 C96 168 74 165 54 170 C71 155 96 135 116 116 C101 118 86 114 68 118 C84 75 108 35 123 12 Z"
                fill="#092612" />

              {/* ── Tier 5: Base Heavy Pine Boughs (Deep 30px overlap) ── */}
              <path d="M118 185 C138 198 170 212 210 254 C196 250 182 256 168 252 C154 248 142 254 128 251 C118 249 108 251 98 253 C84 256 72 250 58 254 C44 258 30 250 18 256 C54 214 88 198 118 185 Z"
                fill="#134722" />
              <path d="M32 250 Q50 240 70 246 Q90 238 112 244 Q134 238 156 246 Q178 240 196 250"
                stroke="#1f6533" strokeWidth="5.5" strokeLinecap="round" opacity="0.85" />
              <path d="M42 246 Q62 236 84 242 Q106 234 128 240 Q150 234 172 242 Q190 236 204 247"
                stroke="#3ea659" strokeWidth="2.4" strokeLinecap="round" opacity="0.75" />

              {/* ── Tier 4: Lower-Mid Pine Boughs (Deep 30px overlap) ── */}
              <path d="M118 138 C136 150 162 166 194 206 C180 202 168 208 154 204 C140 200 130 206 118 203 C106 206 96 200 82 204 C68 208 56 202 42 206 C74 166 100 150 118 138 Z"
                fill="#18562a" />
              <path d="M50 200 Q72 190 96 196 Q118 188 142 196 Q166 190 184 200"
                stroke="#24783c" strokeWidth="5" strokeLinecap="round" opacity="0.85" />
              <path d="M58 196 Q78 186 102 192 Q124 184 148 192 Q168 186 178 196"
                stroke="#46b763" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />

              {/* ── Tier 3: Mid Pine Boughs (Deep 30px overlap) ── */}
              <path d="M118 94 C134 106 155 120 178 158 C166 155 156 160 144 156 C132 152 124 158 118 155 C112 158 104 152 92 156 C80 160 70 155 58 158 C81 120 102 106 118 94 Z"
                fill="#1e6b35" />
              <path d="M66 154 Q88 146 110 150 Q130 144 152 150 Q166 146 172 154"
                stroke="#2c8d47" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
              <path d="M72 150 Q92 142 112 146 Q132 140 154 146 Q164 142 170 150"
                stroke="#50c870" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />

              {/* ── Tier 2: Upper Pine Boughs (Deep 30px overlap with Spire) ── */}
              <path d="M118 54 C130 65 146 78 162 112 C152 109 144 114 134 110 C126 107 122 112 118 110 C114 112 110 107 102 110 C92 114 84 109 74 112 C90 78 106 65 118 54 Z"
                fill="#247a3d" />
              <path d="M80 108 Q100 100 118 104 Q136 100 150 108"
                stroke="#35a051" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
              <path d="M86 104 Q104 96 120 100 Q136 96 146 104"
                stroke="#5ed87f" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

              {/* ── Tier 1: Conifer Top Crown & Spire (Seamlessly integrated into canopy) ── */}
              <path d="M123 12 C126 24 133 38 145 54 L138 56 L150 66 C138 64 124 65 118 65 C112 65 98 64 86 66 L98 56 L91 54 C103 38 110 24 123 12 Z"
                fill="#2c8f49" />
              <path d="M123 12 Q134 36 150 66" stroke="url(#needle-sunlit-l)" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M123 12 Q108 36 86 66" stroke="#165628" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />

              {/* Terminal needle tip */}
              <path d="M123 12 L127 4 M123 12 L125 3 M123 12 L129 6" stroke="#78e495" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="124" cy="12" r="2.8" fill="#8af2a4" opacity="0.9" />

              {/* Subtle needle whispers on outer edge */}
              <g className="animate-pine-rustle" style={{ transformOrigin: '210px 254px' }}>
                <path d="M210 254 Q220 252 228 260 M210 254 Q222 257 230 265" stroke="#48be6b" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
              </g>
              <g className="animate-pine-rustle" style={{ transformOrigin: '194px 206px', animationDelay: '-0.8s' }}>
                <path d="M194 206 Q204 204 210 211 M194 206 Q205 210 212 217" stroke="#54cc77" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
              </g>
            </g>

            {/* ── SUBTERRANEAN GROUND & CHOTA GRASS (Roots completely underground & hidden by small grass) ── */}
            {/* Dark soil mound underground */}
            <ellipse cx="116" cy="348" rx="46" ry="10" fill="#201205" opacity="0.92" />
            <path d="M72 350 Q116 338 160 350 Q136 358 72 350 Z" fill="#36741b" />

            {/* ── Dense small grass blades (छोटा घास) sprouting IN FRONT of trunk to completely hide root entry ── */}
            <path d="M90 352 Q87 334 84 320 Q90 334 94 352 Z" fill="#357d19" />
            <path d="M96 352 Q94 326 91 312 Q98 330 100 352 Z" fill="#469b24" />
            <path d="M102 353 Q103 322 102 306 Q107 326 107 353 Z" fill="#5cb834" />
            <path d="M108 353 Q111 318 113 300 Q115 322 114 353 Z" fill="#6ec93c" />
            <path d="M114 353 Q118 314 121 296 Q122 320 120 353 Z" fill="#7adb44" />
            <path d="M120 353 Q124 318 128 302 Q127 324 125 353 Z" fill="#62c035" />
            <path d="M126 352 Q131 324 135 310 Q133 328 130 352 Z" fill="#4ea627" />
            <path d="M132 352 Q138 328 143 316 Q140 332 136 352 Z" fill="#3c881e" />
            <path d="M138 351 Q144 334 148 322 Q144 336 141 351 Z" fill="#2f7216" />

            {/* Foreground fine light grass tufts */}
            <path d="M98 353 Q102 336 106 324 Q105 338 103 353 Z" fill="#6ec93c" />
            <path d="M109 353 Q114 332 117 318 Q116 336 114 353 Z" fill="#88ee52" />
            <path d="M119 353 Q122 330 126 316 Q124 334 122 353 Z" fill="#7adb44" />
            <path d="M125 353 Q130 334 134 322 Q131 337 128 353 Z" fill="#58b52f" />
          </svg>
        </div>

        {/* ── Right Wind-Tilted Realistic Christmas Pine Tree (Seamless & Rooted in the Earth) ── */}
        <div className="hidden sm:block absolute bottom-0 right-2 sm:right-6 lg:right-10 w-44 sm:w-56 lg:w-68 h-64 sm:h-80 lg:h-[370px] pointer-events-none z-0">
          <svg viewBox="0 0 210 320" className="w-full h-full overflow-visible" fill="none">
            <defs>
              <linearGradient id="pine-bark-right" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#221004" />
                <stop offset="50%" stopColor="#452511" />
                <stop offset="100%" stopColor="#180a02" />
              </linearGradient>
            </defs>

            {/* ── Right Tree Sways as ONE Unified Body (No detached cones or floating gaps!) ── */}
            <g className="animate-pine-sway" style={{ transformOrigin: '105px 305px', animationDelay: '-1.4s' }}>

              {/* Wooden Trunk into soil (No root sticks) */}
              <path d="M97 312 C100 268 102 225 105 165 C108 225 110 268 113 312 Z" fill="url(#pine-bark-right)" />

              {/* Continuous solid conifer core (Zero gap guaranteed) */}
              <path d="M110 18 C115 38 135 68 152 108 C136 104 122 108 108 106 C126 122 148 140 166 156 C148 152 128 156 108 154 C128 170 156 188 178 204 C158 200 134 204 105 202 C125 216 156 230 188 248 C166 244 140 248 105 246 C72 248 48 244 26 248 C58 230 88 216 105 202 C78 204 54 200 36 204 C58 188 86 170 106 154 C86 156 68 152 50 156 C68 140 90 122 106 106 C92 108 78 104 62 108 C78 68 98 38 110 18 Z"
                fill="#0a2812" />

              {/* Tier 4 (Base Boughs - Deep 25px overlap) */}
              <path d="M105 178 C124 192 152 208 188 248 C166 244 140 248 105 246 C72 248 48 244 26 248 C62 208 88 192 105 178 Z" fill="#113f1f" />
              <path d="M38 244 Q72 232 105 238 Q138 232 176 244" stroke="#36a254" strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />

              {/* Tier 3 (Mid-Lower Boughs - Deep 25px overlap) */}
              <path d="M105 134 C122 148 148 162 178 202 C158 198 134 202 105 200 C78 202 54 198 36 202 C64 162 88 148 105 134 Z" fill="#165026" />
              <path d="M48 198 Q78 188 106 194 Q134 188 166 198" stroke="#40b861" strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />

              {/* Tier 2 (Mid-Upper Boughs - Deep 25px overlap) */}
              <path d="M106 94 C120 108 142 120 166 156 C148 153 128 156 106 154 C86 156 68 153 50 156 C72 120 92 108 106 94 Z" fill="#1e6833" />
              <path d="M58 152 Q84 144 106 148 Q128 144 154 152" stroke="#4dc671" strokeWidth="2.4" strokeLinecap="round" opacity="0.85" />

              {/* Tier 1 (Spire Top - Continuous seamless connection into Tier 2, overlapping deeply down to y=106) */}
              <path d="M110 18 C113 28 118 42 128 56 L123 58 L136 72 L128 74 L142 90 C130 87 118 89 110 88 C102 89 90 87 78 90 L92 74 L84 72 L97 58 L92 56 C102 42 107 28 110 18 Z"
                fill="#288642" />
              <path d="M110 18 Q122 42 142 90" stroke="#6ce28e" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="111" cy="18" r="2.8" fill="#8af2a4" />

              {/* Right needle rustle */}
              <g className="animate-pine-rustle" style={{ transformOrigin: '188px 248px', animationDelay: '-1s' }}>
                <path d="M188 248 Q196 246 202 252 M188 248 Q198 251 204 257" stroke="#4dc770" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </g>

            {/* ── Subterranean soil and small grass (छोटा घास) completely hiding right tree roots ── */}
            <ellipse cx="105" cy="310" rx="38" ry="9" fill="#201205" opacity="0.9" />
            <path d="M70 312 Q105 300 140 312 Q122 318 70 312 Z" fill="#36741b" />

            {/* Small dense grass tuft hiding the trunk base */}
            <path d="M84 314 Q88 296 90 282 Q92 298 91 314 Z" fill="#3f8c20" />
            <path d="M92 314 Q95 292 98 276 Q100 294 99 314 Z" fill="#54b02e" />
            <path d="M100 315 Q104 288 107 272 Q109 292 108 315 Z" fill="#68c538" />
            <path d="M108 315 Q112 290 115 274 Q114 294 112 315 Z" fill="#7adb44" />
            <path d="M115 314 Q119 294 122 280 Q120 298 118 314 Z" fill="#52ad2a" />
            <path d="M122 313 Q126 298 129 286 Q127 300 124 313 Z" fill="#3a821a" />
          </svg>
        </div>

        {/* ── Mid-Meadow Realistic Botanical Plant (Next to Weather Card) ── */}
        <div className="absolute bottom-[28px] sm:bottom-[36px] lg:bottom-[44px] left-[42%] sm:left-[46%] lg:left-[48%] w-32 sm:w-40 lg:w-48 h-36 sm:h-44 lg:h-52 pointer-events-none z-0">
          <svg viewBox="0 0 160 200" className="w-full h-full overflow-visible" fill="none">
            <defs>
              <linearGradient id="plant-stem-grad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#256e2e" />
                <stop offset="100%" stopColor="#48b85b" />
              </linearGradient>
              <linearGradient id="plant-leaf-sun" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#76e492" />
                <stop offset="60%" stopColor="#42b05b" />
                <stop offset="100%" stopColor="#1e6b33" />
              </linearGradient>
            </defs>

            {/* ── Plant Stems & Foliage swaying softly with the breeze ── */}
            <g className="animate-plant-sway" style={{ transformOrigin: '80px 185px' }}>

              {/* Deep background shadow foliage */}
              <g opacity="0.9">
                <path d="M78 180 Q62 135 38 95" stroke="#185226" strokeWidth="3" strokeLinecap="round" />
                <path d="M48 115 Q36 108 30 116 Q42 122 48 115 Z" fill="#134720" />
                <path d="M56 130 Q42 122 36 130 Q50 138 56 130 Z" fill="#134720" />
                
                <path d="M82 180 Q98 135 122 92" stroke="#185226" strokeWidth="3" strokeLinecap="round" />
                <path d="M112 112 Q124 105 130 113 Q118 120 112 112 Z" fill="#134720" />
                <path d="M104 128 Q118 120 124 128 Q110 136 104 128 Z" fill="#134720" />
              </g>

              {/* ── Main Arching Stems ── */}
              {/* Left outer low stem & broad leaf */}
              <path d="M80 180 Q55 160 25 140" stroke="url(#plant-stem-grad)" strokeWidth="3" strokeLinecap="round" />
              <path d="M25 140 C14 135 10 148 22 154 C34 160 38 146 25 140 Z" fill="#29853e" stroke="#1a5a29" strokeWidth="0.8" />
              <path d="M42 152 C32 146 30 156 40 160 C50 164 52 154 42 152 Z" fill="#369c4d" />

              {/* Left tall graceful stem */}
              <path d="M80 180 Q65 115 48 55" stroke="url(#plant-stem-grad)" strokeWidth="3.2" strokeLinecap="round" />
              {/* Left stem leaf pairs */}
              <path d="M48 55 C40 46 34 56 44 64 C54 72 58 60 48 55 Z" fill="url(#plant-leaf-sun)" stroke="#1a5e2b" strokeWidth="0.8" />
              <path d="M54 78 C42 70 38 80 48 88 C58 96 64 84 54 78 Z" fill="#329e4a" stroke="#1a5e2b" strokeWidth="0.8" />
              <path d="M60 102 C48 94 44 104 54 112 C64 120 70 108 60 102 Z" fill="#2d8e42" />
              <path d="M68 128 C56 122 52 130 62 138 C72 144 76 134 68 128 Z" fill="#247837" />

              {/* Center tall stem with flower bud */}
              <path d="M80 180 Q79 105 82 35" stroke="url(#plant-stem-grad)" strokeWidth="3.5" strokeLinecap="round" />
              {/* Center stem leaves */}
              <path d="M82 60 C72 52 68 62 76 70 C84 78 88 66 82 60 Z" fill="url(#plant-leaf-sun)" stroke="#1a5e2b" strokeWidth="0.8" />
              <path d="M82 62 C92 54 96 64 88 72 C80 80 76 68 82 62 Z" fill="url(#plant-leaf-sun)" stroke="#1a5e2b" strokeWidth="0.8" />
              <path d="M81 88 C70 80 66 90 74 98 C82 106 86 94 81 88 Z" fill="#38a652" />
              <path d="M81 90 C92 82 96 92 88 100 C80 108 76 96 81 90 Z" fill="#38a652" />
              <path d="M80 118 C68 112 64 120 72 128 C80 134 84 124 80 118 Z" fill="#2b843e" />
              <path d="M80 120 C92 114 96 122 88 130 C80 136 76 126 80 120 Z" fill="#2b843e" />

              {/* Center blossom bud */}
              <g className="animate-plant-ripple" style={{ transformOrigin: '82px 35px' }}>
                <path d="M82 35 Q80 24 76 18 Q84 22 82 35 Z" fill="#ffeb3b" opacity="0.9" />
                <path d="M82 35 Q84 24 88 18 Q80 22 82 35 Z" fill="#ffd54f" opacity="0.9" />
                <circle cx="82" cy="22" r="3.2" fill="#fff59d" />
                <circle cx="82" cy="22" r="1.8" fill="#fff" />
              </g>

              {/* Right tall graceful stem (naturally arching towards wind) */}
              <path d="M80 180 Q95 115 115 50" stroke="url(#plant-stem-grad)" strokeWidth="3.2" strokeLinecap="round" />
              {/* Right stem leaf pairs */}
              <path d="M115 50 C125 42 129 52 120 60 C111 68 105 56 115 50 Z" fill="url(#plant-leaf-sun)" stroke="#1a5e2b" strokeWidth="0.8" />
              <path d="M108 74 C120 66 124 76 114 84 C104 92 98 80 108 74 Z" fill="#38a652" stroke="#1a5e2b" strokeWidth="0.8" />
              <path d="M102 98 C114 90 118 100 108 108 C98 116 92 104 102 98 Z" fill="#309244" />
              <path d="M94 124 C106 118 110 126 100 134 C90 140 86 130 94 124 Z" fill="#247837" />

              {/* Right bud */}
              <g className="animate-plant-ripple" style={{ transformOrigin: '115px 50px', animationDelay: '-0.7s' }}>
                <circle cx="118" cy="44" r="3.5" fill="#ffd54f" />
                <circle cx="118" cy="44" r="2" fill="#fff9c4" />
              </g>

              {/* Right outer low stem & broad leaf */}
              <path d="M80 180 Q105 158 136 136" stroke="url(#plant-stem-grad)" strokeWidth="3" strokeLinecap="round" />
              <path d="M136 136 C148 132 150 144 138 150 C126 156 122 142 136 136 Z" fill="#329e4a" stroke="#1a5e2b" strokeWidth="0.8" />
              <path d="M120 148 C130 142 132 152 122 156 C112 160 110 150 120 148 Z" fill="#28833b" />
            </g>

            {/* ── Subterranean Soil & Chota Grass (जमीन के अंदर जड़ें + आगे छोटा घास) ── */}
            {/* Dark soil mound under the plant base */}
            <ellipse cx="80" cy="186" rx="28" ry="7" fill="#201205" opacity="0.9" />
            <path d="M52 188 Q80 178 108 188 Q92 194 52 188 Z" fill="#347018" />

            {/* Chota grass tuft concealing plant base */}
            <path d="M64 190 Q62 176 59 164 Q64 176 68 190 Z" fill="#3f8c20" />
            <path d="M70 190 Q69 170 67 156 Q73 172 74 190 Z" fill="#52ad2a" />
            <path d="M76 191 Q77 166 78 150 Q81 170 80 191 Z" fill="#68c538" />
            <path d="M82 191 Q84 164 86 148 Q87 168 85 191 Z" fill="#7adb44" />
            <path d="M88 191 Q90 168 93 152 Q92 172 90 191 Z" fill="#62c035" />
            <path d="M94 190 Q97 172 100 160 Q98 174 96 190 Z" fill="#4ea627" />
            <path d="M100 189 Q103 176 106 166 Q104 178 101 189 Z" fill="#357d19" />
          </svg>
        </div>

        {/* Grass blades — left side */}
        {[12, 32, 55, 82, 112, 145, 178, 214, 252].map((x, i) => (
          <div
            key={`gl-${i}`}
            className="animate-grass-wave absolute bottom-[10%]"
            style={{ left: x, animationDuration: `${2.2 + i * 0.3}s`, animationDelay: `${-(i * 0.2)}s` }}
          >
            <svg width="11" height="30" viewBox="0 0 11 30" fill="none">
              <path d="M5.5 30 Q1 19 2 5 Q5.5 0 5.5 0 Q5.5 0 9 5 Q10 19 5.5 30Z"
                fill={i % 2 === 0 ? '#3d8220' : '#4da02c'} opacity="0.9" />
            </svg>
          </div>
        ))}

        {/* Grass blades — right side */}
        {[1180, 1210, 1240, 1268, 1296, 1322, 1350, 1378].map((x, i) => (
          <div
            key={`gr-${i}`}
            className="animate-grass-wave absolute bottom-[10%]"
            style={{ left: x, animationDuration: `${2.5 + i * 0.25}s`, animationDelay: `${-(i * 0.18)}s` }}
          >
            <svg width="13" height="34" viewBox="0 0 13 34" fill="none">
              <path d="M6.5 34 Q1 21 2 6 Q6.5 0 6.5 0 Q6.5 0 11 6 Q12 21 6.5 34Z"
                fill={i % 2 === 0 ? '#3d8220' : '#52a832'} opacity="0.88" />
            </svg>
          </div>
        ))}

        {/* Wild flowers — pre-computed petal positions (no Math.cos/sin at runtime) */}
        {/* Angles 0°,72°,144°,216°,288° → cx = 9+cos(a)*5, cy = 9+sin(a)*5 (rounded to 2dp) */}
        {[70, 190, 310, 440, 560, 680, 810, 950, 1070].map((x, i) => {
          const color = i % 3 === 0 ? '#ff8fab' : i % 3 === 1 ? '#ffd166' : '#74c0fc'
          // [cx, cy] pre-computed for angles 0,72,144,216,288 degrees
          const petals: [number, number, number][] = [
            [14, 9,   0],
            [10.55, 13.76,  72],
            [3.45, 11.94, 144],
            [3.45,  4.06, 216],
            [10.55,  4.24, 288],
          ]
          return (
            <div key={`f-${i}`} className="absolute" style={{ left: x, bottom: '13%' }}>
              <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                <line x1="9" y1="22" x2="9" y2="9" stroke="#2d6a10" strokeWidth="1.8" />
                {petals.map(([cx, cy, angle], j) => (
                  <ellipse key={j} cx={cx} cy={cy} rx="4" ry="2.5"
                    fill={color} transform={`rotate(${angle} 9 9)`} opacity="0.92" />
                ))}
                <circle cx="9" cy="9" r="2.8" fill="#fff9c4" />
              </svg>
            </div>
          )
        })}
      </div>

      {/* ── Wind-blown falling/drifting leaves floating across landscape (Soft realistic petals) ── */}
      {driftLeaves.map((dl, i) => (
        <div
          key={`dl-${i}`}
          className="animate-leaf-drift absolute pointer-events-none"
          style={{
            bottom: dl.bottom,
            animationDuration: `${dl.dur}s`,
            animationDelay: `${dl.delay}s`,
            transform: `scale(${dl.scale})`,
          }}
        >
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none" className="drop-shadow-xs">
            {/* Curved organic leaf silhouette */}
            <path
              d="M1 7 C5 2 15 1 21 7 C15 13 5 12 1 7 Z"
              fill={i % 2 === 0 ? '#4ab853' : '#68cf71'}
              opacity="0.9"
            />
            {/* Soft central leaf vein */}
            <path d="M2 7 Q11 6.5 19 7" stroke="#1d6628" strokeWidth="0.8" opacity="0.6" />
          </svg>
        </div>
      ))}

      {/* ── Floating pollen ── */}
      {pollens.map((p, i) => (
        <div
          key={i}
          className="animate-float-up absolute"
          style={{ left: p.left, bottom: '22%', animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
        >
          <div
            className="rounded-full"
            style={{
              width: i % 2 === 0 ? 5 : 3,
              height: i % 2 === 0 ? 5 : 3,
              background: i % 2 === 0 ? 'rgba(255,220,50,0.8)' : 'rgba(255,255,255,0.75)',
              boxShadow: '0 0 4px 2px rgba(255,220,50,0.35)',
            }}
          />
        </div>
      ))}

      {/* ── Subtle wind streaks ── */}
      {[
        { top: '18%', w: 220, dur: '3.6s', delay: '0s'    },
        { top: '30%', w: 280, dur: '4.8s', delay: '-1.5s' },
        { top: '44%', w: 180, dur: '3.2s', delay: '-0.8s' },
      ].map((s, i) => (
        <div key={i} className="animate-wind-streak absolute h-px rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent"
          style={{ top: s.top, left: 0, width: s.w, animationDuration: s.dur, animationDelay: s.delay }} />
      ))}

    </div>
  )
}
