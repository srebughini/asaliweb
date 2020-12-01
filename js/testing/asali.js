var OMEGA_FILE_PATH = "js/testing/data/omega.json"
var THERMO_FILE_PATH = "js/testing/data/thermo.json"
var TRANSPORT_FILE_PATH = "js/testing/data/transport.json"

/*
function loadJsonFile(callback, jsonFilePath) {
    let requestObj = new XMLHttpRequest();
    requestObj.overrideMimeType("application/json");
    requestObj.open('GET', jsonFilePath, true);
    requestObj.onload = function (e) {
        if (requestObj.readyState === 4) {
          if (requestObj.status === 200) {
            callback(requestObj.responseText);
          } else {
            console.error(requestObj.statusText);
          }
        }
      };
      requestObj.onerror = function (e) {
        console.error(requestObj.statusText);
      };

    requestObj.send(null);
    //return JSON.parse(requestObj.responseText);
}

function stringToJson(message) {
    return JSON.parse(this.responseText);
}
*/

function loadJsonFile(url, callback /*, opt_arg1, opt_arg2, ... */) {
    var xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.callback = callback;
    xhr.arguments = Array.prototype.slice.call(arguments, 2);
    xhr.onload = function () { this.callback.apply(this, this.arguments); };
    xhr.onerror = function () { console.error(this.statusText); };
    xhr.open("GET", url, true);
    xhr.send(null);
}

const Fractions = Object.freeze({ MOLE: "mole", MASS: "mass" });

const ThermoParameters = () => {
    let _thermoDict = {}

    loadJsonFile(THERMO_FILE_PATH, _setThermoDict);

    function _setThermoDict()
    {
        _thermoDict = this.responseText;
    }

    function getHighTemperatureCoefficients(gasSpecieName) {
        return _thermoDict[gasSpecieName].slice(0, 7);
    }

    function getLowTemperatureCoefficients(gasSpecieName) {
        return _thermoDict[gasSpecieName].slice(7, 14);
    }

    return { getHighTemperatureCoefficients, getLowTemperatureCoefficients }
}

const TransportParameters = () => {
    let _transportDict = {}
    loadJsonFile(TRANSPORT_FILE_PATH, _setTransportDict);
    
    function _setTransportDict()
    {
        _transportDict = this.responseText;
    }

    async function getGeometry(gasSpecieName) {
        return _transportDict[gasSpecieName][0];
    }

    async function getLJpotential(gasSpecieName) {
        return _transportDict[gasSpecieName][1];
    }

    async function getLJdiameter(gasSpecieName) {
        return _transportDict[gasSpecieName][2];
    }

    async function getDipole(gasSpecieName) {
        return _transportDict[gasSpecieName][3];
    }

    async function getPolar(gasSpecieName) {
        return _transportDict[gasSpecieName][4];
    }

    async function getCollision(gasSpecieName) {
        return _transportDict[gasSpecieName][5];
    }

    async function getMolecularWeight(gasSpecieName) {
        return _transportDict[gasSpecieName][6];
    }

    return { getGeometry, getLJpotential, getLJdiameter, getDipole, getPolar, getCollision, getMolecularWeight }
}

const GasSpecie = ({ name, transportParameters, thermoParameters }) => {
    let _name = name;
    let _highTemperatureCoefficients = thermoParameters.getHighTemperatureCoefficients(_name);
    let _lowTemperatureCoefficients = thermoParameters.getLowTemperatureCoefficients(_name);
    let _geometry = transportParameters.getGeometry(_name);
    let _LJpotential = transportParameters.getLJpotential(_name);
    let _LJdiameter = transportParameters.getLJdiameter(_name);
    let _dipole = transportParameters.getDipole(_name);
    let _polar = transportParameters.getPolar(_name);
    let _collision = transportParameters.getCollision(_name);
    let _molecularWeight = transportParameters.getMolecularWeight(_name);

    function getName() {
        return _name;
    }

    function getMolecularWeight() {
        return _molecularWeight;
    }

    function getHighTemperatureCoefficients() {
        return _highTemperatureCoefficients;
    }

    function getLowTemperatureCoefficients() {
        return _lowTemperatureCoefficients;
    }

    function getGeometry() {
        return _geometry;
    }

    function getLJpotential() {
        return _LJpotential;
    }

    function getLJdiameter() {
        return _LJdiameter;
    }

    function getDipole() {
        return _dipole;
    }

    function getPolar() {
        return _polar;
    }

    function getCollision() {
        return _collision;
    }

    return { getName, getMolecularWeight, getHighTemperatureCoefficients, getLowTemperatureCoefficients, getGeometry, getLJpotential, getLJdiameter, getDipole, getPolar, getCollision }
}

