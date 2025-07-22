import { useState, useEffect } from 'react'
import './App.css'
import {APIProvider, Map, Marker, useMapsLibrary, useMap} from '@vis.gl/react-google-maps';

//Temporary apartment locations (this will be replaced with an API call to get all the apartments near a given location)
const locations = [
  { id: 1, name: "Location A", position: { lat: 40.11, lng: -83.14 },
  images: ["apart1.jpg", "apart2.jpg"]},
  { id: 2, name: "The Pines at Tuttle Crossing", position: { lat: 40.0956, lng: -83.1405 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 3, name: "The Orchard", position: { lat: 40.0959, lng: -83.1383 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 4, name: "The Residences", position: { lat: 40.1181, lng: -83.1238 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 5, name: "Camden Place", position: { lat: 40.1070, lng: -83.1554 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 6, name: "Scycamore Ridge", position: { lat: 40.1088, lng: -83.1322 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 7, name: "Bent Tree", position: { lat: 40.1492, lng: -83.1684 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 8, name: "The Charles at Riggins Run", position: { lat: 40.0952, lng: -83.1409 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 9, name: "Sawmill Commons", position: { lat: 40.1095, lng: -83.1503 },
 images: ["apart1.jpg", "apart2.jpg"]},
  { id: 10, name: "Strathemoor", position: { lat: 40.1102, lng: -83.1437 }, 
 images: ["apart1.jpg", "apart2.jpg"]},
];

function ChatBox({chatAI, setChatAI}){
  const handleExit = () => {
      setChatAI(false);
  }
  if(chatAI){
    return(
        <div className="chatbox" id="chatbox">
          <div className="chatbox-header">AI Assistant</div>
          <div className="chatbox-body" id="chat-messages">
            <p><strong>Bot:</strong> Hi! Looking for an apartment?</p>
          </div>
          <div className="chatbox-input">
            <input type="text" placeholder="Type your message..." id="chat-input" />
            <button>Send</button>
            <button className = "exit" onClick={handleExit}>X</button>
          </div>
        </div>
    );
  }else{
    return (<></>);
  }
}
export function ApartmentList({apartmentName, images}){
  const [index, setIndex] = useState(0);
  const [chat, setChat] = useState(false);
  const handleNextImage = () => {
      if(index + 1 >= images.length){
        setIndex(0);
      }else{
          setIndex(prev => prev + 1);
      }
  }
  const handleChat = () => {
      setChat(true);
  }
  return (
    <>
      <div className='apartment'>
        <h1>{apartmentName}</h1>
        <div className='apartment_image'>
          <img src = {images[index]}></img>
          <div className='buttons'>
            <button onClick={handleNextImage}>Next Image</button>
            <button className='like_button'>Like</button>
            <button onClick={handleChat}>Chat with AI</button>
          </div>
        </div>
        <p>Apartment Details</p>
      </div>
      {chat && <ChatBox chatAI = {chat} setChatAI = {setChat}/>}
     </>
  );
}

//Displays the route on the map if the user has selected route to be showed
function Directions({active, coords}){
    //Returns back an instance of the map
    const map = useMap();
    const routesLibrary = useMapsLibrary('routes');
    const [directionsService, setDirectionsService] = useState();
    const [directionsRenderer, setDirectionsRenderer] = useState();
    const [routes, setRoutes] = useState([]);
    useEffect (() => {
        if(!routesLibrary || !map) return;
        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(new routesLibrary.DirectionsRenderer({map}));
    }, [routesLibrary, map])
    
    //If the button Show Routes is clicked (true), display the route based on the coordinates of the last marker selected by the user
    //If the coordinates change and the show routes buttons is still true, a different route is rendered
    useEffect (() => {
        if(!directionsService || !directionsRenderer) return;
        if(active){
          console.log("hi")
            directionsService.route({
            origin: {lat: coords[0], lng: coords[1]},
            destination: "281 W Lane Ave, Columbus, OH 43210",
            travelMode: 'DRIVING', 
            provideRouteAlternatives: true,   
            }).then(response => {
                directionsRenderer.setDirections(response);
                setRoutes(response.routes);
            });
        }else{
          //If the user has unclicked bus routes, remove the route
           directionsRenderer.setDirections({ routes: [] });
        }
    }, [active, coords, directionsService, directionsRenderer])

    return null;
}

function CrimeRate({display, setDisplay}){
  const handleExit = () => {
      setDisplay(false);
  }
  if(display){
      return (
      <div className="overlay">
        <div className="crime_rate">
          <h2>Crime Data</h2>
          <p>Crime data (graph, chart, etc) goes here</p>
          <button onClick={handleExit}>Close</button>
        </div>
      </div>
    
    );
  }else{
    return <></>
  }
}

function App() {
  const [showBusRoutes, setShowBusRoutes] = useState(false);
  const [showCrimeData, setShowCrimeData] = useState(false)
  const [apart, setApart] = useState(locations[0]);
  const handleBusRoutes = () => {
    console.log(showBusRoutes);
      if(showBusRoutes){
        setShowBusRoutes(false);
      }else{
        setShowBusRoutes(true);
      }
  }

  const handleCrimeRate = () =>{
        setShowCrimeData(true);
  }
  //Handles the event when user clicks on a marker on the map.
  //Store the coordinates of the marker as well as the name of the apartment
  const handleMarkerClick = (apartment) => {
    //Copy the old fields
      setApart(apartment)
  }
  const apartmentLocations = locations.map(apartment => 
      <Marker
      position={{lat: apartment.position.lat, lng: apartment.position.lng}} 
      onClick={() => handleMarkerClick(apartment)}/>
  )
  return (
    <div className = 'container'>
        <APIProvider apiKey={"AIzaSyCa8bWzF5tllZ0X1FTST9vvYLHU9nSkb24"}>
      <div className='map'>
        <Map
          style={{width: '900px', height: '800px'}}
          defaultCenter={{lat: 40.110031, lng: -83.141846}}
          defaultZoom={10}
          fullscreenControl = {true}>
          <Directions active = {showBusRoutes} coords = {[apart.position.lat, apart.position.lng]}/>
          {apartmentLocations}
        </Map>
        <div className='buttons'>
            <button onClick={handleBusRoutes}>{showBusRoutes ? "Hide Bus Routes" : "Show Bus Routes"}</button>
            <button onClick={handleCrimeRate}>Crime Rates</button>
        </div>
      </div>
      {showCrimeData && <CrimeRate display = {showCrimeData} setDisplay={setShowCrimeData}/>}
      <ApartmentList apartmentName={apart.name} images = {apart.images}/>
    </APIProvider>
    </div>
  );
}

export default App
