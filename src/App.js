import './App.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useEffect, useRef, useState } from 'react';
import "ol/ol.css";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';



function App() {
  const mapRef = useRef()
  const [mapState, setMapState] = useState()
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [showModal, setshowModal] = useState()
  const [iller, setiller] = useState({})
  const [yemekler, setyemekler] = useState({})

  const geoJson = new GeoJSON({ dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" })

  useEffect(() => {
    fetch('/iller.json'
      , {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setiller(myJson);
      });
    fetch('/yemekler.json'
      , {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setyemekler(myJson);
      });
  }, [])

  useEffect(() => {
    let map;
    if (mapRef && iller.features) {
      map = new Map({
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: new VectorSource({
              format: new GeoJSON(),
              features: new GeoJSON().readFeatures(iller, { dataProjection: 'EPSG:4326', featureProjection: "EPSG:3857" }),
            }),
            style: new Style({
              fill: new Fill({
                color: '#73b2e090'
              }),
              stroke: new Stroke({
                color: '#580f2790',
                width: 3
              }),
            })
          }),
          new VectorLayer({
            source: new VectorSource({
              format: new GeoJSON(),
            }),
            style: new Style({
              fill: new Fill({
                color: '#580f27'
              })
            })
          })
        ],
        target: 'map',
        view: new View({
          center: [3935795.1369, 4696142.9211],
          zoom: 7,
        }),
      });
      setMapState(map)
    }

    return () => {
      if (map) {
        map.dispose();
        setMapState();
      }
    }
  }, [mapRef, iller])

  const handleClick = () => {
    setButtonDisabled(true)
    let number;
    let data;
    let interval = setInterval(() => {
      const randomNumber = Math.floor((Math.random() * 81) + 1);
      number = randomNumber;
      const source = mapState.getAllLayers()[2].getSource()
      source.clear();
      data = iller.features.find(obj => obj.id === number);
      const feature = geoJson.readFeature(data)
      source.addFeature(feature);
    }, 200);

    setTimeout(() => {
      setButtonDisabled(false)
      clearInterval(interval)
      const yemek = yemekler.iller.find(obj => obj.il === data.properties.name);
      setshowModal(yemek)
    }, 2000);
  }


  return (
    <div ref={mapRef} id="map" className="map">
      <button disabled={buttonDisabled || showModal} className="btn" onClick={handleClick}>Çarkı Çevir</button>
      {showModal && <div id="myModal" class="modal">
        <div class="modal-content">
          <div onClick={() => { setshowModal() }} class="close">&times;</div>
          <h1>{showModal.il}</h1>
          <div>Tebrikler {showModal.en_unlu_yemek} kazandiniz!!!*</div>
          <div style={{fontSize:"3px"}}>*
Cekilis sadece bilgilendirme amacli olup Huseyin Soyturk makina tekstil gıda sağlık otomotiv mobilya dayanıklı tüketim malları ithalat ve ihracat limited şirketi hicbir sorumluluk almamaktadir.</div>
        </div>
      </div>}
      <div className="copyright" >© Tum hakki Huseyin Soyturk
        makina tekstil gıda sağlık otomotiv mobilya dayanıklı tüketim malları ithalat ve ihracat limited şirketinde saklidir. 2024</div>
    </div>
  );
}

export default App;
