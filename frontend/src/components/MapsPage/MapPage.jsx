import { useState, useEffect, useRef } from 'react'
import './MapPage.css'
import {APIProvider, Map, Marker, useMapsLibrary, useMap} from '@vis.gl/react-google-maps';
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
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
  if (currId.current === -1) return;
    console.log("Saving apartment with ID:", currId.current);
    axios.put(`http://localhost:8000/save_apartments/${currId.current}`)
    .then(() => {
      console.log("hi");
    })
    .catch(err => console.error(err));
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

function MapPage() {
  const [showBusRoutes, setShowBusRoutes] = useState(false);
  const [showCrimeData, setShowCrimeData] = useState(false)
  //Defauly value so that conditional rendering not required null no accessed
  const [apart, setApart] = useState({
      latitude: 40.110031,
      longitude: -83.141846,
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
  const handleMarkerClick = (apartment) => {
    //Copy the old fields
      setApart(apartment)
  }
  const apartmentLocations = listApart.map(apartment => 
      <Marker
       key={apartment.id}
      position={{lat: apartment.latitude, lng: apartment.longitude}} 
      onClick={() => handleMarkerClick(apartment)}/>
  )
  return (
    <div className = 'container'>
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <div className='map'>
        <Map
          style={{width: '900px', height: '800px'}}
          defaultCenter={{lat: 40.110031, lng: -83.141846}}
          defaultZoom={10}
          fullscreenControl = {true}>
          <Directions active = {showBusRoutes} coords = {[apart.latitude, apart.longitude]}/>
          {apartmentLocations}
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
