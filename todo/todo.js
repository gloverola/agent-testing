const STORAGE_KEY = "todos";

function loadTodos() {
  try {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(todos) ? todos : [];
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function renderTodos(todos) {
  const list = document.getElementById("todo-list");
  list.replaceChildren(
    ...todos.map((todo) => {
      const li = document.createElement("li");
      li.textContent = todo.text;
      return li;
    })
  );
}

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const todos = loadTodos();
  todos.push({ text, createdAt: new Date().toISOString() });
  saveTodos(todos);
  renderTodos(todos);
  input.value = "";
  input.focus();
});

renderTodos(loadTodos());
