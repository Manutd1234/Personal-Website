"use client";

import BookCarousel from "./BookCarousel";
import ProjectBookReader from "./ProjectBookReader";
import { projects, projectArchive } from "@/content/portfolio";
import { projectMedia } from "@/content/media";

const allProjects = [...projects, ...projectArchive];

export default function ProjectsPanel({
  active = true,
  requestedProject,
}: {
  active?: boolean;
  requestedProject?: { title: string; id: number };
}) {
  return (
    <div className="project-library">
      <BookCarousel
        projects={allProjects}
        media={projectMedia}
        active={active}
        requestedProject={requestedProject?.title}
        requestKey={requestedProject?.id}
        renderDetails={(project, media) => (
          <ProjectBookReader
            key={project.title}
            project={project}
            media={media}
          />
        )}
      />
      <a
        className="book-library-source"
        href="https://github.com/Manutd1234"
        target="_blank"
        rel="noreferrer"
      >
        Explore all repositories <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}
