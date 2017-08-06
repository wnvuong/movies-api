"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Https = require("https");
function get(url, callback) {
    Https.get(url, (res) => {
        if (res.statusCode !== 200) {
            let error = new Error(`Request Failed.\n Status Code: ${res.statusCode}`);
            console.error(error);
            res.resume();
            callback(error, null);
        }
        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => rawData += chunk);
        res.on('end', () => {
            callback(null, rawData);
        });
    }).on('finish', () => {
    });
}
exports.get = get;
//# sourceMappingURL=request.js.map