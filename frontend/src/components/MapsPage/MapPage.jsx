import { useState, useEffect, useRef } from 'react';
import './MapPage.css';
import {APIProvider, Map, Marker, useMapsLibrary, useMap} from '@vis.gl/react-google-maps';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; 
import { Card, CardContent } from '@mui/material';
import { Button, Box } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';


function ApartmentImage({ id, index, apartmentName }) {
  const src = `/images/id_${id}_${index}.jpg`;  // Use index directly if your images are named id_0_1.jpg, id_0_2.jpg etc

  return (
    <img
      src={src}
      alt={`${apartmentName} image ${index}`}
      style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }}
      onError={(e) => {
        console.error('Image failed:', e.target.src);
        e.target.style.display = 'none'; // This hides the image
      }}
    />
  );
}



function ChatBox({chatAI, setChatAI, apartName, apartId, userData}){
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
            question: userQuestion, 
            user_info: userData
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

  if (!chatAI) return null;

  return (
    <Box
      sx={{
        position: 'fixed',       
        bottom: 80,             
        right: 24,
        width: 400,             
        height: 400,
        bgcolor: 'background.paper',
        border: '2px solid black', 
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300,           
      }}
    >
      <Box
        sx={{
          bgcolor: 'black',
          color: 'white',
          p: 1,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>AI Assistant</span>
        {/* exit button */}
        <Button
          variant="outlined"
          size="small"
          onClick={handleExit}
          sx={{
            color: 'white',
            borderColor: 'white',
            minWidth: 'auto',
            padding: '2px 6px',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          X
        </Button>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
          fontSize: '0.9rem',
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #ccc',
        }}
        id="chat-messages"
      >
        <p>
          <strong>Bot:</strong> Hi {userData.userName}! What questions can I help you answer about {apartName}!
        </p>
        {conversation}
      </Box>

      {/* chat messages with added scroll */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          p: 1,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <Button variant="outlined" onClick={handleSend} size="small" sx={{ borderColor: 'black', color: 'black' }}>
          Send
        </Button>
        <Button variant="outlined" onClick={handleClear} size="small" sx={{ borderColor: 'black', color: 'black' }}>
          Clear
        </Button>
      </Box>
    </Box>
  );
}




export function ApartmentList({apartmentName, description, price, beds, baths, sqft, id, userData}){
  const [chat, setChat] = useState(false);
  const [liked, setLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);
  const currId = useRef(-1);
  const imageMap = { 0:4, 1:3, 2:3, 3:3, 4:3, 5:1, 6:2, 7:4, 8:2, 9:3}

  const handleChat = () => {
      setChat(true);
  }

const handleLike = () => {
  if (!liked) {
    setLiked(true);
    setTotalLikes(prev => prev + 1);
    console.log("Saving apartment with ID:", currId.current);
    // request immediately after apartment like
    axios.put(`http://localhost:8000/save_apartments/${id}`)
      .then(() => console.log("Apartment liked"))
      .catch(err => console.error(err));
  } else {
    // handle unliking logic 
    setLiked(false);
    setTotalLikes(prev => prev - 1);
  }
};

  useEffect(() => {
    setChat(false)
    setLiked(false); 
    currId.current = id
}, [id]);


// useEffect(() => {
//   if (currId.current === -1) return;
//     console.log("Saving apartment with ID:", currId.current);
//     axios.put(`http://localhost:8000/save_apartments/${currId.current}`)
//     .then(() => {
//       console.log("hi");
//     })
//     .catch(err => console.error(err));
// }, [liked]);



  return (
    <>
      <Card className="apartment-card">
        <CardContent>
        <div className="apartment-title">
          <h1>{apartmentName}</h1>
          <button onClick={handleLike} className="like-button">
          {liked ? <FavoriteIcon color='pink' fontSize='large' /> : <FavoriteBorderIcon fontSize='large' />}
        </button>
        </div>
        
        <div>
        <div className="image-carousel-wrapper">
          {imageMap[id] > 0 ? (
            <Swiper
              navigation={true}
              modules={[Navigation]}
              spaceBetween={100}
              slidesPerView={1}
              style={{ width: '100%', height: '400px' }}
            >
              {[...Array(3).keys()].map((i) => (
                <SwiperSlide key={i} style={{ height: '400px' }}>
                  <ApartmentImage id={id} index={i + 1} apartmentName={apartmentName} />
                </SwiperSlide>
              ))}
            </Swiper>
           ) : (
            <p>No images available</p>
          )} 
          </div>

          <Button
            variant="outlined"
            onClick={handleChat}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              borderColor: 'black',
              color: 'black',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '30px',
              padding: '10px 20px',
              '&:hover': {
                borderColor: 'black',
                backgroundColor: '#f0f0f0',
              }
            }}
          >
            Chat with AI
          </Button>
        </div>

        <div className="apartment-details">
          <div className="apartment-heading">
            <span className="price">${price}/mo</span>
            <span className="divider">|</span>
            <span className="beds">{beds} beds</span>
            <span className="divider">|</span>
            <span className="baths">{baths} baths</span>
            <span className="divider">|</span>
            <span className="sqft">{sqft} sqft</span>
          </div>
          <div className="description">
            <p>{description}</p>
          </div>
        </div>
        </CardContent>
      </Card>

      {chat && (
        <ChatBox
          chatAI={chat}
          setChatAI={setChat}
          apartName={apartmentName}
          userData={userData}
          apartId={id}
        />
      )}
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
  const location = useLocation();
  const userData = location.state?.userData || null;
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
  const [infoWindowShown, setInfoWindowShown] = useState(false);

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
      console.log(listApart)
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
      position={{lat: apartment.latitude, lng: apartment.longitude}} 
      onClick={() => handleMarkerClick(apartment, index)}/>
  )
  return (
    <div className = 'container'>
      {/* <div className="background-fade"> </div> */}
        <APIProvider apiKey= {process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <div className='map'>
          <Map
            style={{width: '900px', height: '800px'}}
            defaultCenter={{lat: 30.266667, lng: -97.741667}}
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
        {apart && 
          <ApartmentList 
            apartmentName={apart.name} 
            images={apart.images} 
            description={apart.description} 
            price = {apart.price} 
            beds = {apart.beds}
            baths = {apart.baths} 
            sqft={apart.lot_size_sqft} 
            id={apart.id}
            userData={userData}
            />}
        </APIProvider>
      </div>
  );
}

export default MapPage
