interface CellCornersInput {
  index: number;
  total: number;
  featured: boolean;
  filler: boolean;
}

function cellCorners({ index, total, featured, filler }: CellCornersInput) {
  const lastVisible = filler ? total - 2 : total - 1;
  const classes = ["rounded-panel"];

  if (index === 0) classes.push("rounded-t-none");
  if (index === lastVisible) classes.push("rounded-b-none");

  classes.push("md:rounded-panel");

  if (index === 0) classes.push(featured ? "md:rounded-t-none" : "md:rounded-tl-none");
  if (index === 1 && !featured) classes.push("md:rounded-tr-none");

  if (featured && total === 1) {
    classes.push("md:rounded-b-none");
  } else {
    if (index === total - 2) classes.push("md:rounded-bl-none");
    if (index === total - 1) classes.push("md:rounded-br-none");
  }

  return classes.join(" ");
}

export function postGrid<T>(items: T[], featured: boolean) {
  const filler = (featured ? items.length - 1 : items.length) % 2 === 1;
  const cells: (T | "filler")[] = filler ? [...items, "filler"] : items;
  const total = cells.length;
  return {
    cells,
    corners: (index: number) => cellCorners({ index, total, featured, filler }),
  };
}
