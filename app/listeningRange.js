var coord = [{x:45, y:64}, {x:56, y:98}, {x:23, y:44}, {x:33, y:44}, {x:53, y:44}];
var dist = 15;

function getListenObjects(coordinates, listenRange) {

    //Initializes our final return, augments the coordinates with their actual positions
    var listenDict = []
    for (var i = 0; i < coordinates.length; i++) 
    {
        listenDict.push([]);
        coordinates[i].idx = i
    }

    coordinates = coordinates.sort(function(c1, c2){return c1.x - c2.x})
    coordinates = getXOverlap(coordinates, listenRange);

    coordinates = coordinates.sort(function(c1, c2){return c1.y - c2.y})
    coordinates = getYOverlap(coordinates, listenRange);
    for (var i = 0; i < coordinates.length-1; i++) 
    {
        for(var j = i+1; j < coordinates.length;j++)
        {
            coord1 = coordinates[i];
            coord2 = coordinates[j];

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

function getXOverlap(coordinates, listenRange)
{
    var filteredCoord = []

    for (var i = 0; i < coordinates.length-1; i++) 
    {
        for(var j = i+1; j < coordinates.length;j++)
        {
            coord1 = coordinates[i];
            coord2 = coordinates[j];

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

function getYOverlap(coordinates, listenRange)
{
    var filteredCoord = []

    for (var i = 0; i < coordinates.length-1; i++) 
    {
        for(var j = i+1; j < coordinates.length;j++)
        {
            coord1 = coordinates[i];
            coord2 = coordinates[j];

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

console.log(getListenObjects(coord, dist))