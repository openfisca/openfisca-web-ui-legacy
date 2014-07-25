'use strict';

var models = require('../models');


describe('models.TestCase.isSingleton', function() {
  it('should return false for kind=familles and role=parents', function() {
    expect(models.TestCase.isSingleton('familles', 'parents')).toEqual(false);
  });
  it('should return true for kind=menages and role=conjoint', function() {
    expect(models.TestCase.isSingleton('menages', 'conjoint')).toEqual(true);
  });
});

describe('models.TestCase.withoutIndividu', function() {
  it('should return a new test case without the individu in individus and entities', function() {
    var testCase = {
      familles: {
        famille1: {
          parents: ['individu1'],
        },
      }, 
      foyers_fiscaux: { // jshint ignore:line
        foyerFiscal1: {
          declarants: ['individu1'],
        },
      },
      individus: {
        individu1: {
          nom_individu: 'Personne 1', // jshint ignore:line
        }, 
      }, 
      menages: {
        menage1: {
          personne_de_reference: 'individu1', // jshint ignore:line
        },
      }
    };
    var expectedTestCase = {
      familles: {
        famille1: {},
      }, 
      foyers_fiscaux: { // jshint ignore:line
        foyerFiscal1: {},
      },
      individus: {}, 
      menages: {
        menage1: {},
      }
    };
    var newTestCase = models.TestCase.withoutIndividu('individu1', testCase);
    expect(newTestCase).toEqual(expectedTestCase);
  });
  it('should return a new test case without the individu in individus and entities', function() {
    var testCase = {
      "familles": {
          "9318ec58-3e3e-46d3-bd28-6dbf0cb2808e": {
              "parents": [
                  "1f4adbbd-f776-4f5e-8e52-8934c2e196a3",
                  "9eda136d-302f-455a-9fe6-ac54e7629796"
              ],
              "nom_famille": "2"
          },
          "1ee8fc5e-d5ce-4e1e-8f55-6f60002a0482": {
              "parents": [
                  "6153f248-85f1-4bf5-8a77-9de8a83d0b95",
                  "65b49e53-0bfb-4f2c-b090-a70bd5f8a322"
              ],
              "nom_famille": "1"
          }
      },
      "foyers_fiscaux": {
          "cc80715f-2401-4342-ba5d-ee8c815ba48f": {
              "declarants": [
                  "1f4adbbd-f776-4f5e-8e52-8934c2e196a3",
                  "9eda136d-302f-455a-9fe6-ac54e7629796"
              ],
              "nom_foyer_fiscal": "2"
          },
          "51fbd368-1269-4191-973f-03b5373f8081": {
              "declarants": [
                  "6153f248-85f1-4bf5-8a77-9de8a83d0b95",
                  "65b49e53-0bfb-4f2c-b090-a70bd5f8a322"
              ],
              "nom_foyer_fiscal": "1"
          }
      },
      "individus": {
          "65b49e53-0bfb-4f2c-b090-a70bd5f8a322": {
              "nom_individu": "Personne 2"
          },
          "1f4adbbd-f776-4f5e-8e52-8934c2e196a3": {
              "nom_individu": "Personne 3"
          },
          "9eda136d-302f-455a-9fe6-ac54e7629796": {
              "nom_individu": "Personne 4"
          },
          "6153f248-85f1-4bf5-8a77-9de8a83d0b95": {
              "nom_individu": "Personne 1"
          }
      },
      "menages": {
          "7df7b419-5fbb-4163-8db5-8d5495032b36": {
              "personne_de_reference": "6153f248-85f1-4bf5-8a77-9de8a83d0b95",
              "conjoint": "65b49e53-0bfb-4f2c-b090-a70bd5f8a322",
              "nom_menage": "1"
          },
          "c31ea62a-02e2-47a0-b5e8-dcfcf395d09d": {
              "personne_de_reference": "1f4adbbd-f776-4f5e-8e52-8934c2e196a3",
              "conjoint": "9eda136d-302f-455a-9fe6-ac54e7629796",
              "nom_menage": "2"
          }
      },
    };
    var expectedTestCase = {
      "familles": {
          "9318ec58-3e3e-46d3-bd28-6dbf0cb2808e": {
              "parents": [
                  "1f4adbbd-f776-4f5e-8e52-8934c2e196a3",
              ],
              "nom_famille": "2"
          },
          "1ee8fc5e-d5ce-4e1e-8f55-6f60002a0482": {
              "parents": [
                  "6153f248-85f1-4bf5-8a77-9de8a83d0b95",
                  "65b49e53-0bfb-4f2c-b090-a70bd5f8a322"
              ],
              "nom_famille": "1"
          }
      },
      "foyers_fiscaux": {
          "cc80715f-2401-4342-ba5d-ee8c815ba48f": {
              "declarants": [
                  "1f4adbbd-f776-4f5e-8e52-8934c2e196a3",
              ],
              "nom_foyer_fiscal": "2"
          },
          "51fbd368-1269-4191-973f-03b5373f8081": {
              "declarants": [
                  "6153f248-85f1-4bf5-8a77-9de8a83d0b95",
                  "65b49e53-0bfb-4f2c-b090-a70bd5f8a322"
              ],
              "nom_foyer_fiscal": "1"
          }
      },
      "individus": {
          "65b49e53-0bfb-4f2c-b090-a70bd5f8a322": {
              "nom_individu": "Personne 2"
          },
          "1f4adbbd-f776-4f5e-8e52-8934c2e196a3": {
              "nom_individu": "Personne 3"
          },
          "6153f248-85f1-4bf5-8a77-9de8a83d0b95": {
              "nom_individu": "Personne 1"
          }
      },
      "menages": {
          "7df7b419-5fbb-4163-8db5-8d5495032b36": {
              "personne_de_reference": "6153f248-85f1-4bf5-8a77-9de8a83d0b95",
              "conjoint": "65b49e53-0bfb-4f2c-b090-a70bd5f8a322",
              "nom_menage": "1"
          },
          "c31ea62a-02e2-47a0-b5e8-dcfcf395d09d": {
              "personne_de_reference": "1f4adbbd-f776-4f5e-8e52-8934c2e196a3",
              "nom_menage": "2"
          }
      },
    };
    var newTestCase = models.TestCase.withoutIndividu('9eda136d-302f-455a-9fe6-ac54e7629796', testCase);
    expect(newTestCase).toEqual(expectedTestCase);
  });

});
