var mongo = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/local";
var validUrl = require("valid-url");

var express = require("express");
var app = express();

app.use("/", function(req, res) {
    var reqUrl = req.originalUrl.substr(1);
    var resUrl = "";
    if (reqUrl) {
        mongo.connect(url, function(err, db) {
            if (err) throw err;
            var coll = db.collection("urlShortener");
            var shortUrl = "";
            if (validUrl.isWebUri(reqUrl)) {
                coll.find({"url": reqUrl}).toArray(function(err, doc) {
                    if (err) throw err;
                    if (doc.length) {
                        res.send(JSON.stringify({"url": doc[0].url, "shortenedUrl": "https://api-projects-rfoyer.c9users.io/" + doc[0].shortenedUrl}));
                        db.close();
                    }
                    else {
                        coll.insert({"url": reqUrl} );
                        coll.find({"url": reqUrl}).toArray(function(err, doc) {
                            if (err) throw err;
                            shortUrl = doc[0]._id.toString().substr(-4);
                            coll.update({"url": reqUrl}, { $set: {"shortenedUrl": shortUrl}});    
                            res.send(JSON.stringify({url: reqUrl, shortenedUrl: "https://api-projects-rfoyer.c9users.io/" + shortUrl}));
                            db.close();
                        });
                    }
                });
            }
            else {
                coll.find({ "shortenedUrl": reqUrl}).toArray(function(err, doc) {
                    if (err) throw err;
                    if (doc.length) {
                        res.redirect(doc[0].url);
                        db.close();
                    }
                    else {
                        res.send(doc);
                        db.close();
                    }
                });
            }
        });
    }
    else {
        res.send("error: valid URL not entered");
    }
});

app.listen(8080);