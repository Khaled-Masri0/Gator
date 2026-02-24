import { db } from "..";
import { feed_follows, feeds, users } from "../schema";
import { eq, and } from "drizzle-orm";



export async function createFeed(name: string, url: string, userId: string) {
  const [result] = await db.insert(feeds).values({ name, url, userId }).returning();
  return result;
}

export async function getFeeds(){
  return db.query.feeds.findMany({
    with: {
      user: true,
    }
  }
  )};

export async function createFeedFollow(userId: string, feedId: string) {
  const [result] = await db.insert(feed_follows).values({ userId, feedId }).returning();
  
  const feedFollow = await db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(eq(feed_follows.id, result.id));

  return feedFollow[0];
}

export async function getFeedByUrl(url: string) {
  return db.query.feeds.findFirst({
    where: eq(feeds.url, url),
  });
}

export async function getFeedFollowsForUser(userId: string) {
  return db
    .select({
      id: feed_follows.id,
      createdAt: feed_follows.createdAt,
      updatedAt: feed_follows.updatedAt,
      feedName: feeds.name,
      userName: users.name,
    })
    .from(feed_follows)
    .innerJoin(feeds, eq(feed_follows.feedId, feeds.id))
    .innerJoin(users, eq(feed_follows.userId, users.id))
    .where(eq(feed_follows.userId, userId));
}

export async function deleteFeedFollow(userId: string, feedUrl: string) {
  const feed = await getFeedByUrl(feedUrl);
  if (!feed) {
    throw new Error(`Feed with URL ${feedUrl} not found`);
  }
  
  await db.delete(feed_follows)
    .where(and(eq(feed_follows.userId, userId), eq(feed_follows.feedId, feed.id)));
}

