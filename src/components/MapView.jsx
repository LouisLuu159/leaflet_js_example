import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  useMapEvents,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "leaflet-contextmenu";
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";

import "leaflet-routing-machine";
// import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

import Geocoder from "leaflet-control-geocoder";

import "../site.css";

L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.5.0/dist/images/";

/* Setup markers */
function makeIcon(i, n) {
  var url = "images/marker-via-icon-2x.png";
  var markerList = [
    "images/marker-start-icon-2x.png",
    "images/marker-end-icon-2x.png",
  ];
  if (i === 0) {
    return L.icon({
      iconUrl: markerList[0],
      iconSize: [20, 56],
      iconAnchor: [10, 28],
    });
  }
  if (i === n - 1) {
    return L.icon({
      iconUrl: markerList[1],
      iconSize: [20, 56],
      iconAnchor: [10, 28],
    });
  } else {
    return L.icon({
      iconUrl: url,
      iconSize: [20, 56],
      iconAnchor: [10, 28],
    });
  }
}

const EventMap = () => {
  const map = useMap();

  const profileRoutes = {
    foot: "routed-foot",
    bike: "routed-bike",
    car: "routed-car",
  };

  const [profile, setProfile] = useState("car");
  const [startLatLng, setStartLatLng] = useState(null);
  const [destLatLng, setDestLatLng] = useState(null);

  const zoomIn = (e) => {
    console.log(e);
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  const setStart = (e) => {
    setStartLatLng(L.latLng(e.latlng.lat, e.latlng.lng));
  };

  const setDest = (e) => {
    setDestLatLng(L.latLng(e.latlng.lat, e.latlng.lng));
  };

  const contextMenuItems = [
    {
      text: "Zoom In",
      callback: zoomIn,
    },
    {
      text: "Zoom Out",
      callback: zoomOut,
    },
    {
      text: "Direct from here",
      callback: setStart,
    },
    { text: "Direct to here", callback: setDest },
  ];

  useEffect(() => {
    console.log("Re-render");
    const routeControl = L.Routing.control({
      waypoints: [startLatLng, destLatLng],

      routeWhileDragging: true,
      lineOptions: {
        styles: [
          { color: "#022bb1", opacity: 0.8, weight: 8 },
          { color: "white", opacity: 0.3, weight: 6 },
        ],
      },

      showAlternatives: true,
      altLineOptions: {
        styles: [
          { color: "#40007d", opacity: 0.4, weight: 8 },
          { color: "black", opacity: 0.5, weight: 2, dashArray: "2,4" },
          { color: "white", opacity: 0.3, weight: 6 },
        ],
      },

      collapsible: true,
      router: new L.Routing.OSRMv1({
        language: "vi",
        serviceUrl: `//routing.openstreetmap.de/${profileRoutes[profile]}/route/v1`,
      }),

      geocoder: Geocoder.nominatim(),
      geocodersClassName: "osrm-directions-inputs",
      geocoderPlaceholder: function (i, n) {
        let startend = [
          "Start - press enter to drop marker",
          "End - press enter to drop marker",
        ];
        let via = "Via point - press enter to drop marker";
        if (i === 0) {
          return startend[0];
        }
        if (i === n - 1) {
          return startend[1];
        } else {
          return via;
        }
      },
      addWaypoints: false,
      routeDragInterval: 200,
      reverseWaypoints: true,
      createMarker: function (i, start, n) {
        let marker = L.marker(start.latLng, {
          draggable: true,
          icon: makeIcon(i, n),
        });
        return marker;
      },
    }).addTo(map);

    const routingContainer = document.getElementsByClassName(
      "leaflet-routing-container leaflet-bar leaflet-routing-collapsible leaflet-control"
    )[0];

    console.log(routingContainer);
    routingContainer.classList.add("dark");
    routingContainer.classList.add("pad2");

    const geoCoder = document.getElementsByClassName(
      "leaflet-routing-geocoders"
    )[0];

    L.control.scale().addTo(map);

    contextMenuItems.forEach((item) => {
      map.contextmenu.addItem(item);
    });

    return () => {
      map.removeControl(routeControl);
      map.contextmenu.removeAllItems();
    };
  }, [profile, startLatLng, destLatLng]);

  return <Profile profile={profile} setProfile={setProfile} />;
};

const Profile = (props) => {
  const profile = props.profile;

  return (
    <select
      className="leaflet-routing-select-profile"
      id="profile-selector"
      onChange={(event) => {
        const profile = event.currentTarget.value;
        //console.log(profile);
        props.setProfile(profile);
      }}
      value={profile}
    >
      <option value="car">Car</option>
      <option value="bike">Bike</option>
      <option value="foot">Foot</option>
    </select>
  );
};

const MapView = () => {
  const map = useRef();

  return (
    <MapContainer
      className="markercluster-map"
      center={[21.028511, 105.804817]}
      zoom={13}
      maxZoom={18}
      contextmenu={true}
      ref={map}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      <EventMap />
    </MapContainer>
  );
};

export default MapView;
