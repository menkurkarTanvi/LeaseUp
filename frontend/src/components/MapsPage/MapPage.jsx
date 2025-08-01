import { useState, useEffect, useRef, useCallback} from 'react'
import './MapPage.css'
import {APIProvider, Map, Marker, InfoWindow, useMapsLibrary, useMap, useMarkerRef} from '@vis.gl/react-google-maps';
import {BarChart } from '@mui/x-charts/BarChart';
import {LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios'

function ChatBox({chatAI, setChatAI, apartName, apartId}){
  const [send, setSend] = useState(0);
  const [clear, setClear] = useState(0);
  const [conversationList, setConversationList] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  const handleSend = () => {
    if (!userQuestion.trim()) return;
    setSend(prev => prev + 1);
  }
  const handleExit = () => {
      setChatAI(false);
  }

  const handleClear = () => {
      setClear(prev => prev +1);
  }
   const conversation = conversationList.map(msg => (
    <p>
      <strong>{msg.sender === "human" ? "You" : "Bot"}:</strong> {msg.content}
    </p>
  ));
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // PUT only if userQuestion is not empty
        if (userQuestion.trim() !== '') {
          await axios.put(`http://localhost:8000/save_map_conversation/${apartId}`, {
            question: userQuestion
          });
          setUserQuestion('');
        }

        // Always run GET
        const res = await axios.get(`http://localhost:8000/get_map_conversation/${apartId}`);
        setConversationList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversation();
  }, [send]);

   useEffect(() => {
    if (clear === 0) return;
    axios.put(`http://localhost:8000/clear/${apartId}`
    ).then(() => {
        setUserQuestion('');
    }).catch(err => console.error(err))
    .then(() =>{
          axios.get(`http://localhost:8000/get_map_conversation/${apartId}`)
          .then(res => {
            setConversationList(res.data);
          })
          .catch(err => console.error(err));
    });
  }, [clear]);

  if(chatAI){
    return(
        <div className="chatbox" id="chatbox">
          <div className="chatbox-header">AI Assistant</div>
          <div className="chatbox-body" id="chat-messages">
            <p><strong>Bot:</strong> Hi! What questions can I help you answer about {apartName}!</p>
            {conversation}
          </div>
          <div className="chatbox-input">
             <input
              type="text"
              placeholder="Type your message..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
            />
            <button onClick={handleSend}>Send</button>
            <button onClick={handleClear}>Clear</button>
            <button className = "exit" onClick={handleExit}>X</button>
          </div>
        </div>
    );
  }else{
    return (<></>);
  }
}
export function ApartmentList({apartmentName, images, description, price, beds, baths, sqft, id}){
  const [index, setIndex] = useState(0);
  const [chat, setChat] = useState(false);
  const [like, setLike] = useState(0);
  const currId = useRef(-1);
  console.log(images);
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

  const handleLike = () => {
    if (id !== currId.current) {
      setLike(prev => prev + 1);
      currId.current = id;
    }
  }
  useEffect (() => {
        setChat(false);
  }, [id])

  useEffect(() => {
    if (currId == -1) return;
    axios.put(`http://localhost:8000/save_apartments/${id}`
    ).then(() => {
        console.log("hi");
    }).catch(err => console.error(err))
  }, [like]);

  return (
    <>
      <div className='apartment'>
        <div className='apartment-title'>
          <h1>{apartmentName}</h1>
        </div>
        <div className='apartment_image'>
          <img src = {images[index]}></img>
          <div className='buttons'>
            <button onClick={handleNextImage}>Next Image</button>
            <button onClick = {handleLike} className='like_button'>Like</button>
            <button onClick={handleChat}>Chat with AI</button>
          </div>
        </div>
        <div className = "apartment-details">
          <div className='apartment-heading'>
            <span className="price">${price}/mo</span>
            <span className="divider">|</span>
            <span className="beds">{beds} beds</span>
            <span className="divider">|</span>
            <span className="baths">{baths} baths</span>
            <span className="divider">|</span>
            <span className="sqft">{sqft} sqft</span>
          </div>
          <div className = 'description'><p>{description}</p></div>
        </div>
      </div>
      {chat && <ChatBox chatAI = {chat} setChatAI = {setChat} apartName = {apartmentName}
      apartId={id}/>}
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
    const [routeIndex, setRouteIndex] = useState(0);

    const selected = routes[routeIndex];
    const leg = selected?.legs[0];

    // Initialize Directions Service and Renderer
    useEffect(() => {
      if (!routesLibrary || !map) return;
      if (!directionsService) setDirectionsService(new routesLibrary.DirectionsService());
      if (!directionsRenderer) {
        const renderer = new routesLibrary.DirectionsRenderer({ map });
        setDirectionsRenderer(renderer);
      }
    }, [routesLibrary, map]);
    
    //If the button Show Routes is clicked (true), display the route based on the coordinates of the last marker selected by the user
    //If the coordinates change and the show routes buttons is still true, a different route is rendered
    useEffect (() => {
        if(!directionsService || !directionsRenderer) return;
        if(active){
            directionsService.route({
            origin: {lat: coords[0], lng: coords[1]},
            destination: "701 S. West Street, Arlington, TX 76019",
            travelMode: 'DRIVING', 
            provideRouteAlternatives: true,   
            }).then(response => {
              directionsRenderer.setDirections(response);
                setRoutes(response.routes);
                setRouteIndex(0); // reset to first route
            });
        }else{
           //If the user has unclicked bus routes, remove the route
           directionsRenderer.setDirections({ routes: [] });
           setRoutes([]);
        }
    }, [active, coords, directionsService, directionsRenderer])

  // Update visible route when routeIndex changes
  useEffect(() => {
    if (!directionsRenderer || routes.length === 0) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer, routes]);
    
    if(!leg) return null;
    return (
      <div className = "directions"> 
          <h2>{selected.summary}</h2>
          <p>{leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}</p>
          <p>Distance: {leg.distance?.text}</p>
          <p>Duration: {leg.duration?.text}</p>

          <h2>Other Routes</h2>
          <ul>
            {routes.map((route,index) => <li key = {route.summary}><button onClick={() => setRouteIndex(index)}>{route.summary}</button></li>)}
          </ul>
      </div>
    );
}

function CrimeRate({ display, setDisplay }) {
  const handleExit = () => {
    setDisplay(false);
  };

  if (!display) return null;

  const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

  return (
    <div className="overlay">
      <div className="crime_rate">
        <h2>Arlington, TX Crime Data (2017–2024)</h2>

        <h3>Violent Crime Rate per 100,000 Residents</h3>
        <LineChart
          xAxis={[{ data: years, label: 'Year' }]}
          series={[
            {
              data: [306.5, 270, 305.4, 321.0, 342.5, 328, 340, 330],
              label: 'Violent Crime Rate',
            },
          ]}
          height={300}
        />

        <h3>Estimated Total Violent Crime Incidents</h3>
        <LineChart
          xAxis={[{ data: years, label: 'Year' }]}
          series={[
            {
              data: [1875, 1650, 1900, 2000, 2150, 2075, 1921, 1900],
              label: 'Total Violent Crimes',
            },
          ]}
          height={300}
        />

        <h3>Homicide Count</h3>
        <LineChart
          xAxis={[{ data: years, label: 'Year' }]}
          series={[
            {
              data: [15, 12, 13, 17, 18, 14, 15, 17],
              label: 'Homicides',
            },
          ]}
          height={300}
        />

        <button onClick={handleExit}>Close</button>
      </div>
    </div>
  );
}

function MapPage() {
  const [showBusRoutes, setShowBusRoutes] = useState(false);
  const [showCrimeData, setShowCrimeData] = useState(false);
  const [infoWindowShown, setInfoWindowShown] = useState(false);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
  const markerRefs = useRef([])
  //Defauly value so that conditional rendering not required null no accessed
  const [apart, setApart] = useState({
      latitude: 32.7318,
      longitude: -97.1106,
      name: '',
      images: []
  });
  const [listApart, setListApart] = useState([]);
  //Empty array for useEffect means the code runs once upon mount and never again
  useEffect(() => {
      axios.get(`http://localhost:8000/apartments/`)
    .then(res => {
      setListApart(res.data);
      //Sets the apartment on the list to the first apartment until user makes selection
      if (res.data.length > 0) setApart(res.data[0]);
    })
    .catch(err => console.error(err));
  }, []);

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
  //stores the apartment object the user has selected on the map
  const handleMarkerClick = (apartment, index) => {
    //Copy the old fields
      setApart(apartment)
      setSelectedMarkerIndex(index);
      setInfoWindowShown(isShown => !isShown)
  }
   
  // if the maps api closes the infowindow, we have to synchronize our state
  const handleClose = () => {
      setSelectedMarkerIndex(null);
      setInfoWindowShown(isShown => !isShown)
  }


  const apartmentLocations = listApart.map((apartment, index) => 
      <Marker
       key={apartment.id}
       ref = {(el) => (markerRefs.current[index] = el)}
      position={{lat: apartment.latitude, lng: apartment.longitude}} 
      onClick={() => handleMarkerClick(apartment, index)}/>
  )
  return (
    <div className = 'container'>
        <APIProvider apiKey={"AIzaSyCa8bWzF5tllZ0X1FTST9vvYLHU9nSkb24"}>
      <div className='map'>
        <Map
          style={{width: '900px', height: '800px'}}
          defaultCenter={{lat: 32.7318, lng: -97.1106}}
          defaultZoom={10}
          fullscreenControl = {true}>
          <Directions active = {showBusRoutes} coords = {[apart.latitude, apart.longitude]}/>
          {apartmentLocations}
          {infoWindowShown && (
            <InfoWindow anchor={markerRefs.current[selectedMarkerIndex]} onClose={handleClose}>
              <p>${apart.price}</p>
            </InfoWindow>
          )}
        </Map>
        <div className='buttons'>
            <button onClick={handleBusRoutes}>{showBusRoutes ? "Hide Bus Routes" : "Show Bus Routes"}</button>
            <button onClick={handleCrimeRate}>Crime Rates</button>
        </div>
      </div>
      {showCrimeData && <CrimeRate display = {showCrimeData} setDisplay={setShowCrimeData}/>}
      {apart && <ApartmentList apartmentName={apart.name} images={apart.images} 
      description={apart.description} price = {apart.price} beds = {apart.beds}
      baths = {apart.baths} sqft={apart.lot_size_sqft} id = {apart.id}/>}
    </APIProvider>
    </div>
  );
}

export default MapPage
