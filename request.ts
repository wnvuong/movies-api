import * as Https from 'https';

function get(url: string, callback: (err: any, result: string) => void) {
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

export {
    get
}