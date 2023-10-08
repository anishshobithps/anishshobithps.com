import { getPermalink } from '~/ts/utils';

export const SocialLinks = [
  { name: 'github', url: 'https://github.com/anishshobithps'},
	{ name: 'linkedin', url: 'https://www.linkedin.com/in/anishshobithps'},
	{ name: 'twitter', url: 'https://twitter.com/anishshobithps'},
	{ name: 'discord', url: 'https://discord.gg/H5NQcKJEa7'},
	{ name: 'instagram', url: 'https://www.instagram.com/anishshobithps/'},
	{ name: 'stackoverflow', url: 'https://stackoverflow.com/users/11995214'},
	{ name: 'spotify', url: 'https://open.spotify.com/user/goshcrm0y9jzum2lffvu6f4hz'},
].sort((a, b) => a.name.localeCompare(b.name));

export const technologies = [
  {
    'logo': 'simple-icons:astro',
    'text': 'Astro'
  },
  {
    'logo': 'akar-icons:javascript-fill',
    'text': 'JavaScript'
  },
  {
    'logo': 'cib:typescript',
    'text': 'TypeScript'
  },
  {
    'logo': 'simple-icons:tailwindcss',
    'text': 'Tailwind'
  },
  {
    'logo': 'fa-brands:node-js',
    'text': 'Node.js'
  },
  {
    'logo': 'mdi:language-python',
    'text': 'Python'
  },
  {
    'logo': 'mdi:git',
    'text': 'Git'
  },
  {
    'logo': 'mdi:language-cpp',
    'text': 'CPP'
  },
  {
    'logo': 'mdi:language-c',
    'text': 'C'
  },
  {
    'logo': 'mdi:google-cloud',
    'text': 'Google Cloud'
  },
  {
    'logo': 'simple-icons:heroku',
    'text': 'Heroku'
  },
  {
    'logo': 'fa-brands:java',
    'text': 'Java'
  },
  {
    'logo': 'ion:logo-docker',
    'text': 'Docker'
  }
].sort((a, b) => a.text.localeCompare(b.text));

export const gear = [{
  name: 'Workstation',
  items: [
    'ROG Zephyrus G14 GA401',
    'ASUS Mechanical Gaming Keyboard - ROG Strix Scope RX',
    'HP Ink Tank 419',
    'TP-Link UH400 USB 3.0 4-Port',
    'Amazon Basics Wired Gaming Mouse',
    'boAt Bassheads 225',
    'TTP-Link AC1200 Archer A6 Smart WiFi',
    'Adjustable Wood Desktop Storage Organizer Display Shelf Rack',
    'Tidy Up! Wire Bin (Black)',
    'Shuban Metal Mesh Desk Rack',
    'Table - Custom made',
  ]
}]

export const headerData = {
  links: [
    {
      text: 'About',
      href: getPermalink('/about'),
    },
    // {
    //   text: 'Projects',
    //   href: getPermalink('/projects'),
    // },
    {
      text: 'Gear',
      href: getPermalink('/gear'),
    },
    // {
    //   text: 'Contact',
    //   href: getPermalink('/contact'),
    // },
  ]
};

export const footerData = {
  footNote: `
    <a class='text-zinc-600 hover:underline dark:text-gray-200' href='https://github.com/Anish-Shobith'>Anish Shobith</a> &copy; 2022 - Present · All rights reserved.
  `,
};
