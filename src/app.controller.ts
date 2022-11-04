import { HttpService } from '@nestjs/axios';
import { Controller, Get, Req, Res, StreamableFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { join, resolve } from 'path';

const isProduction = process.env.PRODUCTION === 'true';
const backenUrl = isProduction ? 'fonts.blh.app' : 'localhost:3000';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get('/index.html')
  async getHtml(@Res() response: Response): Promise<any> {
    return response.send(`
     <html>
      <head>
        <link
          href="http://localhost:3000/css?family=Roboto:500,700,400italic"
          rel="stylesheet"
        />

        <link
          href="https://${backenUrl}/css2?family=Poor+Story&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <h1 style="font-family: 'Roboto'">HTML</h1>
        <h1 style="font-family: 'Poor Story'">HTML</h1>
      </body>
    </html>`);
  }

  @Get('/css*')
  async getCss(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const fontUrl = `https://fonts.googleapis.com${
      request.path
    }?${new URLSearchParams(request.query as {}).toString()}`;
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

  @Get('*')
  async getHello(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    const fontUrl = `https://fonts.gstatic.com${
      request.path
    }?${new URLSearchParams(request.query as {}).toString()}`;

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
