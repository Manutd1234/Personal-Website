import { featuredProjectStories } from "./project-stories-featured";
import { archiveProjectStories } from "./project-stories-archive";

export type ProjectPoint = {
  label: string;
  detail: string;
};

export type ProjectStory = {
  summary: string;
  audience: string;
  problem: string;
  contribution: string;
  sections: readonly {
    title: string;
    points: readonly ProjectPoint[];
  }[];
};

// Expanded book chapters retain the scope and attribution of the portfolio's
// verified project records. Short highlights remain available to other views.
export const projectStories: Readonly<Record<string, ProjectStory | undefined>> = {
  ...featuredProjectStories,
  ...archiveProjectStories,
};
