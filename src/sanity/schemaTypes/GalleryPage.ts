// sanity/schemaTypes/galleryPage.ts
export default {
  name: "galleryPage",
  type: "document",
  title: "Gallery Page",
  fields: [
    { name: "title", type: "string" },
    { name: "description", type: "text" },
    {
      name: "images",
      type: "array",
      of: [
        {
          type: "image",
          fields: [
            {
              name: "orientation",
              type: "string",
              options: {
                list: ["horizontal", "vertical"],
              },
            },
          ],
        },
      ],
    },
  ],
};
