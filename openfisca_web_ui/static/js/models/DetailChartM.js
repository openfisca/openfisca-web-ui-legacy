define([
	'DetailChartM',

	'jquery',
	'underscore',
	'backbone',
	'backbone.DeepModel'
	],
	function () {
		var DetailChartM = Backbone.DeepModel.extend({
			events: {},
			defaults: {
				source: {
						  "name": "root", 
						  "description": "root", 
						  "type": 0, 
						  "values": [
						    25770.75727131086
						  ], 
						  "color": [
						    0, 
						    0, 
						    0
						  ], 
						  "children": {
						    "revdisp": { // revenu disponible
						      "name": "Rev. disp.", 
						      "description": "Revenu disponible", 
						      "type": 2, 
						      "values": [
						        25770.75727131086
						      ], 
						      "color": [
						        0, 
						        0, 
						        255
						      ], 
						      "children": {
						        "rev_trav": { // revenu du travail
						          "name": "Rev. travail", 
						          "description": "Revenu du travail", 
						          "type": 0, 
						          "values": [
						            22911.46557131086
						          ], 
						          "color": [
						            0, 
						            155, 
						            204
						          ], 
						          "children": {
						            "salnet": {
						              "name": "Sal. nets", 
						              "description": "Salaires nets", 
						              "type": 0, 
						              "values": [
						                22911.46557131086
						              ], 
						              "color": [
						                0, 
						                138, 
						                201
						              ], 
						              "children": {
						                "sal": {
						                  "name": "Sal. impos.", 
						                  "description": "Salaires imposables", 
						                  "type": 0, 
						                  "values": [
						                    23534.170427852863
						                  ], 
						                  "color": [
						                    0, 
						                    115, 
						                    170
						                  ], 
						                  "children": {
						                    "salbrut": {
						                      "name": "Sal. bruts", 
						                      "description": "Salaires bruts", 
						                      "type": 0, 
						                      "values": [
						                        22136.68171141146
						                      ], 
						                      "color": [
						                        0, 
						                        99, 
						                        143
						                      ], 
						                      "children": {
						                        "salsuperbrut": { // salaire super brute, ensemble de tout ce que paie l'entreprise pour un salarié
						                          "name": "Co\u00fbt travail", 
						                          "description": "Salaires super bruts", 
						                          "type": 0, 
						                          "values": [
						                            30080.864067156686
						                          ], 
						                          "color": [
						                            0, 
						                            66, 
						                            92
						                          ]
						                        }, 
						                        "cotpat": {
						                          "name": "Cotsoc pat", 
						                          "description": "Cotisations sociales patronales", 
						                          "type": 0, 
						                          "values": [
						                            -10081.182355745226
						                          ], 
						                          "color": [
						                            249, 
						                            208, 
						                            211
						                          ]
						                        }, 
						                        "alleg_fillon": {
						                          "name": "All\u00e8g. sal.", 
						                          "description": "All\u00e8gement sur les bas salaires (Fillon)", 
						                          "type": 0, 
						                          "values": [
						                            0.0
						                          ], 
						                          "color": [
						                            0, 
						                            99, 
						                            143
						                          ]
						                        }, 
						                        "alleg_cice": {
						                          "name": "CICE", 
						                          "description": "Cr\u00e9dit d'imp\u00f4t comp\u00e9titivit\u00e9-emploi", 
						                          "type": 0, 
						                          "values": [
						                            0.0
						                          ], 
						                          "color": [
						                            0, 
						                            99, 
						                            143
						                          ]
						                        }, 
						                        "taxes_sal": {
						                          "name": "Taxe sal.", 
						                          "description": "Taxe sur les salaires", 
						                          "type": 0, 
						                          "values": [
						                            0.0
						                          ], 
						                          "color": [
						                            0, 
						                            99, 
						                            143
						                          ]
						                        }, 
						                        "tehr": {
						                          "name": "TEHR", 
						                          "description": "Taxe exceptionnelle sur les hauts revenus", 
						                          "type": 0, 
						                          "values": [
						                            0.0
						                          ], 
						                          "color": [
						                            0, 
						                            99, 
						                            143
						                          ]
						                        }
						                      }
						                    }, 
						                    "primes": {
						                      "name": "Primes", 
						                      "description": "Primes", 
						                      "type": 0, 
						                      "values": [
						                        5.170427852865
						                      ], 
						                      "color": [
						                        0, 
						                        99, 
						                        143
						                      ]
						                    }, 
						                    "cotsal": {
						                      "name": "Cotsoc sal", 
						                      "description": "Cotisations sociales salari\u00e9es", 
						                      "type": 0, 
						                      "values": [
						                        -13041.5800671479346
						                      ], 
						                      "color": [
						                        243, 
						                        166, 
						                        171
						                      ]
						                    }, 
						                    "csgsald": {
						                      "name": "CSG deduc", 
						                      "description": "CSG d\u00e9ductible (salaires)", 
						                      "type": 0, 
						                      "values": [
						                        -1095.1016442635248
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }, 
						                    "mhsup": {
						                      "name": "Heures sup", 
						                      "description": "Heures suppl\u00e9mentaires \u00e9xon\u00e9r\u00e9es", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        0, 
						                        115, 
						                        170
						                      ]
						                    }
						                  }
						                }, 
						                "csgsali": {
						                  "name": "CSG imp. sal.", 
						                  "description": "CSG non d\u00e9ductible (salaires)", 
						                  "type": 0, 
						                  "values": [
						                    -515.3419502416588
						                  ], 
						                  "color": [
						                    235, 
						                    114, 
						                    118
						                  ]
						                }, 
						                "crdssal": {
						                  "name": "CRDS sal.", 
						                  "description": "CRDS (salaires)", 
						                  "type": 0, 
						                  "values": [
						                    -107.36290630034559
						                  ], 
						                  "color": [
						                    229, 
						                    48, 
						                    56
						                  ]
						                }, 
						                "hsup": {
						                  "name": "Heures sup", 
						                  "description": "Heures suppl\u00e9mentaires", 
						                  "type": 0, 
						                  "values": [
						                    0
						                  ], 
						                  "color": [
						                    0, 
						                    115, 
						                    170
						                  ]
						                }
						              }
						            }, 
						            "rag": {
						              "name": "Rev. agric.", 
						              "description": "Revenus agricoles", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                0, 
						                155, 
						                204
						              ]
						            }, 
						            "ric": {
						              "name": "R. ind. comm.", 
						              "description": "Revenus industriels et commerciaux", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                0, 
						                155, 
						                204
						              ]
						            }, 
						            "rnc": {
						              "name": "R. non comm.", 
						              "description": "Revenus non commerciaux", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                0, 
						                155, 
						                204
						              ]
						            }
						          }
						        }, 
						        "pen": {
						          "name": "Pensions", 
						          "description": "Pensions", 
						          "type": 0, 
						          "values": [
						            0.0
						          ], 
						          "color": [
						            97, 
						            75, 
						            150
						          ], 
						          "children": {
						            "chonet": {
						              "name": "Ch\u00f4mage net", 
						              "description": "Ch\u00f4mage net", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                136, 
						                120, 
						                178
						              ], 
						              "children": {
						                "cho": {
						                  "name": "Ch\u00f4mage decl.", 
						                  "description": "Ch\u00f4mage", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    136, 
						                    120, 
						                    178
						                  ], 
						                  "children": {
						                    "chobrut": {
						                      "name": "Ch\u00f4mage brut", 
						                      "description": "Ch\u00f4mage brut", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        136, 
						                        120, 
						                        178
						                      ]
						                    }, 
						                    "csgchod": {
						                      "name": "CSG d\u00e9d. ch\u00f4m.", 
						                      "description": "CSG d\u00e9ductible (ch\u00f4mage)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }
						                  }
						                }, 
						                "csgchoi": {
						                  "name": "CSG imp. ch\u00f4m.", 
						                  "description": "CSG non d\u00e9ductible (ch\u00f4mage)", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    235, 
						                    114, 
						                    118
						                  ]
						                }, 
						                "crdscho": {
						                  "name": "CRDS ch\u00f4m.", 
						                  "description": "CRDS (ch\u00f4mage)", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    229, 
						                    48, 
						                    56
						                  ]
						                }
						              }
						            }, 
						            "rstnet": {
						              "name": "Retraites nettes", 
						              "description": "Retraites nettes", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                87, 
						                88, 
						                138
						              ], 
						              "children": {
						                "rst": {
						                  "name": "Retr. d\u00e9cl.", 
						                  "description": "Retraites", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    87, 
						                    88, 
						                    138
						                  ], 
						                  "children": {
						                    "rstbrut": {
						                      "name": "Retr. brutes", 
						                      "description": "Retraites brutes", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        87, 
						                        88, 
						                        138
						                      ]
						                    }, 
						                    "csgrstd": {
						                      "name": "CSG d\u00e9d. ret.", 
						                      "description": "CSG d\u00e9ductible (retraite)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }
						                  }
						                }, 
						                "csgrsti": {
						                  "name": "CSG imp. pens.", 
						                  "description": "CSG non d\u00e9ductible (pensions)", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    235, 
						                    114, 
						                    118
						                  ]
						                }, 
						                "crdsrst": {
						                  "name": "CRDS (pens.)", 
						                  "description": "CRDS (pensions)", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    229, 
						                    48, 
						                    56
						                  ]
						                }
						              }
						            }, 
						            "alr": {
						              "name": "P. alim. re\u00e7.", 
						              "description": "Pensions alimentaires re\u00e7ues", 
						              "type": 0, 
						              "values": [
						                0
						              ], 
						              "color": [
						                136, 
						                120, 
						                178
						              ]
						            }, 
						            "alv": {
						              "name": "P. alim. vers.", 
						              "description": "Pensions alimentaires vers\u00e9e", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                136, 
						                120, 
						                178
						              ]
						            }, 
						            "rto": {
						              "name": "Rentes viag.", 
						              "description": "Rentes viag\u00e8res", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                125, 
						                185, 
						                86
						              ]
						            }
						          }
						        }, 
						        "rev_cap_net": {
						          "name": "Rev. cap. net", 
						          "description": "Revenus du capital net", 
						          "type": 0, 
						          "values": [
						            0.0
						          ], 
						          "color": [
						            255, 
						            222, 
						            48
						          ], 
						          "children": {
						            "rev_cap_brut": {
						              "name": "Rev. cap. brut", 
						              "description": "Revenus du capital brut", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                255, 
						                222, 
						                48
						              ], 
						              "children": {
						                "fon": {
						                  "name": "Rev. fonciers", 
						                  "description": "Revenus fonciers", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    255, 
						                    245, 
						                    155
						                  ]
						                }, 
						                "f3vg": {
						                  "name": "Plus.-values mo.", 
						                  "description": "Plus-values de cessions de valeurs mobili\u00e8res", 
						                  "type": 0, 
						                  "values": [
						                    0
						                  ], 
						                  "color": [
						                    255, 
						                    245, 
						                    155
						                  ]
						                }, 
						                "f3vz": {
						                  "name": "Plus.-values immo.", 
						                  "description": "Plus-values immobili\u00e8res", 
						                  "type": 0, 
						                  "values": [
						                    0
						                  ], 
						                  "color": [
						                    255, 
						                    245, 
						                    155
						                  ]
						                }, 
						                "rev_cap_bar": {
						                  "name": "Rev cap bar", 
						                  "description": "Revenus du capital soumis au bar\u00e8me", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    255, 
						                    239, 
						                    103
						                  ]
						                }, 
						                "rev_cap_lib": {
						                  "name": "Rev cap lib", 
						                  "description": "Revenus du capital soumis au pr\u00e9l\u00e8vement lib\u00e9ratoire", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    255, 
						                    233, 
						                    28
						                  ]
						                }, 
						                "rac": {
						                  "name": "Rev. accesoires", 
						                  "description": "Revenus accessoires", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    247, 
						                    221, 
						                    0
						                  ]
						                }
						              }
						            }, 
						            "cotsoc_cap": {
						              "name": "Cotsoc. capital", 
						              "description": "Cotisations sociales sur les revenus du capital", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                243, 
						                166, 
						                171
						              ], 
						              "children": {
						                "prelsoc_cap": {
						                  "name": "Pr. s. cap.", 
						                  "description": "Pr\u00e9l\u00e8vement social sur les revenus du capital", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    243, 
						                    166, 
						                    171
						                  ], 
						                  "children": {
						                    "prelsoc_fon": {
						                      "name": "Pr. s. foncier", 
						                      "description": "Pr\u00e9l\u00e8vement social sur les revenus fonciers", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        243, 
						                        166, 
						                        171
						                      ]
						                    }, 
						                    "prelsoc_pv_mo": {
						                      "name": "Prel. soc. p.-v. mo.", 
						                      "description": "Pr\u00e9l\u00e8vement social sur les plus-values de cessions de valeurs mobili\u00e8res", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        243, 
						                        166, 
						                        171
						                      ]
						                    }, 
						                    "prelsoc_pv_immo": {
						                      "name": "Prel. soc. p.-v.", 
						                      "description": "Pr\u00e9l\u00e8vement social sur les plus-values immobili\u00e8res", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        243, 
						                        166, 
						                        171
						                      ]
						                    }, 
						                    "prelsoc_cap_bar": {
						                      "name": "Pr. s. cap. bar.", 
						                      "description": "Pr\u00e9l\u00e8vement social sur les revenus du capital soumis au bar\u00e8me", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        243, 
						                        166, 
						                        171
						                      ]
						                    }, 
						                    "prelsoc_cap_lib": {
						                      "name": "Prel. soc. lib.", 
						                      "description": "Pr\u00e9l\u00e8vement social sur les revenus du capital soumis au pr\u00e9l\u00e8vement lib\u00e9ratoire", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        243, 
						                        166, 
						                        171
						                      ]
						                    }
						                  }
						                }, 
						                "csg_cap": {
						                  "name": "CSG cap.", 
						                  "description": "CSG des revenus du capital", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    235, 
						                    114, 
						                    118
						                  ], 
						                  "children": {
						                    "csg_fon": {
						                      "name": "CSG foncier", 
						                      "description": "CSG (revenus fonciers)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }, 
						                    "csg_pv_mo": {
						                      "name": "CSG p.-v. mo.", 
						                      "description": "CSG (plus-values de cessions de valeurs mobili\u00e8res)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }, 
						                    "csg_pv_immo": {
						                      "name": "CSG p.-v. immo.", 
						                      "description": "CSG (plus-values immobili\u00e8res)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }, 
						                    "csg_cap_bar": {
						                      "name": "CSG cap. bar.", 
						                      "description": "CSG (revenus du capital au bar\u00e8me)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }, 
						                    "csg_cap_lib": {
						                      "name": "CSG cap. lib.", 
						                      "description": "CSG (revenus du capital soumis au pr\u00e9l\u00e8vement lib\u00e9ratoire)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        235, 
						                        114, 
						                        118
						                      ]
						                    }
						                  }
						                }, 
						                "crds_cap": {
						                  "name": "CRDS cap.", 
						                  "description": "CRDS", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    229, 
						                    48, 
						                    56
						                  ], 
						                  "children": {
						                    "crds_fon": {
						                      "name": "CRDS foncier", 
						                      "description": "CRDS (revenus fonciers)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        229, 
						                        48, 
						                        56
						                      ]
						                    }, 
						                    "crds_pv_mo": {
						                      "name": "CRDS p.-v. mo.", 
						                      "description": "CRDS (plus-values de cessions de valeurs mobili\u00e8res)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        229, 
						                        48, 
						                        56
						                      ]
						                    }, 
						                    "crds_pv_immo": {
						                      "name": "CRDS p.-v. immo.", 
						                      "description": "CRDS (plus-values immobili\u00e8res)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        229, 
						                        48, 
						                        56
						                      ]
						                    }, 
						                    "crds_cap_bar": {
						                      "name": "CRDS cap. bar.", 
						                      "description": "CRDS (revenus du capital au bar\u00e8me)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        229, 
						                        48, 
						                        56
						                      ]
						                    }, 
						                    "crds_cap_lib": {
						                      "name": "CRDS cap. lib.", 
						                      "description": "CRDS (revenus du capital soumis au pr\u00e9l\u00e8vement lib\u00e9ratoire)", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        229, 
						                        48, 
						                        56
						                      ]
						                    }
						                  }
						                }
						              }
						            }, 
						            "imp_lib": {
						              "name": "Pr\u00e9l. lib\u00e9rat.", 
						              "description": "Pr\u00e9l\u00e8vement lib\u00e9ratoire sur les revenus du patrimoine", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                232, 
						                79, 
						                95
						              ]
						            }
						          }
						        }, 
						        "ir_lps": {
						          "name": "IR (LPS)", 
						          "description": "Imp\u00f4t sur le revenu (Landais, Piketty, Saez)", 
						          "type": 0, 
						          "values": [
						            0.0
						          ], 
						          "color": [
						            232, 
						            79, 
						            95
						          ]
						        }, 
						        "psoc": {
						          "name": "Prest. soc.", 
						          "description": "Prestations sociales", 
						          "type": 0, 
						          "values": [
						            2859.2916999999998
						          ], 
						          "color": [
						            255, 
						            102, 
						            63
						          ], 
						          "children": {
						            "pfam": {
						              "name": "Prest. fam.", 
						              "description": "Prestations familiales", 
						              "type": 0, 
						              "values": [
						                2859.2916999999998
						              ], 
						              "color": [
						                83, 
						                170, 
						                49
						              ], 
						              "children": {
						                "af": {
						                  "name": "Alloc. fam.", 
						                  "description": "Allocations familiales", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    181, 
						                    213, 
						                    154
						                  ]
						                }, 
						                "cf": {
						                  "name": "Compl. fam.", 
						                  "description": "Compl\u00e9ment familial", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    125, 
						                    185, 
						                    86
						                  ]
						                }, 
						                "ars": {
						                  "name": "ARS", 
						                  "description": "Allocation de rentr\u00e9e scolaire", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    91, 
						                    172, 
						                    38
						                  ]
						                }, 
						                "aeeh": {
						                  "name": "AEEH", 
						                  "description": "Allocation d'\u00e9ducation de l'enfant handicap\u00e9", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    80, 
						                    160, 
						                    38
						                  ]
						                }, 
						                "paje": {
						                  "name": "PAJE", 
						                  "description": "Prestation d'accueil du jeune enfant", 
						                  "type": 0, 
						                  "values": [
						                    2873.66
						                  ], 
						                  "color": [
						                    77, 
						                    144, 
						                    34
						                  ], 
						                  "children": {
						                    "paje_base": {
						                      "name": "PAJE", 
						                      "description": "Paje - Allocation de base", 
						                      "type": 0, 
						                      "values": [
						                        2028.48
						                      ], 
						                      "color": [
						                        77, 
						                        144, 
						                        34
						                      ]
						                    }, 
						                    "paje_nais": {
						                      "name": "Prime naiss.", 
						                      "description": "Paje - Prime de naissance", 
						                      "type": 0, 
						                      "values": [
						                        845.18
						                      ], 
						                      "color": [
						                        77, 
						                        144, 
						                        34
						                      ]
						                    }, 
						                    "paje_clca": {
						                      "name": "CLCA", 
						                      "description": "Paje - Compl\u00e9ment de libre choix d'activit\u00e9", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        77, 
						                        144, 
						                        34
						                      ]
						                    }, 
						                    "paje_colca": {
						                      "name": "COLCA", 
						                      "description": "Paje - Compl\u00e9ment optionnel de libre choix d'activit\u00e9", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        77, 
						                        144, 
						                        34
						                      ]
						                    }, 
						                    "paje_clmg": {
						                      "name": "CLCMG", 
						                      "description": "Paje - Compl\u00e9ment de libre choix du mode de garde", 
						                      "type": 0, 
						                      "values": [
						                        0.0
						                      ], 
						                      "color": [
						                        77, 
						                        144, 
						                        34
						                      ]
						                    }
						                  }
						                }, 
						                "asf": {
						                  "name": "ASF", 
						                  "description": "Allocation de soutien familial", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    77, 
						                    144, 
						                    34
						                  ]
						                }, 
						                "crds_pfam": {
						                  "name": "CRDS fam.", 
						                  "description": "CRDS (prestations familiales)", 
						                  "type": 0, 
						                  "values": [
						                    -14.3683
						                  ], 
						                  "color": [
						                    229, 
						                    48, 
						                    56
						                  ]
						                }
						              }
						            }, 
						            "mini": {
						              "name": "Min. sociaux", 
						              "description": "Minima sociaux", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                240, 
						                138, 
						                76
						              ], 
						              "children": {
						                "aspa": {
						                  "name": "Min. viellesse", 
						                  "description": "Minimum vieillesse", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    249, 
						                    193, 
						                    148
						                  ]
						                }, 
						                "aah": {
						                  "name": "AAH", 
						                  "description": "Allocation adulte handicap\u00e9", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    244, 
						                    160, 
						                    80
						                  ]
						                }, 
						                "caah": {
						                  "name": "CAAH", 
						                  "description": "Compl\u00e9ment de l'allocation adulte handicap\u00e9", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    244, 
						                    160, 
						                    80
						                  ]
						                }, 
						                "asi": {
						                  "name": "ASI", 
						                  "description": "Allocation suppl\u00e9mentaire d'invalidit\u00e9", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    244, 
						                    160, 
						                    80
						                  ]
						                }, 
						                "rsa": {
						                  "name": "RSA", 
						                  "description": "Revenu de solidarit\u00e9 active", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    239, 
						                    130, 
						                    19
						                  ]
						                }, 
						                "psa": {
						                  "name": "PSA", 
						                  "description": "Prime de solidarit\u00e9 active", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    239, 
						                    130, 
						                    19
						                  ]
						                }, 
						                "aefa": {
						                  "name": "AEFA", 
						                  "description": "Aide exceptionelle de fin d'ann\u00e9e", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    237, 
						                    119, 
						                    3
						                  ]
						                }, 
						                "api": {
						                  "name": "API", 
						                  "description": "Allocation parent isol\u00e9", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    208, 
						                    112, 
						                    4
						                  ]
						                }
						              }
						            }, 
						            "logt": {
						              "name": "Prest. logement", 
						              "description": "Prestations logement", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                255, 
						                222, 
						                48
						              ], 
						              "children": {
						                "apl": {
						                  "name": "APL", 
						                  "description": "Aide personalis\u00e9e au logement", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    255, 
						                    245, 
						                    155
						                  ]
						                }, 
						                "als": {
						                  "name": "ALS", 
						                  "description": "Allocation logement social", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    255, 
						                    239, 
						                    103
						                  ]
						                }, 
						                "alf": {
						                  "name": "ALF", 
						                  "description": "Allocation de logement familiale", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    255, 
						                    233, 
						                    28
						                  ]
						                }, 
						                "alset": {
						                  "name": "AL \u00e9tudiant", 
						                  "description": "Allocation logement \u00e9tudiant", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    247, 
						                    221, 
						                    0
						                  ]
						                }, 
						                "crds_lgtm": {
						                  "name": "CRDS log.", 
						                  "description": "CRDS (allocation logement)", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    229, 
						                    48, 
						                    56
						                  ]
						                }
						              }
						            }
						          }
						        }, 
						        "ppe": {
						          "name": "PPE", 
						          "description": "Prime pour l'emploi", 
						          "type": 0, 
						          "values": [
						            0.0
						          ], 
						          "color": [
						            182, 
						            34, 
						            131
						          ]
						        }, 
						        "impo": {
						          "name": "Imp\u00f4ts directs", 
						          "description": "Imp\u00f4ts directs", 
						          "type": 0, 
						          "values": [
						            0.0
						          ], 
						          "color": [
						            232, 
						            79, 
						            95
						          ], 
						          "children": {
						            "irpp": {
						              "name": "IRPP", 
						              "description": "Imp\u00f4t sur le revenu", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                232, 
						                79, 
						                95
						              ]
						            }, 
						            "ir_pv_immo": {
						              "name": "IR immo.", 
						              "description": "Imp\u00f4t sur le revenu aff\u00e9rent \u00e0 la plus-value immobili\u00e8re", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                232, 
						                79, 
						                95
						              ]
						            }, 
						            "isf net": {
						              "name": "ISF net", 
						              "description": "ISF net", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                182, 
						                34, 
						                131
						              ], 
						              "children": {
						                "isf_tot": {
						                  "name": "ISF", 
						                  "description": "Imp\u00f4t de solidarit\u00e9 sur la fortune", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    232, 
						                    79, 
						                    95
						                  ]
						                }, 
						                "bouclier_fiscal": {
						                  "name": "Bouclier fiscal", 
						                  "description": "Bouclier fiscal", 
						                  "type": 0, 
						                  "values": [
						                    0.0
						                  ], 
						                  "color": [
						                    182, 
						                    34, 
						                    131
						                  ]
						                }
						              }
						            }, 
						            "tax_hab": {
						              "name": "TH", 
						              "description": "Taxe d'habitation", 
						              "type": 0, 
						              "values": [
						                0.0
						              ], 
						              "color": [
						                232, 
						                79, 
						                95
						              ]
						            }
						          }
						        }
						      }
						    }
						  }},
				datas: {},
				groupedDatas: {}
			},
			initialize: function () {
				console.info('DetailChartM initialized');
				this.parse();
				this.groupByPositive();
				this.groupByAll();
			},
			render: function () {},

			/* 
				** Parse datas **
				- Delete objects with null value
				- Create "value" property equal to values[0]
			*/
			parse: function () {
				var json = this.get('source').children.revdisp;
					json._id = 'revdisp';

				var doIt = function (json) {
					var that = this,
						old_children = json.children;
						json.children = [];

					_.each(old_children, function (el, name) {

						if(el.values[0] != 0) {
							var newEl = el;
							newEl._id = name;

							if(el.children) { doIt(el); }
							else {
								newEl.value = newEl.values[0];

								/* Add isPositive */
								if(newEl.value != 0) newEl.isPositive = (newEl.value > 0) ? true : false;
							}
							json.children.push(newEl);
						}
					});
					return json;
				};

				var result = doIt(json);
				this.set({datas: result});
				return result;
			},
			groupByPositive: function () {
				var groupedDatas = { positive: [], negative: [] };
				var doIt = function (obj) {
					_.each(obj, function (el, name) {
						if(el.hasOwnProperty('children')) {doIt(el.children);}
						else {
							if(el.values[0] > 0) groupedDatas.positive.push(el);
							else if(el.values[0] < 0) groupedDatas.negative.push(el);
						}
					});
				};
				doIt(this.get('datas').children);
				this.set({'groupedDatas.positive': groupedDatas});
				return groupedDatas;
			},
			groupByAll: function () {
				var groupedDatas = jQuery.extend(true, {}, this.get('datas'));
					groupedDatas.children = [];
					doIt = function (obj) {
					_.each(obj, function (el, name) {
						if(el.hasOwnProperty('children')) {doIt(el.children);}
						else groupedDatas.children.push(el);
					});
				};
				doIt(this.get('datas').children);
				this.set({'groupedDatas.all': groupedDatas});
				return groupedDatas;
			}
		});
		return DetailChartM;
	}
);