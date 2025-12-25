// sanity/schemaTypes/blogPost.ts
export default {
  name: "blogPost",
  type: "document",
  title: "Blog Post",
  fields: [
    { name: "title", type: "string" },
    {
      name: "slug",
      type: "slug",
      options: { source: "title" },
    },
    { name: "excerpt", type: "text" },
    { name: "publishedAt", type: "datetime" },

    {
      name: "coverImage",
      type: "image",
    },

    {
      name: "content",
      type: "array",
      of: [{ type: "block" }, { type: "image" }],
    },
  ],
};
