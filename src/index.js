import fetch from "node-fetch";
import express from "express";
const app = express();

const regexToFindUUID = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;
async function getFile(url) {
  const response = await fetch(url);
  const file = await response.text();
  return file.split("\n");
}

function getID(lines, name) {
  const line = lines.find((value) => {
    return value.includes(name) && value.includes("ID:");
  });

  return line.match(regexToFindUUID)[0];
}

function getUrls(lines, uuid) {
  return lines.filter((a) => {
    const value = a;
    return (
      value.includes(uuid) &&
      value.includes("://") &&
      value.includes("dl.lyriclify.com") &&
      !value.includes("api.qrserver") &&
      !value.includes("cloudflare")
    );
  });
}
async function extracUrls(url, name) {
  const lines = await getFile(url);
  const UUID = getID(lines, name);

  const urls = getUrls(lines, UUID);

  return urls;
}

app.get("/", function (req, res) {
  res.send("Hello World");
});

const PORT = process.env.PORT || 5555;

app.get("/extract", async (req, res) => {
  try {
    const urls = await extracUrls(req.query.url, req.query.name);
    return res.send(`
    <pre>
  ${urls.join("\n \n")}
    </pre>
    
    `);
  } catch (e) {
    return res.send(`
    <pre>
  not found or error
    </pre>
    
    `);
  }
});
const server = app.listen(PORT, function () {
  console.log("Example app listening at http://%s:%s", PORT);
});
