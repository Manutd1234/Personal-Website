// Curated from the local, metadata-free portfolio photo copies.
// The gym photograph is illustrative and attributed below.
export type LifePhoto = {
  id: string;
  src: string;
  thumb?: string;
  alt: string;
  caption: string;
  category: "Travel" | "People" | "Food" | "Learning" | "Gym";
  width: number;
  height: number;
  position?: string;
  credit?: { label: string; url: string; licenseUrl: string };
};

export const lifePhotos: readonly LifePhoto[] = [
  {
    id: "alpine",
    src: "images/hobbies/travel-alpine.webp",
    thumb: "images/life/alpine-thumb.webp",
    alt: "Ian smiling in front of a forested mountain landscape",
    caption: "Taking the scenic route.",
    category: "Travel",
    width: 1200,
    height: 1600,
    position: "center 45%",
  },
  {
    id: "workshop",
    src: "images/hobbies/learning-sap-workshop.webp",
    thumb: "images/life/workshop-thumb.webp",
    alt: "Participants learning together at a SAP S.C.A.L.E workshop",
    caption: "New ideas at a SAP workshop.",
    category: "Learning",
    width: 1600,
    height: 1067,
  },
  {
    id: "gym",
    src: "images/hobbies/gym-nenad-stojkovic.webp",
    alt: "Illustrative photograph of a modern gym interior with strength-training equipment",
    caption: "Time away from the screen. Illustrative gym photo.",
    category: "Gym",
    width: 1600,
    height: 1067,
    credit: {
      label: "Nenad Stojković / Wikimedia Commons · resized to WebP",
      url: "https://commons.wikimedia.org/wiki/File:Design_and_equipment_in_modern_gym.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
    },
  },
  {
    id: "candid",
    src: "images/life/orientation-portrait.webp",
    thumb: "images/life/candid-thumb.webp",
    alt: "Ian smiling beside a railing during orientation week",
    caption: "Somewhere between activities.",
    category: "People",
    width: 1600,
    height: 1200,
    position: "center 40%",
  },
  {
    id: "chicken-rice",
    src: "images/hobbies/food-chicken-rice.webp",
    alt: "Roast chicken rice served with chilli and side dishes",
    caption: "Always room for chicken rice.",
    category: "Food",
    width: 1130,
    height: 1600,
  },
  {
    id: "brainhack-team",
    src: "images/portfolio/brainhack-champion-team.webp",
    thumb: "images/life/brainhack-team-thumb.webp",
    alt: "Team Pandamonium holding the BrainHack Novice Champion sign",
    caption: "A shared win at BrainHack.",
    category: "People",
    width: 1600,
    height: 1067,
  },
  {
    id: "westminster",
    src: "images/ian-westminster-1600.webp",
    alt: "Ian standing in front of Westminster Abbey in London",
    caption: "A London afternoon.",
    category: "Travel",
    width: 1600,
    height: 2134,
  },
  {
    id: "brainhack-table",
    src: "images/portfolio/brainhack-at-work.webp",
    thumb: "images/life/brainhack-table-thumb.webp",
    alt: "Team Pandamonium working together around their laptops at BrainHack",
    caption: "Learning by building, together.",
    category: "Learning",
    width: 1600,
    height: 1067,
  },
  {
    id: "beach-games",
    src: "images/life/orientation-beach-games.webp",
    thumb: "images/life/beach-games-thumb.webp",
    alt: "Orientation friends playing a game on the beach",
    caption: "A day out with the crew.",
    category: "People",
    width: 1600,
    height: 1200,
  },
  {
    id: "travel-hill-view",
    src: "images/life/travel-hill-view.webp",
    thumb: "images/life/travel-hill-view-thumb.webp",
    alt: "Green hills and a town beneath a bright blue sky",
    caption: "A view worth stopping for.",
    category: "Travel",
    width: 1600,
    height: 1089,
  },
];
