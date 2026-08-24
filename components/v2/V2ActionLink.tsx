'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const MotionLink = motion.create(Link);

export function V2ActionLink({
  href,
  children,
  external = false,
  className = '',
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
}) {
  return (
    <MotionLink
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={`group bg-ink text-yellow block px-5 py-4 text-center text-[10px] font-bold ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      <span className="underline-offset-4 group-hover:underline">
        {children}
      </span>
    </MotionLink>
  );
}
