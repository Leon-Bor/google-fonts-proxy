import { HttpService } from '@nestjs/axios';
import { Controller, Get, Req, Res, StreamableFile } from '@nestjs/common';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import { join } from 'path';

const backenUrl = 'fonts.blh.app';

@Controller()
export class AppController {
  constructor(private readonly httpService: HttpService) {}

  @Get('*')
  async getHello(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<any> {
    console.log(request.path, request.query);
    if (request.path.includes('/css')) {
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
      const css = (data as string).replace(/fonts.gstatic.com/g, backenUrl);

      return response
        .set({
          'content-type': 'text/css',
        })
        .status(200)
        .send(css);
    } else {
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
}
