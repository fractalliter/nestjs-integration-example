import {Controller, Get, HttpException, HttpStatus, Query} from '@nestjs/common';
import {URL} from "node:url";
import {AppService} from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("movieTrailer")
  getMovieTrailer(@Query("movie_url") movie_url: string) {
    try {
      new URL(movie_url);
      return this.appService.getMovieTrailer(movie_url);
    } catch (error) {
      throw new HttpException("Bad url", HttpStatus.BAD_REQUEST);
    }
  }
}
