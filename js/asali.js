class Asali {
    constructor() {
        this.temperature = 0.;
        this.pressure = 0.;
        this.x = [];
        this.y = [];
        this.names = [];
    }

    reset()
    {
        this.temperature = 0.;
        this.pressure = 0.;
        this.x = [];
        this.y = [];
        this.names = [];
    }

    addMassFraction(name, y)
    {
        if (this.names.includes(name) == false)
        {
            this.names.push(name);
            this.y.push(y);
        }
        else
        {
            var idx = this.names.indexOf(name);
            this.y[idx] = y
        }
        
    }

    addMoleFraction(name, x)
    {
        if (this.names.includes(name) == false)
        {
            this.names.push(name);
            this.x.push(x);
        }
        else
        {
            var idx = this.names.indexOf(name);
            this.x[idx] = x
        }
    }

    setMassFracion(names, y)
    {
        if (names.length != y.length)
        {
            alert("ASALI::ERROR --> Wrong number of mole fractions");
            this.reset()
        }
        else
        {
            this.reset();
            for (let i=0; i<names.length; i++)
            {
                this.y.push(y[i]);
                this.names.push(names[i]);
            }
        }
    }

    setMoleFracion(names, x)
    {
        if (names.length != x.length)
        {
            alert("ASALI::ERROR --> Wrong number of mole fractions");
            this.reset()
        }
        else
        {
            this.reset();
            for (let i=0; i<names.length; i++)
            {
                this.x.push(x[i]);
                this.names.push(names[i]);
            }
        }
    }
}