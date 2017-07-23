module.exports = function defaultSchemaAttributePlugin (schema, options) {
  	schema.add({ 
  		created: { 
	        type: Date, 
            mergeable: false,
	        default: Date.now 
	    },
	    modified: { 
	        type: Date, 
            mergeable: false,
	        default: Date.now 
	    },
	    isDeleted: {
	        type: Boolean, 
	        default: false,
	        index: true
	    }
  	});
  
  	schema.pre('save', function (next) {
  		if(!this.isNew) {
    		this.modified = Date.now();
  		}
    	next();
  	});
  
  	if (options && options.indexPaths) {
  		for(var key in options.indexPaths) {
  			schema.path(key).index(options.indexPaths[key]);
  		}
  	}
}