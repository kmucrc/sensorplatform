import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "1200px",
  height: "400px",
};

const center = {
  lat: 37.611896677263125,
  lng: 126.99841166597041,
};
const Map = (props) => {
  const [markers, setMarkers] = useState([]);
  useEffect(() => {
    if (props.marker.length !== 0) {
      var markerList = [];
      for (var i = 0; i < props.marker.length; i++) {
        const gps = props.marker[i].split(",");
        // console.log(gps)
        var gpsInfo = {
          lat: parseFloat(gps[0]),
          lng: parseFloat(gps[1]),
        };
        markerList.push(gpsInfo);
      }
      setMarkers(markerList);
    }
  }, [props]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_MAP_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={17}>
        {markers.map((e, i) => {
          return <Marker key={i} position={e} />;
        })}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
