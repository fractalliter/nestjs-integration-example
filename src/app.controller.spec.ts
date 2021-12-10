import {HttpModule} from '@nestjs/axios';
import {CacheModule, HttpException, HttpStatus} from '@nestjs/common';
import {Test, TestingModule} from '@nestjs/testing';
import {randomUUID} from 'node:crypto';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import MovieTrailersDTO from './dto/movieTrailers.dto';

describe('AppController', () => {
  let appController: AppController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
      imports: [HttpModule, CacheModule.register()]
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it("should return movie trailers", async () => {
      const movie = "https://content.viaplay.se/pc-se/film/focus-2015"
      const response = await appController.getMovieTrailer(movie);
      expect(response).toBeDefined();
      expect(Array.isArray((response as MovieTrailersDTO).trailers)).toEqual(true)
    }, 30000);

    it("should return movie trailers faster from cache", async () => {
      const movie = "https://content.viaplay.se/pc-se/film/focus-2015"
      const response = await appController.getMovieTrailer(movie);
      expect(response).toBeDefined();
      expect(Array.isArray((response as MovieTrailersDTO).trailers)).toEqual(true)
    });

    it("should return an error", (done) => {
      const movie = "https://content.viaplay.se/pc-se/film/" + randomUUID();
      appController.getMovieTrailer(movie).catch(error => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toEqual(HttpStatus.NOT_FOUND);
        expect(error.message).toEqual("Movie does not exist");
        done();
      });
    });
  });
});
