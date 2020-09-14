class Asali {
    constructor() {
        this._temperature = 0.;
    }
    get temperature() {
        return this._temperature;
    }
    
    set temperature(temperature) {
        this._temperature = temperature;
    }
}

function set_temperature(asali, temperature){
    asali.temperature = temperature;
    return asali.temperature;
}