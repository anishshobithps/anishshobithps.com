import { source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(_: Request, { params }: RouteContext<'/llms.mdx/blog/[[...slug]]'>) {
    const { slug } = await params;
    const page = source.getPage(slug);

    if (!page) notFound();

    const text = await page.data
        .getText('processed')
        .then((processed) => processed || page.data.getText('raw'));

    return new Response(`# ${page.data.title} (${page.url})\n\n${text}`, {
        headers: { 'Content-Type': 'text/markdown' },
    });
}

export function generateStaticParams() {
    return source.generateParams();
}
