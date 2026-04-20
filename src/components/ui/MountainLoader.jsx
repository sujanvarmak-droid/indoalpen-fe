export const MountainLoader = ({ size = 'md', text = 'Loading...', fullscreen = false }) => {
  const sizeMap = { sm: 80, md: 160, lg: 240 };
  const w = sizeMap[size];
  const h = Math.round(w * 0.55);

  const content = (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={w}
        height={h}
        viewBox="0 0 280 154"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold base gradient — top bright, mid deep, lower warm */}
          <linearGradient id="ml-gold" x1="140" y1="0" x2="140" y2="154" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#FDE68A" />
            <stop offset="20%"  stopColor="#F59E0B" />
            <stop offset="55%"  stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Shadow/depth layer gradient */}
          <linearGradient id="ml-shadow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#78350F" stopOpacity="0.4" />
            <stop offset="50%"  stopColor="#78350F" stopOpacity="0" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0.35" />
          </linearGradient>

          {/* Shimmer sweep gradient */}
          <linearGradient id="ml-shimmer" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="42%"  stopColor="white" stopOpacity="0" />
            <stop offset="50%"  stopColor="white" stopOpacity="0.55" />
            <stop offset="58%"  stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              values="-280 0; 280 0"
              dur="2s"
              repeatCount="indefinite"
            />
          </linearGradient>

          {/* Clip to mountain silhouette */}
          <clipPath id="ml-clip">
            <path d="
              M 0,154
              C 12,138 22,118 34,102
              L 40,92 L 58,54 L 68,68
              L 80,52 L 88,40
              C 90,36 92,32 96,26
              L 106,8
              L 116,26 C 120,34 124,42 128,52
              L 138,68 L 148,54
              L 162,20
              L 176,52 L 186,40
              L 196,52 L 204,44
              C 208,38 212,34 216,30
              L 222,22
              L 232,40 L 240,52
              L 248,44 L 258,60
              C 264,72 270,94 276,118
              L 280,136 L 280,154 Z
            " />
          </clipPath>
        </defs>

        {/* Mountain base fill */}
        <path
          d="
            M 0,154
            C 12,138 22,118 34,102
            L 40,92 L 58,54 L 68,68
            L 80,52 L 88,40
            C 90,36 92,32 96,26
            L 106,8
            L 116,26 C 120,34 124,42 128,52
            L 138,68 L 148,54
            L 162,20
            L 176,52 L 186,40
            L 196,52 L 204,44
            C 208,38 212,34 216,30
            L 222,22
            L 232,40 L 240,52
            L 248,44 L 258,60
            C 264,72 270,94 276,118
            L 280,136 L 280,154 Z
          "
          fill="url(#ml-gold)"
        />

        {/* Depth/shadow overlay */}
        <path
          d="
            M 0,154
            C 12,138 22,118 34,102
            L 40,92 L 58,54 L 68,68
            L 80,52 L 88,40
            C 90,36 92,32 96,26
            L 106,8
            L 116,26 C 120,34 124,42 128,52
            L 138,68 L 148,54
            L 162,20
            L 176,52 L 186,40
            L 196,52 L 204,44
            C 208,38 212,34 216,30
            L 222,22
            L 232,40 L 240,52
            L 248,44 L 258,60
            C 264,72 270,94 276,118
            L 280,136 L 280,154 Z
          "
          fill="url(#ml-shadow)"
        />

        {/* Shimmer sweep */}
        <rect x="0" y="0" width="280" height="154" fill="url(#ml-shimmer)" clipPath="url(#ml-clip)" />

        {/* Peak highlight dots (bright glint at each peak tip) */}
        <circle cx="106" cy="8"  r="2.5" fill="white" fillOpacity="0.7">
          <animate attributeName="fill-opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" begin="0s" />
        </circle>
        <circle cx="162" cy="20" r="2.5" fill="white" fillOpacity="0.5">
          <animate attributeName="fill-opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="222" cy="22" r="2"   fill="white" fillOpacity="0.4">
          <animate attributeName="fill-opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" begin="0.6s" />
        </circle>
      </svg>

      {text && (
        <p className="text-sm font-medium text-brand animate-pulse tracking-wide">{text}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};
