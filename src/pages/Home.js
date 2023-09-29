import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import axios from 'axios';
import {getChartData, getForecastData, getIcons, getPrecipitationChartData} from '../forecastService';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

const Home = () => {


    const [options, setOptions] = useState([])
    const [daysArray, setDaysArray] = useState([]);
    const [currentPlace, setCurrPlace] = useState([]);
    const [currentDayData, setCurrentDayData] = useState([]);
    const [chartSettings, setChartSettings] = useState([]);
    const [barChartSettings, setBarChartSettings] = useState([]);
    const [barOptions, setBarOptions] = useState([])
    const [viewPrecipitation, setViewPrecipitation] = useState(2);
    const [viewDaily, setViewDaily] = useState(2);

    const [isLoaded, setLoaded] = useState(null);
    const [cityArrays, setCity] = useState(false);
    const [showCity, setShow] = useState(true); 
    const [searchValue, setSearchValue] = useState("");

    const handleMouseOnMove = (e, targetSource) => {
        const {currentTarget: target} = e;

        const targetBox = target.getBoundingClientRect(),
            x = e.clientX - targetBox.left,
            y = e.clientY - targetBox.top;
            
        const centerX = (targetBox.right - targetBox.left)/2
        const centerY = (targetBox.bottom - targetBox.top)/2
        
        
        target.style.setProperty("--hover-x", x + "px");
        target.style.setProperty("--hover-y", y + "px");
        target.style.setProperty("--shadow-x", (centerX - x)/50 + "px");
        target.style.setProperty("--shadow-y", (centerY - y)/50 + "px");
    
        
    }

    useEffect(() => {
        for (const card of document.querySelectorAll(".card-bg")) {
            card.onmousemove = e => handleMouseOnMove(e, card);
        }
        for (const card of document.querySelectorAll(".day-forecast")) {
            card.onmousemove = e => handleMouseOnMove(e, card);
        }
    }, [])

    useEffect(() => {
        const itemStorage = localStorage.getItem("currentCity");
        const countryCodeStorage = localStorage.getItem("countryCode");
        if (itemStorage === null || countryCodeStorage === null) {
            localStorage.setItem("currentCity", "Pécs");
            localStorage.setItem("countryCode", "HU");
            loadForeCast("Pécs", "HU")
            return;
        }  
        loadForeCast(itemStorage, countryCodeStorage)
    }, []) 

    const loadForeCast = (countryNameStore, countryCodeStore) => {
        getForecastData(countryNameStore, countryCodeStore).then(function(response) {
            setDaysArray(response[0])
            setCurrPlace(response[1]);
            setCurrentDayData(response[2])
            getChartData(response[0]).then(function(response) {
                setChartSettings(response[0]);
                setOptions(response[1]);
                setLoaded(true);
            });

            getPrecipitationChartData(response[0]).then(function(response) {
                setBarChartSettings(response[0]);
                setBarOptions(response[1]);
            })
        })
    }



    const changeViewPrecip = (e, precipitationID) => {
        document.querySelectorAll(".precipitation-container button").forEach((buttonElement, buttonIndex) => {
            buttonElement.classList.remove("active")
        })
        e.target.classList.add("active")
        setViewPrecipitation(precipitationID);
        var isWeekly = false;
        if (precipitationID === 1) {
            isWeekly = true;
        }

        getPrecipitationChartData(daysArray, isWeekly).then(function(response) {
            setBarChartSettings(response[0]);
            setBarOptions(response[1]);
        })       
    }

    const resetInputs = () => {
        document.querySelectorAll(".precipitation-container button").forEach((buttonElement, buttonIndex) => {
            buttonElement.classList.remove("active");
        })

        document.querySelectorAll(".daily-container button").forEach((buttonElement, buttonIndex) => {
            buttonElement.classList.remove("active");
        })

        document.getElementById("first").classList.add("active");
        document.getElementById("firstp").classList.add("active");
    }
    

    const changeViewDaily = (e, viewID) => {
        document.querySelectorAll(".daily-container button").forEach((buttonElement, buttonIndex) => {
            buttonElement.classList.remove("active")
        })
        setViewDaily(viewID);
        e.target.classList.add("active")
        var isWeekly = false;
        if (viewID === 1) {
            isWeekly = true;
            
        }

        getChartData(daysArray, isWeekly).then(function(response) {
            setChartSettings(response[0]);
        })       
    }

    useEffect(() => {
        const searchCity = () => {
            const currentText = searchValue;
            if (currentText.length > 2) {
                axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${currentText}&apiKey=${process.env.REACT_APP_AUTOCOMPLETE_API_KEY}`).then(function(response) {
                        
                    setCity(response.data.features)
                })   
            }
        }

        var delayTime = setTimeout(() => {
            searchCity();
        }, 250)

        return () => {
            clearTimeout(delayTime);
          }
    }, [searchValue])



    const setCityName = (cityName, currCountryCode) => {
        localStorage.setItem("currentCity", cityName);
        localStorage.setItem("countryCode", currCountryCode);
        loadForeCast(cityName, currCountryCode)

       setSearchValue("");
        resetInputs();
    }

    

  return (
    <div className="main-container">
        <div className="header-content">
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><path d="M0 336c0 79.5 64.5 144 144 144H512c70.7 0 128-57.3 128-128c0-61.9-44-113.6-102.4-125.4c4.1-10.7 6.4-22.4 6.4-34.6c0-53-43-96-96-96c-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32C167.6 32 96 103.6 96 192c0 2.7 .1 5.4 .2 8.1C40.2 219.8 0 273.2 0 336z"/></svg>   
                Kerweather
            </span>          
            <div className="search-bar">
                
                <input value={searchValue} onChange={(e) => setSearchValue(e.currentTarget.value)} id='input' onClick={(e) => setShow(true)} type="text" required></input>
                <label for="input">Írd be a városnevet</label>
                    
                <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
                {showCity === true ?
                <>
                    {cityArrays !== false ? <>
                        <div className="cities-found">
                        <ul> 
                           {cityArrays.map((cityData, cityIndex) => (
                                                      
                                   <li onClick={(e) => setCityName(cityData.properties.address_line1, cityData.properties.country_code)} key={cityIndex}>
                                       {cityData.properties.address_line1}
                                   </li>
                               
                           ))}
                           </ul> 
                       </div>   

                    </>:<></>}
                    </>                  
                :
                    <></>                
                }  
            </div>
        </div>
        <div className="main-content">
            <section className="first-section">
                <div className="img-container">             
                    <div className="img-content">
                        <span>
                            
                            {isLoaded === true ? <>
                                {getIcons(daysArray[0]["icon"])[0]}
                                <p>{Math.round(daysArray[0]["temp"])}˚C</p>
                                <p>{currentPlace}</p>
                            </>:<></>}                             
                        </span>
                        <span>
                            <p>
                            {getCurrentTime(new Date())}
                            </p>
                            <p>
                            {isLoaded === true ? <>                       
                                {getDayName().charAt(0).toUpperCase() + getDayName().slice(1)} 
                                , {getIcons(daysArray[0]["icon"])[1]}
                                
                                </>:<></>
                            }
                            </p>
                        </span>
                    </div>
                    {isLoaded === true ? <>   
                        <img src={require("../files/" + getIcons(daysArray[0]["icon"])[2] + ".jpg")} alt='' />
                    </>
                    :
                    <></>
                    }
                </div>
                <div className="precipitation-container">
                    <p>{viewPrecipitation === 1 ? <>Heti csapadék valószínűség </>: <> Napi csapadék valószínűség</>}</p>  
                    {isLoaded === true ? <>
                        <div className="chart-container">
                            <Bar options={barOptions} data={barChartSettings} />
                        </div>
                        <div className="text-container">
                            <p>Napos</p>
                            <p>Enyhén esős</p>
                            <p>Esős</p>
                        </div>
                    </>
                    :
                    <>

                    </>}
                    <div className="switch-buttons">
                        <button  onClick={(e) => changeViewPrecip(e, 1)}>Heti</button>
                        <button id='firstp' onClick={(e) => changeViewPrecip(e, 2)} className="active">Napi</button>
                    </div>
                </div>
            </section>
            <div className="info-container">
                <div className="card-container">
                    <div className="card-bg">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 10V3M12 3L9 6M12 3L15 6M6 12L5 11M18 12L19 11M3 18H21M5 21H19M7 18C7 15.2386 9.23858 13 12 13C14.7614 13 17 15.2386 17 18" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        <span>
                            <p>Napkelte</p>
                            {isLoaded === true ?
                                <p>{currentDayData.sunrise.slice(0, 5)}</p>
                            :
                                <></>
                            }
                        </span>  
                            
                    </div>
                    <div className="card-bg">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 12L5 11M18 12L19 11M3 18H21M5 21H19M7 18C7 15.2386 9.23858 13 12 13C14.7614 13 17 15.2386 17 18M12 3V10M12 10L15 7M12 10L9 7" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                        <span>
                            <p>Napnyugta</p>
                            {isLoaded === true ?
                                <p>{currentDayData.sunset.slice(0, 5)}</p>
                            :
                                <></>
                            }
                        </span>  
                    </div>
                    <div className="card-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">

                        <path d="M288 32c0 17.7 14.3 32 32 32h32c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c53 0 96-43 96-96s-43-96-96-96H320c-17.7 0-32 14.3-32 32zm64 352c0 17.7 14.3 32 32 32h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H384c-17.7 0-32 14.3-32 32zM128 512h32c53 0 96-43 96-96s-43-96-96-96H32c-17.7 0-32 14.3-32 32s14.3 32 32 32H160c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32 14.3-32 32s14.3 32 32 32z"/></svg>
                        <span>
                            <p>Szél</p>
                            <p>{currentDayData.windspeed} km/h</p>
                        </span> 
                    </div>
                    <div className="card-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">

                        <path d="M192 512C86 512 0 426 0 320C0 228.8 130.2 57.7 166.6 11.7C172.6 4.2 181.5 0 191.1 0h1.8c9.6 0 18.5 4.2 24.5 11.7C253.8 57.7 384 228.8 384 320c0 106-86 192-192 192zM96 336c0-8.8-7.2-16-16-16s-16 7.2-16 16c0 61.9 50.1 112 112 112c8.8 0 16-7.2 16-16s-7.2-16-16-16c-44.2 0-80-35.8-80-80z"/></svg>
                        <span>
                            <p>Pára</p>
                            <p>{currentDayData.humidity}%</p>
                        </span> 
                    </div>
                    <div className="card-bg">
                    <svg fill="#FFFFFF" viewBox="0 0 32 32" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style>  </style> </defs> <path d="M13,30H9a2.0027,2.0027,0,0,1-2-2V20H9v8h4V20h2v8A2.0027,2.0027,0,0,1,13,30Z" transform="translate(0 0)"></path> <polygon points="25 20 23.25 20 21 29.031 18.792 20 17 20 19.5 30 22.5 30 25 20"></polygon> <rect x="15" y="2" width="2" height="5"></rect> <rect x="21.6675" y="6.8536" width="4.958" height="1.9998" transform="translate(1.5191 19.3744) rotate(-45)"></rect> <rect x="25" y="15" width="5" height="2"></rect> <rect x="2" y="15" width="5" height="2"></rect> <rect x="6.8536" y="5.3745" width="1.9998" height="4.958" transform="translate(-3.253 7.8535) rotate(-45)"></rect> <path d="M22,17H20V16a4,4,0,0,0-8,0v1H10V16a6,6,0,0,1,12,0Z" transform="translate(0 0)"></path> <rect id="_Transparent_Rectangle_" data-name="<Transparent Rectangle>" class="cls-1" width="32" height="32"></rect> </g></svg> <span>
                            <p>UV Index</p>
                            <p>{currentDayData.uvindex}%</p>
                        </span> 
                    </div>
                    <div className="card-bg">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/></svg>                        <span>
                            <p>Látótáv</p>
                            <p>{Math.round(currentDayData.visibility)} km</p>
                        </span> 
                    </div>                                       
                </div>
                <div className="daily-container">
                
                        {viewDaily === 1 ? <>
                                <p className="title">Heti hőmérséklet</p>
                            </>:
                            <>
                                <p className="title">Napi hőmérséklet</p>
                            </>}   

                    <div className="line-chart">

                    {isLoaded === true ?  <>
                        <Line options={options} plugins={[ChartDataLabels]}  data={chartSettings} />
                    </>:<></>}     
                    </div>    
                    <div className="switch-buttons">
                            <button onClick={(e) => changeViewDaily(e, 1)}>Heti</button>
                            <button id='first' onClick={(e) => changeViewDaily(e, 2)} className="active">Napi</button>
                        </div>          
                    
                    <p className="days7-text">7 napos előrejelzés</p>
                    <div className="days7-forecast">
                        {isLoaded === true ?
                        <>
                            {daysArray.map((dayData, dayIndex) => (                       
                                    <>
                                    {parseInt(dayIndex) < 7 ? 
                                        <>
                                        {/* {parseInt(dayIndex) !== 0 ? */}
                                        <div className="day-forecast">
                                            <p>{dayData["datetime"].slice(8, 10)}</p>
                                            <p>{getDayName(new Date(dayData["datetime"])).toUpperCase().charAt(0) + getDayName(new Date(dayData["datetime"])).toUpperCase().charAt(1)}</p>
                                            {getIcons(dayData["icon"])[0]}
                                            {getIcons(dayData["icon"])[1]}
                                            <p>{Math.round(dayData["temp"])} ˚C</p>
                                        </div> 
                                  
                                        </>
                                
                                    :
                                        <></>
                                    }

                                    </>
                            ))}
                        </>
                        :
                        <>

                        </>}

                    </div>    
                </div>
            </div>
        </div>
    </div>
  )
}

function getDayName(date = new Date(), locale = 'hu-HU') {
    return date.toLocaleDateString(locale, {weekday: 'long'});
}


const getCurrentTime = () => {
    const currTime = new Date();
    let currHour= currTime.getHours();
    if (currHour < 10) {
        currHour = "0" + currHour
    }
    let currMin = currTime.getMinutes();
    if (currMin < 10) {
        currMin = "0" + currMin
    }

    let activeTime = `${currHour}:${currMin}`

    return activeTime;
}

export default Home