'use strict';

var fs = require('fs'),
    path = require('path'),
    should = require('chai').should,
    directoryWatcher = require('../directoryWatcher.js');

var fixturesInputPath = path.join(__dirname, '../test/test-input');
var fixturesOutputPath = path.join(__dirname, '../test/test-output');
var testDocPath = fixturesInputPath + '/' +'test.doc'

if (!fs.existsSync(fixturesInputPath)) fs.mkdirSync(fixturesInputPath);
if (!fs.existsSync(fixturesOutputPath)) fs.mkdirSync(fixturesOutputPath);

directoryWatcher.startWatch(fixturesInputPath, fixturesOutputPath);

describe('directory watcher module', function () {
    it('should create a non text file in the output directory', function () {
        var newFile = new Date().getTime() + ".jpeg";
        var filePath = fixturesInputPath + '/' + newFile;
        var outputFile = fixturesOutputPath + '/' + newFile;

        fs.writeFile(filePath, "test", function (err) {
            if (err) return err;
        });

        fs.stat(filePath, function (err, stats) {
            if (err) {
                fs.unlinkSync(filePath);
                fs.unlinkSync(filePath);
                return console.error(err);
            }


            fs.unlink(filePath, function (err) {
                if (err) return console.log(err);
            });
        });

        fs.exists(outputFile, function (exists) {
            should(exists).equal(true);
            fs.unlinkSync(outputFile);
        });
    });

    it('should create a text file in the output directory', function () {
        var newFile = new Date().getTime() + ".txt";
        var filePath = fixturesInputPath + '/' + newFile;

        fs.writeFile(filePath, "test", function (err) {
            if (err) return err;

            fs.unlink(filePath, function (err) {
                if (err) return console.log(err);
            });
        });

        fs.stat(filePath, function (err, stats) {
            if (err) return console.error(err);
            var files = fs.readdirSync(fixturesOutputPath);
            fs.unlinkSync(fixturesOutputPath + '/' + files[1]);
            should(path.extname(files[1]) === ".txt").equal(true);
        });
    });

});
