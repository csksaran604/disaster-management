function sendSOS() {
    const disasterType = document.getElementById("disasterType").value;
    const userName = document.getElementById("userName").value;
    const location = document.getElementById("location").value;
    const contact = document.getElementById("contact").value;
    const description = document.getElementById("description").value;

    const message = document.getElementById("alertMessage");
    const historyList = document.getElementById("historyList");

    // Validation
    if (userName.trim() === "") {
        alert("⚠️ Please enter your name!");
        return;
    }

    if (location.trim() === "") {
        alert("⚠️ Please enter your location!");
        return;
    }

    if (contact.trim() === "") {
        alert("⚠️ Please enter an emergency contact number!");
        return;
    }

    if (description.trim() === "") {
        alert("⚠️ Please describe the emergency!");
        return;
    }

    // Date and time
    const now = new Date();
    const dateTime = now.toLocaleString();

    // Alert message
    message.textContent =
        "🚨 SOS REQUEST SENT! Name: " + userName +
        " | Disaster: " + disasterType +
        " | Location: " + location +
        " | Status: 🔴 Pending" +
        " | Time: " + dateTime;

    // Remove default message
    if (historyList.innerHTML.includes("No SOS requests yet.")) {
        historyList.innerHTML = "";
    }

    // Create history item
    const historyItem = document.createElement("li");

    const details = document.createElement("p");
    details.textContent =
        "🔴 Status: Pending" +
        " | Name: " + userName +
        " | Disaster: " + disasterType +
        " | Location: " + location +
        " | Contact: " + contact +
        " | Description: " + description +
        " | Time: " + dateTime;

    // Pending button
    const pendingBtn = document.createElement("button");
    pendingBtn.textContent = "🔴 Pending";
    pendingBtn.onclick = function () {
        details.textContent = details.textContent.replace(
            /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
            "🔴 Status: Pending"
        );
    };

    // In Progress button
    const progressBtn = document.createElement("button");
    progressBtn.textContent = "🟡 In Progress";
    progressBtn.onclick = function () {
        details.textContent = details.textContent.replace(
            /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
            "🟡 Status: In Progress"
        );
    };

    // Resolved button
    const resolvedBtn = document.createElement("button");
    resolvedBtn.textContent = "🟢 Resolved";
    resolvedBtn.onclick = function () {
        details.textContent = details.textContent.replace(
            /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
            "🟢 Status: Resolved"
        );
    };

    // Add everything to history item
    historyItem.appendChild(details);
    historyItem.appendChild(pendingBtn);
    historyItem.appendChild(progressBtn);
    historyItem.appendChild(resolvedBtn);

    historyList.appendChild(historyItem);

    // Popup
    alert(
        "🆘 SOS Request Sent!\n\n" +
        "Name: " + userName +
        "\nDisaster: " + disasterType +
        "\nLocation: " + location +
        "\nStatus: Pending" +
        "\nTime: " + dateTime
    );

    // Clear inputs
    document.getElementById("userName").value = "";
    document.getElementById("location").value = "";
    document.getElementById("contact").value = "";
    document.getElementById("description").value = "";
}


function clearHistory() {
    const historyList = document.getElementById("historyList");

    historyList.innerHTML = "<li>No SOS requests yet.</li>";

    alert("🗑️ SOS History has been cleared!");
}
function getCurrentLocation() {
    const locationInput = document.getElementById("location");

    if (navigator.geolocation) {
        locationInput.value = "Getting your location...";

        navigator.geolocation.getCurrentPosition(
            async function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                try {
                    const response = await fetch(
                        "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
                        latitude +
                        "&lon=" +
                        longitude
                    );

                    const data = await response.json();

                    if (data.display_name) {
                        locationInput.value = data.display_name;
                    } else {
                        locationInput.value =
                            "Latitude: " + latitude +
                            ", Longitude: " + longitude;
                    }

                } catch (error) {
                    locationInput.value =
                        "Latitude: " + latitude +
                        ", Longitude: " + longitude;
                }
            },

            function () {
                alert("⚠️ Unable to get your location. Please allow location permission.");
                locationInput.value = "";
            }
        );

    } else {
        alert("⚠️ Geolocation is not supported by your browser.");
    }
}