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
        title_label_style: {
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '18px',
            fontFamily: 'Covidfont'
        },
        defaultPoint_tooltip: '<b>%name: %seriesName</b><br/>+%Value new cases',
        type: 'horizontal column',
        legend: {
            position: 'right top',
            fill: '#f1f8ff',
            boxVisible: true,
            corners: 'round',
            radius: 5,
            margin_left: 10,
            outline: {
                color: '#a5c6ee',
                width: 3
            },
            defaultEntry: {
                iconWidth: 25,
                padding: 4,
                style: {
                    color: '#3A5254',
                    fontSize: '10pt',
                    fontStyle: 'italic',
                    fontFamily: 'Arial',
                    fontWeight: 'normal'
                },
                states: {
                    hover_style: {
                        color: '#FF5254'
                    },
                    hidden_style: {
                        color: '#c2bec1'
                    }
                }
            }
        },
        palette: ['#9fa8da', '#f48fb1', '#ffab91', '#ffe082', '#c5e1a5', '#80cbc4', '#81d4fa'],
        yAxis: {
            scale_type: 'stacked',
            label_text: 'Daily Cases',
            label_style: {
                color: '#fefefe',
                fontFamily: 'Covidfont',
                fontSize: '19px'
            },
            defaultTick: {
                label_style: {
                    color: '#ffffff',
                }
            },
        },
        box: {
            padding: 10,
            outline: {
                color: '#FF0000',
                width: 4
            },
            radius: 5,
            fill: '#631616'
        },
        xAxis: {
            label_text: 'Countries',
            label_style: {
                color: '#fefefe',
                fontFamily: 'Covidfont',
                fontSize: '19px'
            },
            defaultTick: {
                label_style: {
                    color: '#ffffff',
                    fontFamily: 'Covidfont',
                    fontSize: '8px'
                }
            },
        },
        defaultPoint_outline_color: 'darkenMore',
        title_label_text: 'Corona Virus Daily Cases by Country',
        series: seriesData,
        chartArea: {
            fill: 'black'
        }
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