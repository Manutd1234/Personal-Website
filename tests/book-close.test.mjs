import assert from "node:assert/strict";
import test from "node:test";
import {getBookCloseAlignment} from "../components/book-close.ts";

for (const [label, fixture] of Object.entries({
  desktop: {
    sceneWidth: 1120, sceneHeight: 520, perspective: 1400,
    originX: 560, originY: 197.6,
    bookWidth: 235.1875, bookHeight: 333.96875, bookDepth: 30,
    pageLeft: 560, pageTop: 51, pageWidth: 534.5, pageHeight: 453.25,
  },
  compact: {
    sceneWidth: 344, sceneHeight: 450, perspective: 1000,
    originX: 172, originY: 171,
    bookWidth: 166, bookHeight: 235.71875, bookDepth: 34,
    pageLeft: 1, pageTop: 42, pageWidth: 342, pageHeight: 410.5,
  },
})) {
  test(`${label}: paper projects onto the reader's exact four corners`, () => {
    const aligned = getBookCloseAlignment(fixture);
    const z = fixture.bookDepth / 2 * aligned.scaleX;
    const perspectiveScale = fixture.perspective / (fixture.perspective - z);
    const project = (x, y) => ({
      x: fixture.originX + (fixture.sceneWidth / 2 + aligned.x + (x - fixture.bookWidth / 2) * aligned.scaleX - fixture.originX) * perspectiveScale,
      y: fixture.originY + (fixture.sceneHeight / 2 + aligned.y + (y - fixture.bookHeight / 2) * aligned.scaleY - fixture.originY) * perspectiveScale,
    });
    for (const [x, y] of [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      const actual = project(x * fixture.bookWidth, y * fixture.bookHeight);
      assert.ok(Math.abs(actual.x - (fixture.pageLeft + x * fixture.pageWidth)) < 1e-9);
      assert.ok(Math.abs(actual.y - (fixture.pageTop + y * fixture.pageHeight)) < 1e-9);
    }
  });
}
