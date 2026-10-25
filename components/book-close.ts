/** Closing owns one physical book from the visible spread to the shelf.
 * The full-resolution paper is folded once; no opening timeline is reversed. */
export const BOOK_CLOSE_MOTION = { duration: 900, foldEnd: .5 } as const;

export type BookCloseTransition = {
  finish: () => void;
  cancel: () => void;
  isActive: () => boolean;
};

type BookCloseOptions = {
  stage: HTMLElement;
  scene: HTMLElement;
  details: HTMLElement;
  /** The selected .book-orbit-item, including its .book-object. */
  book: HTMLElement;
  controls: HTMLElement;
  onComplete: () => void;
};

type CloseAlignment = {
  sceneWidth: number;
  sceneHeight: number;
  perspective: number;
  originX: number;
  originY: number;
  bookWidth: number;
  bookHeight: number;
  bookDepth: number;
  pageLeft: number;
  pageTop: number;
  pageWidth: number;
  pageHeight: number;
};

/** Invert the scene's perspective at the paper plane, rather than fitting a
 * rotated book's axis-aligned bounding rectangle. At the other endpoint the
 * clone uses the shelf's actual orbit, object and cover transforms unchanged. */
export function getBookCloseAlignment(input: CloseAlignment) {
  const ratio = input.pageWidth / input.bookWidth;
  const compensation = 1 / (1 + ratio * input.bookDepth / (2 * input.perspective));
  const scaleX = ratio * compensation;
  const scaleY = input.pageHeight / input.bookHeight * compensation;
  const x = input.originX + (input.pageLeft + input.pageWidth / 2 - input.originX) * compensation - input.sceneWidth / 2;
  const y = input.originY + (input.pageTop + input.pageHeight / 2 - input.originY) * compensation - input.sceneHeight / 2;
  const hingeX = input.sceneWidth / 2 + x - input.bookWidth * scaleX / 2;
  const hingeZ = (input.bookDepth / 2 - 1) * scaleX;
  const edgeOnAngle = -Math.atan2(input.perspective - hingeZ, input.originX - hingeX) * 180 / Math.PI;
  return {
    orbit: `translate3d(${x}px, ${y}px, 0px)`,
    object: `rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale3d(${scaleX}, ${scaleY}, ${scaleX})`,
    scaleX, scaleY, compensation, x, y, edgeOnAngle,
  };
}

/** Preserve the current typography and page-body scroll even though the paper
 * now lives inside a physical cover rather than the React reader ancestry. */
function snapshotPage(source: HTMLElement, bookWidth: number, bookHeight: number) {
  const copy = source.cloneNode(true) as HTMLElement;
  const originals = [source, ...source.querySelectorAll<HTMLElement>("*")];
  const copies = [copy, ...copy.querySelectorAll<HTMLElement>("*")];
  const scroll: Array<{element: HTMLElement; top: number; left: number}> = [];
  originals.forEach((original, index) => {
    const target = copies[index];
    const computed = getComputedStyle(original);
    for (const property of computed) target.style.setProperty(property, computed.getPropertyValue(property));
    target.style.setProperty("animation", "none", "important");
    target.style.setProperty("transition", "none", "important");
    // A copied explicit visibility would let descendants punch through the
    // stationary sheet after its parent is hidden beneath the shut cover.
    target.style.setProperty("visibility", "inherit", "important");
    target.removeAttribute("id");
    target.removeAttribute("aria-controls");
    target.removeAttribute("aria-describedby");
    if (original.scrollTop || original.scrollLeft) {
      scroll.push({element: target, top: original.scrollTop, left: original.scrollLeft});
    }
  });
  const width = source.getBoundingClientRect().width;
  const height = source.getBoundingClientRect().height;
  Object.assign(copy.style, {
    position: "absolute", inset: "0 auto auto 0", margin: "0",
    width: `${width}px`, height: `${height}px`,
    transformOrigin: "0 0", transform: `scale(${bookWidth / width}, ${bookHeight / height})`,
    pointerEvents: "none",
  });
  copy.dataset.bookCloseSnapshot = "true";
  copy.inert = true;
  copy.setAttribute("aria-hidden", "true");
  return { copy, restoreScroll: () => scroll.forEach(({element, top, left}) => {
    element.scrollTop = top;
    element.scrollLeft = left;
  }) };
}

const BOOK_SURFACES = ".book-front, .book-back, .book-back-lining, .book-spine, .book-pages, .book-under-leaf, .book-leaf-front, .book-leaf-back, .book-inside-cover, .book-cover-edge, .book-ground-shadow";

