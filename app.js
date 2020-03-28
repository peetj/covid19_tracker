window.onload = function () {
    init();
    document.querySelector('#load-button').click();
}

var config = {
    apiKey: "AIzaSyBH6MqXoE4SY4Gpb5wgvPABkY7tWEZtXu4",
    authDomain: "covid-19-tracker-b4eb3.firebaseapp.com",
    databaseURL: "https://covid-19-tracker-b4eb3.firebaseio.com",
    projectId: "covid-19-tracker-b4eb3",
    storageBucket: "covid-19-tracker-b4eb3.appspot.com",
    messagingSenderId: "881937155733",
    appId: "1:881937155733:web:b6324b5c216c2485da3d9c",
    measurementId: "G-J2RMWGDDJ6"
};

var __chart;
var seriesData = [];
var snapshot = [];
var collections = [];

function init() {
    // Initialize Firebase
    firebase.initializeApp(config);
    var firestore = firebase.firestore();

    // Get the data
    dt = getTodaysDate()
    while (dt != "23032020") {
        var coll = firestore.collection("days").doc(dt).collection("countries")
        collections.push({
            date: dt,
            collection: coll
        })
        // Decrement dt
        dt = getYesterdaysDate(dt)
    }
    console.log('collections', collections)

    const loadButton = document.querySelector('#load-button')
    var itemsProcessed = 0;
    loadButton.addEventListener('click', function () {
        collections.map((collObj, idx, arr) => {
            var dt = collObj.date;
            var collRef = collObj.collection;
            collRef.get().then(function (querySnapshot) {
                itemsProcessed++;
                querySnapshot.forEach(function (doc) {
                    console.log(doc.id, " => ", doc.data());
                    appendToTheDaysSnapshot(doc.data());
                });
                // Add it to the global DS
                var seriesObj = {}
                seriesObj.name = formatDateForSeries(dt)
                seriesObj.id = "s".concat(idx + 1)
                seriesObj.points = [...snapshot]
                seriesData.push(seriesObj)
                snapshot = []
                if (itemsProcessed === arr.length) {
                    var seriesIdx = seriesData[0].points.length === 0 ? 1 : 0;
                    seriesData[seriesIdx].points = seriesData[seriesIdx].points.sort(function (aPoint, bPoint) {
                        var b = aPoint.y,
                            a = bPoint.y;
                        return a < b ? -1 : a > b ? 1 : 0;
                    });
                    seriesData.reverse();
                    renderGraph();
                }
            })
        })
    })
}

function appendToTheDaysSnapshot(data) {
    if (data.name === "Total:")
        return;

    var country = {};
    country.x = data.name;
    country.y = parseInt((data.newCases === "" ? 0 : data.newCases.replace("+", "").replace(",", "")), 10);
    snapshot.push(country);
}

function renderGraph() {
    __chart = JSC.Chart("chartDiv", {
        debug: false,
        defaultPoint_tooltip: '<b>%name: %seriesName</b><br/>+%Value new cases',
        type: 'horizontal column',
        palette: 'fiveColor7',
        yAxis: {
            scale_type: 'stacked',
            label_text: 'Daily Cases'
        },
        defaultPoint_outline_color: 'darkenMore',
        title_label_text: 'COVID-19 Daily Cases by country',
        xAxis_label_text: 'Countries',
        series: seriesData,
    });
}

function getTodaysDate() {
    var today = new Date();
    return formatDate(today);
}

function getYesterdaysDate(d) {
    var day = parseInt(d.slice(0, 2), 10)
    var month = parseInt(d.slice(2, 4), 10) - 1
    var year = parseInt(d.slice(4), 10)
    var dt = new Date(year, month, day)
    dt.setDate(dt.getDate() - 1);
    return formatDate(dt)
}

function formatDate(dt) {
    var dd = dt.getDate();
    var mm = dt.getMonth() + 1;

    var yyyy = dt.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    return "" + dd + mm + yyyy;
}

function formatDateForSeries(dt) {
    var day = dt.slice(0, 2)
    var month = dt.slice(2, 4)
    var year = dt.slice(4)

    return day + "/" + month + "/" + year
}