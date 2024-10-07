const renderTasksProgressData = (tasks) => {
  let taskProgress;
  const taskProgressDOM = document.getElementById('tasks-progress');

  if (taskProgressDOM) taskProgress = taskProgressDOM;
  else {
    const newTasksProgressDOM = document.createElement('div');
    newTasksProgressDOM.id = 'tasks-progress';
    document.getElementById('todo-footer').appendChild(newTasksProgressDOM);
    taskProgress = newTasksProgressDOM;

  }

  const doneTasks = tasks.filter(({ checked }) => checked).length;
  const totalTasks = tasks.length;
  taskProgress.textContent = `${doneTasks}/${totalTasks} Concluídas`
}

const getTasksFromLocalStorage = () => {
  const localTasks = JSON.parse(window.localStorage.getItem('tasks'))
  return localTasks ? localTasks : [];
}

const setTaskInLocalStorage = (tasks) => {
  window.localStorage.setItem('tasks', JSON.stringify(tasks))
}

const removeTask = (taskId) => {
  const tasks = getTasksFromLocalStorage()
  const updatedTasks = tasks.filter(task => task.id !== taskId);
  setTaskInLocalStorage(updatedTasks)
  renderTasksProgressData(updatedTasks)

  document.getElementById('todo-list').removeChild(document.getElementById(taskId))
}

const removeDoneTasks = () => {
  const tasks = getTasksFromLocalStorage()
  const tasksToRemove = tasks.filter(({ checked }) => checked).map(({ id }) => id)
  
  const updatedTasks = tasks.filter(({ checked }) => !checked)
  setTaskInLocalStorage(updatedTasks)
  renderTasksProgressData(updatedTasks)

  tasksToRemove.forEach((tasksToRemove) => {
    document.getElementById('todo-list').removeChild(document.getElementById(tasksToRemove))
  })
}

const onCheckboxClick = (event) => {
  const [id] = (event.target.id.split('-'))

  const tasks = getTasksFromLocalStorage()
  
  const updatedTasks = tasks.map((task) => {
    return parseInt(task.id) === parseInt(id) ? {...task, checked: event.target.checked} : task
    
  })

  setTaskInLocalStorage(updatedTasks)
  renderTasksProgressData(updatedTasks)
}

const createTaskListItem = (task, checkbox) => {
  const list = document.getElementById('todo-list');
  const toDo = document.createElement('li');

  const removeTaskButton = document.createElement('button')
  removeTaskButton.textContent = 'X'
  removeTaskButton.ariaLabel = 'Remover tarefa'

  removeTaskButton.onclick = () => removeTask(task.id)

  toDo.id = task.id;

  toDo.appendChild(checkbox);
  toDo.appendChild(removeTaskButton)
  list.appendChild(toDo);
}

const getCheckboxInput = ({id, description, checked}) => {
  const checkbox = document.createElement('input')
  const label = document.createElement('label')
  const wrapper = document.createElement('div')
  const checkboxId = `${id}-checkbox`

  checkbox.type = 'checkbox';
  checkbox.id = checkboxId;
  checkbox.checked = checked || false;
  checkbox.addEventListener('change', onCheckboxClick)

  label.textContent = description;
  label.htmlFor = checkboxId;

  wrapper.className = 'checkbox-label-container';

  wrapper.appendChild(checkbox);
  wrapper.appendChild(label);

  return wrapper
}

const getNewTaskId = () => {
  const tasks = getTasksFromLocalStorage()
  const lastId = tasks[tasks.length - 1]?.id
  return lastId ? lastId + 1 : 1
}

const getNewTaskData = (event) => {
  const description = event.target.elements.description.value
  const id = getNewTaskId()

  return {description, id}
}

const getCreatedTaskInfo = (event) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(getNewTaskData(event))
  }, 3000)
}) 

const createTask = async (event) => {
  event.preventDefault();
  document.getElementById('save-task').setAttribute('disabled', true)

  const newTaskData = await getCreatedTaskInfo(event)
  const ckeckbox = getCheckboxInput(newTaskData)
  createTaskListItem(newTaskData, ckeckbox)

  const tasks = getTasksFromLocalStorage()
  const updatedTasks = [
    ...tasks,
    {id: newTaskData.id, description: newTaskData.description, checked: false}
  ]

  setTaskInLocalStorage(updatedTasks)
  renderTasksProgressData(updatedTasks)

  document.getElementById('description').value = ''
  document.getElementById('save-task').removeAttribute('disabled')
}

window.onload = function() {
  const form = document.getElementById('create-todo-form');
  form.addEventListener('submit', createTask);

  const tasks = getTasksFromLocalStorage();

  tasks.forEach((task) => {
    const checkbox = getCheckboxInput(task);
    createTaskListItem(task, checkbox)
  })

  renderTasksProgressData(tasks)
}