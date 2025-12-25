import {
  Avatar,
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Tag,
  Text,
  Meta,
  Schema,
  Row,
} from "@once-ui-system/core";

import React from "react";
import { sanity } from "@/lib/sanity.client";
import { baseURL, person, social } from "@/resources";
import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_ABOUT = {
  title: "About",
  intro: "",
  sections: [],
};

export async function generateMetadata() {
  const about =
    (await sanity.fetch(`
      *[_type=="aboutPage"][0]{
        title,
        intro
      }
    `)) ?? FALLBACK_ABOUT;

  return Meta.generate({
    title: about.title,
    description: about.intro,
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: "/about",
  });
}

export default async function About() {
  const about =
    (await sanity.fetch(`
      *[_type=="aboutPage"][0]{
        title,
        intro,
        sections[]{
          heading,
          content
        }
      }
    `)) ?? FALLBACK_ABOUT;

  const structure = about.sections.map((section: any) => ({
    title: section.heading,
    display: true,
    items: [],
  }));

  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.intro}
        path="/about"
        author={{
          name: person.name,
          url: `${baseURL}/about`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      {structure.length > 0 && (
        <Column
          left="0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          s={{ hide: true }}
        >
          <TableOfContents
            structure={structure}
            about={{ tableOfContent: { display: true, subItems: false } }}
          />
        </Column>
      )}

      <Row fillWidth s={{ direction: "column" }} horizontal="center">
        {/* LEFT SIDEBAR */}
        <Column
          className={styles.avatar}
          top="64"
          fitHeight
          position="sticky"
          s={{ position: "relative", style: { top: "auto" } }}
          minWidth="160"
          paddingX="l"
          paddingBottom="xl"
          gap="m"
          flex={3}
          horizontal="center"
        >
          <Avatar src={person.avatar} size="xl" />

          <Row gap="8" vertical="center">
            <Icon onBackground="accent-weak" name="globe" />
            {person.location}
          </Row>

          <Row wrap gap="8">
            {person.languages?.map((language, index) => (
              <Tag key={index} size="l">
                {language}
              </Tag>
            ))}
          </Row>
        </Column>

        {/* MAIN CONTENT */}
        <Column className={styles.blockAlign} flex={9} maxWidth={40}>
          <Column minHeight="160" vertical="center" marginBottom="32">
            <Heading className={styles.textAlign} variant="display-strong-xl">
              {person.name}
            </Heading>
            <Text
              className={styles.textAlign}
              variant="display-default-xs"
              onBackground="neutral-weak"
            >
              {person.role}
            </Text>

            {social.length > 0 && (
              <Row
                className={styles.blockAlign}
                paddingTop="20"
                gap="8"
                wrap
                horizontal="center"
                fitWidth
              >
                {social
                  .filter((item) => item.essential)
                  .map((item) => (
                    <React.Fragment key={item.name}>
                      <Row s={{ hide: true }}>
                        <Button
                          href={item.link}
                          prefixIcon={item.icon}
                          label={item.name}
                          size="s"
                          variant="secondary"
                        />
                      </Row>
                      <Row hide s={{ hide: false }}>
                        <IconButton
                          size="l"
                          href={item.link}
                          icon={item.icon}
                          variant="secondary"
                        />
                      </Row>
                    </React.Fragment>
                  ))}
              </Row>
            )}
          </Column>

          {/* INTRO */}
          {about.intro && (
            <Column textVariant="body-default-l" fillWidth gap="m" marginBottom="xl">
              <Text>{about.intro}</Text>
            </Column>
          )}

          {/* CMS SECTIONS */}
          {about.sections.map((section: any, index: number) => (
            <Column key={index} fillWidth gap="m" marginBottom="xl">
              <Heading
                as="h2"
                id={section.heading}
                variant="display-strong-s"
              >
                {section.heading}
              </Heading>
              <Text variant="body-default-m">
                {section.content}
              </Text>
            </Column>
          ))}
        </Column>
      </Row>
    </Column>
  );
}
