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
  private readonly apiKey = "5b3a8dc6f827ebdc7379fa89532534df";
  private readonly searchMovieURL = "https://api.themoviedb.org/3/search/movie";
  private readonly movieURL = "https://api.themoviedb.org/3/movie";

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async getMovieTrailer(url: string): Promise<MovieTrailersDTO> {
    try {
      // return movie trailer URL from cache
      const trailers: MovieTrailersDTO = await this.cacheManager.get(url);
      if (trailers) {
        return trailers;
      }

      let viaplayMovieDetails: MovieDetailDTO = await this.getMovieDetails(url);
      const {title, year} = viaplayMovieDetails;
      const movieTMDBID = await this.getMovieID(title, year);
      return await this.getMovieTrailers(movieTMDBID, url, viaplayMovieDetails);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException("Movie does not exist", HttpStatus.NOT_FOUND);
    }
  }

  private async getMovieDetails(url: string): Promise<MovieDetailDTO> {
    // Get viaplay cached movie details
    let viaplayMovieDetails: MovieDetailDTO = await this.cacheManager.get(`viaplay-${url}`);

    if (!viaplayMovieDetails) {
      // Get movie details from Viaplay endpoint
      const {data, headers} = await firstValueFrom(this.httpService.get(url));
      const ttl = getCacheControl(headers);
      const {imdb, production, title} = data._embedded['viaplay:blocks'][0]._embedded['viaplay:product'].content;
      // Cache movie details fetched from Viaplay
      this.cacheManager.set(`viaplay-${url}`, {...imdb, ...production, title}, {ttl});
      viaplayMovieDetails = {...imdb, ...production, title};
    }
    return viaplayMovieDetails;
  }

  private async getMovieID(title: string, year: number): Promise<number> {
    const queryURL = `${this.searchMovieURL}?api_key=${this.apiKey}&language=en-US&query=${title}&page=1&include_adult=false&year=${year}`;
    // Get cached movie id from TMDB
    let movieTMDBID: number = await this.cacheManager.get(queryURL);
    if (!movieTMDBID) {
      // Search TMDB movies and get id of the movie
      const {data, headers} = await firstValueFrom(this.httpService.get(queryURL));
      const ttl = getCacheControl(headers);
      const {id} = data.results[0];
      this.cacheManager.set(queryURL, id, {ttl});
      movieTMDBID = id;
    }
    return movieTMDBID;
  }

  private async getMovieTrailers(movieID: number, url: string, movieDetails: MovieDetailDTO): Promise<MovieTrailersDTO> {
    // Search for movie trailers and filter the official ones
    const movieTrailersURL = `${this.movieURL}/${movieID}/videos?api_key=${this.apiKey}&language=en-US`;
    const {data, headers} = await firstValueFrom(this.httpService.get(movieTrailersURL));
    const ttl = getCacheControl(headers);
    const trailerKeys: string[] = data.results.filter(result => result.official).map(({key}) => key);
    const trs = trailerKeys.map(key => `https://www.youtube.com/watch?v=${key}`);
    const movieDetailsWithTrailers = {...movieDetails, trailers: trs};
    // Cache the trailers with movie IMDB info
    this.cacheManager.set(url, movieDetailsWithTrailers, {ttl});
    return movieDetailsWithTrailers;
  }
}
