const http = require("http");
const https = require("https");
const url = require("url");

function fetchTitle(address, callback) {
  let parsedUrl = url.parse(address);
  let protocol = parsedUrl.protocol === "https:" ? https : http;

  protocol
    .get(address, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        let match = data.match(/<title>([^<]*)<\/title>/);
        if (match && match[1]) {
          callback(null, `${address} - "${match[1]}"`);
        } else {
          callback(null, `${address} - NO TITLE FOUND`);
        }
      });
    })
    .on("error", () => {
      callback(null, `${address} - NO RESPONSE`);
    });
}

http
  .createServer((req, res) => {
    if (req.url.startsWith("/I/want/title")) {
      let queryData = url.parse(req.url, true).query;
      let addresses =
        queryData.address instanceof Array
          ? queryData.address
          : [queryData.address];

      let results = [];
      let completed = 0;

      addresses.forEach((address, index) => {
        fetchTitle(address, (err, result) => {
          results[index] = result;
          completed++;
          if (completed === addresses.length) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(
              "<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>"
            );
            results.forEach((result) => {
              res.write(`<li>${result}</li>`);
            });
            res.write("</ul></body></html>");
            res.end();
          }
        });
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("404 Not Found");
    }
  })
  .listen(3000, () => console.log("Server running on port 3000"));
