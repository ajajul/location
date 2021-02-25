import "./App.css";
import React from "react";
import { Map, GoogleApiWrapper, Marker, Polygon } from "google-maps-react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { components } from "react-select";

const API_KEY = "<KEY_HERE>";
const PIRCE_PER_METER = 0.5;

function App(props) {
  const [currentLocation, setCurentLocation] = React.useState(null);
  const [pickupLocation, setPickupLocation] = React.useState(null);
  const [deliveryLocation, setDeliveryLocation] = React.useState(null);
  const [details, setDetails] = React.useState({});
  const [pins, setPins] = React.useState(null);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      const location = {
        name: "current Location",
        value: "currentLocation",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurentLocation(location);
    });
  }, []);
  
  React.useEffect(() => {
    if (pickupLocation && deliveryLocation) {
      setPins([pickupLocation, deliveryLocation])
      axios.post(`http://localhost:8000/api/locations/getDetail`, {
        origins: `${pickupLocation.lat},${pickupLocation.lng}`,
        destinations: `${deliveryLocation.lat},${deliveryLocation.lng}`
      }).then(res => {
        const data = res.data;
        setDetails({
          distance: data.distance.text,
          duration: data.duration.text,
          cost: data.distance.value * PIRCE_PER_METER
        })
      });
    }
  }, [pickupLocation, deliveryLocation]);

  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props}>
      <div className="select-option">
        <img className="imageName" src="./marker.svg" alt={props.data.name} />
        <div className="info">
          <p className="name">{props.data.name}</p>
          <p className="address">{props.data.address}</p>
        </div>
      </div>
    </Option>
  );

  const getOptions = (query, is_pickup) => {
    console.log(query);
    return new Promise((resolve, reject) => {
      if (!query) return resolve([]);
      axios.get(`http://localhost:8000/api/locations/search/${query}?location=${currentLocation.lat},${currentLocation.lng}`)
        .then((response) => {
          const locations = response.data
          let res = locations.map((location) => ({
            ...location,
            value: location.id || location.name,
          }));
          if (is_pickup && currentLocation) {
            res = [ currentLocation, ...res];
          }
          console.log(res);
          resolve(res);
        })
        .catch(reject);
    });
  };

  const saveOption = (location) => {
    if (location.id || location.value === "currentLocation") return;
    axios.post(`http://localhost:8000/api/locations`, location);
  };

  return (
    <div className="App">
      <div className="search">
        <AsyncSelect
          cacheOptions
          defaultOptions
          name="pickup_address"
        name="pickup_address" 
          name="pickup_address"
          value={pickupLocation}
          getOptionValue={e => e.name}
          loadOptions={(query) => {return getOptions(query, true)}}
          components={{ Option: IconOption }}
          onChange={(location) => {
            setPickupLocation(location);
            saveOption(location);
          }}
          placeholder="Choose your pickup address"
        />
        <AsyncSelect
          cacheOptions
          defaultOptions
          name="pickup_address"
          value={deliveryLocation && deliveryLocation.name}
          loadOptions={(query) => getOptions(query)}
          components={{ Option: IconOption }}
          name="delivery_address"
        name="delivery_address" 
          name="delivery_address"
          onChange={(location) => {
            setDeliveryLocation(location);
            saveOption(location);
          }}
          placeholder="Choose your delivery address"
        />
      </div>
      <Map
        google={props.google}
        zoom={18}
        id="map-canvas"
        center={currentLocation}
        options={{ streetViewControl: false }}
      >
        {currentLocation ? (
          <Marker key="currentLocation" position={currentLocation} label="Current Location"/>
        ) : null}
        {pickupLocation ? (
          <Marker key="pickupLocation" position={pickupLocation} label="Pickup" />
        ) : null}
        {deliveryLocation ? (
          <Marker key="deliveryLocation" position={deliveryLocation} label="Dropoff" />
        ) : null}
        {pins ? (
          <Polygon
            paths={pins}
            strokeColor="#0000FF"
            strokeOpacity={0.8}
            strokeWeight={2}
            
            fillColor="#0000FF"
            fillOpacity={0.35} />
          ) : null}
        </Map>
      {details ? (
        <div className="footer">
          <div className="details">
            <strong className="cost">{details.cost} Rs.</strong>
            <strong className="duration">
              <label>{details.distance}</label> | <label>{details.duration}</label>
            </strong>
          </div>
          <button className="enter-place-btn">Enter Place Details</button>
        </div>
      ) : null}
    </div>
  );
}

export default GoogleApiWrapper({
  apiKey: API_KEY,
})(App);
