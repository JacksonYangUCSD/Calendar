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

    let currentDate = new Date();

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
    function openAddTaskModal(day, month, year) {
        taskDateInput.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Set the date input to the selected date
        taskModal.style.display = 'block'; // Show the modal
    }

    // Function to show tasks for a specific date in the sidebar
    function showTasksForDate(year, month, day) {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formattedDate = `${monthNames[month - 1]} ${day}, ${year}`; // Format the date
        const taskDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        const tasksForDay = tasks[taskDate] || [];

        selectedDateDisplay.textContent = `${formattedDate}`; // Show formatted date in sidebar
        taskList.innerHTML = ''; // Clear existing tasks

        if (tasksForDay.length === 0) {
            taskList.innerHTML = '<p>No tasks for this day.</p>';
            return;
        }

        tasksForDay.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.classList.add('task-item');
            taskItem.textContent = `${task.name}: ${task.details}`;
            taskList.appendChild(taskItem);
        });
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

    // Handle form submission to add a task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from submitting in the default way
        const taskName = document.getElementById('task-name').value;
        const taskDetails = document.getElementById('task-details').value;
        const taskDate = taskDateInput.value;

        // Save task to local storage
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        if (!tasks[taskDate]) {
            tasks[taskDate] = [];
        }
        tasks[taskDate].push({ name: taskName, details: taskDetails });
        localStorage.setItem('tasks', JSON.stringify(tasks));

        // Refresh the calendar to show the new task
        populateCalendar(currentDate);

        // Show tasks for today after adding a new task
        showTasksForDate(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());

        // Close the modal after adding the task
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
