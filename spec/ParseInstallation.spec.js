'use strict';
// These tests check the Installations functionality of the REST API.
// Ported from installation_collection_test.go

let auth = require('../src/Auth');
let cache = require('../src/cache');
let Config = require('../src/Config');
let Parse = require('parse/node').Parse;
let rest = require('../src/rest');
let request = require("request");

let config;
let database;
let defaultColumns = require('../src/Controllers/SchemaController').defaultColumns;

const installationSchema = { fields: Object.assign({}, defaultColumns._Default, defaultColumns._Installation) };

describe('Installations', () => {

  beforeEach(() => {
    config = new Config('test');
    database = config.database;
  });

  it_exclude_dbs(['postgres'])('creates an android installation with ids', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var device = 'android';
    var input = {
      'installationId': installId,
      'deviceType': device
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      var obj = results[0];
      expect(obj.installationId).toEqual(installId);
      expect(obj.deviceType).toEqual(device);
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('creates an ios installation with ids', (done) => {
    var t = '11433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var device = 'ios';
    var input = {
      'deviceToken': t,
      'deviceType': device
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      var obj = results[0];
      expect(obj.deviceToken).toEqual(t);
      expect(obj.deviceType).toEqual(device);
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('creates an embedded installation with ids', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var device = 'embedded';
    var input = {
      'installationId': installId,
      'deviceType': device
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      var obj = results[0];
      expect(obj.installationId).toEqual(installId);
      expect(obj.deviceType).toEqual(device);
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('creates an android installation with all fields', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var device = 'android';
    var input = {
      'installationId': installId,
      'deviceType': device,
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      var obj = results[0];
      expect(obj.installationId).toEqual(installId);
      expect(obj.deviceType).toEqual(device);
      expect(typeof obj.channels).toEqual('object');
      expect(obj.channels.length).toEqual(2);
      expect(obj.channels[0]).toEqual('foo');
      expect(obj.channels[1]).toEqual('bar');
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('creates an ios installation with all fields', (done) => {
    var t = '11433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var device = 'ios';
    var input = {
      'deviceToken': t,
      'deviceType': device,
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      var obj = results[0];
      expect(obj.deviceToken).toEqual(t);
      expect(obj.deviceType).toEqual(device);
      expect(typeof obj.channels).toEqual('object');
      expect(obj.channels.length).toEqual(2);
      expect(obj.channels[0]).toEqual('foo');
      expect(obj.channels[1]).toEqual('bar');
      done();
    }).catch((error) => { console.log(error); });
  });

  it('should properly fail queying installations', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var device = 'android';
    var input = {
      'installationId': installId,
      'deviceType': device
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      let query = new Parse.Query(Parse.Installation);
      return query.find()
    }).then((results) => {
      fail('Should not succeed!');
      done();
    }).catch((error) => {
      expect(error.code).toBe(119);
      expect(error.message).toBe('Clients aren\'t allowed to perform the find operation on the installation collection.')
      done();
    });
  });

  it_exclude_dbs(['postgres'])('should properly queying installations with masterKey', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var device = 'android';
    var input = {
      'installationId': installId,
      'deviceType': device
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      let query = new Parse.Query(Parse.Installation);
      return query.find({useMasterKey: true});
    }).then((results) => {
      expect(results.length).toEqual(1);
      var obj = results[0].toJSON();
      expect(obj.installationId).toEqual(installId);
      expect(obj.deviceType).toEqual(device);
      done();
    }).catch((error) => {
      fail('Should not fail');
      done();
    });
  });

  it('fails with missing ids', (done) => {
    var input = {
      'deviceType': 'android',
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      fail('Should not have been able to create an Installation.');
      done();
    }).catch((error) => {
      expect(error.code).toEqual(135);
      done();
    });
  });

  it('fails for android with missing type', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var input = {
      'installationId': installId,
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      fail('Should not have been able to create an Installation.');
      done();
    }).catch((error) => {
      expect(error.code).toEqual(135);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('creates an object with custom fields', (done) => {
    var t = '11433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var input = {
      'deviceToken': t,
      'deviceType': 'ios',
      'channels': ['foo', 'bar'],
      'custom': 'allowed'
    };
  rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      var obj = results[0];
      expect(obj.custom).toEqual('allowed');
      done();
    }).catch((error) => { console.log(error); });
  });

  // Note: did not port test 'TestObjectIDForIdentifiers'

  it_exclude_dbs(['postgres'])('merging when installationId already exists', (done) => {
    var installId1 = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '11433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var installId2 = '12345678-abcd-abcd-abcd-123456789abd';
    var input = {
      'deviceToken': t,
      'deviceType': 'ios',
      'installationId': installId1,
      'channels': ['foo', 'bar']
    };
    var firstObject;
    var secondObject;
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      firstObject = results[0];
      delete input.deviceToken;
      delete input.channels;
      input['foo'] = 'bar';
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      secondObject = results[0];
      expect(firstObject._id).toEqual(secondObject._id);
      expect(secondObject.channels.length).toEqual(2);
      expect(secondObject.foo).toEqual('bar');
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('merging when two objects both only have one id', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input1 = {
      'installationId': installId,
      'deviceType': 'ios'
    };
    var input2 = {
      'deviceToken': t,
      'deviceType': 'ios'
    };
    var input3 = {
      'deviceToken': t,
      'installationId': installId,
      'deviceType': 'ios'
    };
    var firstObject;
    var secondObject;
    rest.create(config, auth.nobody(config), '_Installation', input1)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      firstObject = results[0];
      return rest.create(config, auth.nobody(config), '_Installation', input2);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(2);
      if (results[0]['_id'] == firstObject._id) {
        secondObject = results[1];
      } else {
        secondObject = results[0];
      }
      return rest.create(config, auth.nobody(config), '_Installation', input3);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0]['_id']).toEqual(secondObject._id);
      done();
    }).catch((error) => { console.log(error); });
  });

  xit('creating multiple devices with same device token works', (done) => {
    var installId1 = '11111111-abcd-abcd-abcd-123456789abc';
    var installId2 = '22222222-abcd-abcd-abcd-123456789abc';
    var installId3 = '33333333-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId1,
      'deviceType': 'ios',
      'deviceToken': t
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      input.installationId = installId2;
      return rest.create(config, auth.nobody(config), '_Installation', input);
    }).then(() => {
      input.installationId = installId3;
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', {installationId: installId1}, installationSchema, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      return database.adapter.find('_Installation', {installationId: installId2}, installationSchema, {});
    }).then(results => {
      expect(results.length).toEqual(1);
      return database.adapter.find('_Installation', {installationId: installId3}, installationSchema, {});
    }).then((results) => {
      expect(results.length).toEqual(1);
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('updating with new channels', (done) => {
    var input = {
      installationId: '12345678-abcd-abcd-abcd-123456789abc',
      deviceType: 'android',
      channels: ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      var id = results[0].objectId;
      var update = {
        'channels': ['baz']
      };
      return rest.update(config, auth.nobody(config), '_Installation', id, update);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].channels.length).toEqual(1);
      expect(results[0].channels[0]).toEqual('baz');
      done();
    }).catch(error => {
      console.log(error);
      fail();
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update android fails with new installation id', (done) => {
    var installId1 = '12345678-abcd-abcd-abcd-123456789abc';
    var installId2 = '87654321-abcd-abcd-abcd-123456789abc';
    var input = {
      'installationId': installId1,
      'deviceType': 'android',
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = { 'installationId': installId2 };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    }).then(() => {
      fail('Updating the installation should have failed.');
      done();
    }).catch((error) => {
      expect(error.code).toEqual(136);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update ios fails with new deviceToken and no installationId', (done) => {
    var a = '11433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var b = '91433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var input = {
      'deviceToken': a,
      'deviceType': 'ios',
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = { 'deviceToken': b };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    }).then(() => {
      fail('Updating the installation should have failed.');
    }).catch((error) => {
      expect(error.code).toEqual(136);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update ios updates device token', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '11433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var u = '91433856eed2f1285fb3aa11136718c1198ed5647875096952c66bf8cb976306';
    var input = {
      'installationId': installId,
      'deviceType': 'ios',
      'deviceToken': t,
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = {
        'installationId': installId,
        'deviceToken': u,
        'deviceType': 'ios'
      };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].deviceToken).toEqual(u);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update fails to change deviceType', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var input = {
      'installationId': installId,
      'deviceType': 'android',
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = {
        'deviceType': 'ios'
      };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    }).then(() => {
      fail('Should not have been able to update Installation.');
      done();
    }).catch((error) => {
      expect(error.code).toEqual(136);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update android with custom field', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var input = {
      'installationId': installId,
      'deviceType': 'android',
      'channels': ['foo', 'bar']
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = {
        'custom': 'allowed'
      };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0]['custom']).toEqual('allowed');
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update android device token with duplicate device token', (done) => {
    var installId1 = '11111111-abcd-abcd-abcd-123456789abc';
    var installId2 = '22222222-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId1,
      'deviceToken': t,
      'deviceType': 'android'
    };
    var firstObject;
    var secondObject;
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      input = {
        'installationId': installId2,
        'deviceType': 'android'
      };
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {installationId: installId1}, {}))
    .then(results => {
      firstObject = results[0];
      expect(results.length).toEqual(1);
      return database.adapter.find('_Installation', installationSchema, {installationId: installId2}, {});
    }).then(results => {
      expect(results.length).toEqual(1);
      secondObject = results[0];
      // Update second installation to conflict with first installation
      input = {
        'objectId': secondObject.objectId,
        'deviceToken': t
      };
      return rest.update(config, auth.nobody(config), '_Installation', secondObject.objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {objectId: firstObject.objectId}, {}))
    .then(results => {
      // The first object should have been deleted
      expect(results.length).toEqual(0);
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('update ios device token with duplicate device token', (done) => {
    var installId1 = '11111111-abcd-abcd-abcd-123456789abc';
    var installId2 = '22222222-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId1,
      'deviceToken': t,
      'deviceType': 'ios'
    };
    var firstObject;
    var secondObject;
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      input = {
        'installationId': installId2,
        'deviceType': 'ios'
      };
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {installationId: installId1}, {}))
    .then((results) => {
      expect(results.length).toEqual(1);
      firstObject = results[0];
      return database.adapter.find('_Installation', installationSchema, {installationId: installId2}, {});
    })
    .then(results => {
      expect(results.length).toEqual(1);
      secondObject = results[0];
      // Update second installation to conflict with first installation id
      input = {
        'installationId': installId2,
        'deviceToken': t
      };
      return rest.update(config, auth.nobody(config), '_Installation', secondObject.objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {objectId: firstObject.objectId}, {}))
    .then(results => {
      // The first object should have been deleted
      expect(results.length).toEqual(0);
      done();
    }).catch((error) => { console.log(error); });
  });

  xit('update ios device token with duplicate token different app', (done) => {
    var installId1 = '11111111-abcd-abcd-abcd-123456789abc';
    var installId2 = '22222222-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId1,
      'deviceToken': t,
      'deviceType': 'ios',
      'appIdentifier': 'foo'
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      input.installationId = installId2;
      input.appIdentifier = 'bar';
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      // The first object should have been deleted during merge
      expect(results.length).toEqual(1);
      expect(results[0].installationId).toEqual(installId2);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update ios token and channels', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId,
      'deviceType': 'ios'
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = {
        'deviceToken': t,
        'channels': []
      };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].installationId).toEqual(installId);
      expect(results[0].deviceToken).toEqual(t);
      expect(results[0].channels.length).toEqual(0);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update ios linking two existing objects', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId,
      'deviceType': 'ios'
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      input = {
        'deviceToken': t,
        'deviceType': 'ios'
      };
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, { deviceToken: t }, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = {
        'deviceToken': t,
        'installationId': installId,
        'deviceType': 'ios'
      };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].installationId).toEqual(installId);
      expect(results[0].deviceToken).toEqual(t);
      expect(results[0].deviceType).toEqual('ios');
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update is linking two existing objects w/ increment', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId,
      'deviceType': 'ios'
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => {
      input = {
        'deviceToken': t,
        'deviceType': 'ios'
      };
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, { deviceToken: t }, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = {
        'deviceToken': t,
        'installationId': installId,
        'deviceType': 'ios',
        'score': {
          '__op': 'Increment',
          'amount': 1
        }
      };
      return rest.update(config, auth.nobody(config), '_Installation', results[0].objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].installationId).toEqual(installId);
      expect(results[0].deviceToken).toEqual(t);
      expect(results[0].deviceType).toEqual('ios');
      expect(results[0].score).toEqual(1);
      done();
    });
  });

  it_exclude_dbs(['postgres'])('update is linking two existing with installation id', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId,
      'deviceType': 'ios'
    };
    var installObj;
    var tokenObj;
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      installObj = results[0];
      input = {
        'deviceToken': t,
        'deviceType': 'ios'
      };
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, { deviceToken: t }, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      tokenObj = results[0];
      input = {
        'installationId': installId,
        'deviceToken': t,
        'deviceType': 'ios'
      };
      return rest.update(config, auth.nobody(config), '_Installation', installObj.objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, { objectId: tokenObj.objectId }, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].installationId).toEqual(installId);
      expect(results[0].deviceToken).toEqual(t);
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('update is linking two existing with installation id w/ op', (done) => {
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var input = {
      'installationId': installId,
      'deviceType': 'ios'
    };
    var installObj;
    var tokenObj;
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      installObj = results[0];
      input = {
        'deviceToken': t,
        'deviceType': 'ios'
      };
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, { deviceToken: t }, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      tokenObj = results[0];
      input = {
        'installationId': installId,
        'deviceToken': t,
        'deviceType': 'ios',
        'score': {
          '__op': 'Increment',
          'amount': 1
        }
      };
      return rest.update(config, auth.nobody(config), '_Installation', installObj.objectId, input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, { objectId: tokenObj.objectId }, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].installationId).toEqual(installId);
      expect(results[0].deviceToken).toEqual(t);
      expect(results[0].score).toEqual(1);
      done();
    }).catch((error) => { console.log(error); });
  });

  it_exclude_dbs(['postgres'])('ios merge existing same token no installation id', (done) => {
    // Test creating installation when there is an existing object with the
    // same device token but no installation ID.  This is possible when
    // developers import device tokens from another push provider; the import
    // process does not generate installation IDs. When they later integrate
    // the Parse SDK, their app is going to save the installation. This save
    // op will have a client-generated installation ID as well as a device
    // token. At this point, if the device token matches the originally-
    // imported installation, then we should reuse the existing installation
    // object in case the developer already added additional fields via Data
    // Browser or REST API (e.g. channel targeting info).
    var t = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    var installId = '12345678-abcd-abcd-abcd-123456789abc';
    var input = {
      'deviceToken': t,
      'deviceType': 'ios'
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      input = {
        'installationId': installId,
        'deviceToken': t,
        'deviceType': 'ios'
      };
      return rest.create(config, auth.nobody(config), '_Installation', input);
    })
    .then(() => database.adapter.find('_Installation', installationSchema, {}, {}))
    .then(results => {
      expect(results.length).toEqual(1);
      expect(results[0].deviceToken).toEqual(t);
      expect(results[0].installationId).toEqual(installId);
      done();
    })
    .catch(error => {
      console.log(error);
      fail();
      done();
    });
  });

  it('allows you to get your own installation (regression test for #1718)', done => {
    let installId = '12345678-abcd-abcd-abcd-123456789abc';
    let device = 'android';
    let input = {
      'installationId': installId,
      'deviceType': device
    };
    rest.create(config, auth.nobody(config), '_Installation', input)
    .then(createResult => {
      let headers = {
        'X-Parse-Application-Id': 'test',
        'X-Parse-REST-API-Key':   'rest',
      };
      request.get({
        headers: headers,
        url: 'http://localhost:8378/1/installations/' + createResult.response.objectId,
        json: true,
      }, (error, response, body) => {
        expect(body.objectId).toEqual(createResult.response.objectId);
        done();
      });
    })
    .catch(error => {
      console.log(error);
      fail('failed');
      done();
    });
  });

  // TODO: Look at additional tests from installation_collection_test.go:882
  // TODO: Do we need to support _tombstone disabling of installations?
  // TODO: Test deletion, badge increments
});