export function startBookClose({ stage, scene, details, book, controls, onComplete }: BookCloseOptions): BookCloseTransition {
  const reader = details.querySelector<HTMLElement>(".project-book-reader");
  const left = reader?.querySelector<HTMLElement>(".reader-static-left");
  const right = reader?.querySelector<HTMLElement>(".reader-static-right");
  const spread = reader?.querySelector<HTMLElement>(".reader-spread");
  const originalObject = book.querySelector<HTMLElement>(".book-object");
  const originalButton = book.querySelector<HTMLElement>(".book-click");
  const theatre = scene.parentElement;
  if (!reader || !left || !originalObject || !originalButton || !theatre) {
    onComplete();
    return {finish() {}, cancel() {}, isActive: () => false};
  }

  const single = reader.dataset.single === "true" || !right;
  const stationarySource = single ? left : right!;
  const pageRect = stationarySource.getBoundingClientRect();
  const sceneRect = scene.getBoundingClientRect();
  const theatreRect = theatre.getBoundingClientRect();
  const sceneStyle = getComputedStyle(scene);
  const sceneWidth = parseFloat(sceneStyle.width);
  const sceneHeight = parseFloat(sceneStyle.height);
  const bookStyle = getComputedStyle(book);
  const objectStyle = getComputedStyle(originalObject);
  const [originX, originY] = sceneStyle.perspectiveOrigin.split(" ").map(parseFloat);
  const width = parseFloat(bookStyle.width);
  const height = parseFloat(bookStyle.height);
  const depth = parseFloat(objectStyle.getPropertyValue("--book-depth")) || 30;
  // A reader-size cover must not lunge into the camera as it crosses 90°.
  // Use a gentle perspective for the fold, restoring the shelf's perspective
  // continuously during the return so the final physical pose is identical.
  const foldPerspective = Math.max(6000, pageRect.width * 10);
  const alignment = getBookCloseAlignment({
    sceneWidth, sceneHeight,
    perspective: foldPerspective,
    originX, originY, bookWidth: width, bookHeight: height, bookDepth: depth,
    pageLeft: pageRect.left - sceneRect.left, pageTop: pageRect.top - sceneRect.top,
    pageWidth: pageRect.width, pageHeight: pageRect.height,
  });
  const resting = {
    orbit: bookStyle.transform,
    button: getComputedStyle(originalButton).transform,
    object: objectStyle.transform,
  };
  const layer = document.createElement("div");
  layer.className = "book-close-scene";
  layer.dataset.bookCloseMethod = "fold-then-return";
  layer.dataset.bookCloseSingle = String(single);
  layer.setAttribute("aria-hidden", "true");
  layer.inert = true;
  Object.assign(layer.style, {
    left: `${sceneRect.left - theatreRect.left}px`, top: `${sceneRect.top - theatreRect.top}px`,
    width: `${sceneWidth}px`, height: `${sceneHeight}px`,
    perspective: `${foldPerspective}px`, perspectiveOrigin: sceneStyle.perspectiveOrigin,
  });
  const movingBook = book.cloneNode(true) as HTMLElement;
  movingBook.removeAttribute("data-close-source");
  movingBook.dataset.bookCloseModel = "true";
  movingBook.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
  const button = movingBook.querySelector<HTMLElement>(".book-click")!;
  const object = movingBook.querySelector<HTMLElement>(".book-object")!;
  const cover = movingBook.querySelector<HTMLElement>(".book-cover-hinge")!;
  const lining = movingBook.querySelector<HTMLElement>(".book-inside-cover")!;
  button.removeAttribute("aria-controls");
  button.removeAttribute("data-hovered");
  button.tabIndex = -1;
  lining.replaceChildren();
  const leftSnapshot = single ? null : snapshotPage(left, width, height);
  if (leftSnapshot) lining.append(leftSnapshot.copy);
  const rightSnapshot = snapshotPage(stationarySource, width, height);
  const paper = document.createElement("div");
  paper.className = "book-close-paper";
  paper.append(rightSnapshot.copy);
  object.append(paper);
  const shadow = document.createElement("div");
  shadow.className = "book-close-shadow";
  if (spread) {
    const spreadRect = spread.getBoundingClientRect();
    const spreadStyle = getComputedStyle(spread);
    Object.assign(shadow.style, {
      left: `${spreadRect.left - sceneRect.left}px`, top: `${spreadRect.top - sceneRect.top}px`,
      width: `${spreadRect.width}px`, height: `${spreadRect.height}px`,
      borderRadius: spreadStyle.borderRadius, boxShadow: spreadStyle.boxShadow,
    });
  }
  layer.append(shadow, movingBook);
  theatre.append(layer);
  leftSnapshot?.restoreScroll();
  rightSnapshot.restoreScroll();

  let active = true;
  let deadline: ReturnType<typeof setTimeout>;
  const animations: Animation[] = [];
  const {duration, foldEnd} = BOOK_CLOSE_MOTION;
  const ease = "cubic-bezier(.32,.05,.2,1)";
  const add = (element: HTMLElement, frames: Keyframe[]) => {
    const animation = element.animate(frames, {duration, fill: "both", easing: "linear"});
    animation.pause();
    animation.currentTime = 0;
    animations.push(animation);
    return animation;
  };
  const returnToShelf = (element: HTMLElement, from: string, to: string) => add(element, [
    {transform: from, offset: 0}, {transform: from, offset: foldEnd, easing: ease},
    {transform: to, offset: 1},
  ]);
  returnToShelf(movingBook, alignment.orbit, resting.orbit);
  returnToShelf(button, "rotateY(0deg)", resting.button);
  returnToShelf(object, alignment.object, resting.object);
  add(shadow, [
    {opacity: 1, offset: 0, easing: "ease-out"}, {opacity: 0, offset: .24}, {opacity: 0, offset: 1},
  ]);
  add(layer, [
    {perspective: `${foldPerspective}px`, offset: 0},
    {perspective: `${foldPerspective}px`, offset: foldEnd, easing: ease},
    {perspective: sceneStyle.perspective, offset: 1},
  ]);
  add(cover, [
    {transform: `translateZ(calc(var(--book-half-depth) - 1px)) rotateY(${single ? alignment.edgeOnAngle : -180}deg)`, offset: 0, easing: ease},
    {transform: "translateZ(calc(var(--book-half-depth) - 1px)) rotateY(0deg)", offset: foldEnd},
    {transform: "translateZ(calc(var(--book-half-depth) - 1px)) rotateY(0deg)", offset: 1},
  ]);
  // The stationary sheet remains readable until the cover has fully covered
  // it. A tiny depth separation prevents a coplanar flash at the final fold.
  add(paper, [
    {visibility: "visible", offset: 0}, {visibility: "visible", offset: foldEnd - .001},
    {visibility: "hidden", offset: foldEnd}, {visibility: "hidden", offset: 1},
  ]);
  object.querySelectorAll<HTMLElement>(".book-back, .book-back-lining, .book-spine, .book-pages").forEach(surface => add(surface, [
    {opacity: 0, offset: 0}, {opacity: 0, offset: foldEnd, easing: "ease-out"},
    {opacity: 1, offset: .65}, {opacity: 1, offset: 1},
  ]));
  movingBook.querySelectorAll<HTMLElement>(".book-ground-shadow").forEach(shadow => add(shadow, [
    {opacity: 0, offset: 0}, {opacity: 0, offset: .65, easing: "ease-out"}, {opacity: 1, offset: 1},
  ]));
  scene.querySelectorAll<HTMLElement>(".book-orbit-item").forEach(neighbor => {
    if (neighbor === book) return;
    neighbor.querySelectorAll<HTMLElement>(BOOK_SURFACES).forEach(surface => add(surface, [
      {opacity: 0, offset: 0}, {opacity: 0, offset: foldEnd, easing: "ease-out"},
      {opacity: 1, offset: .86}, {opacity: 1, offset: 1},
    ]));
  });
  reader.querySelectorAll<HTMLElement>(".reader-running-title, .reader-navigation, .reader-key-hint").forEach(chrome => add(chrome, [
    {opacity: 1, offset: 0, easing: "ease-out"}, {opacity: 0, offset: .16}, {opacity: 0, offset: 1},
  ]));
  add(controls, [
    {opacity: 0, offset: 0}, {opacity: 0, offset: .72, easing: "ease-out"}, {opacity: 1, offset: 1},
  ]);

  const cleanup = () => {
    clearTimeout(deadline);
    animations.forEach(animation => { animation.onfinish = null; animation.cancel(); });
    layer.remove();
    delete book.dataset.closeSource;
    delete stage.dataset.closeActive;
  };
  const finish = () => {
    if (!active) return;
    active = false;
    // Commit the real shelf's visibility while the matching final clone is
    // still present, then remove the complete temporary scene in this task.
    try { onComplete(); } finally { cleanup(); }
  };
  book.dataset.closeSource = "true";
  stage.dataset.closeActive = "true";
  stage.dataset.motionPhase = "closing";
  const now = document.timeline.currentTime;
  animations.forEach(animation => {
    animation.play();
    if (typeof now === "number") animation.startTime = now;
  });
  animations[0].onfinish = finish;
  deadline = setTimeout(finish, duration + 150);
  return {
    finish,
    cancel() {
      if (!active) return;
      active = false;
      cleanup();
    },
    isActive: () => active,
  };
}
