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

const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


// =====================================
// 🏠 DEMO SHELTERS
// =====================================
// Testing locations only.
// Replace with verified locations later.

const verifiedShelters = [

    {
        id: "school",

        name:
            "Government Higher Secondary School",

        state:
            "Tamil Nadu",

        district:
            "Erode",

        latitude:
            11.3410,

        longitude:
            77.7172,

        available:
            true
    },


    {
        id: "community",

        name:
            "Community Hall",

        state:
            "Tamil Nadu",

        district:
            "Erode",

        latitude:
            11.3300,

        longitude:
            77.7250,

        available:
            true
    },


    {
        id: "relief",

        name:
            "District Relief Center",

        state:
            "Tamil Nadu",

        district:
            "Erode",

        latitude:
            11.3500,

        longitude:
            77.7050,

        available:
            true
    }

];


// =====================================
// 🗺️ MAP VARIABLES
// =====================================

let map = null;

let userMarker = null;

let shelterMarkers = [];

let selectedShelterMarker = null;

let routeLine = null;

let currentLatitude = null;

let currentLongitude = null;


// =====================================
// 🗺️ INITIALIZE MAP
// =====================================

function initializeMap() {

    const mapElement =
        document.getElementById("map");


    if (!mapElement) {

        console.error(
            "Map element not found."
        );

        return;
    }


    // Prevent double initialization

    if (map) {

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

            maxZoom:
                19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(map);


    console.log(
        "Map initialized successfully."
    );

}


// =====================================
// 🏠 ADD SHELTER MARKERS
// =====================================

function addShelterMarkers() {

    if (!map) {

        return;
    }


    // Remove old shelter markers

    shelterMarkers.forEach(

        function(marker) {

            map.removeLayer(
                marker
            );

        }

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

                ])

                .addTo(map);


            marker.bindPopup(

                "<b>🏠 " +

                shelter.name +

                "</b><br>" +

                "📍 " +

                shelter.district +

                ", " +

                shelter.state +

                "<br>" +

                "🟢 Available" +

                "<br>" +

                "<small>Demo location for testing</small>"

            );


            shelterMarkers.push(
                marker
            );

        }

    );

}


// =====================================
// 📏 CALCULATE DISTANCE
// =====================================

