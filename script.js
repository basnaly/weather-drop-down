
'use strict';

let apiKey = '';

const getApiKey = () => {
    let key = $("#key").val().trim();
    console.log(key);
    apiKey = key;
}

const activities = {
"outColdSolo": ["Sledding", "Ice Skating", "Skiing", "Snowboarding", "Walking", "Running"],
"outColdTeam": ["Ice Skating", "Skiing", "Hockey", "Snow rugby"],
"outWarmSolo": ["Swimming", "Biking", "Surfing", "Walking", "Running"],
"outWarmTeam" : ["Tennis", "Rugby", "Baseball", "Soccer", "Golf", " Volleyball"],
}

class ActivitiesClass {
    constructor() {
        this.temperature = null;
        this.activities = [];
    }
    setTemperature(temperature) {
        this.temperature = temperature;
    }

    calculateTab() {
        this.tab = $("span.selected").html();
    }

    displayActivities () {
        this.getActivities()

        $(".activities").html(this.activities.map(el => $("<li></li>").html(el)));

        if (this.tab === "All") {
            $(".list-activities").css("align-items", "flex-end");
        }
        else if (this.tab === "Team") {
            $(".list-activities").css("align-items", "center");
        }
        else if (this.tab === "Solo") {
            $(".list-activities").css("align-items", "flex-start");
        }
    }
    
    getActivities () {
        this.calculateTab();
        let solo = activities["outWarmSolo"];
        let team = activities["outWarmTeam"];
        let all = activities["outWarmSolo"].concat(activities["outWarmTeam"]);
    
        if (this.temperature < 0) {
            solo = activities["outColdSolo"];
            team = activities["outColdTeam"];
            all = activities["outColdSolo"].concat(activities["outColdTeam"]);
        } 

        if (this.tab === "All") {
            this.activities = all;
        }
        else if (this.tab === "Team") {
            this.activities = team;
        }
        else if (this.tab === "Solo") {
            this.activities = solo;
        }
    }
};

const ACTIVITIES = new ActivitiesClass()

const onClickTab = (tabClicked) => {
    let id = "#activ-" + tabClicked;
    $(".item").removeClass("selected");
    $(id).addClass("selected");
    ACTIVITIES.displayActivities(); 
}

function openDropdownMenu() {
        $("#dropdown").toggleClass("animate__backInDown animate__bounceOutUp border")
        .css("max-height", "unset"); 
        $("#location").focus();
};

$(function(){

    $("#activity-button").on('click', openDropdownMenu);
     
    $("#get-forecast").on('click', function(){
        let inputLoc = $("#location").val().trim();  // after user types and sends location
        console.log(inputLoc);

        getApiKey();

        $("#get-forecast").attr("disabled", true).html("Loading..");

        $("#unavailable").css("display", "none");
        $("#dropdown-bottom").css("display", "none");
        $(".div-weather").css("display", "none");
        $(".div-location").css("display", "none");


        let textMessage = "Weather information unavailable";
        if (inputLoc.length < 3){
            textMessage = "Please type more than 3 letters";
            unavailable(textMessage);
        } 
        else if (apiKey.length === 0) {
            textMessage = "API key is missing" ;
            unavailable(textMessage);
        } else {
            getWeatherLocation(inputLoc) 
        }  
    }); 
});

const unavailable = (textMessage) => {
    $("#unavailable").css("display", "flex");
    $("#unavailable-text").html(textMessage);
    $("#get-forecast").attr("disabled", false).html("Get Forecast");
}

const getWeatherLocation = async (location) =>{
    let urlCurrent = requestURL + `q=${location}&appid=${apiKey}&units=metric`
    try {
        let data = await sendRequest('GET', urlCurrent) // get response from server
            console.log(data);

        displayWeather(data)    // display wheather and location

        ACTIVITIES.displayActivities();
        
        $("#dropdown-bottom").removeClass("animate__fadeOutUp").addClass("animate__fadeInDown");

        $("#dropdown-bottom").css("display", "flex");
        $(".div-weather").css("display", "unset");
        $(".div-location").css("display", "unset");

        $("#get-forecast").attr("disabled", false).html("Get Forecast");

    } catch (error) {
        console.log(error)
        let message = error?.data?.message ?? "The data is not available";
        unavailable(message);
    }  
}

let textWeatherStyle = {
    color: "darkred"
}

const displayWeather = (jason) => {
    let locationPlace = jason.name + " ," + jason.sys.country;
    $("#location-place").html(locationPlace).css(textWeatherStyle);

    let longitudePlace = jason.coord.lon;
    $("#longitude").html(longitudePlace).css(textWeatherStyle);

    let latitudePlace = jason.coord.lat;
    $("#latitude").html(latitudePlace).css(textWeatherStyle);

    let iconPlace = jason.weather[0].icon;
    $(".icon-weather").attr("src", `http://openweathermap.org/img/wn/${iconPlace}@2x.png`);
 
    let temperaturePlace = jason.main.temp;
    ACTIVITIES.setTemperature(temperaturePlace);
    $("#temperature").html(temperaturePlace).css(textWeatherStyle);

    let humidityPlace = jason.main.humidity;
    $("#humidity").html(humidityPlace).css(textWeatherStyle);

    let pressurePlace = jason.main.pressure;
    $("#pressure").html(pressurePlace).css(textWeatherStyle);

    let windPlace = jason.wind.speed;
    $("#wind").html(windPlace).css(textWeatherStyle);

}

const requestURL = 'https://api.openweathermap.org/data/2.5/weather?'

function sendRequest(method, url, body = null) {
    const headers = {
    }

    let params = {
        method: method,
        body: JSON.stringify(body),
        headers: headers
    }

    if (!body) {
        params = {
        method: method,
        headers: headers
        }
    }

    return fetch(url, params)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            return response.json().then(error => {
                const e = new Error('Somthing wrong')
                e.data = error
                throw e
            })
        })
}

