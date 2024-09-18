document.addEventListener('DOMContentLoaded', () => {
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

    // Function to populate the calendar
    function populateCalendar(date) {
        datesContainer.innerHTML = ''; // Clear existing dates
        const year = date.getFullYear();
        const month = date.getMonth();
        const today = new Date();

        // Set month and year display
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
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
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`; // Format the date
        const taskDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        const tasksForDay = tasks[taskDate] || [];

        selectedDateDisplay.textContent = `Tasks for ${formattedDate}`; // Show formatted date in sidebar
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
            deleteButton.addEventListener('click', () => {
                deleteTask(taskDate, index); // Delete the task
            });

            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(deleteButton);
            taskItem.appendChild(buttonContainer);
            taskList.appendChild(taskItem);
        });
    }

    // Function to delete a task
    function deleteTask(taskDate, taskIndex) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        if (tasks[taskDate]) {
            tasks[taskDate].splice(taskIndex, 1); // Remove the task from the array
            localStorage.setItem('tasks', JSON.stringify(tasks)); // Save the updated tasks to local storage

            // Refresh the task list for the current date
            const [year, month, day] = taskDate.split('-');
            showTasksForDate(parseInt(year), parseInt(month), parseInt(day));
        }
    }

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

    // Handle form submission to add or edit a task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from submitting in the default way
        const taskName = taskNameInput.value;
        const taskDetails = taskDetailsInput.value;
        const taskDate = taskDateInput.value;

        // Save or edit task in local storage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        if (!tasks[taskDate]) {
            tasks[taskDate] = [];
        }

        if (editMode && editTaskIndex !== null) {
            // Edit the existing task
            tasks[editTaskDate][editTaskIndex] = { name: taskName, details: taskDetails };
        } else {
            // Add a new task
            tasks[taskDate].push({ name: taskName, details: taskDetails });
        }

        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Refresh the calendar to show the new or edited task
        populateCalendar(currentDate);

        // Show tasks for the selected date after adding or editing a task
        showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

        // Close the modal after adding or editing the task
        taskModal.style.display = 'none';
    });

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

    // Initial population of the calendar
    populateCalendar(currentDate);

    // Show tasks for today by default
    showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

    
});
