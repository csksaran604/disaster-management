import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================
// 🔥 FIREBASE CONFIG
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyCOug6KwpFtoeXNVjOAZOUg1eWVu7npkcc",
    authDomain: "disaster-management-96929.firebaseapp.com",
    projectId: "disaster-management-96929",
    storageBucket: "disaster-management-96929.firebasestorage.app",
    messagingSenderId: "349356499578",
    appId: "1:349356499578:web:7de4f7b871b0332c4391c3",
    measurementId: "G-R85HX7MW6C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =====================================
// 🏠 DEMO SHELTER
// =====================================
// Demo/testing location only.
// Replace with verified shelter data later.

const verifiedShelters = [
    {
        id: "demo-shelter-1",
        name: "Demo Emergency Shelter",
        state: "Tamil Nadu",
        district: "Demo Location",
        latitude: 11.3410,
        longitude: 77.7172,
        available: true
    }
];


// =====================================
// 🆘 SEND SOS
// =====================================

async function sendSOS() {

    const disasterType =
        document.getElementById("disasterType")?.value || "Unknown";

    const severity =
        document.getElementById("severity")?.value || "Medium";

    const userName =
        document.getElementById("userName")?.value.trim() || "";

    const location =
        document.getElementById("location")?.value.trim() || "";

    const contact =
        document.getElementById("contact")?.value.trim() || "";

    const description =
        document.getElementById("description")?.value.trim() || "";

    const message =
        document.getElementById("alertMessage");

    const historyList =
        document.getElementById("historyList");


    if (!userName) {
        alert("⚠️ Please enter your name!");
        return;
    }

    if (!location) {
        alert("⚠️ Please get your current location!");
        return;
    }

    if (!contact) {
        alert("⚠️ Please enter your emergency contact number!");
        return;
    }

    if (!description) {
        alert("⚠️ Please describe the emergency!");
        return;
    }


    const dateTime =
        new Date().toLocaleString();


    try {

        await addDoc(
            collection(db, "sos_requests"),
            {
                userName,
                disasterType,
                severity,
                location,
                contact,
                description,
                status: "Pending",
                dateTime,
                createdAt: serverTimestamp()
            }
        );


        if (message) {
            message.textContent =
                "🚨 SOS REQUEST SENT! " +
                "Name: " + userName +
                " | Disaster: " + disasterType +
                " | Severity: " + severity +
                " | Location: " + location +
                " | Status: 🔴 Pending";
        }


        if (historyList) {

            if (
                historyList.innerHTML.includes(
                    "No SOS requests yet."
                )
            ) {
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
        }


        alert(
            "🆘 SOS Request Sent Successfully!"
        );


        document.getElementById("userName").value = "";
        document.getElementById("location").value = "";
        document.getElementById("contact").value = "";
        document.getElementById("description").value = "";


    } catch (error) {

        console.error(
            "Firebase Error:",
            error
        );

        alert(
            "❌ SOS could not be saved."
        );

    }
}


// =====================================
// 🗑️ CLEAR HISTORY
// =====================================

function clearHistory() {

    const historyList =
        document.getElementById("historyList");

    if (historyList) {

        historyList.innerHTML =
            "<li>No SOS requests yet.</li>";

    }

}


// =====================================
// 📍 CURRENT LOCATION
// =====================================

function getCurrentLocation() {

    const locationInput =
        document.getElementById("location");


    if (!navigator.geolocation) {

        alert(
            "⚠️ Geolocation is not supported."
        );

        return;
    }


    locationInput.value =
        "Getting your location...";


    navigator.geolocation.getCurrentPosition(

        async function(position) {

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
                        longitude +
                        "&zoom=18&addressdetails=1"
                    );


                const data =
                    await response.json();


                if (data.display_name) {

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

                locationInput.value =
                    "Latitude: " +
                    latitude +
                    ", Longitude: " +
                    longitude;

            }


            showNearestShelter(
                latitude,
                longitude
            );

        },


        function(error) {

            console.error(
                "Location Error:",
                error
            );

            locationInput.value = "";

            alert(
                "⚠️ Please allow location permission."
            );

        },


        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


// =====================================
// 📏 DISTANCE CALCULATION
// =====================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

        Math.sin(dLon / 2) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;

}


// =====================================
// 🏠 FIND NEAREST SHELTER
// =====================================

function findNearestShelter(
    userLat,
    userLng
) {

    let nearest = null;

    let shortestDistance =
        Infinity;


    verifiedShelters.forEach(
        function(shelter) {

            if (!shelter.available) {
                return;
            }


            const distance =
                calculateDistance(
                    userLat,
                    userLng,
                    shelter.latitude,
                    shelter.longitude
                );


            if (
                distance <
                shortestDistance
            ) {

                shortestDistance =
                    distance;

                nearest = {
                    ...shelter,
                    distance
                };

            }

        }
    );


    return nearest;
}


// =====================================
// 🏠 SHOW SHELTER
// =====================================

function showNearestShelter(
    latitude,
    longitude
) {

    const shelterInfo =
        document.getElementById(
            "shelterInfo"
        );


    if (!shelterInfo) {
        return;
    }


    const shelter =
        findNearestShelter(
            latitude,
            longitude
        );


    if (!shelter) {

        shelterInfo.innerHTML = `
            <div class="distance-box">
                <h3>🏠 Nearest Shelter</h3>
                <p>No shelter available.</p>
            </div>
        `;

        return;
    }


    shelterInfo.innerHTML = `

        <div class="distance-box">

            <h3>
                🏠 ${shelter.name}
            </h3>

            <p>
                📍 ${shelter.district},
                ${shelter.state}
            </p>

            <p>
                📏 Distance:
                <strong>
                    ${shelter.distance.toFixed(2)} km
                </strong>
            </p>

            <p>
                🟢 Available
            </p>

            <small>
                ⚠️ Demo location for testing only
            </small>

        </div>

    `;
}


// =====================================
// 🌐 GLOBAL FUNCTIONS
// =====================================

window.sendSOS =
    sendSOS;

window.clearHistory =
    clearHistory;

window.getCurrentLocation =
    getCurrentLocation;

window.showNearestShelter =
    showNearestShelter;
