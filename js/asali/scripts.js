asali = new Asali(omega, thermo, transport);

function saveTemperatureAndPressure() {
    asali.T = document.getElementById("Input_temperature").value;
    asali.P = document.getElementById("Input_pressure").value;
}

function addSpecies() {
    asali.addMoleFraction(document.getElementById("Input_name").value, document.getElementById("Input_value").value);
}

function removeSpecies() {
    asali.removeSpecies(document.getElementById("Input_name").value);
}

function clearAllInput() {
    asali.T = 0.;
    asali.P = 0.;
    cleanSpecies();
}

function cleanSpecies() {
    asali.names = [];
    asali.x = [];
}

function showInput() {
    document.getElementById('Temperature').innerHTML = asali.T;
    document.getElementById('Pressure').innerHTML = asali.P;

    let e = "<hr/>";

    for (let i = 0; i < asali.names.length; i++) {
        e += `${asali.names[i]} : ${asali.x[i]}<br/>`;
    }

    document.getElementById('Names').innerHTML = e;
}