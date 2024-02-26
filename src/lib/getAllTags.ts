/* eslint-disable */
import { getCollection } from "astro:content";
import { deslugify, slugify } from "./slug";

export function getAllTags<T extends Record<string, any>>(posts: T[] = []) {
  const allTags = new Set<string>();
  posts.forEach((post) => {
    // Assuming that 'tags' property exists in the data object of type T
    (post.tags || []).map((tag: string) => allTags.add(tag.toLowerCase()));
  });
  return [...allTags];
}

export const getTaxonomy = async (collection: "blog", name: string) => {
  const singlePages = await getCollection(collection);
  const taxonomyPages = singlePages.map(
    (page) => page.data[name as keyof typeof page.data],
  );
  let taxonomies = [];
  for (let i = 0; i < taxonomyPages.length; i++) {
    const categoryArray = taxonomyPages[i];
    // Type guard to check if categoryArray is defined and is an array
    if (Array.isArray(categoryArray)) {
      for (let j = 0; j < categoryArray.length; j++) {
        taxonomies.push({
          name: categoryArray[j],
          slug: slugify(categoryArray[j]),
        });
      }
    }
  }
  const taxonomy = [...new Set(taxonomies)];
  return taxonomy;
};

export const getSinglePage = async (collection: "blog") => {
  const allPage = await getCollection(collection);
  const removeIndex = allPage.filter((data) => data.id.match(/^(?!-)/));
  const removeDrafts = removeIndex.filter((data) => !data.data.draft);
  return removeDrafts;
};

export const taxonomyFilter = (posts: any[], name: string, key: any) =>
  posts.filter((post) =>
    post.data[name]
      .map((name: string) => deslugify(name))
      .includes(deslugify(key)),
  );
