import * as Cheerio from 'cheerio';
import * as Request from './request';

import * as Express from 'express';
const app = Express();
const base = 'https://www.primewire.ag';

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get('/search', (req, res) => {
    let payload = [];
    Request.get(`${base}/index.php?search_keywords=${req.query.q}`, (err, result) => {
        if (!err) {
            const $ = Cheerio.load(result);
            $('.index_item.index_item_ie').each((i, elem) => {
                let title = $(elem).find('img').first().attr('alt').substr(6);
                let thumbnail = $(elem).find('img').first().attr('data-cfsrc');
                let url = '/show' + $(elem).find('a').first().attr('href');
                let yearSplit = $(elem).find('h2').first().text().split(' ');
                let year = yearSplit[yearSplit.length - 1];
                year = year.substring(1, year.length - 1);
                payload.push({
                    year: parseInt(year),
                    title: `${title}`,
                    url,
                    thumbnail
                })
            });
            res.send({
                success: true,
                payload
            });
        } else {
            res.send({
                success: false
            });
        }
    })
})

app.get('/show/:id', (req, res) => {
    Request.get(`${base}/${req.params.id}`, (err, result) => {
        if (!err) {
            const $ = Cheerio.load(result);
            let episodes = [];
            $('.tv_episode_item').each((i, elem) => {
                let tvEpisodeItem = $(elem);
                let tvEpisodeSeason = parseInt(tvEpisodeItem.parent().attr('data-id'));
                let tvEpisodeNumber = parseInt(tvEpisodeItem.text().split(' ')[1].substr(1));
                let tvEpisodeUrl = tvEpisodeItem.children().first().attr('href');
                let tvEpisodeName = tvEpisodeItem.children().first().children('.tv_episode_name').text().substr(3);
                episodes.push({
                    episodeName: tvEpisodeName,
                    url: tvEpisodeUrl,
                    season: tvEpisodeSeason,
                    episodeNumber: tvEpisodeNumber
                });
                parseEpisode(tvEpisodeUrl, (err, result) => {
                    if (!err) {
                        let payload = {
                            url: result.tvEpisodeProviderUrl,
                            name: tvEpisodeName,
                            provider: result.tvEpisodeProvider
                        }
                        // console.log(JSON.stringify(payload, null, 2))
                       
                    }
                });
            });
            res.send({
                success: true,
                payload: episodes
            })
        } else {
            res.send({
                success: false
            });
        }
    });
});

app.listen(4000, () => {
    console.log('Movie app listening on port 4000')
})

// Request.get(`${base}/watch-2745400-Silicon-Valley-online-free`, (err, result) => {
//     if (!err) {
//         const $ = Cheerio.load(result);
//         $('.tv_episode_item').each((i, elem) => {
//             let tvEpisodeItem = $(elem);
//             let tvEpisodeUrl = tvEpisodeItem.children().first().attr('href');
//             let tvEpisodeName = tvEpisodeItem.children().first().children('.tv_episode_name').text().substr(3);
            
//             parseEpisode(tvEpisodeUrl, (err, result) => {
//                 let payload = {
//                     url: result.tvEpisodeProviderUrl,
//                     name: tvEpisodeName,
//                     provider: result.tvEpisodeProvider
//                 }
//                 console.log(JSON.stringify(payload, null, 2))
//             });
//         });
//     }
// });

function parseEpisode(tvEpisodeUrl: string, callback: (err, result) => void) {
    Request.get(`${base}${tvEpisodeUrl}`, (err, res) => {
        const $ = Cheerio.load(res);
        $('.movie_version.movie_version_alt').each((i, elem) => {
            let tvEpisodeItem = $(elem);
            let tvEpisodeProviderUrl = tvEpisodeItem.find('.movie_version_link a').first().attr('href');
            let tvEpisodeProvider = tvEpisodeItem.find('.version_host script').first().toString();
            tvEpisodeProvider = tvEpisodeProvider.substring(49, tvEpisodeProvider.length - 12);
            callback(null, {
                tvEpisodeProviderUrl,
                tvEpisodeProvider
            })
        });
    });
}