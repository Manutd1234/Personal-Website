function Icon({
  children,
  size = 20,
}: {
  children: React.ReactNode;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

export function Github({ size }: { size: number }) {
  return (
    <Icon size={size}>
      <path
        d="M15.5 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.7-1.4 5.7-6.3A4.9 4.9 0 0 0 19.4 6c.1-.3.6-1.6-.1-3.3 0 0-1.1-.3-3.6 1.3a12.2 12.2 0 0 0-6.5 0C6.7 2.3 5.6 2.7 5.6 2.7 4.9 4.4 5.4 5.7 5.5 6a4.9 4.9 0 0 0-1.3 3.3c0 4.9 3 6 5.7 6.3-.4.3-.7.9-.8 1.7-.7.3-2.5.9-3.6-1 0 0-.7-1.3-2-1.4 0 0-1.3 0-.1.8 0 0 .9.4 1.5 1.9 0 0 .8 2.4 4.1 1.7V21"
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Icon>
  );
}

export function Linkedin({ size }: { size: number }) {
  return (
    <Icon size={size}>
      <path
        d="M7 9v10M7 5.5v.1M11 19v-5.6c0-2.4 4-3 4 0V19M11 9v10"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3 3h18v18H3z" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}
