// Curated from the local, metadata-free portfolio photo copies.
// Personal gym photos were selected and exported from Photos by the user workflow.
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
    id: "gym-mirror",
    src: "images/life-new/gym-mirror-bench.webp",
    thumb: "images/life-new/gym-mirror-bench-thumb.webp",
    alt: "Mirror portrait seated on a gym bench, surrounded by training equipment",
    caption: "Time away from the screen.",
    category: "Gym",
    width: 900,
    height: 1600,
    position: "center 35%",
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
    id: "food-dish-lime-chilli",
    src: "images/life-new/food-dish-lime-chilli.webp",
    thumb: "images/life-new/food-dish-lime-chilli-thumb.webp",
    alt: "A plated dish with sauce, lime halves, and a side of chilli",
    caption: "A good meal is always worth a photo.",
    category: "Food",
    width: 900,
    height: 1600,
  },
  {
    id: "friends-sports-field",
    src: "images/life-new/friends-sports-field.webp",
    thumb: "images/life-new/friends-sports-field-thumb.webp",
    alt: "A group posing beside a netted sports field under a cloudy blue sky",
    caption: "A day out with friends.",
    category: "People",
    width: 1280,
    height: 960,
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
    id: "orientation-paper-activity",
    src: "images/life-new/orientation-paper-activity.webp",
    thumb: "images/life-new/orientation-paper-activity-thumb.webp",
    alt: "An orientation group gathered around a classroom table with colourful paper shapes",
    caption: "An orientation group activity.",
    category: "Learning",
    width: 1600,
    height: 1200,
  },
  {
    id: "gym-strength-floor",
    src: "images/life-new/gym-strength-floor.webp",
    thumb: "images/life-new/gym-strength-floor-thumb.webp",
    alt: "A gym floor with weight machines, squat racks, and training equipment",
    caption: "Back on the gym floor.",
    category: "Gym",
    width: 1200,
    height: 1600,
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
