import {Test, TestingModule} from '@nestjs/testing';
import {HttpStatus, INestApplication} from '@nestjs/common';
import * as request from 'supertest';
import {AppModule} from './../src/app.module';
import {randomUUID} from 'node:crypto';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/movieTrailer (GET)', () => {
    const movieURL = "https://content.viaplay.se/pc-se/film/focus-2015";
    const response = request(app.getHttpServer())
      .get("/movieTrailer/?movie_url=" + movieURL);
    return response.expect(200);
  }, 30000);

  it('/movieTrailer (GET) from cache', () => {
    const movieURL = "https://content.viaplay.se/pc-se/film/focus-2015";
    const response = request(app.getHttpServer())
      .get("/movieTrailer/?movie_url=" + movieURL);
    return response.expect(200);
  });

  it('/movieTrailer (GET) throws an error', () => {
    const movieURL = "https://content.viaplay.se/pc-se/film/" + randomUUID();
    const response = request(app.getHttpServer())
      .get("/movieTrailer/?movie_url=" + movieURL);
    return response.expect(HttpStatus.NOT_FOUND);
  });

  it('/movieTrailer (GET) throws a bad request error', () => {
    const movieURL = randomUUID();
    const response = request(app.getHttpServer())
      .get("/movieTrailer/?movie_url=" + movieURL);
    return response.expect(HttpStatus.BAD_REQUEST);
  });
});
