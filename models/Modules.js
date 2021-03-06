var mongoose = require('mongoose');

var ModulesSchema = mongoose.Schema({
  name: String,
  description: String,
  test: {
    _type: {
      type: String
    },
    enum_data: {
      type: String
    },
    fuzz_data: {

    },
    userScript: {
      type: String
    },
    state: {
      type: String
    },
    timeout: {
      type: String
    }
  },
  results: {
    _type: {
      type: String
    }, // [SIMPLE_TABLE]
    columns: [],
    browsers: {}
  },
  tags: [],
  owner: String,
  favs: [],
  created: {
    type: Date,
    default: Date.now
  },
  viewCount: Number

});



ModulesSchema.statics.add = function(obj, callback) {
  var instance = new Modules();

  instance.name = obj.name;
  instance.description = obj.description;
  instance.test._type = obj.test._type;
  instance.test.state = obj.test.state;
  instance.test.userScript = obj.test.userScript;
  if (obj.test.enum_data)
    instance.test.enum_data = obj.test.enum_data;
  if (obj.test.fuzz_data)
    instance.test.fuzz_data = obj.test.fuzz_data;
  instance.results._type = obj.results._type;
  if (obj.results.columns)
    instance.results.columns = obj.results.columns;
  instance.tags = obj.tags;
  instance.owner = obj.owner;
  instance.favs = new Array();


  instance.save(function(err) {
    callback(err, instance);
  });
};

ModulesSchema.statics.getModuleById = function(id, callback) {
  this.findOne({
    _id: id
  }, function(err, module) {
    if (!module) return callback(new Error('The module is not found'));
    return callback(null, module);
  });
};

ModulesSchema.statics.getModuleByIdAndIncreaseViewCount = function(id, callback){
  this.getModuleById(id, function(err, module){
    ModulesSchema.statics.addViewCount(id, function(){
      return callback(err, module);
    });
  });
};

ModulesSchema.statics.getModulesByUser = function(username, callback) {
  this.find({ owner: username }, function(err, modules) {
    return callback(null, modules);
  });
};

ModulesSchema.statics.getFavsByUser = function(username, callback) {
  this.find({ "favs": {$in: [username] }}, function(err, modules) {
    return callback(null, modules);
  });
};

// Returns the top 10 modules
ModulesSchema.statics.getTopModules = function(callback){
  this
    .find({})
    .sort({viewCount: -1})
    .limit(10)
    .exec(function(err, modules) {
      if (!modules) return callback(new Error('No modules found'));
      return callback(null, modules);
    });
};


ModulesSchema.statics.addViewCount = function(id, callback){
  Modules.update({_id: id}, {$inc: {viewCount: 1}}).exec(function(){
    callback();
  });
};


// Search by Name, Description and also by tags if starts with [tags]:
ModulesSchema.statics.searchAll = function(str, cb) {
  var query = {};
  str = str.toLowerCase().trim();
  if (str.indexOf('[tags]:') === 0) {
    var tags = str.substr(7).split(' ');
    query.tags = {};
    query.tags.$in = tags;
    console.log(tags);
  } else {
    query.$or = [];
    var obj = {};
    obj.name = {};
    obj.name.$regex = '.*' + str + '.*';
    obj.name.$options = 'i';

    query.$or.push(obj);
    obj = {};
    obj.description = {};
    obj.description.$regex = '.*' + str + '.*';
    obj.description.$options = 'i';
    query.$or.push(obj);
  }

  this.find(query, function(err, modules) {
    if (err)
      console.log(err);

    modules.forEach(function(module) {
      if(module.results.browsers) {
        module.browsers_tested = Object.keys(module.results.browsers).length;
      }
    });
    cb(err, modules);
  });
};


var Modules = mongoose.model('Modules', ModulesSchema);


module.exports= Modules;
