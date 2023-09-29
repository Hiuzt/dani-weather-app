import { fa } from '@faker-js/faker';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import React, { useState } from 'react';
const labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:00"];

export const options = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
        
        x: {
            grid: {
                display: false,             
              },
            
        },
        y: {
            suggestedMax: 50,
            suggestedMin: -20,
            display: false,
            grid: {
                display: false,
                
            },
        },

    },
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },


    },
    tension: 0.5,
};

async function getPrecipitationChartData(daysArray, isWeekly = false) {
    var chartData = {}
    var chartOptions = {}
    var tempHoursArray = []
    var tempPrecipProb = []
    if (isWeekly === true) {
            daysArray.forEach((hoursItem, hoursIndex) => {
            if (hoursIndex < 7) {            
                tempPrecipProb.push(Math.round(hoursItem["precipprob"]));
                tempHoursArray.push(hoursItem["datetime"].slice(5, 10));
            }       
            });
         
        chartData = {
            labels: tempHoursArray,
            datasets: [
            {
            minBarLength: 7,
                data:  tempHoursArray.map((hoursItem, hoursIndex) => tempPrecipProb[hoursIndex]),
                backgroundColor: "rgba(54, 179, 105, 1)",
                borderColor: "rgba(54, 179, 105, 0.5)",
                barThickness: "10",
            },
        ],
        }  
    } else {
           let tempHoursArray = []
            let tempPrecipProb = []
            daysArray[0].hours.forEach((daysItem, daysIndex) => { 
                if (daysIndex%4 === 0 || daysIndex === 23) {      
                    tempPrecipProb.push(Math.round(daysItem["precipprob"]));
                    tempHoursArray.push(daysItem["datetime"]);
                }            

                chartData = {
                    labels,
                    datasets: [
                        {
                            minBarLength: 7,
                            data:  tempHoursArray.map((daysItem, daysIndex) => tempPrecipProb[daysIndex]),
                            backgroundColor: "rgba(54, 179, 105, 1)",
                            borderColor: "rgba(54, 179, 105, 0.5)",
                            barThickness: "10",
                        },
                    ],
                }       
            });        
    }
  
    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        elements: {
            bar: {
                borderWidth: 2,
            },
        },
        scales: {
            
            x: {
                display: false,
                grid: {
                    display: false,             
                  },
                  suggestedMax: 50,
                  suggestedMin: 0,
                
            },

        },
        

        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },   
        },
    }




    return [chartData, chartOptions]
}

async function getChartData(daysArray, isWeekly = false) {
    var chartSettings = {};
    var tempHoursArray = []
        var tempFeelsArray = []
    
    if (isWeekly === true ) {
        
        
        daysArray.forEach((hoursItem, hoursIndex) => {
            if (hoursIndex < 7) {
                tempFeelsArray.push(Math.round(hoursItem["temp"]));
                tempHoursArray.push(hoursItem["datetime"].slice(8, 10));
            }
                
        });
        
        chartSettings = {
            labels: tempHoursArray,
            datasets: [
            {
                data: tempHoursArray.map((hoursItem, hoursIndex) => tempFeelsArray[hoursIndex]),
                fill: "start",
                borderColor: 'rgb(54, 179, 105)',
                backgroundColor: 'rgba(54, 179, 105, 0.5)',
                datalabels: {
                color: '#FFF',
                align: "top",
                offset: 5,
                },
            },
            ]                  
        }     
    } else {
            var tempHoursArray = []
            var tempFeelsArray = []
            
            daysArray[0]["hours"].forEach((hoursItem, hoursIndex) => {
                if (hoursIndex%4 === 0 || hoursIndex === 23) {
                    tempFeelsArray.push(Math.round(hoursItem["temp"]));
                    tempHoursArray.push(hoursItem["datetime"]);
                    // console.log(tempFeelsArray)
                }
            });
            
            chartSettings = {
                labels,
                datasets: [
                {
                    data: tempHoursArray.map((hoursItem, hoursIndex) => tempFeelsArray[hoursIndex]),
                    fill: "start",
                    borderColor: 'rgb(54, 179, 105)',
                    backgroundColor: 'rgba(54, 179, 105, 0.5)',
                    datalabels: {
                    color: '#FFF',
                    align: "top",
                    offset: 5,
                    },
                },
                ]                  
            }        

    }
    return [chartSettings, options];
}

