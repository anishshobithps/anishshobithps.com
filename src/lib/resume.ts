
import { siteConfig } from "@/lib/config";

export async function fetchResume() {
    const res = await fetch(siteConfig.resumeURL, {
        next: { revalidate: 3600 },
    });

    if (!res.ok || !res.body) {
        throw new Error(
            `Failed to fetch resume: ${res.status} ${res.statusText}`
        );
    }

    return res;
}

export function getResumeFilename(download: boolean = false) {
    const formattedName = siteConfig.name.replace(/\s+/g, "_");
    const formattedDate = new Intl.DateTimeFormat("en-GB")
        .format(new Date())
        .replace(/\//g, "-");
    return download ? `${formattedName}-Resume-${formattedDate}.pdf` : `${siteConfig.name}'s Resume.pdf`;
}
