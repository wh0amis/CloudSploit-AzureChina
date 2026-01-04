var shared = require(__dirname + '/../shared.js');
var functions = require('./functions.js');
var regLocations = require('./locations.js');
var govLocations = require('./locations_gov.js');
var chinaLocations = require('./locations_china.js');

var locations = function(govcloud, china) {
    // Support both explicit parameters and settings object
    if (typeof govcloud === 'object' && govcloud !== null) {
        // First argument is actually a settings object
        var settings = govcloud;
        if (settings.azure_china) return chinaLocations;
        if (settings.govcloud) return govLocations;
        return regLocations;
    }
    // Legacy support: explicit boolean parameters
    if (china) return chinaLocations;
    if (govcloud) return govLocations;
    return regLocations;
};

var helpers = {
    locations: locations
};

for (var s in shared) helpers[s] = shared[s];
for (var f in functions) helpers[f] = functions[f];

module.exports = helpers;
