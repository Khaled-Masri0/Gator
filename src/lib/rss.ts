import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};


export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.statusText}`);
  }

  const xmlData = await response.text();
  const parser = new XMLParser();
  const parsed = parser.parse(xmlData);
  if(parsed.rss.channel === undefined){
    throw new Error("Error: Missing channel element");
  }

  if(parsed.rss.channel.title === undefined || parsed.rss.channel.link === undefined || parsed.rss.channel.description === undefined){
    throw new Error("Error: Missing required channel fields");
  }

  const { title, link, description, item } = parsed.rss.channel;

 const items: RSSItem[] = item === undefined ? [] : Array.isArray(item) ? item : [item];
 const validItems = items.filter(itm => 
  itm.title !== undefined && 
  itm.link !== undefined && 
  itm.description !== undefined && 
  itm.pubDate !== undefined
);


 return {
  channel: {
    title,
    link,
    description,
    item: validItems,
  },
} as RSSFeed;

}