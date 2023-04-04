import slugify from 'limax';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, DATE_FORMATTER } from '~/ts/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getProjectRootDir = (): string => {
    const mode = import.meta.env.MODE;
  
    return mode === 'production' ? path.join(__dirname, '../') : path.join(__dirname, '../../');
  };
  
const __srcFolder = path.join(getProjectRootDir(), '/src');
  
export const getRelativeUrlByFilePath = (filepath: string): string => {
    return filepath.replace(__srcFolder, '');
};

const formatter =
  DATE_FORMATTER ||
  new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });


export const getFormattedDate = (date: Date) => (date ? formatter.format(date) : '');

export const trim = (str = '', ch?: string) => {
  let start = 0;
  let end = str.length || 0;
  while (start < end && str[start] === ch) ++start;
  while (end > start && str[end - 1] === ch) --end;
  return start > 0 || end < str.length ? str.substring(start, end) : str;
};


export const trimSlash = (s: string) => trim(trim(s, '/'));
const createPath = (...params: string[]) => {
  const paths = params
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
  return `/${paths}${(SITE.trailingSlash && paths ? '/' : '')}`;
};

const BASE_PATHNAME = SITE.basePathname;

export const cleanSlug = (text = '') =>
  trimSlash(text)
    .split('/')
    .map((slug) => slugify(slug))
    .join('/');

export const getCanonical = (path = ''): string | URL => new URL(path, SITE.origin);

export const getPermalink = (slug = '', type = 'page'): string => {
  let permalink: string;

  switch (type) {
    case 'post':
      permalink = createPath(trimSlash(slug));
      break;

    case 'page':
    default:
      permalink = createPath(slug);
      break;
  }

  return definitivePermalink(permalink);
};

export const getHomePermalink = (): string => getPermalink('/');


export const getAsset = (path: string): string =>
  `/${[BASE_PATHNAME, path]
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/')}`;

const definitivePermalink = (permalink: string): string => createPath(BASE_PATHNAME, permalink);

const load = async function () {
    let images: Record<string, () => Promise<unknown>> | undefined = undefined;
    try {
      images = import.meta.glob('~/assets/images/**');
    } catch (e) {
      // continue regardless of error
    }
    return images;
};
  

// @ts-expect-error _images is not defined
let _images;

export const fetchLocalImages = async () => {
    // @ts-expect-error _images is not defined
    _images = _images || load();
    return await _images;
};
  

export const findImage = async (imagePath?: string) => {
    if (typeof imagePath !== 'string') return null;
  
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  
    if (!imagePath.startsWith('~/assets')) return null; // For now only consume images using ~/assets alias (or absolute)
  
    const images = await fetchLocalImages();
    const key = imagePath.replace('~/', '/src/');
  
    return typeof images[key] === 'function' ? (await images[key]())['default'] : null;
};
