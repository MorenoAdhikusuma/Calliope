import { Flex, Meta, Schema } from "@once-ui-system/core";
import GalleryView from "@/components/gallery/GalleryView";
import { sanity } from "@/lib/sanity.client";
import { urlFor } from "@/lib/sanity.image";
import { baseURL, person } from "@/resources";

export async function generateMetadata() {
  const gallery = await sanity.fetch(`
    *[_type=="galleryPage"][0]{
      title,
      description
    }
  `);

  return Meta.generate({
    title: gallery.title,
    description: gallery.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(gallery.title)}`,
    path: "/gallery",
  });
}

export default async function Gallery() {
  const gallery = await sanity.fetch(`
    *[_type=="galleryPage"][0]{
      title,
      description,
      images[]{
        asset,
        orientation
      }
    }
  `);

  const images = gallery.images.map((img: any) => ({
    src: urlFor(img).width(1200).quality(85).url(),
    alt: "gallery image",
    orientation: img.orientation,
  }));

  return (
    <Flex maxWidth="l">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={gallery.title}
        description={gallery.description}
        path="/gallery"
        image={`/api/og/generate?title=${encodeURIComponent(gallery.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/gallery`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <GalleryView images={images} />
    </Flex>
  );
}
