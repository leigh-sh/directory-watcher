'use strict';

var fs = require('fs'),
    path = require('path');

var watcher;

function getFileType(fileName) {
    return fileName.split('.').pop();
}

function addTimeToFileName(fileName) {
    var fileType = getFileType(fileName);
    var filePrefix = fileName.substr(0, fileName.lastIndexOf('.'));
    filePrefix += getTimeStr();
    return filePrefix + '.' + fileType;
}

function get24HourDisplay(timeDigit) {
    return ("0" + timeDigit).slice(-2);
}

function getTimeStr() {
    var d = new Date(),
        hour = get24HourDisplay(d.getHours()),
        minute = get24HourDisplay(d.getMinutes());

    return (hour + minute);
}

function copyFile(sourceDirectory, targetDirectory, fileName, callback) {
    var sourceFile = sourceDirectory + "/" + fileName,
        targetFile = targetDirectory + "/" + fileName;
    if (!fs.existsSync(sourceFile)) return;

    fs.stat(targetFile, function (err) {
        if (!err) return callback(new Error("File " + targetFile + " already exists."));

        fs.stat(sourceFile, function (err, stats) {
            if (err) return callback(err);

            if (stats.isDirectory()) {
                fs.mkdirSync(targetFile);
                fs.readdirSync(sourceFile).forEach(function (fileInDir) {
                    copyFile(path.join(sourceFile, fileInDir),
                        path.join(targetFile, fileInDir));
                });
            } else {
                var fileType = getFileType(fileName);
                if (fileType === 'txt') targetFile = addTimeToFileName(targetFile);

                var readStream = fs.createReadStream(sourceFile);
                readStream.pipe(fs.createWriteStream(targetFile));
                readStream.on('end', callback);
            }
        });
    });
}

function startWatch(sourceDirectory, targetDirectory) {
    if (!sourceDirectory || !targetDirectory) return console.error('Please enter source and target directory');

    if (!fs.existsSync(targetDirectory)) fs.mkdirSync(targetDirectory);

    watcher = fs.watch(sourceDirectory, {recursive: true}, function (event, fileName) {
        if (event === 'rename') {
            copyFile(sourceDirectory, targetDirectory, fileName, function (err) {
                if (err) throw err;

            });
        }
    });
}

function stopWatch() {
    watcher.close();
}

module.exports = {
    startWatch: startWatch,
    stopWatch: stopWatch
};

//startWatch('/Users/leigh/WebstormProjects/directoryWatcher/test/test-input', '/Users/leigh/WebstormProjects/directoryWatcher/test/test-output');