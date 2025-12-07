import pg from "pg";
import { performance } from "perf_hooks";

const CONFIG = {
  mode: "sequential",   // "parallel" or "sequential"
  clients: 50,        // number of parallel clients this thing is just for parallel
  queriesPerClient: 5 // number of queries per client
};

async function createClient() {
  const client = new pg.Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "pass",
    database: "postgres",
  });
  await client.connect();
  return client;
}

async function runQuery(client) {
  const start = performance.now();
  await client.query("SELECT NOW()");
  const end = performance.now();
  return end - start;
}

async function parallelTest() {
  let latencies = [];
  
  const clients = await Promise.all(
    Array.from({ length: CONFIG.clients }).map(() => createClient())
  );

  const startAll = performance.now();
  const promises = [];

  for (let c of clients) {
    for (let i = 0; i < CONFIG.queriesPerClient; i++) {
      promises.push(runQuery(c).then(lat => latencies.push(lat)));
    }
  }

  await Promise.all(promises);
  const endAll = performance.now();

  clients.forEach(c => c.end());

  return {
    mode: "parallel",
    avgLatency: avg(latencies),
    totalTime: endAll - startAll,
  };
}

async function sequentialTest() {
  let latencies = [];

  const startAll = performance.now();
  const clients = await Promise.all(
    Array.from({ length: CONFIG.clients }).map(() => createClient())
  );
  for (let c of clients) {
    // var client = await createClient();
    for ( let i = 0; i < CONFIG.queriesPerClient; i++) {
    const lat = await runQuery(c);
    latencies.push(lat);
    // client.end();
    }
  }
  const endAll = performance.now();


  return {
    mode: "sequential",
    avgLatency: avg(latencies),
    totalTime: endAll - startAll,
  };
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function main() {
  console.log("\nRunning test:", CONFIG.mode.toUpperCase());

  const result =
    CONFIG.mode === "parallel"
      ? await parallelTest()
      : await sequentialTest();

  console.log("\nResults:");
  console.log("Mode:", result.mode);
  console.log("Avg Query Latency:", result.avgLatency.toFixed(2), "ms");
  console.log("Total Time:", result.totalTime.toFixed(2), "ms");
}

main();
