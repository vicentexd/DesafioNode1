const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find((x) => x.username === username);

  if (!findUser) {
    return response.status(404).json({
      error: "Usuário não encontrado",
    });
  }

  request.user = findUser;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const existUsername = users.find((x) => x.username === username);

  if (existUsername) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const indexOfTodo = user.todos.findIndex((x) => x.id === id);

  if (indexOfTodo !== -1) {
    user.todos[indexOfTodo] = {
      ...user.todos[indexOfTodo],
      title,
      deadline: new Date(deadline),
    };

    return response.status(201).json(user.todos[indexOfTodo]);
  } else {
    return response.status(404).json({ error: "Todo não encontrada" });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexOfTodo = user.todos.findIndex((x) => x.id === id);

  if (indexOfTodo !== -1) {
    user.todos[indexOfTodo] = {
      ...user.todos[indexOfTodo],
      done: true,
    };

    return response.status(201).json(user.todos[indexOfTodo]);
  } else {
    return response.status(404).json({ error: "Todo não encontrada" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const indexOfTodo = user.todos.findIndex((x) => x.id === id);

  if (indexOfTodo !== -1) {
    user.todos.splice(indexOfTodo, 1);

    return response.status(204).json();
  } else {
    return response.status(404).json({ error: "Todo não encontrada" });
  }
});

module.exports = app;
