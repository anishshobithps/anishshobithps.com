import { db } from "@/lib/db";
import { projects as projectsTable } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export type Project = {
    id: number;
    title: string;
    description: string;
    highlights: string[];
    live: string | null;
    github: string | null;
    enabled: boolean;
    sortOrder: number;
};

export async function getPublicProjects(): Promise<Project[]> {
    return db
        .select({
            id: projectsTable.id,
            title: projectsTable.title,
            description: projectsTable.description,
            highlights: projectsTable.highlights,
            live: projectsTable.live,
            github: projectsTable.github,
            enabled: projectsTable.enabled,
            sortOrder: projectsTable.sortOrder,
        })
        .from(projectsTable)
        .where(eq(projectsTable.enabled, true))
        .orderBy(asc(projectsTable.sortOrder), asc(projectsTable.id));
}
