asali = new Asali();

function asaliSaveTemperature()
{
    asali.temperature = document.getElementById("Input_temperature").value;
    return false;
}
   
function asaliShowTemperature()
{
    document.getElementById('Temperature').innerHTML = asali.temperature;
}