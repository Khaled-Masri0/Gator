import { readConfig, setUser } from "./config";
import { createUser, getUser, deleteAllUsers, getAllUsers  } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/rss";
import { createFeed, createFeedFollow, getFeeds, getFeedByUrl, getFeedFollowsForUser, deleteFeedFollow } from "./lib/db/queries/feeds";
import { Feed, User } from "./lib/db/schema";


export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;
export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    if (!config.currentUserName) {
      console.error("You must be logged in to use this command");
      process.exit(1);
    }

    const user = await getUser(config.currentUserName);
    if (!user) {
      console.error("Current user not found in database");
      process.exit(1);
    }

    await handler(cmdName, user, ...args);
  };
}
export function registerCommand(registry: CommandsRegistry, cmdName: string, handler: CommandHandler): void {
  registry[cmdName] = handler;
}

export async function runCommand(registry: CommandsRegistry, cmdName: string, ...args: string[]): Promise<void> {
  const handler = registry[cmdName];    
  if (handler) {
    await handler(cmdName, ...args);    
  } else {
    console.error(`Unknown command: ${cmdName}`);
  }
}
export async function handlerLogin(_cmdName: string, ...args: string[]) {  
  if (args.length !== 1) {
    console.error("Usage: login <username>");
    process.exit(1);  
  }
  
  const userName = args[0];
  
  const user = await getUser(userName);
  if (!user) {
    console.error(`User ${userName} not found`);
    process.exit(1);
  }
  
  setUser(readConfig(), userName);
  console.log(`Logged in as ${userName}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    console.error("Usage: register <username>");
    process.exit(1);  
  }
  
  const userName = args[0];
  console.log(`Registering user ${userName}...`);
  try {
  const user = await createUser(userName);
  setUser(readConfig(), userName);
  console.log(`User ${userName} registered and logged in successfully.`);
  console.log(user);
} catch (e) {
  console.error("Error creating user:", e);
  process.exit(1);
}
}

export async function handlerReset(_cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    console.error("Usage: reset");
    process.exit(1);  
  }
  
  await deleteAllUsers();
  console.log("All users deleted successfully.");
}

export async function handlerUsers(_cmdName: string, ...args: string[]) {
  if (args.length !== 0) {
    console.error("Usage: users");
    process.exit(1);  
  }

  const config  = readConfig();
  const users = await getAllUsers();
  console.log("Registered users:");
  
  users.forEach(user => {
    if(user.name === config.currentUserName){
      console.log(`- ${user.name} (current)`);
    }
    else{
      console.log(`- ${user.name}`);
    }
  });

}

export async function handlerAgg(_cmdName: string, ...args: string[]) {
 const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(JSON.stringify(feed, null, 2));
}

export async function addFeed(_cmdName: string, user: User,  ...args: string[]) {
  if (args.length !== 2) {
    console.error("Usage: addfeed <feed-name> <feed-url>");
    process.exit(1);  
  } 

  const [feedName, feedUrl] = args;
 
  const feed = await createFeed(feedName, feedUrl, user.id);
  const feedFollow = await createFeedFollow(user.id, feed.id);
  
  console.log(`Feed ${feedName} added and followed successfully.`);
  console.log(`Feed: ${feedFollow.feedName}`);
  console.log(`User: ${feedFollow.userName}`);
}

function printFeed(feed: Feed, user: User) {
  console.log(`Name: ${feed.name}`);
  console.log(`URL: ${feed.url}`);
  console.log(`User: ${user.name}`);
}


export async function handlerFeeds(_cmdName: string,  ...args: string[]) {
  if (args.length !== 0) {
    console.error("Usage: feeds");
    process.exit(1);  
  }

  const feeds = await getFeeds();
  feeds.forEach(feed => {
    printFeed(feed, feed.user);
    console.log("---");
  });
}

export async function handlerFollow(_cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 1) {
    console.error("Usage: follow <feed-url>");
    process.exit(1);  
  }
  
  const feedUrl = args[0];

  const feed = await getFeedByUrl(feedUrl);
  if (!feed) {
    console.error(`Feed with URL ${feedUrl} not found`);
    process.exit(1);
  }
  
  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`Successfully followed feed: ${feedFollow.feedName}`);
  console.log(`User: ${feedFollow.userName}`);
}

export async function handlerFollowing(_cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 0) {
    console.error("Usage: following");
    process.exit(1);  
  }
  
  const feedFollows = await getFeedFollowsForUser(user.id);
  if (feedFollows.length === 0) {
    console.log("You are not following any feeds.");
    return;
  }
  
  console.log("Feeds you are following:");
  feedFollows.forEach(follow => {
    console.log(`- ${follow.feedName} (added on ${follow.createdAt.toLocaleString()})`);
  });
}

export async function handlerUnfollow(_cmdName: string, user: User, ...args: string[]) {
  if (args.length !== 1) {
    console.error("Usage: unfollow <feed-url>");
    process.exit(1);  
  }
  
  const feedUrl = args[0];
  await deleteFeedFollow(user.id, feedUrl);
  console.log(`Successfully unfollowed feed with URL: ${feedUrl}`);
}