function calculateDistance(

    lat1,

    lon1,

    lat2,

    lon2

) {


    const R = 6371;


    const dLat =

        (
            lat2 - lat1
        )

        *

        Math.PI

        /

        180;


    const dLon =

        (
            lon2 - lon1
        )

        *

        Math.PI

        /

        180;


    const a =

        Math.sin(
            dLat / 2
        ) ** 2

        +

        Math.cos(

            lat1

            *

            Math.PI

            /

            180

        )

        *

        Math.cos(

            lat2

            *

            Math.PI

            /

            180

        )

        *

        Math.sin(
            dLon / 2
        ) ** 2;


    const c =

        2

        *

        Math.atan2(

            Math.sqrt(a),

            Math.sqrt(
                1 - a
            )

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

                distance

                <

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
// 📍 GET CURRENT LOCATION
// =====================================

function getCurrentLocation() {

    getUserLocation(
        false
    );

}


// =====================================
// 📍 SHOW LIVE LOCATION ON MAP
// =====================================

function showLiveLocation() {

    getUserLocation(
        true
    );

}


// =====================================
// 📍 GET USER GPS LOCATION
// =====================================

function getUserLocation(

    focusMap

) {


    if (!navigator.geolocation) {

        alert(
            "⚠️ Your browser does not support GPS."
        );

        return;

    }


    const locationInput =

        document.getElementById(
            "location"
        );


    const mapStatus =

        document.getElementById(
            "mapStatus"
        );


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


            console.log(

                "Current Location:",

                latitude,

                longitude

            );


            // =====================================
            // 📍 UPDATE MAP
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


                // Add new user marker

                userMarker =

                    L.marker(

                        userLocation

                    )

                    .addTo(map);


                userMarker.bindPopup(

                    "<b>📍 My Location</b>"

                    +

                    "<br>"

                    +

                    "Latitude: "

                    +

                    latitude.toFixed(6)

                    +

                    "<br>"

                    +

                    "Longitude: "

                    +

                    longitude.toFixed(6)

                );


                if (focusMap) {

                    userMarker.openPopup();

                }

            }


            // =====================================
            // 📝 TEMPORARY COORDINATES
            // =====================================

            if (locationInput) {


                locationInput.value =

                    latitude.toFixed(6)

                    +

                    ", "

                    +

                    longitude.toFixed(6);

            }


            // =====================================
            // 🗺️ MAP STATUS
            // =====================================

            if (mapStatus) {


                mapStatus.textContent =

                    "✅ Your current location is shown on the map.";

            }


            // =====================================
            // 🏠 SHOW NEAREST SHELTER
            // =====================================

            if (map) {


                showNearestShelter(

                    latitude,

                    longitude

                );

            }


            // =====================================
            // 🌍 GET ADDRESS
            // =====================================

            try {


                const response =

                    await fetch(

                        "https://nominatim.openstreetmap.org/reverse?format=json&lat="

                        +

                        latitude

                        +

                        "&lon="

                        +

                        longitude

                        +

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

                    locationInput

                    &&

                    data.display_name

                ) {


                    locationInput.value =

                        data.display_name;

                }


            }

            catch (error) {


                console.log(

                    "Address lookup unavailable:",

                    error

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


            if (

                error.code === 1

            ) {


                errorMessage =

                    "⚠️ Location permission denied. Please allow location access.";

            }


            else if (

                error.code === 2

            ) {


                errorMessage =

                    "⚠️ Location information is unavailable.";

            }


            else if (

                error.code === 3

            ) {


                errorMessage =

                    "⚠️ Location request timed out. Please try again.";

            }


            alert(
                errorMessage
            );

        },


        {

            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                0

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


    if (!map) {

        return;

    }


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

        nearest.distance.toFixed(
            2
        );


    // Remove old selected shelter marker

    if (selectedShelterMarker) {


        map.removeLayer(

            selectedShelterMarker

        );


        selectedShelterMarker =
            null;

    }


    // Remove old route

    if (routeLine) {


        map.removeLayer(

            routeLine

        );


        routeLine =
            null;

    }


    // Add nearest shelter marker

    selectedShelterMarker =

        L.marker([

            nearest.latitude,

            nearest.longitude

        ])

        .addTo(map);


    selectedShelterMarker.bindPopup(

        "<b>🏠 "

        +

        nearest.name

        +

        "</b>"

        +

        "<br>"

        +

        "📏 Distance: "

        +

        distance

        +

        " km"

    );


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

                weight:
                    4

            }

        )

        .addTo(map);


    // Display information

    if (info) {


        info.innerHTML =

            `

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


    if (

        !select

        ||

        !info

    ) {

        return;

    }


    const selectedId =

        select.value;


    if (!selectedId) {


        info.innerHTML =

            "<p>📍 Select a shelter to view details.</p>";


        return;

    }


    if (

        currentLatitude === null

        ||

        currentLongitude === null

    ) {


        info.innerHTML =

            "<p>⚠️ First click <b>Show My Location</b> or <b>Get Current Location</b>.</p>";


        return;

    }


    const shelter =

        verifiedShelters.find(

            function(item) {


                return (

                    item.id === selectedId

                );

            }

        );


    if (!shelter) {


        info.innerHTML =

            "<p>⚠️ Shelter data unavailable.</p>";


        return;

    }


    const distance =

        calculateDistance(

            currentLatitude,

            currentLongitude,

            shelter.latitude,

            shelter.longitude

        );


    if (!map) {

        return;

    }


    // Remove old marker

    if (selectedShelterMarker) {


        map.removeLayer(

            selectedShelterMarker

        );

    }


    // Remove old route

    if (routeLine) {


        map.removeLayer(

            routeLine

        );

    }


    // Add selected shelter marker

    selectedShelterMarker =

        L.marker([

            shelter.latitude,

            shelter.longitude

        ])

        .addTo(map);


    selectedShelterMarker.bindPopup(

        "<b>🏠 "

        +

        shelter.name

        +

        "</b>"

        +

        "<br>"

        +

        "📏 Distance: "

        +

        distance.toFixed(2)

        +

        " km"

    )

    .openPopup();


    // Draw route line

    routeLine =

        L.polyline(

            [

                [

                    currentLatitude,

                    currentLongitude

                ],

                [

                    shelter.latitude,

                    shelter.longitude

                ]

            ],

            {

                weight:
                    4

            }

        )

        .addTo(map);


    // Fit map

    const bounds =

        L.latLngBounds([

            [

                currentLatitude,

                currentLongitude

            ],

            [

                shelter.latitude,

                shelter.longitude

            ]

        ]);


    map.fitBounds(

        bounds,

        {

            padding:
                [50, 50]

        }

    );


    // Show information

    info.innerHTML =

        `

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
        )?.value

        ||

        "Unknown";


    const severity =

        document.getElementById(
            "severity"
        )?.value

        ||

        "Medium";


    const userName =

        document.getElementById(
            "userName"
        )?.value.trim()

        ||

        "";


    const location =

        document.getElementById(
            "location"
        )?.value.trim()

        ||

        "";


    const contact =

        document.getElementById(
            "contact"
        )?.value.trim()

        ||

        "";


    const description =

        document.getElementById(
            "description"
        )?.value.trim()

        ||

        "";


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
        // SUCCESS MESSAGE
        // =====================================

        if (message) {


            message.textContent =

                "🚨 SOS REQUEST SENT! "

                +

                "Name: "

                +

                userName

                +

                " | Disaster: "

                +

                disasterType

                +

                " | Severity: "

                +

                severity

                +

                " | Status: 🔴 Pending";

        }


        if (statusMessage) {


            statusMessage.textContent =

                "✅ SOS Request sent successfully!";

        }


        // =====================================
        // ADD HISTORY
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

                "🔴 Pending | "

                +

                "Name: "

                +

                userName

                +

                " | Disaster: "

                +

                disasterType

                +

                " | Severity: "

                +

                severity

                +

                " | Location: "

                +

                location

                +

                " | Time: "

                +

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


        // Keep location after SOS
        // so the user does not need to
        // request GPS again immediately.


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


        addShelterMarkers();


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
