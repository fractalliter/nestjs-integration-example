import {HttpService} from '@nestjs/axios';
import {CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable, Logger} from '@nestjs/common';
import {Cache} from 'cache-manager';
import {firstValueFrom} from 'rxjs';
import MovieDetailDTO from './dto/movieDetail.dto';
import MovieTrailersDTO from './dto/movieTrailers.dto';
import getCacheControl from './utils/getCacheControl';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getMovieTrailer(url: string): Promise<MovieTrailersDTO> {
    let trailers: MovieTrailersDTO = null
    try {
      // return movie trailer URL from cache
      trailers = await this.cacheManager.get(url);
      if (trailers) {
        return trailers;
      }

      let viaplayMovieDetails: MovieDetailDTO = null;
      let movieTMDBID: number = 0
      const apiKey = "5b3a8dc6f827ebdc7379fa89532534df";
      const searchMovieURL = "https://api.themoviedb.org/3/search/movie";
      const movieURL = "https://api.themoviedb.org/3/movie";

      // Get viaplay cached movie details
      viaplayMovieDetails = await this.cacheManager.get(`viaplay-${url}`);

      if (!viaplayMovieDetails) {
        // Get movie details from Viaplay endpoint
        const {data, headers} = await firstValueFrom(this.httpService.get(url));
        const ttl = getCacheControl(headers);
        const {imdb, production, title} = data._embedded['viaplay:blocks'][0]._embedded['viaplay:product'].content;
        // Cache movie details fetched from Viaplay
        this.cacheManager.set(`viaplay-${url}`, {...imdb, ...production, title}, {ttl});
        viaplayMovieDetails = {...imdb, ...production, title};
      }
      const {title, year} = viaplayMovieDetails;
      const queryURL = `${searchMovieURL}?api_key=${apiKey}&language=en-US&query=${title}&page=1&include_adult=false&year=${year}`;
      // Get cached movie id from TMDB
      movieTMDBID = await this.cacheManager.get(queryURL);
      if (!movieTMDBID) {
        // Search TMDB movies and get id of the movie
        const {data, headers} = await firstValueFrom(this.httpService.get(queryURL));
        const ttl = getCacheControl(headers);
        const {id} = data.results[0];
        this.cacheManager.set(queryURL, id, {ttl});
        movieTMDBID = id;
      }
      // Search for movie trailers and filter the official ones
      const movieTrailersURL = `${movieURL}/${movieTMDBID}/videos?api_key=${apiKey}&language=en-US`;
      const {data, headers} = await firstValueFrom(this.httpService.get(movieTrailersURL));
      const ttl = getCacheControl(headers);
      const trailerKeys: string[] = data.results.filter(result => result.official).map(({key}) => key);
      const trs = trailerKeys.map(key => `https://www.youtube.com/watch?v=${key}`);
      const movieDetailsWithTrailers = {...viaplayMovieDetails, trailers: trs};
      // Cache the tralers with movie IMDB info
      this.cacheManager.set(url, movieDetailsWithTrailers, {ttl});
      return movieDetailsWithTrailers;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException("Movie does not exist", HttpStatus.NOT_FOUND);
    }
  }
}
