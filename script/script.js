document.addEventListener('DOMContentLoaded', () => {
    const datesContainer = document.getElementById('dates');
    const monthYearDisplay = document.getElementById('month-year');
    // Correct selectors for the buttons
    const prevButton = document.querySelector('.month-nav-buttons[title="Previous month"]');
    const nextButton = document.querySelector('.month-nav-buttons[title="Next month"]');
    const todayButton = document.getElementById('home-today');

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

        // Add empty blocks for days of the previous month
        const emptyDays = (startingDay === 0) ? 6 : startingDay - 1; // Adjust for Monday start
        for (let i = 0; i < emptyDays; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.classList.add('date');
            datesContainer.appendChild(emptyDiv);
        }

        // Populate the days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateDiv = document.createElement('div');
            dateDiv.classList.add('date');
            dateDiv.innerHTML = `<span>${day}</span>
                <button class="add-task-button" title="Add Task" aria-label="Add Task">+</button>`;

            // Highlight today's date
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dateDiv.classList.add('today');
            }

            datesContainer.appendChild(dateDiv);
        }
    }

    // Event listeners for month navigation
    prevButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        populateCalendar(currentDate);
    });

    nextButton.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        populateCalendar(currentDate);
    });

    // Event listener for "Today" button
    todayButton.addEventListener('click', () => {
        currentDate = new Date();
        populateCalendar(currentDate);
    });

    // Initial population of the calendar
    populateCalendar(currentDate);
});
