// User-selected branding for the award apps; award evidence remains in details.
export const awardAppIcons: Readonly<
  Record<string, { src: string; artwork: "emblem" | "poster" } | undefined>
> = {
  "BrainHack TIL-AI 2026": {
    src: "images/award-icons/brainhack-til-ai.webp",
    artwork: "emblem",
  },
  "Hack the Future AI Hackathon 2026": {
    src: "images/award-icons/hack-the-future-poster.webp",
    artwork: "poster",
  },
  "BügleRock Rockathon 2026": {
    src: "images/award-icons/buglerock.webp",
    artwork: "emblem",
  },
  "SignMeUp · The Merge Hackathon 2026": {
    src: "images/award-icons/devpost.webp",
    artwork: "emblem",
  },
  "SunnyHacks 2026": {
    src: "images/award-icons/devpost.webp",
    artwork: "emblem",
  },
  "Certificate of Appreciation · Project BHID": {
    src: "images/award-icons/nus-csc.webp",
    artwork: "emblem",
  },
  "Outstanding performance & conduct": {
    src: "images/award-icons/singapore-army.webp",
    artwork: "emblem",
  },
  "Chief of Defence Force (CDF) National Education Excellence Award": {
    src: "images/award-icons/160-squadron.webp",
    artwork: "emblem",
  },
};

// Compact full-frame artwork for the remaining award apps.
export const awardIconPreviews: Readonly<Record<string, string | undefined>> = {
  "images/portfolio/brainhack-champion-team.webp":
    "images/award-icons/brainhack-champion-team.webp",
  "images/portfolio/hack-the-future-event.webp":
    "images/award-icons/hack-the-future-event.webp",
  "images/portfolio/dealmachine-pipeline.webp":
    "images/award-icons/dealmachine-pipeline.webp",
  "images/logos/sunnyhacks-original.webp": "images/award-icons/sunnyhacks-hq.webp",
  "images/portfolio/signmeup-gesture-demo.webp":
    "images/award-icons/signmeup-gesture-demo.webp",
  "images/logos/moe.webp": "images/award-icons/moe.webp",
  "images/logos/cdc.webp": "images/award-icons/cdc.webp",
  "images/logos/ejc.webp": "images/award-icons/ejc.webp",
  "images/awards/ejc-softball-team-original.webp":
    "images/award-icons/ejc-softball-team-original.webp",
  "images/logos/sst.webp": "images/award-icons/sst.webp",
  "certificates/sst-best-business-pitch-2018-trophy.webp":
    "images/award-icons/sst-best-business-pitch-2018-trophy.webp",
  "certificates/sst-active-elderly-2018-trophy.webp":
    "images/award-icons/sst-active-elderly-2018-trophy.webp",
  "images/logos/nus-high.webp": "images/award-icons/nus-high.webp",
  "images/logos/btps.webp": "images/award-icons/btps.webp",
  "images/logos/swimsafer.webp": "images/award-icons/swimsafer.webp",
  "images/awards/representative-music-emblem.svg":
    "images/award-icons/representative-music-emblem.webp",
  "images/life-passport-oct24/bhid-team-afternoon.webp":
    "images/award-icons/bhid-team-afternoon.webp",
  "images/awards/160-sqn-ne-award-presentation.webp":
    "images/award-icons/160-sqn-ne-award-presentation.webp",
  "images/life-originals-oct24/army-graduation-group.webp":
    "images/award-icons/army-graduation-group.webp",
  "images/awards/ippt-gold-cloth-patch.webp":
    "images/award-icons/ippt-gold-cloth-patch.webp",
  "images/awards/marksmanship-cloth-patch.webp":
    "images/award-icons/marksmanship-cloth-patch.webp",
  "images/logos/anthropic.svg": "images/award-icons/anthropic.webp",
  "images/logos/datacamp.webp": "images/award-icons/datacamp.webp",
  "images/logos/databricks.svg": "images/award-icons/databricks.webp",
  "images/logos/cisco.webp": "images/award-icons/cisco.webp",
};
