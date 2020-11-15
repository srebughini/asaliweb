class Asali {
    constructor(omega, thermo, transport) {
        this.reset();
        this.omega = omega;
        this.thermo = thermo;
        this.transport = transport;

        //Force definition for testing
        this.T = 393.15
        this.P = 4e05
        this.x = [0.1, 0.2, 0.7];
        this.names = ["H2", "O2", "N2"];
        this.extract_transport_properties("mole");
        this.rho = this.get_mixture_density();
        alert(this.rho)
    }

    reset()
    {
        this.T = 0.;
        this.P = 0.;
        this.MWmix = 0.

        this.x = [];
        this.y = [];
        this.MW = [];
        this.names = [];

        //Bool to reduce calculations
        this.rho_updated_ = false
    }

    extract_transport_properties(input_type)
    {
        for (let i=0; i<this.names.length; i++)
        {
            this.MW.push(this.transport[this.names[i]][6])
        }
        
        if (input_type == "mole")
        {
            this.MWmix = 0.;
            for (let i=0; i<this.names.length; i++)
            {
                this.MWmix = this.MWmix + this.x[i]*this.MW[i];
            }

            for (let i=0; i<this.names.length; i++)
            {
                this.y[i] = this.x[i]*this.MW[i]/this.MWmix;
            }
        }
        else
        {
            this.MWmix = 0.;
            for (let i=0; i<this.names.length; i++)
            {
                this.MWmix = this.MWmix + this.y[i]/this.MW[i];
            }

            for (let i=0; i<this.names.length; i++)
            {
                this.x[i] = this.y[i]/this.MW[i]/this.MWmix;
            }
        }
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

    removeSpecies(name, y)
    {
        if (this.names.includes(name) == true)
        {
            var idx = this.names.indexOf(name);
            this.y.splice(idx,1);
            this.x.splice(idx,1);
            this.names.splice(idx,1);
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
            this.extract_transport_properties("mass");
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
            this.extract_transport_properties("mole");
        }
    }

    get_mixture_density()
    {
        if (this.rho_updated_ == false)
        {
            this.rho = this.P*this.MWmix/(8314.*this.T);
            this.rho_updated_ = true;
        }
        return this.rho
    }

}