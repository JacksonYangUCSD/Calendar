document.addEventListener('DOMContentLoaded', async () => {
    const datesContainer = document.getElementById('dates');
    const monthYearDisplay = document.getElementById('month-year');
    const prevButton = document.querySelector('.month-nav-buttons[title="Previous month"]');
    const nextButton = document.querySelector('.month-nav-buttons[title="Next month"]');
    const todayButton = document.getElementById('home-today');
    const taskSidebar = document.getElementById('task-sidebar');
    const selectedDateDisplay = document.getElementById('selected-date');
    const taskList = document.getElementById('task-list');

    // Modal and form elements
    const taskModal = document.getElementById('task-modal');
    const closeModal = document.querySelector('.close-modal');
    const taskForm = document.getElementById('task-form');
    const taskDateInput = document.getElementById('task-date');
    const taskNameInput = document.getElementById('task-name');
    const taskDetailsInput = document.getElementById('task-details');

    let currentDate = new Date();
    let editMode = false;
    let editTaskIndex = null;
    let editTaskDate = null;

    // Fetch tasks from MongoDB and render them on the calendar
    let tasksFromMongo = await fetchTasksFromMongoDB();

    // Function to populate the calendar
    function populateCalendar(date) {
        datesContainer.innerHTML = ''; // Clear existing dates
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();

        // Set month and year display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        // Get the first day of the month
        const firstDayOfMonth = new Date(year, month, 1);
        const startingDay = firstDayOfMonth.getDay();

        // Determine the number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Get the number of days in the previous month
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Add days from the previous month
        for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date', 'grayed');
            dateDiv.textContent = daysInPrevMonth - (startingDay === 0 ? 6 : startingDay - 1) + i + 1;
            datesContainer.appendChild(dateDiv);
        }

        // Populate the days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date');
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dateDiv.classList.add('today');
            }
            dateDiv.innerHTML = `<span>${day}</span>
                <button class="add-task-button" title="Add Task" aria-label="Add Task">+</button>`;

            // Add event listener for "Add Task" button
            dateDiv.querySelector('.add-task-button').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the date click event
                openAddTaskModal(day, month, year);
            });

            // Add event listener for clicking on the date to show tasks
            dateDiv.addEventListener('click', () => {
                showTasksForDate(year, month + 1, day); // month + 1 because month is 0-based
            });

            datesContainer.appendChild(dateDiv);
        }

        // Add days from the next month to fill the remaining space of the last week
        const totalDaysDisplayed = (startingDay === 0 ? 6 : startingDay - 1) + daysInMonth;
        const nextDaysToDisplay = totalDaysDisplayed % 7 === 0 ? 0 : 7 - (totalDaysDisplayed % 7);

        for (let i = 1; i <= nextDaysToDisplay; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date', 'grayed');
            dateDiv.textContent = i;
            datesContainer.appendChild(dateDiv);
        }
    }

    // Function to open the task modal and set the date
    function openAddTaskModal(day, month, year, task = null, taskIndex = null) {
        taskDateInput.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Set the date input to the selected date

        if (task) { // If editing a task
            editMode = true;
            editTaskIndex = taskIndex;
            editTaskDate = taskDateInput.value;
            taskNameInput.value = task.name;
            taskDetailsInput.value = task.details;
        } else {
            editMode = false;
            taskNameInput.value = '';
            taskDetailsInput.value = '';
        }

        taskModal.style.display = 'block'; // Show the modal
    }

    // Function to show tasks for a specific date in the sidebar
    function showTasksForDate(year, month, day) {
        const taskDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const tasksForDay = tasksFromMongo.find(task => task.date === taskDate)?.tasks || [];

        selectedDateDisplay.textContent = `Tasks for ${taskDate}`;
        taskList.innerHTML = ''; // Clear existing tasks

        if (tasksForDay.length === 0) {
            taskList.innerHTML = '<p>No tasks for this day.</p>';
            return;
        }

        tasksForDay.forEach((task, index) => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.innerHTML = `<span><b>${task.name}</b>: ${task.details}</span>`;

            // Button container to align buttons to the right
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add('task-buttons');

            // Add Edit Button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-task-button');
            editButton.addEventListener('click', () => {
                openAddTaskModal(day, month - 1, year, task, index); // Open modal in edit mode
            });

            // Add Delete Button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-task-button');
            deleteButton.addEventListener('click', async () => {
                await deleteTaskFromMongoDB(taskDate, index); // Delete the task from MongoDB
                tasksFromMongo = await fetchTasksFromMongoDB(); // Fetch updated tasks
                showTasksForDate(year, month, day); // Refresh tasks after deletion
            });

            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            taskItem.appendChild(buttonContainer);
            taskList.appendChild(taskItem);
        });
    }

    // Fetch tasks from MongoDB
    async function fetchTasksFromMongoDB() {
        try {
            const response = await fetch('/get-tasks');
            const tasks = await response.json();
            console.log('Fetched tasks from MongoDB', tasks);
            return tasks;
        } catch (error) {
            console.error('Error fetching tasks from MongoDB:', error);
            return [];
        }
    }

    // Save a task to MongoDB
    async function saveTaskToMongoDB(taskData) {
        try {
            const response = await fetch('/save-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });
            const result = await response.json();
            console.log('Task saved to MongoDB', result);
        } catch (error) {
            console.error('Error saving task to MongoDB:', error);
        }
    }

    // Delete a task from MongoDB
    async function deleteTaskFromMongoDB(date, taskIndex) {
        try {
            const response = await fetch('/delete-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, taskIndex })
            });
            const result = await response.json();
            console.log('Task deleted from MongoDB', result);
        } catch (error) {
            console.error('Error deleting task from MongoDB:', error);
        }
    }

    // Handle form submission to add or edit a task
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent form from submitting in the default way

        const taskName = taskNameInput.value;
        const taskDetails = taskDetailsInput.value;
        const taskDate = taskDateInput.value;

        const taskData = { date: taskDate, name: taskName, details: taskDetails };

        if (editMode && editTaskIndex !== null) {
            // Editing an existing task
            tasksFromMongo = tasksFromMongo.map(task => {
                if (task.date === taskDate) {
                    task.tasks[editTaskIndex] = taskData;
                }
                return task;
            });
        } else {
            // Adding a new task
            await saveTaskToMongoDB(taskData);
            tasksFromMongo = await fetchTasksFromMongoDB(); // Fetch updated tasks
        }

        // Close the modal after adding or editing the task
        taskModal.style.display = 'none';

        // Refresh the tasks for the selected date
        showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    });

    // Initial population of the calendar and tasks
    populateCalendar(currentDate);
    showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

    // Event listeners for month navigation
    prevButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        populateCalendar(currentDate);
        showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    });

    nextButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        populateCalendar(currentDate);
        showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    });

    // Event listener for "Today" button
    todayButton.addEventListener('click', () => {
        currentDate = new Date();
        populateCalendar(currentDate);
        showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    });

    // Event listener to close the modal
    closeModal.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });
});
