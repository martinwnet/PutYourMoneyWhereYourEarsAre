var username = "dave";
var resultsPerPage = 5;
var currentPage = 1;

var owned = new Array();
var displayed = new Array();
var albums = new Array();
var fakeId = 1; //Increment and use when album has no mbid
jQuery.ajaxSetup({
    beforeSend: function() {
        $('#divLoading').show();
    },
    complete: function() {
        $('#divLoading').hide();
    },
    success: function() {}
});

function initialFetch() {
    //clear variables that may have been used previously
    currentPage = 1;
    owned = new Array();
    displayed = new Array();
    albums = new Array();
    fakeId = 1;
    $("#albums").html('');
    $("#divError").html('');

    //get variables from page
    username = $("#username").val();
    resultsPerPage = $("#resultsPerPage").val();
    fetch(resultsPerPage, currentPage); //initial fetch  
}

function fetch(limit, page) {
    $.getJSON("http://ws.audioscrobbler.com/2.0/?format=json&method=user.gettopalbums&user=" + username + "&limit=" + limit + "&page=" + page + "&api_key=b25b959554ed76058ac220b7b2e0a026", function success(data) {
        if (data.error) {
            alert(data.message);
        }
        else {
            if (data.topalbums.album) {//if user has top albums
                $.each(data.topalbums.album, function() {
                    albums.push(this);
                });
                if (currentPage == 1) {
                    displayAlbums();
                }
                else {
                    loadNextAlbum();
                }
            }
            else
            {
                $("#divError").html("Couldn't load top albums from last.fm");
            }
        }
    });
}

function displayAlbums() {
    //use copy of array to loop through and display, this allows us to remove as we display
    albumsCopy = albums.slice();
    $.each(albumsCopy, function() {
        display(this);
    });
}

function display(album) {
    var albumId = (album.mbid == "") ? albumId = fakeId++ : album.mbid;
    if ($.inArray(albumId, owned) == -1 && $.inArray(albumId, displayed) == -1) {
        $("#albums").append("<li id=" + albumId + ">" + album.artist.name + " - " + album.name + "<br /><a href='#' id='removeLink' onclick='remove(\"" + albumId + "\");'>own</a> " + "</li>");
        displayed.push(albumId);
        if (album.image[3]) {
            var imgUrl = album.image[3]["#text"];

            $("#" + albumId).append("<br /><img src='" + imgUrl + "' />");
        }
        albums.splice($.inArray(album, albums), 1); //remove from albums list
        getBuyLink(album, albumId);
        //getAlbumInfo(album, albumId);
    }
}

function getBuyLink(album, albumId) {
    var artist = album.artist.name;
    var albumName = album.name;
    $.getJSON("http://ws.audioscrobbler.com/2.0/?format=json&method=album.getbuylinks&artist=" + escape(artist) + "&album=" + escape(albumName) + "&country=united%20kingdom&api_key=b25b959554ed76058ac220b7b2e0a026", function success(data) {
        if (data.error) {
            alert(data.message);
        }
        else {
            var supplierName = data.affiliations.physicals.affiliation[0].supplierName;
            var price = "";
            if (data.affiliations.physicals.affiliation[0].price) {
                price = data.affiliations.physicals.affiliation[0].price.amount + " " + data.affiliations.physicals.affiliation[0].price.currency;
            }
            var buyLink = data.affiliations.physicals.affiliation[0].buyLink;
            $("#" + albumId + " #removeLink").after(" <a href='" + buyLink + "' title='" + price + "' target='_blank'>buy</a>");
        }
    });
}

function getAlbumInfo(album, albumId) {
    var artist = album.artist.name;
    var albumName = album.name;
    $.getJSON("http://ws.audioscrobbler.com/2.0/?format=json&method=album.getinfo&artist=" + escape(artist) + "&album=" + escape(albumName) + "&api_key=b25b959554ed76058ac220b7b2e0a026", function success(data) {
        if (data.error) {
            alert(data.message);
        }
        else {
            //var imgUrl = data.album.image[0]["#text"];
            //$("#" + albumId).append(" <img src='" + imgUrl + "' />");
        }
    });
}

function loadNextAlbum() {
    if (albums.length > 0) {
        display(albums[0]);
    }
}

function remove(id) {
    owned.push(id);
    $("#" + id).hide("slow");
    if (albums.length > 0) {
        loadNextAlbum();
    }
    else {
        fetch(resultsPerPage, ++currentPage);
    }
}