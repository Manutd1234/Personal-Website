"use client";

import TrophyRoom from "./TrophyRoom";
import CardShowcase from "./CardShowcase";

export default function WorkPanel({
  awardsOnly = false,
  active = true,
}: {
  awardsOnly?: boolean;
  active?: boolean;
}) {
  return (
    <div className="career-classic">
      {awardsOnly ? <TrophyRoom /> : <CardShowcase active={active} />}
    </div>
  );
}
