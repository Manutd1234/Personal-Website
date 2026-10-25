"use client";

import { createContext } from "react";
import type { Project } from "./BookCarousel";
import { projectStories } from "@/content/project-stories";

// The reader settles a pending leaf before the same spread folds back to the shelf.
export const BookClosingContext = createContext(false);

export const openingPageTitles = ["Opening notes", "The problem & my role"] as const;

// The shelf and reader use the same text and classes. Preview markup stays
// phrasing-only because the miniature pages sit inside the book's button.
export function OpeningNotes({ project, preview = false }: { project: Project; preview?: boolean }) {
  const story = projectStories[project.title];
  const Paragraph = preview ? "span" : "p";
  const Heading = preview ? "span" : "h3";
  return <>
    <Paragraph className="reader-category reader-paragraph">{project.category}</Paragraph>
    <Heading className="reader-opening-title">{project.title}</Heading>
    <Paragraph className="reader-intro reader-paragraph">{story?.summary ?? project.description}</Paragraph>
    {story ? <Paragraph className="reader-audience reader-paragraph"><strong>Who it helps</strong>{story.audience}</Paragraph> : null}
    {!story && project.outcome ? <Paragraph className="reader-outcome reader-paragraph">{project.outcome}</Paragraph> : null}
    <Paragraph className="reader-signature reader-paragraph">Ian Wangsa</Paragraph>
  </>;
}

export function OpeningContext({ project, preview = false }: { project: Project; preview?: boolean }) {
  const story = projectStories[project.title];
  if (!story) return null;
  const List = preview ? "span" : "dl";
  const Group = preview ? "span" : "div";
  const Term = preview ? "span" : "dt";
  const Description = preview ? "span" : "dd";
  return <List className="reader-context">
    <Group className="reader-context-block"><Term className="reader-context-term">The problem</Term><Description className="reader-context-description">{story.problem}</Description></Group>
    <Group className="reader-context-block"><Term className="reader-context-term">My contribution</Term><Description className="reader-context-description">{story.contribution}</Description></Group>
  </List>;
}
