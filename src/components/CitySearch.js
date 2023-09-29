import axios from 'axios';
import React, { useEffect, useState } from 'react'
import setCityName from "../pages/Home"

const CitySearch = () => {
    const [cityArrays, setCity] = useState(false);
    const [showCity, setShow] = useState(true); 
    const [searchValue, setSearchValue] = useState("");

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
    

    return (
        <div className="search-bar">

            <input value={searchValue} onChange={(e) => setSearchValue(e.currentTarget.value)} id='input' onClick={(e) => setShow(true)} type="text" required></input>
            <label for="input">Írd be a városnevet</label>

            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
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

                    </> : <></>}
                </>
                :
                <></>
            }
        </div>
    )
}

export default CitySearch