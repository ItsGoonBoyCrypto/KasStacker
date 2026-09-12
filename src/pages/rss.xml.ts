import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import changelog from '@data/changelog.json';

export function GET(context: APIContext) {
  return rss({
    title: 'KasStacker — What moved',
    description:
      "The Kaspa programmability stack's changelog: releases, findings and ecosystem shifts — dated and sourced.",
    site: context.site!,
    items: [...changelog]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((e) => ({
        title: e.title,
        description: e.body,
        pubDate: new Date(`${e.date}T12:00:00Z`),
        link: '/changelog',
      })),
    customData: '<language>en</language>',
  });
}
