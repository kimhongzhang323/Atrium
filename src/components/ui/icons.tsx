type IconProps = { className?: string; size?: number };

const sw = 1.6;
const base = (size = 16) => ({
  width: size, height: size, viewBox: "0 0 16 16",
  fill: "none", stroke: "currentColor", strokeWidth: sw,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const Icon = {
  dashboard: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </svg>
  ),
  events: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M2 6h12M5 1.5v3M11 1.5v3" />
    </svg>
  ),
  tasks: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M3 4h10M3 8h10M3 12h6" />
    </svg>
  ),
  timeline: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <rect x="2" y="3" width="6" height="3" rx="1" />
      <rect x="5" y="7" width="8" height="3" rx="1" />
      <rect x="3" y="11" width="5" height="3" rx="1" />
    </svg>
  ),
  org: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="3" r="1.5" />
      <circle cx="3" cy="13" r="1.5" />
      <circle cx="8" cy="13" r="1.5" />
      <circle cx="13" cy="13" r="1.5" />
      <path d="M8 4.5v3M8 7.5H3V11.5M8 7.5h5v4M8 7.5v4" />
    </svg>
  ),
  team: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <circle cx="5.5" cy="6" r="2" />
      <circle cx="11" cy="6.5" r="1.6" />
      <path d="M2 13c0-2 1.5-3.5 3.5-3.5S9 11 9 13M9.5 13c0-1.5 1-2.7 2.5-2.7s2.5 1.2 2.5 2.7" />
    </svg>
  ),
  sponsors: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M8 14s-5-3.5-5-7a3 3 0 015-2.2A3 3 0 0113 7c0 3.5-5 7-5 7z" />
    </svg>
  ),
  budget: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v8M10 6H7a1.5 1.5 0 000 3h2a1.5 1.5 0 010 3H6" />
    </svg>
  ),
  invoices: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M3 1.5h7l3 3v10H3z" />
      <path d="M10 1.5v3h3M5 8h6M5 11h4" />
    </svg>
  ),
  approvals: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M2.5 8.5L6 12l7.5-8" />
    </svg>
  ),
  reports: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M3 13V7M7 13V3M11 13V9" />
    </svg>
  ),
  files: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M3 2h6l3 3v9H3z" />
      <path d="M9 2v3h3" />
    </svg>
  ),
  draw: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M8 2l1.8 3.7 4 .6-2.9 2.9.7 4L8 11.4 4.4 13.2l.7-4-2.9-2.9 4-.6z" />
    </svg>
  ),
  search: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  ),
  plus: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M8 3v10M3 8h10" />
    </svg>
  ),
  filter: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M2 3h12l-4.5 6v5L6.5 13V9z" />
    </svg>
  ),
  arrow: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M5 3l5 5-5 5" />
    </svg>
  ),
  sidebar: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M6 3v10" />
    </svg>
  ),
  sparkle: ({ size, className }: IconProps) => (
    <svg {...base(size)} className={className}>
      <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l2 2M10 10l2 2M12 4l-2 2M6 10l-2 2" />
    </svg>
  ),
};
