import {GasSpecie, GasState, GasMixtureComposition, GasMixture} from "./modules/jasali.js"

let state = GasState({ temperature: 393.15, pressure: 4e05})

let speciesList = [{"specie": GasSpecie({name: "H2", gasState: state}),"value": 0.1},
                    {"specie": GasSpecie({name: "O2", gasState: state}),"value": 0.2},
                    {"specie": GasSpecie({name: "N2", gasState: state}),"value": 0.7}]


let compositions = GasMixtureComposition(speciesList, "mole")
let mixture = GasMixture({ gasState: state, mixtureComposition: compositions })

console.log(["Molecular weigth", mixture.getMolecularWeight(), "g/mol"])
console.log(["Viscosity       ", mixture.getViscosity(), "Pas"])
console.log(["Specific heat   ", mixture.getMolarSpecificHeat(), "J/kmol/K"])
console.log(["Specific heat   ", mixture.getMassSpecificHeat(), "J/kg/K"])
console.log(["Enthalpy        ", mixture.getMolarEnthalpy(), "J/kmol"])
console.log(["Enthalpy        ", mixture.getMassEnthalpy(), "J/kg"])
console.log(["Entropy         ", mixture.getMolarEntropy(), "J/kmol/K"])
console.log(["Entropy         ", mixture.getMassEntropy(), "J/kg/K"])

let species = mixture.getSpecies();
console.log("Molecular weight [g/mol]")
for (let i=0;i<species.length;i++)
{
    let specie = species[i];

    console.log([specie.getName(),specie.getMolecularWeight()]);
}

console.log("Viscosity [Pass]")
for (let i=0;i<species.length;i++)
{
    let specie = species[i];

    console.log([specie.getName(),specie.getViscosity()]);
}

console.log("Specific heat [J/kg/K]")
for (let i=0;i<species.length;i++)
{
    let specie = species[i];

    console.log([specie.getName(),specie.getMassSpecificHeat()]);
}

console.log("Enthalpy [J/kg]")
for (let i=0;i<species.length;i++)
{
    let specie = species[i];

    console.log([specie.getName(),specie.getMassEnthalpy()]);
}

console.log("Entropy [J/kg/K]")
for (let i=0;i<species.length;i++)
{
    let specie = species[i];

    console.log([specie.getName(),specie.getMassEntropy()]);
}
