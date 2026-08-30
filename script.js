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
// 🔥 INITIALIZE FIREBASE
// =====================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =====================================
// 🏠 SHELTERS
// =====================================

const verifiedShelters = [

    {
        id: "school",
        name: "Government Higher Secondary School",
        state: "Tamil Nadu",
        district: "Erode",
        latitude: 11.3410,
        longitude: 77.7172,
        available: true
    },

    {
        id: "community",
        name: "Community Hall",
        state: "Tamil Nadu",
        district: "Erode",
        latitude: 11.3300,
        longitude: 77.7250,
        available: true
    },

    {
        id: "relief",
        name: "District Relief Center",
        state: "Tamil Nadu",
        district: "Erode",
        latitude: 11.3500,
        longitude: 77.7050,
        available: true
    }

];


// =====================================
// 🗺️ MAP VARIABLES
// =====================================

let map = null;

let userMarker = null;

let selectedShelterMarker = null;

let currentLatitude = null;

let currentLongitude = null;


// =====================================
// 🗺️ INITIALIZE MAP
// =====================================

function initializeMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) {
        console.error("Map element not found.");
        return;
    }

    if (map) {
        return;
    }

    map = L.map("map").setView(
        [20.5937, 78.9629],
        5
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

}


// =====================================
// 📍 GET CURRENT LOCATION
// =====================================

function getCurrentLocation() {

    getUserLocation(false);

}


// =====================================
// 📍 SHOW LIVE LOCATION
// =====================================

function showLiveLocation() {

    getUserLocation(true);

}


// =====================================
// 📍 GET USER GPS LOCATION
// =====================================

function getUserLocation(focusMap) {

    if (!navigator.geolocation) {

        alert(
            "⚠️ Your browser does not support GPS."
        );

        return;
    }


    const locationInput =
        document.getElementById("location");

    const mapStatus =
        document.getElementById("mapStatus");


    if (locationInput) {

        locationInput.value =
            "Getting your location...";

    }


    if (mapStatus) {

        mapStatus.textContent =
            "📍 Getting your current location...";

    }


    navigator.geolocation.getCurrentPosition(

        async function(position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            currentLatitude =
                latitude;

            currentLongitude =
                longitude;


            // =====================================
            // 📍 USER LOCATION
            // =====================================

            if (map) {

                const userLocation = [
                    latitude,
                    longitude
                ];


                if (focusMap) {

                    map.setView(
                        userLocation,
                        15
                    );

                }


                // Remove old user marker

                if (userMarker) {

                    map.removeLayer(
                        userMarker
                    );

                }


                // Add user marker

                userMarker =
                    L.marker(
                        userLocation
                    ).addTo(map);


                userMarker.bindPopup(

                    "<b>📍 My Location</b><br>" +

                    "Latitude: " +
                    latitude.toFixed(6) +

                    "<br>" +

                    "Longitude: " +
                    longitude.toFixed(6)

                );


                if (focusMap) {

                    userMarker.openPopup();

                }

            }


            // =====================================
            // 📝 LOCATION TEXT
            // =====================================

            if (locationInput) {

                locationInput.value =
                    latitude.toFixed(6) +
                    ", " +
                    longitude.toFixed(6);

            }


            // =====================================
            // 🗺️ STATUS
            // =====================================

            if (mapStatus) {

                mapStatus.textContent =
                    "✅ Your current location is shown on the map.";

            }


            // =====================================
            // ❌ DO NOT SHOW SHELTER AUTOMATICALLY
            // =====================================

            // Shelter will appear ONLY
            // when user selects a shelter.


            // =====================================
            // 🌍 REVERSE ADDRESS
            // =====================================

            try {

                const response =
                    await fetch(

                        "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
                        latitude +
                        "&lon=" +
                        longitude +
                        "&zoom=18&addressdetails=1"

                    );


                if (!response.ok) {

                    throw new Error(
                        "Address lookup failed"
                    );

                }


                const data =
                    await response.json();


                if (
                    locationInput &&
                    data.display_name
                ) {

                    locationInput.value =
                        data.display_name;

                }

            }

            catch (error) {

                console.log(
                    "Address lookup unavailable."
                );

            }

        },


        function(error) {

            console.error(
                "GPS Error:",
                error
            );


            if (locationInput) {

                locationInput.value = "";

            }


            if (mapStatus) {

                mapStatus.textContent =
                    "⚠️ Unable to get your location.";

            }


            let errorMessage =
                "⚠️ Unable to get your location.";


            if (error.code === 1) {

                errorMessage =
                    "⚠️ Location permission denied. Please allow location access.";

            }

            else if (error.code === 2) {

                errorMessage =
                    "⚠️ Location information is unavailable.";

            }

            else if (error.code === 3) {

                errorMessage =
                    "⚠️ Location request timed out. Please try again.";

            }


            alert(errorMessage);

        },


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

        }

    );

}


