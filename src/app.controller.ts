import { HttpService } from '@nestjs/axios';
import { Controller, Get, Req, Res, StreamableFile } from '@nestjs/common';
import { query, Request, Response } from 'express';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import * as fs from 'fs';
import { join } from 'path';
import { encode } from 'punycode';
import { Console } from 'console';

const isProduction = true;
const backenUrl = isProduction ? 'fonts.blh.app' : 'localhost:3000';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async getHtml(@Res() response: Response): Promise<any> {
    return response.set({
      'content-type': `text/html`,
    }).send(`
     <html>
      <head>
        <link
          href="http://localhost:3000/css2?family=Exo&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.blh.app/css2?family=Poor+Story&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <h1 style="font-family: 'Exo'">LOCAL</h1>
        <h1 style="font-family: 'Poor Story'">REMOTE</h1>
        <h1>NONE</h1>
      </body>
    </html>`);
  }

  @Get(['/css*', '/icon*'])
  async getCss(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const fontUrl = `https://fonts.googleapis.com${request.originalUrl}`;

    const { data } = await firstValueFrom(
      this.httpService.get(fontUrl, {
        headers: {
          'user-agent': request.headers['user-agent'],
        },
      }),
    );

    let css = (data as string).replace(/fonts.gstatic.com/g, backenUrl);

    if (!isProduction) {
      // Locally we do not have https.
      css = css.replace(/https/g, 'http');
    }

    return response
      .set({
        'content-type': 'text/css',
      })
      .status(200)
      .send(css);
  }

  @Get('/s*')
  async getHello(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const fontUrl = `https://fonts.gstatic.com${request.originalUrl}`;

    const fontResponse = await firstValueFrom(
      this.httpService.get(fontUrl, {
        responseType: 'arraybuffer',
      }),
    );
    const fontPath = join(
      process.cwd(),
      `fonts/${request.path.replace(/\//g, '')}`,
    );
    const fileExtension = request.path.split('.').pop();

    if (!fs.existsSync(fontPath)) {
      const writeStream = fs.createWriteStream(fontPath);
      writeStream.write(fontResponse.data);
      writeStream.on('finish', () => {
        console.log('Added new font to cache: ', fontPath);
        const file = fs.createReadStream(fontPath);
        response.set({
          'content-type': `font/${fileExtension}`,
        });
        file.pipe(response);
      });
      writeStream.end();
    } else {
      const file = fs.createReadStream(fontPath);
      response.set({
        'content-type': `font/${fileExtension}`,
      });
      file.pipe(response);
    }
  }
}
