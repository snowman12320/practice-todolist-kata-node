const http = require('http');
const { v4: v4 } = require('uuid');
const errorHandle = require('./errorHandle');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config('./.env');


// 連接資料庫
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
.connect(DB)
.then(() => {
  console.log('資料庫連線成功');
})
.catch((error) => {
  console.log(error);
});

// 設定 headers
const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
  'Content-Type': 'application/json',
};

// 引入 Room model
const Room = require('./models/room');

// 請求監聽器
const requestListener = async (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url == '/rooms' && req.method == 'GET') {
    const rooms = await Room.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        rooms,
      })
    );
    res.end();
  } else if (req.url == '/rooms' && req.method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const newRoom = await Room.create({
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            rooms: newRoom,
          })
        );
        res.end();
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: 'false',
            message: '欄位沒有正確，或沒有此 ID',
            error: error,
          })
        );
        res.end();
      }
    });
  } else if (req.url == '/rooms' && req.method == 'DELETE') {
    req.on('end', async () => {
      try {
        const id = JSON.parse(body).id;
        const result = await Room.findByIdAndDelete(id);
        if (!result) {
          throw new Error();
        }

        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
          })
        );
        res.end();
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: 'false',
            message: '沒有此 ID',
            error: error,
          })
        );
        res.end();
      }
    });
  } else if (req.url == '/roomsAll' && req.method == 'DELETE') {
    // await Room.deleteMany();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
      })
    );
    res.end();
  } else if (req.url == '/rooms' && req.method == 'PATCH') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const newRoom = await Room.findByIdAndUpdate(data.id, {
          name: data.name,
          price: data.price,
          rating: data.rating,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            rooms: newRoom,
          })
        );
        res.end();
      } catch (error) {
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: 'false',
            message: '欄位沒有正確，或沒有此 ID',
            error: error,
          })
        );
        res.end();
      }
    });
  } else if (req.method == 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: '無此網站路由',
      })
    );
    res.end();
  }
};

// 建立伺服器
const server = http.createServer(requestListener);

server.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
