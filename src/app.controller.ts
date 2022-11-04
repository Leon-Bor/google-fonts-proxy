import { HttpService } from '@nestjs/axios';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

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
      const { data } = await firstValueFrom(this.httpService.get(fontUrl));
      const css = (data as string).replace(/fonts.gstatic.com/g, backenUrl);

      return response.set({ 'content-type': 'text/css' }).status(200).send(css);
    } else {
      const fontUrl = `https://fonts.gstatic.com${
        request.path
      }?${new URLSearchParams(request.query as {}).toString()}`;
      const { data } = await firstValueFrom(this.httpService.get(fontUrl));

      return response
        .set({ 'content-type': `font/${request.path.split('.').pop()}` })
        .status(200)
        .send(data);
    }
  }
}
