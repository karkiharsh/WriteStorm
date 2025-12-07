import pg from "pg";

async function main() {
  let connectedCount = 0;

  for (let i = 0; i < 1000; i++) {   // try more than 100
    try {
      const client = new pg.Client({
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "pass",
        database: "postgres",
      });

      await client.connect();
      connectedCount++;

      console.log(`Connection ${connectedCount} successful`);
    } catch (err) {
      console.error(`❌ Failed at connection ${connectedCount + 1}`);
      console.error(err.message);
      break;             // stop the loop after failure
    }
  }

  console.log(`\nTotal successful connections: ${connectedCount}`);
}

main();
