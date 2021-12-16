<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Finding movie trailers for a url.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Solution

The solution comprises 2 main parts:

1. Gathering information from servers
2. Caching the responses based on their cache-control

In the gathering part, first, a get request will be fetched from Viaplay movie endpoint `MovieDetailsDTO` and will be cached and then search the movie based on the title and the year of the release in TMDB movie search endpoint and cache the result. Then after acquiring the movie ID, will send a request to the movie videos endpoint of TMDB for finding the movie trailers and return the official trailers with movie IMDB information to the client and cache the results `MovieTrailersDTO`. 

In every request to each endpoint, the fetched data will be cached with a TTL of the HTTP header `cache-control: max-age=<time-in-ms>` request, provided by every endpoint. After all the trailers for a movie have been cached, they will be reverted back to the end-user. For the rest of the coming requests, if the TTL is still valid from the cache, but if it's not, it will make the request again.

In this approach, only the first requests and the request with invalid TTL for the cached data will be slow, but the rest of them will be blazingly fast.

## Benchmarks

Here are the benchmarks that has been done with <a href="https://www.joedog.org/siege-manual/" target="_blank">siege</a>.

```bash
siege -t90s http://localhost:3000/movieTrailer?movie_url=https://content.viaplay.se/pc-se/film/focus-2015
```

```
Transactions:		      182089 hits
Availability:		      100.00 %
Elapsed time:		       89.93 secs
Data transferred:	       53.14 MB
Response time:		        0.01 secs
Transaction rate:	     2024.79 trans/sec
Throughput:		        0.59 MB/sec
Concurrency:		       24.92
Successful transactions:      182089
Failed transactions:	           0
Longest transaction:	        0.04
Shortest transaction:	        0.00

```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).
