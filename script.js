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


// =====================================
// 🔥 START FIREBASE
// =====================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =====================================
// 🏠 VERIFIED SHELTER DATA
// =====================================
//
// IMPORTANT:
// இங்கே fake coordinates இல்லை.
// Verified official coordinates கிடைத்த பிறகு
// இந்த array-ல் சேர்க்கலாம்.
//

const verifiedShelters = [
    {
        id: "shelter001",
        name: "Official Shelter",
        state: "Tamil Nadu",
        district: "Erode",
        latitude: 0,
        longitude: 0
    }
];


// =====================================
// 🆘 SEND SOS
// =====================================

async function sendSOS() {

    const disasterType =
        document.getElementById("disasterType").value;

    const severityElement =
        document.getElementById("severity");

    const severity =
        severityElement
            ? severityElement.value
            : "Medium";

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


    // =====================================
    // VALIDATION
    // =====================================

    if (userName.trim() === "") {

        alert("⚠️ Please enter your name!");

        return;
    }


    if (location.trim() === "") {

        alert("⚠️ Please get your current location!");

        return;
    }


    if (contact.trim() === "") {

        alert(
            "⚠️ Please enter an emergency contact number!"
        );

        return;
    }


    if (description.trim() === "") {

        alert(
            "⚠️ Please describe the emergency!"
        );

        return;
    }


    const now = new Date();

    const dateTime =
        now.toLocaleString();


    // =====================================
    // FIREBASE SAVE
    // =====================================

    try {

        await addDoc(
            collection(db, "sos_requests"),
            {

                userName: userName,

                disasterType: disasterType,

                severity: severity,

                location: location,

                contact: contact,

                description: description,

                status: "Pending",

                dateTime: dateTime,

                createdAt: serverTimestamp()

            }
        );


        // =====================================
        // ALERT MESSAGE
        // =====================================

        if (message) {

            message.textContent =
                "🚨 SOS REQUEST SENT! " +
                "Name: " + userName +
                " | Disaster: " + disasterType +
                " | Severity: " + severity +
                " | Location: " + location +
                " | Status: 🔴 Pending" +
                " | Time: " + dateTime;

        }


        // =====================================
        // HISTORY
        // =====================================

        if (
            historyList &&
            historyList.innerHTML.includes(
                "No SOS requests yet."
            )
        ) {

            historyList.innerHTML = "";

        }


        if (historyList) {

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


            // =================================
            // PENDING
            // =================================

            const pendingBtn =
                document.createElement("button");


            pendingBtn.textContent =
                "🔴 Pending";


            pendingBtn.onclick =
                function () {

                    details.textContent =
                        details.textContent.replace(
                            /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
                            "🔴 Status: Pending"
                        );

                };


            // =================================
            // IN PROGRESS
            // =================================

            const progressBtn =
                document.createElement("button");


            progressBtn.textContent =
                "🟡 In Progress";


            progressBtn.onclick =
                function () {

                    details.textContent =
                        details.textContent.replace(
                            /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
                            "🟡 Status: In Progress"
                        );

                };


            // =================================
            // RESOLVED
            // =================================

            const resolvedBtn =
                document.createElement("button");


            resolvedBtn.textContent =
                "🟢 Resolved";


            resolvedBtn.onclick =
                function () {

                    details.textContent =
                        details.textContent.replace(
                            /[🔴🟡🟢] Status: (Pending|In Progress|Resolved)/,
                            "🟢 Status: Resolved"
                        );

                };


            historyItem.appendChild(details);

            historyItem.appendChild(
                pendingBtn
            );

            historyItem.appendChild(
                progressBtn
            );

            historyItem.appendChild(
                resolvedBtn
            );


            historyList.appendChild(
                historyItem
            );

        }


        // =====================================
        // SUCCESS
        // =====================================

        alert(
            "🆘 SOS Request Sent Successfully!\n\n" +

            "Name: " + userName +

            "\nDisaster: " + disasterType +

            "\nSeverity: " + severity +

            "\nLocation: " + location +

            "\nStatus: Pending" +

            "\nTime: " + dateTime
        );


        // =====================================
        // CLEAR INPUTS
        // =====================================

        document.getElementById(
            "userName"
        ).value = "";


        document.getElementById(
            "location"
        ).value = "";


        document.getElementById(
            "contact"
        ).value = "";


        document.getElementById(
            "description"
        ).value = "";


    } catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        alert(
            "❌ SOS could not be saved.\n\n" +
            "Please check Firebase configuration and Firestore rules."
        );

    }

}


// =====================================
// 🗑️ CLEAR HISTORY
// =====================================

function clearHistory() {

    const historyList =
        document.getElementById(
            "historyList"
        );


    if (historyList) {

        historyList.innerHTML =
            "<li>No SOS requests yet.</li>";

    }


    alert(
        "🗑️ SOS History has been cleared!"
    );

}


// =====================================
// 📍 CURRENT LOCATION
// =====================================

function getCurrentLocation() {

    const locationInput =
        document.getElementById(
            "location"
        );


    if (!navigator.geolocation) {

        alert(
            "⚠️ Geolocation is not supported by your browser."
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


            // =================================
            // FIND NEAREST VERIFIED SHELTER
            // =================================

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
                "⚠️ Unable to get your location. Please allow location permission."
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
// 📏 DISTANCE
// =====================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius =
        6371;


    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;


    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            lat1 * Math.PI / 180
        ) *

        Math.cos(
            lat2 * Math.PI / 180
        ) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return earthRadius * c;

}


// =====================================
// 🏠 FIND NEAREST SHELTER
// =====================================

function findNearestShelter(
    latitude,
    longitude
) {

    if (
        verifiedShelters.length === 0
    ) {

        return null;

    }


    let nearest = null;

    let shortestDistance =
        Infinity;


    verifiedShelters.forEach(
        function(shelter) {

            const distance =
                calculateDistance(

                    latitude,

                    longitude,

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

                    distance:
                        distance

                };

            }

        }
    );


    return nearest;

}


// =====================================
// 🏠 SHOW NEAREST SHELTER
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


    const nearest =
        findNearestShelter(
            latitude,
            longitude
        );


    if (!nearest) {

        shelterInfo.innerHTML = `

            <div class="distance-box">

                <h3>
                    🏠 Nearest Shelter
                </h3>

                <p>
                    ⚠️ Verified shelter
                    location is not available
                    for your area yet.
                </p>

            </div>

        `;

        return;

    }


    shelterInfo.innerHTML = `

        <div class="distance-box">

            <h3>
                🏠 ${nearest.name}
            </h3>

            <p>
                📍 ${nearest.district},
                ${nearest.state}
            </p>

            <p class="distance-text">

                📏 Distance:

                <strong>
                    ${nearest.distance.toFixed(2)} km
                </strong>

            </p>

            <p>
                ✅ Verified shelter
            </p>

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
