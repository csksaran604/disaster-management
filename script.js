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
        // Pending
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
        // In Progress
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
        // Resolved
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


    if (navigator.geolocation) {

        locationInput.value =
            "Getting your location...";


        navigator.geolocation.getCurrentPosition(

            async function (position) {

                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                try {

                    const response =
                        await fetch(
                            "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
                            latitude +
                            "&lon=" +
                            longitude
                        );


                    const data =
                        await response.json();


                    if (data.display_name) {

                        locationInput.value =
                            data.display_name;

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

                alert(
                    "⚠️ Unable to get your location. Please allow location permission."
                );

                locationInput.value = "";

            }

        );

    } else {

        alert(
            "⚠️ Geolocation is not supported by your browser."
        );

    }

}


// ===============================
// 🌐 MAKE FUNCTIONS AVAILABLE
// ===============================

window.sendSOS = sendSOS;
window.clearHistory = clearHistory;
window.getCurrentLocation = getCurrentLocation;
