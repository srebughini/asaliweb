import ThermoParameters from "./thermo.js"
import TransportParameters from "./transport.js"
import {CollisionIntegral11, CollisionIntegral22} from "./omega.js"
import {Fractions, Parameters, AsaliError} from "./utils.js"


export function GasState({ temperature, pressure }) {
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

export function GasSpecie({ name, gasState }) {
    let _thermo = ThermoParameters();
    let _transport = TransportParameters();
    let _name = name;
    let _temperature = gasState.getTemperature();
    let _pressure = gasState.getPressure();
    let _highTemperatureCoefficients = _thermo.getHighTemperatureCoefficients(_name);
    let _lowTemperatureCoefficients = _thermo.getLowTemperatureCoefficients(_name);
    let _geometry = _transport.getGeometry(_name);
    let _LJpotential = _transport.getLJpotential(_name);
    let _LJdiameter = _transport.getLJdiameter(_name);
    let _dipole = _transport.getDipole(_name);
    let _polar = _transport.getPolar(_name);
    let _collision = _transport.getCollision(_name);
    let _molecularWeight = _transport.getMolecularWeight(_name);

    //Bools for speed up
    let _cp_update = true;
    let _h_update = true;
    let _s_update = true;
    let _mu_update = true;

    //Reset bools
    function _resetBools() {
        _cp_update = true;
        _h_update = true;
        _s_update = true;
        _mu_update = true;
    }

    //Update gas state
    function updateGasState(gasState) {
        _temperature = gasState.getTemperature();
        _pressure = gasState.getPressure();
        _resetBools();
        return this;
    }

    //Specific heat
    let _cpMole = 0.;
    let _cpMass = 0.;
    function _calculateSpecificHeat() {
        if (_cp_update) {
            let _coefficients = _highTemperatureCoefficients;

            if (_temperature < 1000) {
                _coefficients = _lowTemperatureCoefficients;
            }

            _cpMole = _coefficients[0]
                + _coefficients[1] * _temperature
                + _coefficients[2] * Math.pow(_temperature, 2.)
                + _coefficients[3] * Math.pow(_temperature, 3.)
                + _coefficients[4] * Math.pow(_temperature, 4.);

            _cpMole = _cpMole * Parameters.R;
            _cpMass = _cpMole / _molecularWeight; //J/Kg/K

            _cp_update = false;
        }
    }

    function getMolarSpecificHeat() {
        _calculateSpecificHeat();
        return _cpMole;
    }

    function getMassSpecificHeat() {
        _calculateSpecificHeat();
        return _cpMass;
    }

    //Enthalpy
    let _hMole = 0.;
    let _hMass = 0.;
    function _calculateEnthalpy() {
        if (_h_update) {
            let _coefficients = _highTemperatureCoefficients;

            if (_temperature < 1000) {
                _coefficients = _lowTemperatureCoefficients;
            }

            _hMole = _coefficients[0]
                + _coefficients[1] * _temperature / 2.
                + _coefficients[2] * Math.pow(_temperature, 2.) / 3.
                + _coefficients[3] * Math.pow(_temperature, 3.) / 4.
                + _coefficients[4] * Math.pow(_temperature, 4.) / 5.
                + _coefficients[5] / _temperature;

            _hMole = _hMole * Parameters.R * _temperature;
            _hMass = _hMole / _molecularWeight; //J/Kg

            _h_update = false;
        }
    }

    function getMolarEnthalpy() {
        _calculateEnthalpy();
        return _hMole;
    }

    function getMassEnthalpy() {
        _calculateEnthalpy();
        return _hMass;
    }

    //Entropy
    let _sMole = 0.;
    let _sMass = 0.;
    function _calculateEntropy() {
        if (_s_update) {
            let _coefficients = _highTemperatureCoefficients;

            if (_temperature < 1000) {
                _coefficients = _lowTemperatureCoefficients;
            }

            _sMole = _coefficients[0] * Math.log(_temperature)
                + _coefficients[1] * _temperature
                + _coefficients[2] * Math.pow(_temperature, 2.) / 2.
                + _coefficients[3] * Math.pow(_temperature, 3.) / 3.
                + _coefficients[4] * Math.pow(_temperature, 4.) / 4.
                + _coefficients[6];

            _sMole = _sMole * Parameters.R;
            _sMass = _sMole / _molecularWeight; //J/Kg/K

            _s_update = false;
        }
    }

    function getMolarEntropy() {
        _calculateEntropy();
        return _sMole;
    }

    function getMassEntropy() {
        _calculateEntropy();
        return _sMass;
    }


    //Viscosity
    let _mu = 0.;

    function _calculateViscosity() 
    {
        if (_mu_update) 
        {
            let tr = _temperature / _LJpotential;
            let dr = 1.e06 * 0.5 * Math.pow(_dipole, 2.) / (_LJpotential * Parameters.k * Math.pow(_LJdiameter, 3.)); 
            let sigma = CollisionIntegral22(tr, dr);
            _mu = 1e-05 * (5 / 16) * Math.sqrt(Parameters.pi * Parameters.k * _temperature * _molecularWeight * 1.66054) / (Parameters.pi * sigma * Math.pow(_LJdiameter, 2));
            _mu_update = false;
        }
    }

    function getViscosity() {
        _calculateViscosity();
        return _mu;
    }

    function getName() {
        return _name;
    }

    function getMolecularWeight() {
        return _molecularWeight;
    }

    /*function getHighTemperatureCoefficients() {
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
    }*/

    return {
        updateGasState,
        getName,
        getMolecularWeight,
        getMolarSpecificHeat,
        getMassSpecificHeat,
        getMolarEnthalpy,
        getMassEnthalpy,
        getMolarEntropy,
        getMassEntropy, 
        getViscosity
    }
}

export function GasMixtureComposition(compositionArray, compositionType) {
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

    if ( Math.abs(_moleFraction.reduce((a, b) => a + b, 0) - 1.) > 1e-16)
    {
        AsaliError("Composition sum != 1");
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

export function GasMixture({ gasState, mixtureComposition }) {
    //Bools for speed up
    let _cp_update = true;
    let _h_update = true;
    let _s_update = true;
    let _mu_update = true;

    //Species gas state
    let _species = mixtureComposition.getSpecies();
    let _numberOfSpecies = mixtureComposition.getNumberOfSpecies();
    _species.map(specie => specie.updateGasState(gasState))

    function getSpecies() {
        return _species;
    }

    //Composition
    let _speciesMolecularWeight = _species.map(specie => specie.getMolecularWeight())
    let _moleFraction = mixtureComposition.getMoleFraction();
    let _massFraction = mixtureComposition.getMassFraction();

    function getMassFraction() {
        return _massFraction;
    }

    function getMoleFraction() {
        return _moleFraction;
    }

    //Mixture molecular weight
    let _molecularWeight = mixtureComposition.getMolecularWeight();

    function getMolecularWeight() {
        return _molecularWeight;
    }

    //Specific heat
    let _cpMole = _species.map(specie => specie.getMolarSpecificHeat())
    let _cpMass = _species.map(specie => specie.getMassSpecificHeat())
    let _cpMixMole = 0.;
    let _cpMixMass = 0.;

    function _calculateSpecificHeat() {
        if (_cp_update) {
            _cpMixMole = 0.;
            _cpMixMass = 0.;
            for (let i = 0; i < _numberOfSpecies; i++) {
                _cpMixMole = _cpMixMole + _cpMole[i] * _moleFraction[i];
                _cpMixMass = _cpMixMass + _cpMass[i] * _massFraction[i];
            }
            _cp_update = false;
        }
    }

    function getMolarSpecificHeat() {
        _calculateSpecificHeat();
        return _cpMixMole;
    }

    function getMassSpecificHeat() {
        _calculateSpecificHeat();
        return _cpMixMass;
    }

    //Enthalpy
    let _hMole = _species.map(specie => specie.getMolarEnthalpy())
    let _hMass = _species.map(specie => specie.getMassEnthalpy())
    let _hMixMole = 0.;
    let _hMixMass = 0.;

    function _calculateEnthalpy() {
        if (_h_update) {
            _hMixMole = 0.;
            _hMixMass = 0.;
            for (let i = 0; i < _numberOfSpecies; i++) {
                _hMixMole = _hMixMole + _hMole[i] * _moleFraction[i];
                _hMixMass = _hMixMass + _hMass[i] * _massFraction[i];
            }
            _h_update = false;
        }
    }

    function getMolarEnthalpy() {
        _calculateEnthalpy();
        return _hMixMole;
    }

    function getMassEnthalpy() {
        _calculateEnthalpy();
        return _hMixMass;
    }

    //Entropy
    let _sMole = _species.map(specie => specie.getMolarEntropy())
    let _sMass = _species.map(specie => specie.getMassEntropy())
    let _sMixMole = 0.;
    let _sMixMass = 0.;

    function _calculateEntropy() {
        if (_s_update) {
            _sMixMole = 0.;
            _sMixMass = 0.;
            for (let i = 0; i < _numberOfSpecies; i++) {
                _sMixMole = _sMixMole + _sMole[i] * _moleFraction[i];
                _sMixMass = _sMixMass + _sMass[i] * _massFraction[i];
            }
            _s_update = false;
        }
    }

    function getMolarEntropy() {
        _calculateEntropy();
        return _sMixMole;
    }

    function getMassEntropy() {
        _calculateEntropy();
        return _sMixMass;
    }

    //Viscosity
    let _mu = _species.map(specie => specie.getViscosity());
    let _muMix = 0.;
    
    function _calculateViscosity() 
    {
        if (_mu_update) 
        {
            _muMix = 0.;
            let sum = 0.;
            let phi = 0.;
            for (let k = 0; k < _numberOfSpecies; k++) {
                sum = 0.;
                for (let j = 0; j < _numberOfSpecies; j++) {
                    phi = (1. / Math.sqrt(8.)) * (1. / Math.sqrt(1. + _speciesMolecularWeight[k] / _speciesMolecularWeight[j]))  * Math.pow((1. + Math.sqrt(_mu[k] / _mu[j]) * Math.pow(_speciesMolecularWeight[j] / _speciesMolecularWeight[k], (1. / 4.))), 2.);
                    sum = sum + _moleFraction[j] * phi;
                }
                _muMix = _muMix + _moleFraction[k] * _mu[k] / sum;
            }
            _mu_update = false;
        }
    }

    function getViscosity() {
        _calculateViscosity();
        return _muMix;
    }

    return {
        getSpecies,
        getMassFraction,
        getMoleFraction,
        getMolecularWeight,
        getMolarSpecificHeat,
        getMassSpecificHeat,
        getMolarEnthalpy,
        getMassEnthalpy,
        getMolarEntropy,
        getMassEntropy,
        getViscosity
    }
}