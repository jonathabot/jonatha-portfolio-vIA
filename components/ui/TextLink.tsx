import type { AnchorHTMLAttributes } from 'react';

export function TextLink({ className = '', ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`text-ink underline [text-underline-offset:4px] ${className}`} {...props} />
  );
}
