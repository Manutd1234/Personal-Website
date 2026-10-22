"use client";

import TrophyRoom from "./TrophyRoom";
import CardShowcase from "./CardShowcase";

export default function WorkPanel({
  awardsOnly = false,
}: {
  awardsOnly?: boolean;
}) {
  return (
    <div className="career-classic">
      {awardsOnly ? <TrophyRoom /> : <CardShowcase />}
    </div>
  );
}
