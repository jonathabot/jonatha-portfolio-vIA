'use client';

import dynamic from 'next/dynamic';

const JonathaCharacter3D = dynamic(
  () =>
    import('@/components/three/JonathaCharacter3D').then(
      (module) => module.JonathaCharacter3D,
    ),
  { ssr: false },
);

export function CharacterViewer() {
  return <JonathaCharacter3D view="full" />;
}
