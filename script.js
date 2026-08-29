import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// 🔥 FIREBASE CONFIG
// ===============================

const firebaseConfig = {
    apiKey: "AIzaSyCOug6KwpFtoeXNVjOAZOUg1eWVu7npkcc",
    authDomain: "disaster-management-96929.firebaseapp.com",
    projectId: "disaster-management-96929",
    storageBucket: "disaster-management-96929.firebasestorage.app",
    messagingSenderId: "349356499578",
    appId: "1:349356499578:web:7de4f7b871b0332c4391c3",
    measurementId: "G-R85HX7MW6C"
};


// Firebase start
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ===============================
// 🆘 SEND SOS
// ===============================

async function sendSOS() {

    const disasterType =
        document.getElementById("disasterType").value;

    const severityElement =
        document.getElementById("severity");

    const severity =
        severityElement ? severityElement.value : "Medium";

    const userName =
        document.getElementById("userName").value;

    const location =
        document.getElementById("location").value;

    const contact =
        document.getElementById("contact").value;

    const description =
        document.getElementById("description").value;

    const message =
        document.getElementById("alertMessage");

    const historyList =
        document.getElementById("historyList");


    // ===============================
    // Validation
    // ===============================

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


    const now = new Date();
    const dateTime = now.toLocaleString();


    // ===============================
    // 🔥 SAVE TO FIREBASE
    // ===============================

    try {

        await addDoc(collection(db, "sos_requests"), {

            userName: userName,
            disasterType: disasterType,
            severity: severity,
            location: location,
            contact: contact,
            description: description,
            status: "Pending",
            dateTime: dateTime,
            createdAt: serverTimestamp()

        });


        // ===============================
        // Website alert
        // ===============================

        message.textContent =
            "🚨 SOS REQUEST SENT! Name: " + userName +
            " | Disaster: " + disasterType +
            " | Severity: " + severity +
            " | Location: " + location +
            " | Status: 🔴 Pending" +
            " | Time: " + dateTime;


        // ===============================
        // History
        // ===============================

        if (historyList.innerHTML.includes("No SOS requests yet.")) {
            historyList.innerHTML = "";
        }


        const historyItem =
            document.createElement("li");

        const details =
            document.createElement("p");


        details.textContent =
            "🔴 Status: Pending" +
            " | Name: " + userName +
            " | Disaster: " + disasterType +
            " | Severity: " + severity +
            " | Location: " + location +
            " | Contact: " + contact +
            " | Description: " + description +
            " | Time: " + dateTime;


        // ===============================
        // 🔴 Pending
        // ===============================

        const pendingBtn =
            document.createElement("button");

        pendingBtn.textContent =
            "🔴 Pending";

        pendingBtn.onclick = function () {

            details.textContent =
                details.textContent.replace(
                    /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
                    "🔴 Status: Pending"
                );

        };


        // ===============================
        // 🟡 In Progress
        // ===============================

        const progressBtn =
            document.createElement("button");

        progressBtn.textContent =
            "🟡 In Progress";

        progressBtn.onclick = function () {

            details.textContent =
                details.textContent.replace(
                    /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
                    "🟡 Status: In Progress"
                );

        };


        // ===============================
        // 🟢 Resolved
        // ===============================

        const resolvedBtn =
            document.createElement("button");

        resolvedBtn.textContent =
            "🟢 Resolved";

        resolvedBtn.onclick = function () {

            details.textContent =
                details.textContent.replace(
                    /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
                    "🟢 Status: Resolved"
                );

        };


        historyItem.appendChild(details);

        historyItem.appendChild(pendingBtn);

        historyItem.appendChild(progressBtn);

        historyItem.appendChild(resolvedBtn);

        historyList.appendChild(historyItem);


        // ===============================
        // Success message
        // ===============================

        alert(
            "🆘 SOS Request Sent Successfully!\n\n" +
            "Name: " + userName +
            "\nDisaster: " + disasterType +
            "\nSeverity: " + severity +
            "\nLocation: " + location +
            "\nStatus: Pending" +
            "\nTime: " + dateTime
        );


        // ===============================
        // Clear inputs
        // ===============================

        document.getElementById("userName").value = "";

        document.getElementById("location").value = "";

        document.getElementById("contact").value = "";

        document.getElementById("description").value = "";


    } catch (error) {

        console.error("Firebase Error:", error);

        alert(
            "❌ SOS could not be saved.\n\n" +
            "Please check your Firebase configuration and Firestore rules."
        );

    }
}