async function getForecastData(currentCity, countryCode) {
    var daysArray = [];
    var currentPlace = "";
    var currentDayData = [];
    const weekStart = getNextDays(new Date(), 0).toJSON().slice(0, 10);
    const weekStop = getNextDays(new Date(), 7).toJSON().slice(0, 10)
    await axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${currentCity} ${countryCode}?unitGroup=metric&key=${process.env.REACT_APP_WEATHER_API_KEY}`).then(function(response) {
        daysArray = response.data.days;
        currentPlace = response.data["resolvedAddress"];
        currentDayData = response.data.days[0];
    })
    
    return [daysArray, currentPlace, currentDayData]
}

function getIcons(iconID) {
    const iconList = {
        "snow": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 448 512"><path d="M224 0c17.7 0 32 14.3 32 32V62.1l15-15c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-49 49v70.3l61.4-35.8 17.7-66.1c3.4-12.8 16.6-20.4 29.4-17s20.4 16.6 17 29.4l-5.2 19.3 23.6-13.8c15.3-8.9 34.9-3.7 43.8 11.5s3.8 34.9-11.5 43.8l-25.3 14.8 21.7 5.8c12.8 3.4 20.4 16.6 17 29.4s-16.6 20.4-29.4 17l-67.7-18.1L287.5 256l60.9 35.5 67.7-18.1c12.8-3.4 26 4.2 29.4 17s-4.2 26-17 29.4l-21.7 5.8 25.3 14.8c15.3 8.9 20.4 28.5 11.5 43.8s-28.5 20.4-43.8 11.5l-23.6-13.8 5.2 19.3c3.4 12.8-4.2 26-17 29.4s-26-4.2-29.4-17l-17.7-66.1L256 311.7v70.3l49 49c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-15-15V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V449.9l-15 15c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l49-49V311.7l-61.4 35.8-17.7 66.1c-3.4 12.8-16.6 20.4-29.4 17s-20.4-16.6-17-29.4l5.2-19.3L48.1 395.6c-15.3 8.9-34.9 3.7-43.8-11.5s-3.7-34.9 11.5-43.8l25.3-14.8-21.7-5.8c-12.8-3.4-20.4-16.6-17-29.4s16.6-20.4 29.4-17l67.7 18.1L160.5 256 99.6 220.5 31.9 238.6c-12.8 3.4-26-4.2-29.4-17s4.2-26 17-29.4l21.7-5.8L15.9 171.6C.6 162.7-4.5 143.1 4.4 127.9s28.5-20.4 43.8-11.5l23.6 13.8-5.2-19.3c-3.4-12.8 4.2-26 17-29.4s26 4.2 29.4 17l17.7 66.1L192 200.3V129.9L143 81c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l15 15V32c0-17.7 14.3-32 32-32z"/></svg>, "Havazás", "snow"],
        "rain": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 512 512"><path d="M96 320c-53 0-96-43-96-96c0-42.5 27.6-78.6 65.9-91.2C64.7 126.1 64 119.1 64 112C64 50.1 114.1 0 176 0c43.1 0 80.5 24.3 99.2 60c14.7-17.1 36.5-28 60.8-28c44.2 0 80 35.8 80 80c0 5.5-.6 10.8-1.6 16c.5 0 1.1 0 1.6 0c53 0 96 43 96 96s-43 96-96 96H96zm-6.8 52c1.3-2.5 3.9-4 6.8-4s5.4 1.5 6.8 4l35.1 64.6c4.1 7.5 6.2 15.8 6.2 24.3v3c0 26.5-21.5 48-48 48s-48-21.5-48-48v-3c0-8.5 2.1-16.9 6.2-24.3L89.2 372zm160 0c1.3-2.5 3.9-4 6.8-4s5.4 1.5 6.8 4l35.1 64.6c4.1 7.5 6.2 15.8 6.2 24.3v3c0 26.5-21.5 48-48 48s-48-21.5-48-48v-3c0-8.5 2.1-16.9 6.2-24.3L249.2 372zm124.9 64.6L409.2 372c1.3-2.5 3.9-4 6.8-4s5.4 1.5 6.8 4l35.1 64.6c4.1 7.5 6.2 15.8 6.2 24.3v3c0 26.5-21.5 48-48 48s-48-21.5-48-48v-3c0-8.5 2.1-16.9 6.2-24.3z"/></svg>, "Eső", "rain"],
        "fog": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 640 512"><path d="M32 144c0 79.5 64.5 144 144 144H299.3c22.6 19.9 52.2 32 84.7 32s62.1-12.1 84.7-32H496c61.9 0 112-50.1 112-112s-50.1-112-112-112c-10.7 0-21 1.5-30.8 4.3C443.8 27.7 401.1 0 352 0c-32.6 0-62.4 12.2-85.1 32.3C242.1 12.1 210.5 0 176 0C96.5 0 32 64.5 32 144zM616 368H280c-13.3 0-24 10.7-24 24s10.7 24 24 24H616c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-64 96H440c-13.3 0-24 10.7-24 24s10.7 24 24 24H552c13.3 0 24-10.7 24-24s-10.7-24-24-24zm-192 0H24c-13.3 0-24 10.7-24 24s10.7 24 24 24H360c13.3 0 24-10.7 24-24s-10.7-24-24-24zM224 392c0-13.3-10.7-24-24-24H96c-13.3 0-24 10.7-24 24s10.7 24 24 24H200c13.3 0 24-10.7 24-24z"/></svg>, "Köd", "fog"],
        "wind": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 512 512"><path d="M288 32c0 17.7 14.3 32 32 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c53 0 96-43 96-96s-43-96-96-96H320c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32 14.3-32 32zM128 512h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H160c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/></svg>, "Erős szél", "raincloud"],
        "cloudy": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 640 512"><path d="M0 336c0 79.5 64.5 144 144 144H512c70.7 0 128-57.3 128-128c0-61.9-44-113.6-102.4-125.4c4.1-10.7 6.4-22.4 6.4-34.6c0-53-43-96-96-96c-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32C167.6 32 96 103.6 96 192c0 2.7 .1 5.4 .2 8.1C40.2 219.8 0 273.2 0 336z"/></svg>, "Felhős", "raincloud"],
        "partly-cloudy-day": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 640 512"><path d="M294.2 1.2c5.1 2.1 8.7 6.7 9.6 12.1l14.1 84.7 84.7 14.1c5.4 .9 10 4.5 12.1 9.6s1.5 10.9-1.6 15.4l-38.5 55c-2.2-.1-4.4-.2-6.7-.2c-23.3 0-45.1 6.2-64 17.1l0-1.1c0-53-43-96-96-96s-96 43-96 96s43 96 96 96c8.1 0 15.9-1 23.4-2.9c-36.6 18.1-63.3 53.1-69.8 94.9l-24.4 17c-4.5 3.2-10.3 3.8-15.4 1.6s-8.7-6.7-9.6-12.1L98.1 317.9 13.4 303.8c-5.4-.9-10-4.5-12.1-9.6s-1.5-10.9 1.6-15.4L52.5 208 2.9 137.2c-3.2-4.5-3.8-10.3-1.6-15.4s6.7-8.7 12.1-9.6L98.1 98.1l14.1-84.7c.9-5.4 4.5-10 9.6-12.1s10.9-1.5 15.4 1.6L208 52.5 278.8 2.9c4.5-3.2 10.3-3.8 15.4-1.6zM144 208a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zM639.9 431.9c0 44.2-35.8 80-80 80H288c-53 0-96-43-96-96c0-47.6 34.6-87 80-94.6l0-1.3c0-53 43-96 96-96c34.9 0 65.4 18.6 82.2 46.4c13-9.1 28.8-14.4 45.8-14.4c44.2 0 80 35.8 80 80c0 5.9-.6 11.7-1.9 17.2c37.4 6.7 65.8 39.4 65.8 78.7z"/></svg>, "Derült", "sunny"],
        "partly-cloudy-night": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 640 512"><path d="M495.8 0c5.5 0 10.9 .2 16.3 .7c7 .6 12.8 5.7 14.3 12.5s-1.6 13.9-7.7 17.3c-44.4 25.2-74.4 73-74.4 127.8c0 81 65.5 146.6 146.2 146.6c8.6 0 17-.7 25.1-2.1c6.9-1.2 13.8 2.2 17 8.5s1.9 13.8-3.1 18.7c-34.5 33.6-81.7 54.4-133.6 54.4c-9.3 0-18.4-.7-27.4-1.9c-11.2-22.6-29.8-40.9-52.6-51.7c-2.7-58.5-50.3-105.3-109.2-106.7c-1.7-10.4-2.6-21-2.6-31.8C304 86.1 389.8 0 495.8 0zM447.9 431.9c0 44.2-35.8 80-80 80H96c-53 0-96-43-96-96c0-47.6 34.6-87 80-94.6l0-1.3c0-53 43-96 96-96c34.9 0 65.4 18.6 82.2 46.4c13-9.1 28.8-14.4 45.8-14.4c44.2 0 80 35.8 80 80c0 5.9-.6 11.7-1.9 17.2c37.4 6.7 65.8 39.4 65.8 78.7z"/></svg>, "Derült", "sunny"],
        "clear-day": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 512 512"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>, "Tiszta égbolt", "sunny"],
        "clear-night": [<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 384 512"><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>, "Tiszta égbolt", "clearnight"],
   }   
   
   return iconList[iconID];
}

const getNextDays = (currentDate = new Date(), daysToAdd = 1) => {
    const nextDate = new Date(currentDate)
    nextDate.setDate(currentDate.getDate() + daysToAdd)
    return nextDate
}


export {getChartData, getForecastData, getIcons, getPrecipitationChartData}