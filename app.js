(() => {
  const STORAGE_KEY = "todos";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const empty = document.getElementById("empty");
  const count = document.getElementById("count");
  const clearBtn = document.getElementById("clear-completed");
  const filterBtns = document.querySelectorAll("[data-filter]");

  let todos = load();
  let filter = "all";

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function visibleTodos() {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "completed") return todos.filter((t) => t.done);
    return todos;
  }

  function render() {
    list.replaceChildren();

    for (const todo of visibleTodos()) {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.done ? " completed" : "");
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.done;
      checkbox.className = "toggle";
      checkbox.setAttribute("aria-label", "Mark complete");

      const text = document.createElement("span");
      text.className = "text";
      text.textContent = todo.text;
      text.title = "Double-click to edit";

      const doneBtn = document.createElement("button");
      doneBtn.type = "button";
      doneBtn.className = "mark-done";
      doneBtn.textContent = todo.done ? "Undo" : "Done";
      doneBtn.setAttribute(
        "aria-label",
        todo.done ? `Mark "${todo.text}" as not done` : `Mark "${todo.text}" as done`
      );

      const del = document.createElement("button");
      del.type = "button";
      del.className = "delete";
      del.textContent = "Delete";
      del.setAttribute("aria-label", `Delete "${todo.text}"`);

      li.append(checkbox, text, doneBtn, del);
      list.append(li);
    }

    const remaining = todos.filter((t) => !t.done).length;
    count.textContent = `${remaining} item${remaining === 1 ? "" : "s"} left`;
    empty.hidden = visibleTodos().length > 0;
    clearBtn.hidden = !todos.some((t) => t.done);

    filterBtns.forEach((btn) => {
      const isActive = btn.dataset.filter === filter;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  function update() {
    save();
    render();
  }

  function findTodo(el) {
    const li = el.closest(".todo-item");
    return li ? todos.find((t) => t.id === li.dataset.id) : null;
  }

  function startEdit(span, todo) {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "edit";
    editInput.value = todo.text;
    editInput.maxLength = 200;
    span.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    let finished = false;
    const finish = (commit) => {
      if (finished) return;
      finished = true;
      if (commit) {
        const value = editInput.value.trim();
        if (value) {
          todo.text = value;
        } else {
          todos = todos.filter((t) => t !== todo);
        }
      }
      update();
    };

    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") finish(true);
      if (e.key === "Escape") finish(false);
    });
    editInput.addEventListener("blur", () => finish(true));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: makeId(), text, done: false });
    input.value = "";
    update();
  });

  list.addEventListener("change", (e) => {
    if (!e.target.classList.contains("toggle")) return;
    const todo = findTodo(e.target);
    if (!todo) return;
    todo.done = e.target.checked;
    update();
  });

  list.addEventListener("click", (e) => {
    const todo = findTodo(e.target);
    if (!todo) return;
    if (e.target.classList.contains("mark-done")) {
      todo.done = !todo.done;
      update();
    } else if (e.target.classList.contains("delete")) {
      todos = todos.filter((t) => t !== todo);
      update();
    }
  });

  list.addEventListener("dblclick", (e) => {
    if (!e.target.classList.contains("text")) return;
    const todo = findTodo(e.target);
    if (todo) startEdit(e.target, todo);
  });

  clearBtn.addEventListener("click", () => {
    todos = todos.filter((t) => !t.done);
    update();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      render();
    });
  });

  render();
})();
