asali = new Asali();

function saveTemperatureAndPressure()
{
    asali.temperature = document.getElementById("Input_temperature").value;
    asali.pressure = document.getElementById("Input_pressure").value;
}

function addSpecies()
{
    asali.addMoleFraction(document.getElementById("Input_name").value, document.getElementById("Input_value").value);
}

function removeSpecies()
{
    asali.removeSpecies(document.getElementById("Input_name").value);
}

function clearAllInput()
{
    asali.temperature = 0.;
    asali.pressure = 0.;
    cleanSpecies();
}

function cleanSpecies()
{
    asali.names = [];
    asali.x = [];
}

function showInput()
{
    document.getElementById('Temperature').innerHTML = asali.temperature;
    document.getElementById('Pressure').innerHTML = asali.pressure;

    let e = "<hr/>";   
    
    for (let i=0; i<asali.names.length; i++)
    {
      e += `${asali.names[i]} : ${asali.x[i]}<br/>`;
    }

    document.getElementById('Names').innerHTML = e;
}