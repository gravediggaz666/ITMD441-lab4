document.getElementById('current-btn').addEventListener('click', getCurrentLocation);
document.getElementById('location-select').addEventListener('change', handleLocationChange);
document.getElementById('search-box').addEventListener('input', handleLocationSearch);

// Check if a location has been selected or if the current location button has been clicked
let isLocationSelected = false;

// Add this line to hide the data-table-container initially
document.getElementById('data-table-container').style.display = 'none';

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            fetchSunriseSunset(latitude, longitude);
        }, showError);
    } else {
        showError("Geolocation is not supported by this browser.");
    }

    // Update the flag when the current location button is clicked
    isLocationSelected = true;

    // Call the function to show or hide the data table
    showDataTable();
}

function handleLocationChange(event) {
    const selectedValue = event.target.value;
    if (selectedValue) {
        const [latitude, longitude] = selectedValue.split(',');
        fetchSunriseSunset(latitude, longitude);
        isLocationSelected = true;

        // Call the function to show or hide the data table
        showDataTable();
    }
}

function handleLocationSearch(event) {
    const query = event.target.value;
    fetch(`https://geocode.maps.co/search?q=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const { lat, lon } = data[0];
                fetchSunriseSunset(lat, lon);
                isLocationSelected = true;

                // Call the function to show or hide the data table
                showDataTable();
            } else {
                showError("Location not found.");
            }
        }).catch(() => showError("Error fetching location data."));
}

function fetchSunriseSunset(latitude, longitude) {
    const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Clear existing data

    for (let i = -1; i < 5; i++) {
        setTimeout(() => {
            let date = new Date();
            date.setDate(date.getDate() + i);
            fetchDataForDate(latitude, longitude, formatDate(date), i);
        }, i * 500);
    }
}

function fetchDataForDate(latitude, longitude, date, dayIndex) {
    const url = `https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}&date=${date}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'OK') {
                updateUI(data.results, dayIndex, formatDate(new Date(date)), latitude, longitude);
            } else {
                showError("Error fetching data.");
            }
        })
        .catch(() => showError("Error fetching data."));
}

function updateUI(data, dayIndex, formattedDate) {
    let tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    let newRow = tableBody.insertRow(tableBody.rows.length);

    let cellDate = newRow.insertCell(0);
    cellDate.innerHTML = formattedDate;

    let cellTimezone = newRow.insertCell(1);
    cellTimezone.innerHTML = data.timezone;

    let cellSunrise = newRow.insertCell(2);
    cellSunrise.innerHTML = data.sunrise;

    let cellSunset = newRow.insertCell(3);
    cellSunset.innerHTML = data.sunset;

    let celldawn = newRow.insertCell(4);
    celldawn.innerHTML = data.dawn;

    let celldusk = newRow.insertCell(5);
    celldusk.innerHTML = data.dusk;

    let cellDayLength = newRow.insertCell(6);
    cellDayLength.innerHTML = data.day_length;

    let cellSolarNoon = newRow.insertCell(7);
    cellSolarNoon.innerHTML = data.solar_noon;
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function showError(error) {
    const display = document.getElementById('data-display');
    display.innerText = error;
}

// Add this function to show or hide the data table based on the location selection
function showDataTable() {
    const dataTableContainer = document.getElementById('data-table-container');
    if (isLocationSelected) {
        dataTableContainer.style.display = 'block';
    } else {
        dataTableContainer.style.display = 'none';
    }
}