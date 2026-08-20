function Icon({ children, size = 20 }) {
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

export function ArrowUpRightIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
    </Icon>
  );
}

export function DownloadIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeLinecap="square" strokeWidth="2" />
    </Icon>
  );
}

export function GitHubIcon({ size }) {
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

export function LinkedInIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M7 9v10M7 5.5v.1M11 19v-5.6c0-2.4 4-3 4 0V19M11 9v10" stroke="currentColor" strokeWidth="2" />
      <path d="M3 3h18v18H3z" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function MailIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M3 5h18v14H3z" stroke="currentColor" strokeWidth="2" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
    </Icon>
  );
}

export function MapPinIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6M9 10h6" stroke="currentColor" strokeWidth="2" />
    </Icon>
  );
}

export function SparkIcon({ size }) {
  return (
    <Icon size={size}>
      <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" stroke="currentColor" strokeWidth="2" />
      <path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z" fill="currentColor" />
    </Icon>
  );
}
