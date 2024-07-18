let ulList = document.querySelector("#ul-list");
let newTodoFormElement = document.querySelector("#todo-form");
let newTodoDescriptionElement = document.querySelector("#new-todo-description");

let removeFormElement = document.querySelector("#remove-form");
let radioButtonElements = document.querySelectorAll(".radio");
let warnContainer = document.querySelector("#warn-div");
let checkboxDiv = document.querySelector("#checkbox-div");

let state = {
  todos: [],
};
console.dir(state);

getDataFromApi();

// ##################################################################################
// Todo API

async function getDataFromApi() {
  let response = await fetch("http://localhost:4730/todos/");
  let data = await response.json();
  console.log(data);
  state.todos = data;
  console.table(state.todos);
  render();
}

async function postDataToApi() {
  let response = await fetch("http://localhost:4730/todos/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      description: newTodoDescriptionElement.value.trim(),
      done: false,
    }),
  });
  await response.json();
}

async function removeDataApi(todo) {
  try {
    let response = await fetch("http://localhost:4730/todos/" + todo.id, {
      method: "DELETE",
    });
    await response.json();
  } catch (error) {
    console.log("Error");
  }
}

async function putDataToApi(todo) {
  let response = await fetch("http://localhost:4730/todos/" + todo.id, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      description: todo.description,
      done: todo.done,
    }),
  });
  await response.json();
}

// ###################################################################################
// Render

function render(todos = state.todos) {
  ulList.innerText = "";

  for (let todoData of todos) {
    let newListElement = document.createElement("li");

    let check = document.createElement("input");
    check.className = "checkbox";
    check.type = "checkbox";
    check.checked = todoData.done;
    check.id = "todo-" + todoData.id;

    let newLabel = document.createElement("label");
    newLabel.className = "label-item";
    newLabel.htmlFor = check.id;
    newLabel.innerText = todoData.description;

    check.addEventListener("change", async function () {
      todoData.done = check.checked;
      await putDataToApi(todoData);
      render();
    });

    newListElement.append(check, newLabel);

    let date = document.createElement("p");
    if (todoData.done) {
      newLabel.style.textDecoration = "line-through";
      newLabel.style.color = "#0056b3";
    }

    ulList.appendChild(newListElement);
  }
}

// ##############################################################################
// Add New Todo

function addNewTodo() {
  let newTodoData = {
    description: newTodoDescriptionElement.value.trim(),
    done: false,
  };

  state.todos.push(newTodoData);
  render();
  postDataToApi();

  newTodoDescriptionElement.value = "";
}

// ################################################################################
// Remove

removeFormElement.addEventListener("submit", async function (event) {
  event.preventDefault();

  for (let todo of state.todos) {
    if (todo.done) {
      await removeDataApi(todo);
    }
  }

  state.todos = state.todos.filter(function (todo) {
    return !todo.done;
  });

  render();
});

// #################################################################################
// ### Radio Button Filter
radioButtonElements.forEach(function (radio) {
  radio.addEventListener("change", function () {
    let filteredTodos;
    if (radio.id === "done") {
      filteredTodos = state.todos.filter(function (todo) {
        return todo.done;
      });
    }
    if (radio.id === "open") {
      filteredTodos = state.todos.filter(function (todo) {
        return !todo.done;
      });
    }
    render(filteredTodos);
  });
});

//#####################################################################################

// ### Erzeugt Element für Warnung leere Eingabe und Duplikat
function setWarnDuplicate() {
  let warning = document.createElement("p");
  warning.id = "warning";
  warning.innerText =
    "ToDo already exists, nothing or less than 4 characters entered!";
  warnContainer.appendChild(warning);
  newTodoDescriptionElement.value = "";
}

// ######################################################################################
// Prüfung auf leer, Duplikat und 4 Stellen

newTodoFormElement.addEventListener("submit", checkInput);

function checkInput(event) {
  event.preventDefault();

  warnContainer.innerText = "";

  if (newTodoDescriptionElement.value.trim().length < 3) {
    setWarnDuplicate();
    return;
  }

  for (let index = 0; index < state.todos.length; index++) {
    if (
      newTodoDescriptionElement.value.trim() ===
      state.todos[index]["description"]
    ) {
      setWarnDuplicate();
      return;
    }
  }
  addNewTodo();
}
