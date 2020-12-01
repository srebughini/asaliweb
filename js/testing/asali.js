const Fractions = Object.freeze({ MOLE: "mole", MASS: "mass" });

const ThermoParameters = (coefficientArray) => {
    let _highTemperatureCoefficients = coefficientArray.slice(0, 7);
    let _lowTemperatureCoefficients = coefficientArray.slice(7, 14);

    function getHighTemperatureCoefficients() {
        return _highTemperatureCoefficients;
    }

    function getLowTemperatureCoefficients() {
        return _lowTemperatureCoefficients;
    }

    return { getHighTemperatureCoefficients, getLowTemperatureCoefficients }
}

const TransportParameters = ({ geometry, LJpotential, LJdiameter, dipole, polar }) => {
    let _geometry = geometry;
    let _LJpotential = LJpotential;
    let _LJdiameter = LJdiameter;
    let _dipole = dipole;
    let _polar = polar;

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

    return { getGeometry, getLJpotential, getLJdiameter, getDipole, getPolar }
}

const GasSpecie = ({ name, molecularWeight, transportParameters, thermoParameters }) => {
    let _name = name;
    let _molecularWeight = molecularWeight;
    let _transportParameters = transportParameters;
    let _thermoParameters = thermoParameters;

    function getName() {
        return _name;
    }

    function getMolecularWeight() {
        return _molecularWeight;
    }

    function getTransportParameters() {
        return _transportParameters;
    }

    function getThermoParameters() {
        return _thermoParameters;
    }

    return { getName, getMolecularWeight, getThermoParameters, getTransportParameters }
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


thermo = ThermoParameters([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17])
transport = TransportParameters({ geometry: 1, LJpotential: 2, LJdiameter: 3, dipole: 2, polar: 0 })

h2_gas = GasSpecie({ name: "H2", molecularWeight: 2., thermoParameters: thermo, transportParameters: transport })
o2_gas = GasSpecie({ name: "O2", molecularWeight: 32., thermoParameters: thermo, transportParameters: transport })
n2_gas = GasSpecie({ name: "N2", molecularWeight: 28., thermoParameters: thermo, transportParameters: transport })

state = GasState({ temperature: 298.15, pressure: 101325 })

compositions = GasMixtureComposition([{ "specie": h2_gas, "value": 0.1 }, { "specie": o2_gas, "value": 0.2 }, { "specie": n2_gas, "value": 0.7 }], "mole")


mixture = GasMixture({ gasState: state, mixtureComposition: compositions })