// =====================================
// 🏠 SHOW SELECTED SHELTER
// =====================================

function showSelectedShelter() {

    const select =
        document.getElementById(
            "shelterSelect"
        );

    const info =
        document.getElementById(
            "shelterInfo"
        );


    if (!select || !info) {
        return;
    }


    const selectedId =
        select.value;


    // =====================================
    // ❌ NO SHELTER SELECTED
    // =====================================

    if (!selectedId) {

        info.innerHTML =
            "<p>📍 Select a shelter to view its location.</p>";


        if (selectedShelterMarker) {

            map.removeLayer(
                selectedShelterMarker
            );

            selectedShelterMarker =
                null;

        }

        return;
    }


    // =====================================
    // 📍 USER LOCATION REQUIRED
    // =====================================

    if (
        currentLatitude === null ||
        currentLongitude === null
    ) {

        info.innerHTML =
            "<p>⚠️ First click <b>Show My Location</b>.</p>";

        // Do NOT show shelter yet

        return;
    }


    const shelter =
        verifiedShelters.find(

            function(item) {

                return item.id === selectedId;

            }

        );


    if (!shelter) {

        info.innerHTML =
            "<p>⚠️ Shelter data unavailable.</p>";

        return;
    }


    if (!map) {
        return;
    }


    // =====================================
    // REMOVE OLD SHELTER MARKER
    // =====================================

    if (selectedShelterMarker) {

        map.removeLayer(
            selectedShelterMarker
        );

    }


    // =====================================
    // 🏠 SHOW ONLY SELECTED SHELTER
    // =====================================

    selectedShelterMarker =
        L.marker([

            shelter.latitude,

            shelter.longitude

        ]).addTo(map);


    selectedShelterMarker.bindPopup(

        "<b>🏠 " +
        shelter.name +
        "</b><br>" +

        "📍 " +
        shelter.district +
        ", " +
        shelter.state

    ).openPopup();


    // =====================================
    // 🗺️ MOVE MAP TO SHELTER
    // =====================================

    map.setView(

        [
            shelter.latitude,
            shelter.longitude
        ],

        15

    );


    // =====================================
    // ❌ NO DISTANCE
    // ❌ NO ROUTE LINE
    // =====================================

    info.innerHTML = `

        <div class="distance-box">

            <h3>
                🏠 ${shelter.name}
            </h3>

            <p>
                📍 ${shelter.district},
                ${shelter.state}
            </p>

            <p>
                🟢 Available
            </p>

        </div>

    `;

}


// =====================================
// 🆘 SEND SOS
// =====================================