// ===============================
// 🗑️ CLEAR HISTORY
// ===============================

function clearHistory() {

    const historyList =
        document.getElementById("historyList");

    historyList.innerHTML =
        "<li>No SOS requests yet.</li>";

    alert("🗑️ SOS History has been cleared!");
}


// ===============================
// 📍 CURRENT LOCATION
// ===============================

function getCurrentLocation() {

    const locationInput =
        document.getElementById("location");


    if (!navigator.geolocation) {

        alert(
            "⚠️ Your browser does not support GPS location."
        );

        return;
    }


    locationInput.value =
        "📍 Getting your exact location...";


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            try {

                const response =
                    await fetch(
                        "https://nominatim.openstreetmap.org/reverse" +
                        "?format=json" +
                        "&lat=" + latitude +
                        "&lon=" + longitude +
                        "&zoom=18" +
                        "&addressdetails=1"
                    );


                const data =
                    await response.json();


                if (data.address) {

                    const address =
                        data.address;


                    // Street / Road
                    const road =
                        address.road || "";


                    // House number
                    const houseNumber =
                        address.house_number || "";


                    // Area
                    const neighbourhood =
                        address.neighbourhood ||
                        address.suburb ||
                        address.village ||
                        "";


                    // City
                    const city =
                        address.city ||
                        address.town ||
                        address.municipality ||
                        "";


                    // District
                    const district =
                        address.county || "";


                    // State
                    const state =
                        address.state || "";


                    // Country
                    const country =
                        address.country || "";


                    const parts = [];


                    if (houseNumber && road) {

                        parts.push(
                            houseNumber + ", " + road
                        );

                    } else if (road) {

                        parts.push(road);

                    }


                    if (neighbourhood) {

                        parts.push(neighbourhood);

                    }


                    if (city) {

                        parts.push(city);

                    }


                    if (district &&
                        district !== city) {

                        parts.push(district);

                    }


                    if (state) {

                        parts.push(state);

                    }


                    if (country) {

                        parts.push(country);

                    }


                    if (parts.length > 0) {

                        locationInput.value =
                            parts.join(", ");

                    } else if (data.display_name) {

                        locationInput.value =
                            data.display_name;

                    } else {

                        locationInput.value =
                            "Latitude: " +
                            latitude +
                            ", Longitude: " +
                            longitude;

                    }


                } else if (data.display_name) {

                    locationInput.value =
                        data.display_name;

                } else {

                    locationInput.value =
                        "Latitude: " +
                        latitude +
                        ", Longitude: " +
                        longitude;

                }

            } catch (error) {

                console.error(
                    "Address lookup error:",
                    error
                );


                locationInput.value =
                    "Latitude: " +
                    latitude +
                    ", Longitude: " +
                    longitude;

            }

        },


        function (error) {

            console.error(
                "GPS Error:",
                error
            );


            if (error.code === 1) {

                alert(
                    "⚠️ Location permission denied.\n\n" +
                    "Please allow location access and try again."
                );

            } else if (error.code === 2) {

                alert(
                    "⚠️ Your location could not be determined.\n" +
                    "Please check your GPS."
                );

            } else if (error.code === 3) {

                alert(
                    "⚠️ Location request timed out.\n" +
                    "Please try again."
                );

            } else {

                alert(
                    "⚠️ Unable to get your location."
                );

            }


            locationInput.value = "";

        },


        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


// ===============================
// 🌐 MAKE FUNCTIONS AVAILABLE
// ===============================

window.sendSOS =
    sendSOS;

window.clearHistory =
    clearHistory;

window.getCurrentLocation =
    getCurrentLocation;
