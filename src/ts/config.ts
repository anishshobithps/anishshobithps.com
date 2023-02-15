import defaultImage from '~/assets/images/defaul.png';

const CONFIG = {
  name: 'Anish Shobith P S',
  origin: 'https://anish-shobith.github.io',
  basePathname: '/',
  trailingSlash: false,
  title: 'Anish Shobith P S',
  description: 'Portfolio of Anish Shobith P S',
  defaultImage: defaultImage,
  defaultTheme: 'system', // Values: "system" | "light" | "dark" | "light:only" | "dark:only"
  language: 'en',
  textDirection: 'ltr',
  dateFormatter: new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }),
};

export const SITE = { ...CONFIG };
export const DATE_FORMATTER = CONFIG.dateFormatter;