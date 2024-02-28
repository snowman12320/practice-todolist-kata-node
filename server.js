const http = require('http');
const { v4: v4 } = require('uuid');
const errorHandle = require('./errorHandle');

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
  'Content-Type': 'application/json',
};

const todos = [
  { id: v4(), title: '買牛奶', completed: false },
  { id: v4(), title: '學 Node.js', completed: false },
  { id: v4(), title: '學前端', completed: false },
]; 

const reqListen = (req, res) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  if (req.url === '/todos') {
    switch (req.method) {
      case 'GET':
        res.writeHead(200, headers);
        res.write(JSON.stringify(todos));
        res.end();
        break;
      case 'POST':
        req.on('end', () => {
          try {
            const title = JSON.parse(body).title;
            if (title) {
              const todo = { id: v4(), title, completed: false };
              todos.push(todo);

              res.writeHead(200, headers);
              res.write(JSON.stringify(todo));
              res.end();
            } else {
              errorHandle(res);
            }
          } catch (err) {
            errorHandle(res);
          }
        });
        break;
      case 'DELETE':
        req.on('end', () => {
          try {
            const id = JSON.parse(body).id;
            const index = todos.findIndex((todo) => todo.id === id);
            if (index !== -1) {
              todos.splice(index, 1);

              res.writeHead(200, headers);
              res.write(JSON.stringify({ status: 'success' }));
              res.end();
            } else {
              errorHandle(res);
            }
          } catch (err) {
            errorHandle(res);
          }
        });
        break;
      case 'PATCH':
        req.on('end', () => {
          try {
            const { id, completed } = JSON.parse(body);
            const index = todos.findIndex((todo) => todo.id === id);
            if (index !== -1) {
              todos[index].completed = completed;

              res.writeHead(200, headers);
              res.write(JSON.stringify(todos[index]));
              res.end();
            } else {
              errorHandle(res);
            }
          } catch (err) {
            errorHandle(res);
          }
        });
        break;
    }
  } else if(req.url === '/todosAll' && req.method === 'DELETE') {
    todos.splice(0, todos.length);
    res.writeHead(200, headers);
    res.write(JSON.stringify({ status: 'success' }));
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({ status: 'path not found' }));
    res.end();
  }
};

const server = http.createServer(reqListen);
server.listen(3005);
