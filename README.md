# Google fonts proxy

Since some asshole are sending out final written warnings and charging you a fee when you include any of the google fonts, I wrote this little NodeJs server to proxy the fonts through a url. Feel free to copy and edit the code.

## Description

Simply changes the url from

`http://fonts.google.com/css2?family=Roboto:ital,wght@0,300;0,500;1,300&display=swap`

to

`http://fonts.blh.app/css2?family=Roboto:ital,wght@0,300;0,500;1,300&display=swap`

Then the server replaces all urls within this css file and is also proxying the font files.

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
