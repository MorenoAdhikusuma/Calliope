// sanity/schemaTypes/aboutPage.ts
export default {
  name: "aboutPage",
  type: "document",
  title: "About Page",
  fields: [
    { name: "title", type: "string" },
    { name: "intro", type: "text" },

    {
      name: "sections",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "heading", type: "string" },
            { name: "content", type: "text" },
          ],
        },
      ],
    },

    {
      name: "avatar",
      type: "image",
    },
  ],
};
