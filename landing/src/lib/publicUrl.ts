/** URL of a file in public/, respecting Vite's `base` so the page also works from a sub-path. */
export const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