async function sendSOS() {

    const disasterType =
        document.getElementById(
            "disasterType"
        )?.value || "Unknown";


    const severity =
        document.getElementById(
            "severity"
        )?.value || "Medium";


    const userName =
        document.getElementById(
            "userName"
        )?.value.trim() || "";


    const location =
        document.getElementById(
            "location"
        )?.value.trim() || "";


    const contact =
        document.getElementById(
            "contact"
        )?.value.trim() || "";


    const description =
        document.getElementById(
            "description"
        )?.value.trim() || "";


    const message =
        document.getElementById(
            "alertMessage"
        );


    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    const historyList =
        document.getElementById(
            "historyList"
        );


    // =====================================
    // VALIDATION
    // =====================================

    if (!userName) {

        alert(
            "⚠️ Please enter your name!"
        );

        return;
    }


    if (!location) {

        alert(
            "⚠️ Please get your current location!"
        );

        return;
    }


    if (!contact) {

        alert(
            "⚠️ Please enter your emergency contact number!"
        );

        return;
    }


    if (!description) {

        alert(
            "⚠️ Please describe the emergency!"
        );

        return;
    }


    const dateTime =
        new Date().toLocaleString();


    try {

        if (statusMessage) {

            statusMessage.textContent =
                "⏳ Sending SOS...";

        }


        // =====================================
        // 🔥 SAVE TO FIRESTORE
        // =====================================

        await addDoc(

            collection(
                db,
                "sos_requests"
            ),

            {

                userName:
                    userName,

                disasterType:
                    disasterType,

                severity:
                    severity,

                location:
                    location,

                latitude:
                    currentLatitude,

                longitude:
                    currentLongitude,

                contact:
                    contact,

                description:
                    description,

                status:
                    "Pending",

                dateTime:
                    dateTime,

                createdAt:
                    serverTimestamp()

            }

        );


        // =====================================
        // 🚨 SUCCESS MESSAGE
        // =====================================

        if (message) {

            message.textContent =
                "🚨 SOS REQUEST SENT! " +
                "Name: " +
                userName +
                " | Disaster: " +
                disasterType +
                " | Severity: " +
                severity +
                " | Status: 🔴 Pending";

        }


        if (statusMessage) {

            statusMessage.textContent =
                "✅ SOS Request sent successfully!";

        }


        // =====================================
        // 📋 HISTORY
        // =====================================

        if (historyList) {

            if (
                historyList.textContent.includes(
                    "No SOS requests yet."
                )
            ) {

                historyList.innerHTML = "";

            }


            const item =
                document.createElement(
                    "li"
                );


            item.textContent =
                "🔴 Pending | " +
                "Name: " +
                userName +
                " | Disaster: " +
                disasterType +
                " | Severity: " +
                severity +
                " | Location: " +
                location +
                " | Time: " +
                dateTime;


            historyList.appendChild(
                item
            );

        }


        alert(
            "🆘 SOS Request Sent Successfully!"
        );


        // Clear form

        document.getElementById(
            "userName"
        ).value = "";


        document.getElementById(
            "contact"
        ).value = "";


        document.getElementById(
            "description"
        ).value = "";


    }

    catch (error) {

        console.error(
            "Firebase Error:",
            error
        );


        if (statusMessage) {

            statusMessage.textContent =
                "❌ SOS could not be saved.";

        }


        alert(
            "❌ SOS could not be saved. Check Firebase Firestore rules."
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


    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    if (statusMessage) {

        statusMessage.textContent =
            "🗑️ History cleared.";

    }

}


// =====================================
// 🚀 PAGE LOAD
// =====================================

window.addEventListener(

    "load",

    function() {

        initializeMap();

        // ❌ NO addShelterMarkers()
        // Shelter default-ஆ காட்டாது.

        console.log(
            "Smart Disaster Management loaded successfully."
        );

    }

);


// =====================================
// 🌐 GLOBAL FUNCTIONS
// =====================================

window.getCurrentLocation =
    getCurrentLocation;


window.showLiveLocation =
    showLiveLocation;


window.showSelectedShelter =
    showSelectedShelter;


window.sendSOS =
    sendSOS;


window.clearHistory =
    clearHistory;
