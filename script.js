// Элементы
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const clearBtn = document.getElementById('clearBtn');
const filterBtns = document.querySelectorAll('.filter');

// Загружаем задачи из localStorage или пустой массив
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Сохраняем в localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Отображение задач
function renderTasks(filter = "all") {
    taskList.innerHTML = "";

    tasks.forEach(task => {
        if (
            (filter === "completed" && !task.completed) ||
            (filter === "uncompleted" && task.completed)
        ) return;

        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task");

        taskDiv.innerHTML = `
            <input type="checkbox" data-action="toggle" data-id="${task.id}" ${task.completed ? "checked" : ""}>
            <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}">
                ${task.text}
            </span>
            <button data-action="reminder" data-id="${task.id}" class="btn" ${task.completed ? "disabled" : ""}>⏰</button>
            <button data-action="delete" data-id="${task.id}" class="btn delet-btn">X</button>
        `;

        taskList.appendChild(taskDiv);
    });
}

// Добавление задачи
addTaskBtn.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (text === "") return alert("Введите задачу!");

    tasks.push({ id: crypto.randomUUID(), text, completed: false });
    taskInput.value = "";
    saveTasks();
    renderTasks();
});

// Делегирование событий на список задач
taskList.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    const action = e.target.dataset.action;

    if (!id || !action) return;

    if (action === "toggle") toggleTask(id);
    if (action === "delete") deleteTask(id);
    if (action === "reminder") setReminder(id);
});

// Переключение выполнено/не выполнено
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Удаление задачи
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// Очистка списка
clearBtn.addEventListener("click", () => {
    if (confirm("Очистить все задачи?")) {
        tasks = [];
        saveTasks();
        renderTasks();
    }
});

// Напоминание с выбором секунд
function setReminder(id) {
    const task = tasks.find(t => t.id === id);
    if (!task || task.completed) return;

    const seconds = prompt("Через сколько секунд напомнить?");
    const delay = parseInt(seconds);

    if (isNaN(delay) || delay <= 0) {
        alert("Введите корректное число секунд!");
        return;
    }

    setTimeout(() => {
        alert(`🔔 Напоминание!!! Необходимо выполнить это: ${task.text}`);
    }, delay * 1000);
}

// Фильтрация
filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const filter = btn.dataset.filter;
        renderTasks(filter);
    });
});

// Загружаем задачи с API при первой загрузке
async function loadTasksFromAPI() {
    try {
        const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
        const data = await res.json();

        if (tasks.length === 0) {
            tasks = data.map(todo => ({
                id: String(todo.id), // из API
                text: todo.title,
                completed: todo.completed
            }));
            saveTasks();
        }
        renderTasks();
    } catch (err) {
        console.error("Ошибка загрузки:", err);
    }
}

// Первоначальный запуск
loadTasksFromAPI();
renderTasks();
