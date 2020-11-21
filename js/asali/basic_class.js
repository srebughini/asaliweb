class Asali {
    constructor(omega, thermo, transport) {
        this.reset_properties();
        this.reset_bools();
        this.omega_ = omega;
        this.thermo_ = thermo;
        this.transport_ = transport;
        this.pi_ = 3.14159265358979323846;

        //Force definition for testing
        /*
        this.T = 393.15
        this.P = 4e05
        this.x = [0.1, 0.2, 0.7];
        this.names = ["H2", "O2", "N2"];
        this.initialize_properties_from_data("mole");
        this.get_mixture_density();
        this.get_species_viscosity();
        this.get_binary_diffusion();
        this.get_species_mass_specific_heat();
        this.get_species_thermal_conducitivity();
        this.get_species_mass_enthalpy();
        this.get_species_mass_entropy();
        this.get_mixture_thermal_conductivity();
        this.get_mixture_viscosity();
        this.get_mixture_diffusion();
        this.get_species_arithmetic_mean_gas_velocity();
        this.get_species_mean_free_path();
        this.get_mixture_mass_specific_heat();
        this.get_mixture_mass_enthalpy();
        this.get_mixture_mass_entropy();
        console.log(this.rho);
        console.log(this.mu);
        console.log(this.diff);
        console.log(this.cpmass);
        console.log(this.cond);
        console.log(this.hmass);
        console.log(this.smole);
        console.log(this.cond_mix);
        console.log(this.mu_mix);
        console.log(this.diff_mix);
        console.log(this.v);
        console.log(this.l);
        console.log(this.cpmass_mix);
        console.log(this.hmass_mix);
        console.log(this.smass_mix);*/
    }

    reset_properties() {
        this.T = 0.;
        this.P = 0.;
        this.MWmix = 0.;
        this.cond_mix = 0.;
        this.mu_mix = 0.;
        this.cpmole_mix = 0.;
        this.cpmass_mix = 0.;
        this.hmole_mix = 0.;
        this.hmass_mix = 0.;
        this.smole_mix = 0.;
        this.smass_mix = 0.;

        this.names = [];

        this.x = [];
        this.y = [];
        this.MW = [];
        this.mu = [];
        this.diff = [];
        this.cpmass = [];
        this.cpmole = [];
        this.hmass = [];
        this.hmole = [];
        this.smass = [];
        this.smole = [];
        this.cond = [];
        this.low = [];
        this.high = [];
        this.diff_mix = [];
        this.v = [];
        this.l = [];

        this.geometry = [];
        this.LJpotential = [];
        this.LJdiameter = [];
        this.dipole = [];
        this.polar = [];
        this.collision = [];
    }


    reset_bools() {
        //Bool to reduce calculations
        this.rho_updated_ = false;
        this.mu_updated_ = false;
        this.diff_updated_ = false;
        this.cp_update_ = false;
        this.h_update_ = false;
        this.s_update_ = false;
        this.cond_update_ = false;
        this.v_update_ = false;
        this.l_update_ = false;
        this.cond_mix_update_ = false;
        this.mu_mix_update_ = false;
        this.diff_mix_update_ = false;
        this.cp_mix_update_ = false;
        this.h_mix_update_ = false;
        this.s_mix_update_ = false;
    }

    initialize_properties_from_data(input_type) {
        this.reset_bools();
        for (let i = 0; i < this.names.length; i++) {
            this.geometry.push(this.transport_[this.names[i]][0]);
            this.LJpotential.push(this.transport_[this.names[i]][1]);
            this.LJdiameter.push(this.transport_[this.names[i]][2]);
            this.dipole.push(this.transport_[this.names[i]][3]);
            this.polar.push(this.transport_[this.names[i]][4]);
            this.collision.push(this.transport_[this.names[i]][5]);
            this.MW.push(this.transport_[this.names[i]][6]);

            this.high.push(this.thermo_[this.names[i]].slice(0, 7));
            this.low.push(this.thermo_[this.names[i]].slice(7, this.thermo_[this.names[i]].length));

            this.mu.push(0.);
            this.cpmass.push(0.);
            this.cpmole.push(0.);
            this.hmass.push(0.);
            this.hmole.push(0.);
            this.smass.push(0.);
            this.smole.push(0.);
            this.cond.push(0.);
            this.v.push(0.);
            this.l.push(0.);
            this.diff_mix.push(0.);
            this.diff.push(new Array(this.names.length));
        }

        if (input_type == "mole") {
            this.MWmix = 0.;
            for (let i = 0; i < this.names.length; i++) {
                this.MWmix = this.MWmix + this.x[i] * this.MW[i];
            }

            for (let i = 0; i < this.names.length; i++) {
                this.y[i] = this.x[i] * this.MW[i] / this.MWmix;
            }
        }
        else {
            this.MWmix = 0.;
            for (let i = 0; i < this.names.length; i++) {
                this.MWmix = this.MWmix + this.y[i] / this.MW[i];
            }

            for (let i = 0; i < this.names.length; i++) {
                this.x[i] = this.y[i] / this.MW[i] / this.MWmix;
            }
        }
    }

    collision_integrals(integral_type, Tr, dr) {
        var Ta = -1;
        var Tb = -1;
        var x = [0., 0., 0., 0.];
        var b = [0., 0., 0., 0.];

        var omega = this.omega_[integral_type];

        if (Tr <= omega.t[0]) {
            Ta = 0;
            Tb = 1;
        }
        else if (Tr >= omega.t[omega.t.length - 1]) {
            Ta = omega.t.length - 2;
            Tb = omega.t.length - 1;
        }
        else {
            for (let j = 0; j < omega.t.length - 1; j++) {
                if (Tr >= omega.t[j] && Tr < omega.t[j + 1]) {
                    Ta = j;
                    Tb = j + 1;
                    break;
                }
            }
        }

        var da = -1;
        var db = -1;

        if (dr <= omega.d[0]) {
            da = 0;
            db = 1;
        }
        else if (dr >= omega.d[omega.d.length - 1]) {
            da = omega.d.length - 2;
            db = omega.d.length - 1;
        }
        else {
            for (let j = 0; j < omega.d.length - 1; j++) {
                if (dr >= omega.d[j] && dr < omega.d[j + 1]) {
                    da = j;
                    db = j + 1;
                    break;
                }
            }
        }

        b[0] = omega.matrix[Ta][da];
        b[1] = omega.matrix[Ta][db];
        b[2] = omega.matrix[Tb][da];
        b[3] = omega.matrix[Tb][db];

        x[3] = (b[0] - b[1] - b[2] + b[3]) / (omega.t[Ta] * omega.d[da] - omega.t[Ta] * omega.d[db] - omega.t[Tb] * omega.d[da] + omega.t[Tb] * omega.d[db]);

        x[2] = (-x[3] * (omega.t[Ta] * omega.d[da] - omega.t[Ta] * omega.d[db]) - b[1] + b[0]) / (omega.d[da] - omega.d[db]);

        x[1] = (-x[3] * (omega.t[Ta] * omega.d[da] - omega.t[Tb] * omega.d[da]) - b[2] + b[0]) / (omega.t[Ta] - omega.t[Tb]);

        x[0] = -x[1] * omega.t[Ta] - x[2] * omega.d[da] - x[3] * omega.t[Ta] * omega.d[da] + b[0];

        return x[0] + x[1] * Tr + x[2] * dr + x[3] * Tr * dr;
    }

    addMassFraction(name, y) {
        if (this.names.includes(name) == false) {
            this.names.push(name);
            this.y.push(y);
        }
        else {
            var idx = this.names.indexOf(name);
            this.y[idx] = y
        }

        this.initialize_properties_from_data("mass");
    }

    addMoleFraction(name, x) {
        if (this.names.includes(name) == false) {
            this.names.push(name);
            this.x.push(x);
        }
        else {
            var idx = this.names.indexOf(name);
            this.x[idx] = x
        }
        this.initialize_properties_from_data("mole");
    }

    removeSpecies(name, y) {
        if (this.names.includes(name) == true) {
            var idx = this.names.indexOf(name);
            this.y.splice(idx, 1);
            this.x.splice(idx, 1);
            this.names.splice(idx, 1);
        }
        this.initialize_properties_from_data("mole");
    }

    setMassFracion(names, y) {
        if (names.length != y.length) {
            alert("ASALI::ERROR --> Wrong number of mole fractions");
            this.reset()
        }
        else {
            this.reset();
            for (let i = 0; i < names.length; i++) {
                this.y.push(y[i]);
                this.names.push(names[i]);
            }
            this.initialize_properties_from_data("mass");
        }
    }

    setMoleFracion(names, x) {
        if (names.length != x.length) {
            alert("ASALI::ERROR --> Wrong number of mole fractions");
            this.reset()
        }
        else {
            this.reset();
            for (let i = 0; i < names.length; i++) {
                this.x.push(x[i]);
                this.names.push(names[i]);
            }
            this.initialize_properties_from_data("mole");
        }
    }

    setTemperature(T) {
        if (this.T != T) {
            this.T = T;
            this.reset_bools();
        }
    }

    setPressure(P) {
        if (this.P != P) {
            this.P = P;
            this.reset_bools();
        }
    }

    calculate_specific_heat() {
        if (this.cp_update_ == false) {
            for (let i = 0; i < this.names.length; i++) {
                if (this.T < 1000.) {
                    this.cpmole[i] = this.low[i][0]
                        + this.low[i][1] * this.T
                        + this.low[i][2] * Math.pow(this.T, 2.)
                        + this.low[i][3] * Math.pow(this.T, 3.)
                        + this.low[i][4] * Math.pow(this.T, 4.);
                }
                else {
                    this.cpmole[i] = this.high[i][0]
                        + this.high[i][1] * this.T
                        + this.high[i][2] * Math.pow(this.T, 2.)
                        + this.high[i][3] * Math.pow(this.T, 3.)
                        + this.high[i][4] * Math.pow(this.T, 4.);
                }

                this.cpmole[i] = this.cpmole[i] * 8314.;  //J/Kmol/K
                this.cpmass[i] = this.cpmole[i] / this.MW[i]; //J/Kg/K
            }
            this.cp_update_ = true;
        }
    }

    calculate_enthalpy() {
        if (this.h_update_ == false) {
            for (let i = 0; i < this.names.length; i++) {
                if (this.T < 1000.) {
                    this.hmole[i] = this.low[i][0]
                        + this.low[i][1] * this.T / 2.
                        + this.low[i][2] * Math.pow(this.T, 2.) / 3.
                        + this.low[i][3] * Math.pow(this.T, 3.) / 4.
                        + this.low[i][4] * Math.pow(this.T, 4.) / 5.
                        + this.low[i][5] / this.T;
                }
                else {
                    this.hmole[i] = this.high[i][0]
                        + this.high[i][1] * this.T / 2.
                        + this.high[i][2] * Math.pow(this.T, 2.) / 3.
                        + this.high[i][3] * Math.pow(this.T, 3.) / 4.
                        + this.high[i][4] * Math.pow(this.T, 4.) / 5.
                        + this.high[i][5] / this.T;
                }

                this.hmole[i] = this.hmole[i] * 8314. * this.T;  //J/Kmol
                this.hmass[i] = this.hmole[i] / this.MW[i]; //J/Kg
            }
            this.h_update_ = true;
        }
    }

    calculate_entropy() {
        if (this.s_update_ == false) {
            for (let i = 0; i < this.names.length; i++) {
                if (this.T < 1000.) {
                    this.smole[i] = this.low[i][0] * Math.log(this.T)
                        + this.low[i][1] * this.T
                        + this.low[i][2] * Math.pow(this.T, 2.) / 2.
                        + this.low[i][3] * Math.pow(this.T, 3.) / 3.
                        + this.low[i][4] * Math.pow(this.T, 4.) / 4.
                        + this.low[i][6];
                }
                else {
                    this.smole[i] = this.high[i][0] * Math.log(this.T)
                        + this.high[i][1] * this.T
                        + this.high[i][2] * Math.pow(this.T, 2.) / 2.
                        + this.high[i][3] * Math.pow(this.T, 3.) / 3.
                        + this.high[i][4] * Math.pow(this.T, 4.) / 4.
                        + this.high[i][6];
                }

                this.smole[i] = this.smole[i] * 8314.;  //J/Kmol/K
                this.smass[i] = this.smole[i] / this.MW[i]; //J/Kg/K
            }
            this.s_update_ = true;
        }
    }

    calculate_mixture_specific_heat() {
        if (this.cp_mix_update_ == false) {
            this.calculate_specific_heat();
            this.cpmole_mix = 0;
            this.cpmass_mix = 0;

            for (let i = 0; i < this.names.length; i++) {
                this.cpmole_mix = this.cpmole_mix + this.x[i] * this.cpmole[i];
                this.cpmass_mix = this.cpmass_mix + this.y[i] * this.cpmass[i];
            }
            this.cp_mix_update_ = true;
        }
    }

    calculate_mixture_enthalpy() {
        if (this.h_mix_update_ == false) {
            this.calculate_enthalpy();
            this.hmole_mix = 0;
            this.hmass_mix = 0;

            for (let i = 0; i < this.names.length; i++) {
                this.hmole_mix = this.hmole_mix + this.x[i] * this.hmole[i];
                this.hmass_mix = this.hmass_mix + this.y[i] * this.hmass[i];
            }
            this.h_mix_update_ = true;
        }
    }

    calculate_mixture_entropy() {
        if (this.s_mix_update_ == false) {
            this.calculate_entropy();
            this.smole_mix = 0;
            this.smass_mix = 0;

            for (let i = 0; i < this.names.length; i++) {
                this.smole_mix = this.smole_mix + this.x[i] * this.smole[i];
                this.smass_mix = this.smass_mix + this.y[i] * this.smass[i];
            }
            this.s_mix_update_ = true;
        }
    }

    get_mixture_density() {
        if (this.rho_updated_ == false) {
            this.rho = this.P * this.MWmix / (8314. * this.T);
            this.rho_updated_ = true;
        }
        return this.rho
    }

    get_species_viscosity() {
        if (this.mu_updated_ == false) {
            var Tr = 0.;
            var dr = 0.;
            var sigma = 0.;
            for (let i = 0; i < this.names.length; i++) {
                Tr = this.T / this.LJpotential[i];
                dr = 0.5 * Math.pow(this.dipole[i], 2.) / (this.LJpotential[i] * 1.3806488 * Math.pow(this.LJdiameter[i], 3.));
                dr = 1.e06 * dr
                sigma = this.collision_integrals("22", Tr, dr);
                this.mu[i] = (5 / 16) * Math.sqrt(this.pi_ * 1.3806488 * this.T * this.MW[i] * 1.66054) / (this.pi_ * sigma * Math.pow(this.LJdiameter[i], 2));
                this.mu[i] = this.mu[i] * 1e-05;
            }
            this.mu_updated_ = true;
        }
        return this.mu;
    }

    get_binary_diffusion() {
        if (this.diff_updated_ == false) {
            var MWmix = 0.;
            var LJpotentialmix = 0.;
            var LJdiametermix = 0.;
            var dipolemix = 0.;
            var polarn = 0.;
            var dipolep = 0.;
            var chi = 0.;
            var sigma = 0.;
            var Tr = 0.;
            var dr = 0.;

            for (let i = 0; i < this.names.length; i++) {
                for (let j = 0; j < i; j++) {
                    this.diff[i][j] = this.diff[j][i];
                }

                for (let j = i; j < this.names.length; j++) {
                    MWmix = this.MW[i] * this.MW[j] / (this.MW[i] + this.MW[j]);
                    if (this.polar[i] == 0 && this.polar[j] == 0) {
                        LJpotentialmix = Math.sqrt(this.LJpotential[i] * this.LJpotential[j]);
                        LJdiametermix = 0.5 * (this.LJdiameter[i] + this.LJdiameter[j]);
                        dipolemix = Math.sqrt(this.dipole[i] * this.dipole[j]);
                    }
                    else if (this.polar[i] > 0 && this.polar[j] > 0) {
                        LJpotentialmix = Math.sqrt(this.LJpotential[i] * this.LJpotential[j]);
                        LJdiametermix = 0.5 * (this.LJdiameter[i] + this.LJdiameter[j]);
                        dipolemix = Math.sqrt(this.dipole[i] * this.dipole[j]);
                    }
                    else {
                        polarn = 0.;
                        dipolep = 0.;
                        if (this.polar[i] == 0) {
                            polarn = this.polar[i] / Math.pow(this.LJdiameter[i], 3.);
                            dipolep = 1e02 * this.dipole[j] / Math.sqrt(this.LJpotential[j] * 1.3806488 * Math.pow(this.LJdiameter[j], 3.));
                            chi = 1. + 0.25 * polarn * dipolep * Math.sqrt(this.LJpotential[j] / this.LJpotential[i]);
                        }
                        else {
                            polarn = this.polar[j] / Math.pow(this.LJdiameter[j], 3.);
                            dipolep = 1e02 * this.dipole[i] / Math.sqrt(this.LJpotential[i] * 1.3806488 * Math.pow(this.LJdiameter[innerWidth], 3.));
                            chi = 1. + 0.25 * polarn * dipolep * Math.sqrt(this.LJpotential[i] / this.LJpotential[j]);

                        }
                        LJpotentialmix = Math.pow(chi, 2.) * Math.sqrt(this.LJpotential[i] * this.LJpotential[j]);
                        LJdiametermix = 0.5 * (this.LJdiameter[i] + this.LJdiameter[j]) * Math.pow(chi, -1. / 6.);
                        dipolemix = 0.;

                    }

                    Tr = this.T / LJpotentialmix;
                    dr = 0.5 * Math.pow(dipolemix, 2.) / (LJpotentialmix * 1.3806488 * Math.pow(LJdiametermix, 3.));
                    dr = 1e06 * dr;
                    sigma = this.collision_integrals("11", Tr, dr);
                    this.diff[i][j] = (3 / 16) * Math.sqrt(2. * this.pi_ * Math.pow(1.3806488 * this.T, 3.) / (MWmix * 1.66054)) / (this.P * this.pi_ * Math.pow(LJdiametermix, 2.) * sigma);
                    this.diff[i][j] = this.diff[i][j] * 0.1;
                }
            }
            this.diff_updated_ = true
        }
        return this.diff;
    }

    get_species_molar_specific_heat() {
        this.calculate_specific_heat();
        return this.cpmole;
    }

    get_species_mass_specific_heat() {
        this.calculate_specific_heat();
        return this.cpmass;
    }

    get_species_thermal_conducitivity() {
        if (this.cond_update_ == false) {
            this.get_species_viscosity();
            this.get_binary_diffusion();
            this.get_mixture_density();
            this.calculate_specific_heat();

            var cvtrans = 0.;
            var cvrot = 0.;
            var cvvib = 0.;
            var rho = 0.;
            var A = 0.;
            var B = 0.;
            var F_T = 0.;
            var F_298 = 0.;
            var Zrot = 0.;
            var ftrans = 0.;
            var frot = 0.;
            var fvib = 0.;

            var R = 8314; //[J/Kmol/K]

            for (let i = 0; i < this.names.length; i++) {
                if (this.geometry[i] == 0) //single atom
                {
                    cvtrans = 3. * R * 0.5;
                    cvrot = 0.;
                    cvvib = 0.;
                }
                else if (this.geometry[i] == 1) //linear
                {
                    cvtrans = 3. * R * 0.5;
                    cvrot = R;
                    cvvib = this.cpmole[i] - R - 5. * R * 0.5;
                }
                else //non linear
                {
                    cvtrans = 3. * R * 0.5;
                    cvrot = 3. * R * 0.5;
                    cvvib = this.cpmole[i] - R - 3. * R;
                }

                rho = this.P * this.MW[i] / (R * this.T);
                A = (5. / 2.) - rho * this.diff[i][i] / this.mu[i];

                F_T = 1. + 0.5 * Math.sqrt(Math.pow(this.pi_, 3.) * this.LJpotential[i] / this.T)
                    + (0.25 * Math.pow(this.pi_, 2.) + 2.) * (this.LJpotential[i] / this.T)
                    + Math.sqrt(Math.pow(this.pi_ * this.LJpotential[i] / this.T, 3.));
                F_298 = 1. + 0.5 * Math.sqrt(Math.pow(this.pi_, 3.) * this.LJpotential[i] / 298.)
                    + (0.25 * Math.pow(this.pi_, 2.) + 2.) * (this.LJpotential[i] / 298.)
                    + Math.sqrt(Math.pow(this.pi_ * this.LJpotential[i] / 298., 3.));

                Zrot = this.collision[i] * F_298 / F_T;
                B = Zrot + (2 / this.pi_) * ((5 / 3) * (cvrot / R) + rho * this.diff[i][i] / this.mu[i]);

                ftrans = (5 / 2) * (1 - 2 * cvrot * A / (this.pi_ * cvtrans * B));
                frot = (rho * this.diff[i][i] / this.mu[i]) * (1. + 2. * A / (this.pi_ * B));
                fvib = rho * this.diff[i][i] / this.mu[i];

                this.cond[i] = this.mu[i] * (ftrans * cvtrans + frot * cvrot + fvib * cvvib) / this.MW[i];

            }
            this.cond_update_ = true;
        }
        return this.cond;
    }

    get_species_molar_enthalpy() {
        this.calculate_enthalpy();
        return this.hmole;
    }

    get_species_mass_enthalpy() {
        this.calculate_enthalpy();
        return this.hmass;
    }

    get_species_molar_entropy() {
        this.calculate_entropy();
        return this.smole;
    }

    get_species_mass_entropy() {
        this.calculate_entropy();
        return this.smass;
    }

    get_species_arithmetic_mean_gas_velocity() {
        if (this.v_update_ == false) {
            for (let i = 0; i < this.names.length; i++) {
                this.v[i] = Math.sqrt(8 * 8314 * this.T / (this.pi_ * this.MW[i]));
            }
            this.v_update_ = true;
        }
        return this.v;
    }

    get_species_mean_free_path() {
        if (this.l_update_ == false) {
            for (let i = 0; i < this.names.length; i++) {
                this.l[i] = 1.38064852 * 1e-03 * this.T / (Math.sqrt(2) * this.P * Math.pow(this.LJdiameter[i], 2.));
            }
            this.l_update_ = true;
        }

        return this.l;
    }

    get_mixture_thermal_conductivity() {
        if (this.cond_mix_update_ == false) {
            this.get_species_thermal_conducitivity();
            var A = 0.;
            var B = 0.;
            for (let i = 0; i < this.names.length; i++) {
                A = A + this.x[i] * this.cond[i];
                B = B + this.x[i] / this.cond[i];
            }

            this.cond_mix = 0.5 * (A + 1. / B);
            this.cond_mix_update_ = true;
        }
        return this.cond_mix_;
    }

    get_mixture_viscosity() {
        if (this.mu_mix_update_ == false) {
            this.get_species_viscosity();
            this.mu_mix = 0.;
            var sum = 0.;
            var phi = 0.;
            for (let k = 0; k < this.names.length; k++) {
                sum = 0.;
                for (let j = 0; j < this.names.length; j++) {
                    phi = (1. / Math.sqrt(8.)) * (1. / Math.sqrt(1. + this.MW[k] / this.MW[j])) * Math.pow((1. + Math.sqrt(this.mu[k] / this.mu[j]) * Math.pow(this.MW[j] / this.MW[k], (1. / 4.))), 2.);
                    sum = sum + this.x[j] * phi;
                }
                this.mu_mix = this.mu_mix + this.x[k] * this.mu[k] / sum;
            }
            this.mu_mix_update_ = true;
        }

        return this.mu_mix;
    }

    get_mixture_diffusion() {
        if (this.diff_mix_update_ == false) {
            this.get_binary_diffusion();
            for (let k = 0; k < this.names.length; k++) {
                var A = 0;
                var B = 0;
                for (let j = 0; j < this.names.length; j++) {
                    if (j != k) {
                        A = A + this.x[j] * this.MW[j];
                        B = B + this.x[j] / this.diff[j][k];
                    }
                }
                this.diff_mix[k] = A / (this.MWmix * B);
            }
            this.diff_mix_update_ = true;
        }

        return this.diff_mix_;
    }

    get_mixture_molar_specific_heat() {
        this.calculate_mixture_specific_heat();
        return this.cpmole_mix;
    }

    get_mixture_mass_specific_heat() {
        this.calculate_mixture_specific_heat();
        return this.cpmass_mix;
    }

    get_mixture_molar_enthalpy() {
        this.calculate_mixture_enthalpy();
        return this.hmole_mix;
    }

    get_mixture_mass_enthalpy() {
        this.calculate_mixture_enthalpy();
        return this.hmass_mix;
    }

    get_mixture_molar_entropy() {
        this.calculate_mixture_entropy();
        return this.smole_mix;
    }

    get_mixture_mass_entropy() {
        this.calculate_mixture_entropy();
        return this.smass_mix;
    }

}