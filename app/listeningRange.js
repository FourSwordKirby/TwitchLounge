
// Returns an array of arrays, with each array containing which user indexes that user
// is in range of
exports.getListenObjects = function(users, listenRange) {
    var sortedUsers = [];

    //Initializes our final return, augments the coordinates with their actual positions
    var listenDict = [];
    for (var i = 0; i < users.length; i++) 
    {
        listenDict.push([]);
        users[i].idx = i;
        sortedUsers.push(users[i]);
    }

    sortedUsers = sortedUsers.sort(function(c1, c2){return c1.x - c2.x})
    sortedUsers = getXOverlap(sortedUsers, listenRange);

    sortedUsers = sortedUsers.sort(function(c1, c2){return c1.y - c2.y})
    sortedUsers = getYOverlap(sortedUsers, listenRange);
    for (var i = 0; i < sortedUsers.length-1; i++) 
    {
        for(var j = i+1; j < sortedUsers.length;j++)
        {
            coord1 = sortedUsers[i];
            coord2 = sortedUsers[j];

            if(coord2.x <= coord1.x  + listenRange)
            {
                listenDict[coord1.idx].push(coord2.idx);
                listenDict[coord2.idx].push(coord1.idx);
            }
            else
                break;
        }
    }

    for (var i = 0; i < listenDict.length; i++) 
    {
        listenDict[i] = Array.from(new Set(listenDict[i]))
    }
    return listenDict
}

function getXOverlap(users, listenRange)
{
    var filteredCoord = []

    for (var i = 0; i < users.length-1; i++) 
    {
        for(var j = i+1; j < users.length;j++)
        {
            coord1 = users[i];
            coord2 = users[j];

            if(coord2.x <= coord1.x  + listenRange)
            {
                filteredCoord.push(coord1);
                filteredCoord.push(coord2);
            }
            else
                break;
        }
    }
    filteredCoord = Array.from(new Set(filteredCoord))

    return filteredCoord
}

function getYOverlap(users, listenRange)
{
    var filteredCoord = []

    for (var i = 0; i < users.length-1; i++) 
    {
        for(var j = i+1; j < users.length;j++)
        {
            coord1 = users[i];
            coord2 = users[j];

            if(coord2.y <= coord1.y  + listenRange)
            {
                filteredCoord.push(coord1);
                filteredCoord.push(coord2);
            }
            else
                break;
        }
    }
    filteredCoord = Array.from(new Set(filteredCoord))

    return filteredCoord
}

// ----------------------------------------
// Tests

// var User = require('./models/user.js');

// var user1 = new User(); user1.move(45, 64);
// var user2 = new User(); user2.move(56, 98);
// var user3 = new User(); user3.move(23, 44);
// var user4 = new User(); user4.move(33, 44);
// var user5 = new User(); user5.move(53, 44);
// var users = [user1, user2, user3, user4, user5]

// var dist = 15;

// console.log(users);
// console.log(getListenObjects(users, dist))
// console.log(users);