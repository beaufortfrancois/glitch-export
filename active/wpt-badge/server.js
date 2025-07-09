const nodeCron = require("node-cron");

const { URL } = require("url");
const request = require("request");

const express = require("express");
const app = express();

let cacheResults = {};

app.use(express.static("public"));
app.disable("etag");

app.get("/", function (request, response) {
  const product = request.query.product;
  const prefix = request.query.prefix;

  if (!product || !prefix) {
    return response.redirect("/examples.html");
  }

  getWebPlatformTestsScore(product, prefix, (score) => {
    generateBadgeUrl(product, score, (body) => {
      response.set("Cache-Control", "no-cache");
      response.set("Content-Disposition", 'inline; filename="wpt-badge.svg"');
      response.set("Content-Type", "image/svg+xml");
      response.status(200).send(body);
    });
  });
});

app.listen(process.env.PORT || 8080);

// Real magic is below!

function getResultsUrl(product) {
  if (product === "chrome") {
    return "https://wpt.fyi/api/results?label=experimental&label=master&product=chrome";
  }
  return `https://wpt.fyi/api/results?label=master&product=${product}[experimental]`;
}

function getWebPlatformTestsScore(product, prefix, callback) {
  const resultsUrl = getResultsUrl(product);
  if (resultsUrl in cacheResults) {
    console.log("accessing cache");
    const { passes, total } = getPassesAndTotal(
      cacheResults[resultsUrl],
      prefix
    );
    callback(`${passes}/${total}`);
    return;
  }
  console.log("accessing live results");
  request.get({ uri: resultsUrl, json: true }, (error, response, data) => {
    const { passes, total } = getPassesAndTotal(data, prefix);
    cacheResults[resultsUrl] = data;
    callback(`${passes}/${total}`);
  });
}

function getPassesAndTotal(data, prefix) {
  let passes = 0;
  let total = 0;
  Object.entries(data).forEach((pair) => {
    const key = pair[0];
    const val = pair[1];
    if (key.startsWith(prefix)) {
      passes += val["c"][0];
      total += val["c"][1];
    }
  });
  return { passes, total };
}

const colors = [
  "#e57373", // paper-red-300
  "#ffb74d", // paper-orange-300
  "#ffd54f", // paper-amber-300
  "#fff176", // paper-yellow-300
  "#dce775", // paper-lime-300
  "#aed581", // paper-light-green-300
  "#81c784", // paper-green-300
];

function generateBadgeUrl(product, score, callback) {
  const url = new URL(
    `https://img.shields.io/badge/wpt%20|%20${product}-${score}-grey.svg`
  );

  const ratio = eval(score);
  const part = Math.floor((colors.length - 2) * ratio);
  let colorB = colors[0];
  if (ratio > 1) {
    colorB = colors[colors.length - 1];
  } else {
    colorB = colors[part + 1];
  }

  url.searchParams.set("colorB", colorB);
  request.get(url.href, (error, response, body) => {
    callback(body);
  });
}

function getAllResults() {
  cacheResults = {};
  const products = ["chrome", "edge", "firefox", "safari"];
  products.forEach((product) => {
    const resultsUrl = getResultsUrl(product);
    request.get({ uri: resultsUrl, json: true }, (error, response, data) => {
      cacheResults[resultsUrl] = data;
    });
  });
}

getAllResults();

// Schedule a job to run every 6 hours
const job = nodeCron.schedule("0 */6 * * *", () => {
  console.log("reset cache results");
  getAllResults();
});
