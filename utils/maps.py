import requests
from typing import List

#Function Explanation: This function will return a list of all apartments within a certain radius of the city of the students college
#Return: A list of strings where each string is the address
def get_list_of_nearby_apartments(location: str) -> List[str]:
    url = "https://realtor.p.rapidapi.com/properties/v2/list-for-rent"
    headers = {
        "X-RapidAPI-Key": "YOUR_API_KEY",
        "X-RapidAPI-Host": "realty-in-us.p.rapidapi.com"
    }
    #Based on information from questionare, extract list of apartments from API
    param = {
        "latitude":
        "longitude":
        "radius":
        "sort": "lowest_price",
        "type": "apartment",
        "list_price_min":
        "list_price_max":
    }
    #Call the API and format the output as a JSON
    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    apartment_listings = []

#Function gets the bus routes in the city specified by the user
def bus_routes():
    pass

#
def crime_rates():
    pass

#This function stores the aparment user has liked along with all the details
#of the apartment that will populate the spreadsheet: adress, monthly rent, sq ft,
# number rooms, number bathrooms, list of amenities, safety index
def save_apartment():
    pass