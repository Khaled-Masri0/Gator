import { CommandsRegistry, registerCommand, runCommand, handlerLogin, handlerRegister, handlerReset, handlerUsers, handlerAgg, addFeed, handlerFeeds, handlerFollow, handlerFollowing, middlewareLoggedIn, handlerUnfollow } from "./commands";

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", middlewareLoggedIn(addFeed));
  registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
  registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error("Error: not enough arguments provided");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
  process.exit(0);
}

main();