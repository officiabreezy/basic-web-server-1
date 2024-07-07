const express = require('express');
const env = require('dotenv').config();
const port = process.env.PORT || 3000
const requestIP = require('request-ip');
const axios = require('axios');
const app = express();


app.use(requestIP.mw())
app.set('trust proxy', true);
app.enable('trust proxy');

app.get('/', (req, res) => {
    res.send('homepage')
})


app.get('/api/hello', async (req, res) =>{
    const visitor_name = req.query.name
    const ip =  req.clientIp || '8.8.8.8'


    if (!visitor_name) {
        return res.status(404).json({message: "kindly provide a name"});
    }

    if (ip === '::1' || ip === '127.0.0.1') {
        console.log('Localhost IP address, no geolocation available.')};

    try {

        const data =await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.GEOLOCATION_KEY}&ip=${ip}`)

        console.log(data);

        const lat = parseFloat(data.data.latitude);
        const lng = parseFloat(data.data.longitude);

       console.log(lat,lng);

        if (isNaN(lat) || isNaN(lng)) {
            return res.status(400).json({ message: 'latitude and longitude must be a number'})
        }

        const {data: weatherData} = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHERAPI_KEY}&q=${lat},${lng}`)
        console.log(weatherData);
    const { temp_c } = weatherData?.current;
    const {name, region, country} = weatherData?.location;

const response = {
    clientIp: ip,
    location: region,
    client_name: visitor_name,
    temperature: temp_c

}

return res.status(200).json({message: 'Success', response})
    } catch (error) {
        //console.log(error);
        return res.status(500).json({message:'internal error'})
    }
})

app.listen(port,()=>{
    console.log(`listening on http://localhost:${port}`);
})