const GasState = ({ temperature, pressure }) => {
    let _temperature = temperature;
    let _pressure = pressure;

    function getTemperature() {
        return _temperature;
    }

    function getPressure() {
        return _pressure;
    }

    return { getTemperature, getPressure }
}

const GasMixtureComposition = (compositionArray, compositionType) => {
    let _compositionType = compositionType;
    let _numberOfSpecies = compositionArray.length;
    let _species = compositionArray.map(compositionDictionary => compositionDictionary.specie);
    let _moleFraction = new Array(_numberOfSpecies);
    let _massFraction = new Array(_numberOfSpecies);
    let _molecularWeight = 0.

    if (_compositionType == Fractions.MOLE) {
        _moleFraction = compositionArray.map(compositionDictionary => compositionDictionary.value);
        _molecularWeight = compositionArray.map(compositionDictionary => compositionDictionary.value * compositionDictionary.specie.getMolecularWeight()).reduce((a, b) => a + b, 0);
        _massFraction = compositionArray.map(compositionDictionary => compositionDictionary.value * compositionDictionary.specie.getMolecularWeight() / _molecularWeight);
    }
    else if (_compositionType == Fractions.MASS) {
        _massFraction = compositionArray.map(compositionDictionary => compositionDictionary.value);
        _molecularWeight = compositionArray.map(compositionDictionary => compositionDictionary.value / compositionDictionary.specie.getMolecularWeight()).reduce((a, b) => a + b, 0);
        _moleFraction = compositionArray.map(compositionDictionary => compositionDictionary.value / compositionDictionary.specie.getMolecularWeight() / _mixtureMolecularWeight);
    }

    function getCompositionType() {
        return _compositionType;
    }

    function getCompositionDictionary() {
        return _compositionDictionary;
    }

    function getMassFraction() {
        return _massFraction;
    }

    function getMoleFraction() {
        return _moleFraction;
    }

    function getNumberOfSpecies() {
        return _numberOfSpecies;
    }

    function getSpecies() {
        return _species;
    }

    function getMolecularWeight() {
        return _molecularWeight;
    }

    return { getCompositionDictionary, getCompositionType, getMassFraction, getMoleFraction, getNumberOfSpecies, getSpecies, getMolecularWeight }
}

const GasMixture = ({ gasState, mixtureComposition }) => {
    let _temperature = gasState.getTemperature();
    let _pressure = gasState.getPressure();
    let _species = mixtureComposition.getSpecies();
    let _numberOfSpecies = mixtureComposition.getNumberOfSpecies();
    let _moleFraction = mixtureComposition.getMoleFraction();
    let _massFraction = mixtureComposition.getMassFraction();
    let _mixtureMolecularWeight = mixtureComposition.getMolecularWeight();


    return {}
}

thermo = ThermoParameters()
transport = TransportParameters()


console.log(thermo.getHighTemperatureCoefficients("H2"))

/*
h2_gas = GasSpecie({ name: "H2", thermoParameters: thermo, transportParameters: transport })
o2_gas = GasSpecie({ name: "O2", thermoParameters: thermo, transportParameters: transport })
n2_gas = GasSpecie({ name: "N2", thermoParameters: thermo, transportParameters: transport })

console.log(h2_gas.getMolecularWeight())
console.log(n2_gas.getMolecularWeight())
console.log(o2_gas.getHighTemperatureCoefficients())


state = GasState({ temperature: 298.15, pressure: 101325 })

compositions = GasMixtureComposition([{ "specie": h2_gas, "value": 0.1 }, { "specie": o2_gas, "value": 0.2 }, { "specie": n2_gas, "value": 0.7 }], "mole")


mixture = GasMixture({ gasState: state, mixtureComposition: compositions })*/