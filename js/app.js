// Created an array list of loactions that will appear on our map //
// Each location is a pizza place or restaurant in the neighbourhood //
// The location data includes a name of the location, which matches the //
// name found on FourSquare, a Lat and Lng coordinate, a unique FS id #, //
// and a alternative description for the information window details //
// the location coordinated and unique id #'s can be found at https://developer.foursquare.com/docs/explore //
var locationsData = [{
        name: 'Sparkys Family Restaurant',
        lat: 50.40584037032503,
        lng: -104.63804520901597,
        foursquare: '4c156c71127f9521f7042525',
        altDescription: 'Also known as the Sparkledome'
    },
    {
        name: 'Pizza Pizza',
        lat: 50.417880985180474,
        lng: -104.61953207287549,
        foursquare: '4bb54278ef159c74b88b74f7',
        altDescription: 'Hot and ready to go'
    },
    {
        name: 'Houston Pizza',
        lat: 50.48129281672004,
        lng: -104.66588481747148,
        foursquare: '4bb55102941ad13acc1d1ee3',
        altDescription: 'Real Good Food'
    },
    {
        name: 'Tumblers Pizza',
        lat: 50.40798702150921,
        lng: -104.61024372050086,
        foursquare: '4bbb30313db7b713c501249a',
        altDescription: 'Serving Regina Familys good food since 1979'
    },
    {
        name: 'Regent Family Restaurant',
        lat: 50.4742647934236,
        lng: -104.6363707656719,
        foursquare: '4c34a13f213c2d7f22c3385d',
        altDescription: 'Proud to serve Regina for over 30 years'
    },
    {
        name: 'The Open Tap',
        lat: 50.49601,
        lng: -104.64232849999999,
        foursquare: '4bdf1d8de75c0f4705f0c903',
        altDescription: 'Enjoy the good life at the Tap!'
    },
    {
        name: 'East Side Marios',
        lat: 50.44679255677195,
        lng: -104.64232849999999,
        foursquare: '4b81b634f964a52051b930e3',
        altDescription: 'Home Of All You Can Eat‎'
    },
    {
        name: 'Copper Kettle',
        lat: 50.447613705343315,
        lng: -104.61067164194334,
        foursquare: '4bb9188e53649c7451b547fb',
        altDescription: 'Always a terrific lunch buffet'
    },
    {
        name: 'Bocados',
        lat: 50.4462445,
        lng: -104.571313,
        foursquare: '4bd1e3e777b29c748e7f8d82',
        altDescription: 'Laid-back eatery with live music'
    },
    {
        name: 'Boston Pizza',
        lat: 50.44648064015329,
        lng: -104.53598499298096,
        foursquare: '4c8ffa610b9e3704a2d3635e',
        altDescription: 'Your among friends'
    }
];

// Our Foursquare API information uses our ClientId number and our ClientSecret number //
// To obtain this information, an account will need to be created for free on https://foursquare.com/developers/apps //
// The API will require some information about your app before receiving the Id and Secret numbers //

var foursquare = {
    clientId: 'MZLMMHMDYLLSPW0ACCE3DMRMHUQEYGIOPXH5ITOJBTD0D4ON',
    clientSecret: '1G32AEUJHLJJ0JD1N54L3E4FQRR1XSPGPEKCWECKSKLT0HPB',
};

// Created a variable for the map view //
var mapView;

// Created a vairable for the information window //
var informationWindow;

// Foursquare information window Api call content display //
// Using the Array.prototype.join() method on the location //
// details to separate the location information //
function Venue(data) {
    this.name = data.name;
    this.address = data.location.formattedAddress.join(' // ');
    this.photos = data.photos.groups[0].items;
}

// Activate knockout once google map script returns //
function initMap() {
    ko.applyBindings(new viewModel());
}

// Created an error message to appear if google maps fails to load //
function mapError() {
    alert("Error, Could not load Google Maps");
}

// Created our viewModel for the app //
var viewModel = function() {
    var self = this;
    // Centers our map at Wascana Lake location in Regina when user loads the app //
    self.mapCenter = {
        lat: 50.43,
        lng: -104.61
    };

    // Handles the location options displayed in the view list //
    self.locationData = ko.observableArray();
    // Handles the search filter text field, listening to the keys typed in the filter "afterkeydown" //
    self.filterSearch = ko.observable('');

    // Handles displayed markers and options available in //
    // list view, make lowercase to compare the strings //
    self.filteredLocationsData = ko.computed(function() {
        return self.locationData().filter(function(ld) {
            lowerCaseName = ld.name.toLowerCase();
            var isMatched = lowerCaseName.indexOf(self.filterSearch().toLowerCase()) !== -1;
            ld.marker.setVisible(isMatched);
            return isMatched;
        }, this);
    }, this);

    // Re-center our map to the map marker that is currently being previewed //
    // We set our zoom here to be 13, this distance is //
    // reasonable to view all markers at once on a full screen //
    map = new google.maps.Map(document.getElementById('map'), {
        center: self.mapCenter,
        zoom: 13
    });

    // Loop over array and handles setting markers //
    for (var i = 0, wid = locationsData.length; i < wid; i++) {
        // Set id value to i, on page load loops through our array list //
        locationsData[i].id = i;
        var ld = new mapModel(locationsData[i]);
        self.locationData.push(ld);
    }


    // Click on the link - triggers an event that the list option has been clicked //
    chooseLocationsData = function(link) {
        google.maps.event.trigger(link.marker, 'click');
    };
};

