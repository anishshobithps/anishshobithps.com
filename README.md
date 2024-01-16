# anishshobithps.com
My personal website, where I share my experiences and I also write blogs!

## Prerequisites
- Node.js
- Git
- [API](https://github.com/anishshobithps/api.anishshobithps.com)

## Tech Stack
- Astro
- React
- TailwindCSS
- TypeScript
- shadcn

## Setting up and Running
> [!IMPORTANT]
> To avoid confusions, I suggest creating one common directory for the API code and website code, then we can clone both project to the that common directory.

1. Create the common directory, skip if you already made the common directory while cloning the [api](https://github.com/anishshobithps/api.anishshobithps.com).
```sh
mkdir website
```

2. Change the directory to the `website` directory, skip if you have done during the website process.
```sh
cd website
```

3. Clone the Project
```sh
git clone git@github.com:anishshobithps/anishshobithps.com.git www
```
> [!CAUTION]
> Run the [API](https://github.com/anishshobithps/api.anishshobithps.com) before running the website

3. Change the directory to the `www` folder.
```sh
cd www
```

4. Install Dependencies required for the project.
```sh
npm install
```

5. Run the dev version or build code for production via `npm run`.
```sh
npm run dev
# or
npm run build
```

## Acknowledgements
- [Astro Docs](https://docs.astro.build/en/getting-started/)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [ev0-astro-theme](https://github.com/gndx/ev0-astro-theme)