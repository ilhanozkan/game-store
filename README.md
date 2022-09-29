# 🎮 Game Store

A prototype of an e-commerce site selling game products.

This project was developed using **React, TypeScript, Node.js, Express** and **Apollo GraphQL**.

![Overview](https://raw.githubusercontent.com/ilhanozkan/game-store/master/%40readme-images/overview.gif)

This project inspired from [@folab](https://www.figma.com/@folab)'s [Game Drill design](https://www.figma.com/community/file/1138582638202684580).

Get the **live version** without installation **in [here](https://radiant-spire-46493.herokuapp.com/ "Live preview")**.

## Installation Prerequisites

> Make sure you have **Node.js** installed on your system.

If you haven't cloned this repository to your local machine yet, clone it first with fetch options (HTTPS, SSH, GitHub CLI).

If you have already cloned, you can skip to **Installation & Running** steps.

**Clone this repository**

Open your terminal and clone this repository to your local with the HTTPS option.

```bash
$ git clone https://github.com/ilhanozkan/game-store.git
```

## Installation & Running

### Backend

1 - Create environment variables file

Create a file named `.env` under the `backend` folder.

Example **.env** file:

```bash
PORT=5000
APOLLO_PORT=4000
REST_API_URL=http://localhost:5000
```

2 - Install dependencies

Navigate to the frontend folder in terminal.

```bash
cd game-store/backend
```

Run installation command in terminal.

```bash
npm i
```

3 - Start the backend

Start the backend in development.

```bash
npm start
```

### Frontend

1 - Create environment variables file

Create a file named `.env.local` under the `frontend` folder.

Example **.env.local** file:

```bash
REACT_APP_API_URL=http://localhost:4000
REACT_APP_REST_API_URL=http://localhost:5000
```

2 - Install dependencies

Navigate to the frontend folder in terminal.

```bash
cd game-store/frontend
```

Run installation command in terminal.

```bash
npm i
```

3 - Start the frontend

Start the frontend in development.

```bash
npm start
```

## License

MIT License

Copyright (c) 2022 Ilhan Ozkan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