// Our model for location data with marker, JSON call //
var mapModel = function(ldData) {
    var self = this;

    self.name = ldData.name;
    self.id = ldData.id;

    // Handles content for the information window //
    self.contentFoursquare = ko.observable();

    // Gather data about the venue from the Foursquare Api in JSON formatting //
    $.getJSON('https://api.foursquare.com/v2/venues/' + ldData.foursquare + '?v=20170612&client_id=MZLMMHMDYLLSPW0ACCE3DMRMHUQEYGIOPXH5ITOJBTD0D4ON&client_secret=1G32AEUJHLJJ0JD1N54L3E4FQRR1XSPGPEKCWECKSKLT0HPB', function(allData) {
        var mapVenue = $.map(allData.response, function(item) {
            return new Venue(item);
        });
        // Handles displaying the name of the location, altDescription, and location information retrieved from FourSquare //
        var contentString = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h2 id=firstHeading" class="firstHeading">' + mapVenue[0].name + '</h2>' +
            '<div id="bodyContent">' +
            '<p>' + ldData.altDescription + '<br>' + mapVenue[0].address + '</p>' +
            '<div class="imageList">';

        // Handles displaying the images from the photos array for mapVenue retrieved from FourSquare //
        // We set our image size to be 100x100, this can be adjusted to be smaller or larger //
        for (var p = 0, wid = mapVenue[0].photos.length;
            (p < wid) && (p < 2); p++) {
            contentString += '<img src="' + mapVenue[0].photos[p].prefix + '100x100' + mapVenue[0].photos[p].suffix + '"/> ';
        }
        // Handles displaying the source links for the data retrieved from FourSquare and from Google Maps //
        contentString +=
            '</div>' +
            '<p>Venue data provided by  <a href="https://foursquare.com/v/' +
            ldData.foursquare + '?ref=MZLMMHMDYLLSPW0ACCE3DMRMHUQEYGIOPXH5ITOJBTD0D4ON' +
            '">Foursquare API</a>.<br>Map data ©2017 <a href="https://maps.google.com">Google</a>.' +
            '</p>' +
            '</div>' +
            '</div>';
        self.contentFoursquare(contentString);

    }).fail(function() {
        // Handles error loading connection to Foursquare //
        var contentString = '<div id="content">' +
            '<div id="siteNotice">' +
            '</div>' +
            '<h2 id="firstHeading" class="firstHeading">' + ldData.name + '</h2>' +
            '<div id="bodyContent">' +
            '<p>' + ldData.altDescription + '</p>' +
            '</div>' +
            '<p><i>Error, Venue data could not be loaded from Foursquare.</i></p>' +
            '</div>' +
            '</div>';
        self.contentFoursquare(contentString);
    });

    // Handles creating a new map marker //
    self.marker = new google.maps.Marker({
        map: map,
        position: {
            lat: ldData.lat,
            lng: ldData.lng
        },
        content: ldData.altDescription,
    });

    // Handles the listener on the map marker which makes it animate bounce, //
    // hears that a list item has been clicked and triggers the info window to appear on the map //
    self.marker.addListener('click', function() {
        var bouncingMarker = this;
        // Handles the bouncing animation //
        bouncingMarker.setAnimation(google.maps.Animation.BOUNCE);
        // Handles the time it takes to animate the the marker bounce, 700ms //
        setTimeout(function() {
            bouncingMarker.setAnimation(null);
        }, 700);

        if ((informationWindow) && (informationWindow.open)) {
            informationWindow.close();
        }

        informationWindow = new google.maps.InfoWindow({
            content: self.contentFoursquare(),
        });

        // Handles recentering the map to the map marker //
        map.setCenter(new google.maps.LatLng(bouncingMarker.position.lat(), bouncingMarker.position.lng()));
        // Handles opening the information window //
        informationWindow.open(map, bouncingMarker);
    });

    // Handles adding the marker to the map //
    self.marker.setMap(map);
};
