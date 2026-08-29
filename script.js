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
// 🔥 FIREBASE
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
// 🏠 DEMO SHELTERS
// =====================================

const verifiedShelters = [
    {
        id: "demo-school",
        name: "Government Higher Secondary School",
        state: "Tamil Nadu",
        district: "Erode",
        latitude: 11.3410,
        longitude: 77.7172,
        available: true
    },

    {
        id: "demo-community",
        name: "Community Hall",
        state: "Tamil Nadu",
        district: "Erode",
        latitude: 11.3300,
        longitude: 77.7250,
        available: true
    },

    {
        id: "demo-relief",
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
let shelterMarkers = [];
let routeLine = null;


// =====================================
// 🗺️ INITIALIZE MAP
// =====================================

function initializeMap() {

    const mapElement =
        document.getElementById("map");

    if (!mapElement) {
        return;
    }

    map =
        L.map("map").setView(
            [11.3410, 77.7172],
            10
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
// 🏠 ADD SHELTER MARKERS
// =====================================

function addShelterMarkers() {

    if (!map) {
        return;
    }

    shelterMarkers.forEach(
        marker => map.removeLayer(marker)
    );

    shelterMarkers = [];

    verifiedShelters.forEach(
        function(shelter) {

            if (!shelter.available) {
                return;
            }

            const marker =
                L.marker([
                    shelter.latitude,
                    shelter.longitude
                ]).addTo(map);

            marker.bindPopup(
                "<b>🏠 " +
                shelter.name +
                "</b><br>" +
                "📍 " +
                shelter.district +
                ", " +
                shelter.state +
                "<br>" +
                "🟢 Available<br>" +
                "<small>Demo location</small>"
            );

            shelterMarkers.push(marker);
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
    latitude,
    longitude
) {

    let nearest = null;
    let shortestDistance = Infinity;

    verifiedShelters.forEach(
        function(shelter) {

            if (!shelter.available) {
                return;
            }

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
                    distance
                };
            }
        }
    );

    return nearest;
}


// =====================================
// 📍 SHOW CURRENT LOCATION
// =====================================

function showLiveLocation() {

    if (!navigator.geolocation) {

        alert(
            "⚠️ Your browser does not support GPS."
        );

        return;
    }

    const mapStatus =
        document.getElementById(
            "mapStatus"
        );

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


            const userLocation = [
                latitude,
                longitude
            ];


            // Map center
            map.setView(
                userLocation,
                14
            );


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
            ).openPopup();


            // Location text
            const locationInput =
                document.getElementById(
                    "location"
                );


            if (locationInput) {

                locationInput.value =
                    latitude.toFixed(6) +
                    ", " +
                    longitude.toFixed(6);
            }


            if (mapStatus) {

                mapStatus.textContent =
                    "✅ Your current location is shown.";
            }


            // Show nearest shelter automatically
            showNearestShelter(
                latitude,
                longitude
            );


            // Reverse location
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

                if (
                    locationInput &&
                    data.display_name
                ) {

                    locationInput.value =
                        data.display_name;
                }

            } catch (error) {

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

            if (mapStatus) {

                mapStatus.textContent =
                    "⚠️ Unable to get your location.";
            }

            alert(
                "⚠️ Please allow location permission and try again."
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
// 🏠 SHOW NEAREST SHELTER
// =====================================

function showNearestShelter(
    latitude,
    longitude
) {

    const info =
        document.getElementById(
            "shelterInfo"
        );

    const nearest =
        findNearestShelter(
            latitude,
            longitude
        );


    if (!nearest) {

        if (info) {

            info.innerHTML =
                "<p>⚠️ No shelter available.</p>";
        }

        return;
    }


    const distance =
        nearest.distance.toFixed(2);


    // Remove old route
    if (routeLine) {

        map.removeLayer(
            routeLine
        );
    }


    // Add nearest shelter marker
    const shelterMarker =
        L.marker([
            nearest.latitude,
            nearest.longitude
        ]).addTo(map);


    shelterMarker.bindPopup(
        "<b>🏠 " +
        nearest.name +
        "</b><br>" +
        "📏 Distance: " +
        distance +
        " km"
    ).openPopup();


    // Draw line
    routeLine =
        L.polyline(
            [
                [
                    latitude,
                    longitude
                ],

                [
                    nearest.latitude,
                    nearest.longitude
                ]
            ],
            {
                weight: 4
            }
        ).addTo(map);


    // Fit map
    const bounds =
        L.latLngBounds([
            [
                latitude,
                longitude
            ],

            [
                nearest.latitude,
                nearest.longitude
            ]
        ]);


    map.fitBounds(
        bounds,
        {
            padding: [50, 50]
        }
    );


    // Display info
    if (info) {

        info.innerHTML = `

            <div class="distance-box">

                <h3>
                    🏠 ${nearest.name}
                </h3>

                <p>
                    📍 ${nearest.district},
                    ${nearest.state}
                </p>

                <p>
                    🟢 Available
                </p>

                <p class="distance-text">

                    📏 Distance:

                    <strong>
                        ${distance} km
                    </strong>

                </p>

                <small>
                    ⚠️ Demo location for testing only
                </small>

            </div>

        `;
    }
}


// =====================================
// 🏠 SELECT SHELTER
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


    const selected =
        select.value;


    if (!selected) {

        info.innerHTML =
            "<p>📍 Select a shelter.</p>";

        return;
    }


    if (!userMarker) {

        info.innerHTML =
            "<p>⚠️ First click <b>Show My Location</b>.</p>";

        return;
    }


    let shelter = null;


    if (selected === "school") {

        shelter =
            verifiedShelters[0];

    } else if (
        selected === "community"
    ) {

        shelter =
            verifiedShelters[1];

    } else if (
        selected === "relief"
    ) {

        shelter =
            verifiedShelters[2];
    }


    if (!shelter) {
        return;
    }


    const userPosition =
        userMarker.getLatLng();


    const distance =
        calculateDistance(
            userPosition.lat,
            userPosition.lng,
            shelter.latitude,
            shelter.longitude
        );


    if (routeLine) {

        map.removeLayer(
            routeLine
        );
    }


    const marker =
        L.marker([
            shelter.latitude,
            shelter.longitude
        ]).addTo(map);


    marker.bindPopup(
        "<b>🏠 " +
        shelter.name +
        "</b><br>" +
        "📏 Distance: " +
        distance.toFixed(2) +
        " km"
    ).openPopup();


    routeLine =
        L.polyline(
            [
                [
                    userPosition.lat,
                    userPosition.lng
                ],

                [
                    shelter.latitude,
                    shelter.longitude
                ]
            ],
            {
                weight: 4
            }
        ).addTo(map);


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

            <p class="distance-text">

                📏 Distance:

                <strong>
                    ${distance.toFixed(2)} km
                </strong>

            </p>

            <small>
                ⚠️ Demo location for testing only
            </small>

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

    const historyList =
        document.getElementById(
            "historyList"
        );


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

        await addDoc(
            collection(
                db,
                "sos_requests"
            ),
            {

                userName,

                disasterType,

                severity,

                location,

                contact,

                description,

                status:
                    "Pending",

                dateTime,

                createdAt:
                    serverTimestamp()
            }
        );


        if (message) {

            message.textContent =
                "🚨 SOS REQUEST SENT! " +
                "| Name: " +
                userName +
                " | Disaster: " +
                disasterType +
                " | Severity: " +
                severity +
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


            const item =
                document.createElement(
                    "li"
                );


            item.textContent =
                "🔴 Pending | " +
                userName +
                " | " +
                disasterType +
                " | " +
                severity +
                " | " +
                location +
                " | " +
                dateTime;


            historyList.appendChild(
                item
            );
        }


        alert(
            "🆘 SOS Request Sent Successfully!"
        );


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
}


// =====================================
// 🚀 PAGE LOAD
// =====================================

window.addEventListener(
    "load",
    function() {

        initializeMap();

        addShelterMarkers();

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
