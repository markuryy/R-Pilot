import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import LetterPullup from '@/components/ui/letter-pullup';

type Tagline = {
  text: string;
  weight: number;
};

const taglines: Tagline[] = [
  { text: "chat-driven R analysis", weight: 91.5 },
  { text: "vroom vroom", weight: 2.5 },
  { text: "beep beep", weight: 2 },
  { text: "nyoom", weight: 1.5 },
  { text: "", weight: 1 },
];

export default function Brand() {
  const [tagline, setTagline] = useState("chat-driven R analysis");

  useEffect(() => {
    const total = taglines.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * total;
    
    for (const t of taglines) {
      random -= t.weight;
      if (random <= 0) {
        setTagline(t.text);
        break;
      }
    }
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="w-48">
        <Image src="/icon_color.png" alt="Brand" width={192} height={192} />
      </div>
      <div className="text-2xl text-primary mt-4">
        R-Pilot
      </div>
      <div className="text-lg text-muted-foreground mt-1">
        <LetterPullup words={tagline} className="text-lg text-muted-foreground" />
      </div>
    </div>
  );
}
