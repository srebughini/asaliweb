import numpy as np
import json
import os


class FormatConverter:
    def __init__(self, astar_path="asali/astar.asali", omega22_path="asali/omega22.asali",
                 thermo_path="asali/thermo.asali", transport_path="asali/transport.asali"):
        super().__init__()
        self.transport_dict = {}
        self.thermo_dict = {}
        self.omega_dict = {}
        self.transport_path = transport_path
        self.thermo_path = thermo_path
        self.astar_path = astar_path
        self.omega22_path = omega22_path

    @staticmethod
    def _to_json(var_dict, file_path):
        with open(file_path, 'w') as f:
            json.dump(var_dict, f)

    @staticmethod
    def _to_js(var_dict, file_path, var_name):
        js_var_as_string = "var " + var_name + " = " + json.dumps(var_dict)
        with open(file_path, 'w') as f:
            f.write(js_var_as_string)

    @staticmethod
    def _transport_file_parser(transport_path):
        with open(transport_path, 'r') as f:
            transport_list = f.read().split("\n")

        transport_dict = {}
        for transport_str in transport_list:
            if len(transport_str) > 0:
                transport_str_as_list = transport_str.split("\t")
                transport_dict[transport_str_as_list[0]] = list(map(float, transport_str_as_list[1:]))

        return transport_dict, transport_dict.keys()

    @staticmethod
    def _omega_file_parser(omega_path):
        with open(omega_path, 'r') as f:
            omega_list = f.read().split("\n")

        d_sigma = list(map(float, omega_list[0].split("\t")[1:]))
        t_sigma = list()
        sigma_matrix = list()

        for omega_str in omega_list[1:]:
            if len(omega_str) > 0:
                omega_str_as_list = omega_str.split("\t")
                t_sigma.append(float(omega_str_as_list[0]))
                sigma_matrix.append(list(map(float, omega_str_as_list[1:])))

        return np.asarray(d_sigma), np.asarray(t_sigma), np.asarray(sigma_matrix)

    @staticmethod
    def _thermo_file_parser(thermo_path):
        with open(thermo_path, 'r') as f:
            thermo_list = f.read().split("\n")

        thermo_dict = {}
        specie_name = ""
        for thermo_str in thermo_list:
            if len(thermo_str) > 0:
                thermo_str_as_list = thermo_str.split("\t")
                if len(thermo_str_as_list) == 1:
                    specie_name = thermo_str_as_list[0]
                    thermo_dict[specie_name] = list()
                else:
                    value_list = [float(a) for a in thermo_str_as_list if len(a) > 0]
                    thermo_dict[specie_name].extend(value_list)

        return thermo_dict, thermo_dict.keys()

    def read_transport(self):
        self.transport_dict, _ = self._transport_file_parser(self.transport_path)
        return self.transport_dict

    def read_thermo(self):
        self.thermo_dict, _ = self._thermo_file_parser(self.thermo_path)
        return self.thermo_dict

    def read_omega(self):
        d_sigma22, t_sigma22, sigma_matrix22 = self._omega_file_parser(self.omega22_path)
        d_sigma11, t_sigma11, sigma_matrix_a_star = self._omega_file_parser(self.astar_path)
        sigma_matrix11 = np.divide(sigma_matrix22, sigma_matrix_a_star)
        self.omega_dict = {"22": {"d": d_sigma22.tolist(),
                                  "t": t_sigma22.tolist(),
                                  "matrix": sigma_matrix22.tolist()},
                           "11": {"d": d_sigma11.tolist(),
                                  "t": t_sigma11.tolist(),
                                  "matrix": sigma_matrix11.tolist()},
                           }
        return self.omega_dict

    def read_all(self):
        self.read_transport()
        self.read_thermo()
        self.read_omega()

    def save_transport(self, folder_path="", file_name="transport.js"):
        file_path = os.path.join(folder_path, file_name)
        self._to_js(self.transport_dict, file_path, "transport")

    def save_thermo(self, folder_path="", file_name="thermo.js"):
        file_path = os.path.join(folder_path, file_name)
        self._to_js(self.thermo_dict, file_path, "thermo")

    def save_omega(self, folder_path="", file_name="omega.js"):
        file_path = os.path.join(folder_path, file_name)
        self._to_js(self.omega_dict, file_path, "omega")

    def save_all(self, folder_path=""):
        self.save_omega(folder_path=folder_path)
        self.save_thermo(folder_path=folder_path)
        self.save_transport(folder_path=folder_path)


if __name__ == "__main__":
    converter = FormatConverter()
    converter.read_all()
    converter.save_all()
