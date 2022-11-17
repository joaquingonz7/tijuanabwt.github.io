String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

function getWaitTimes()
{
    var tableRowTemplate = 
    `<tr>
    <td>{0}</th>
    <td>{1}</th>
    <td {2}>{3}</th>
    </tr>`
    var warningLevels = ['class="table-success"', 'class="table-warning"', 'class="table-danger"']
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            parser = new DOMParser();
            xmlDoc = this.responseXML;
            txt = "";
            
            items = xmlDoc.getElementsByTagName("item");
            for(i = 0; i < items.length; i++) {
                console.log(items[i])
                var title = items[i].firstChild.textContent;
                var tableElement = null;
                var additionalTitle = "";

                if(title == "Otay Mesa - Passenger") 
                {
                    additionalTitle = "";
                    tableElement = document.getElementById("otayBody"); 
                }
                else 
                { 
                    tableElement = document.getElementById("sanYsidroBody"); 

                    if(title == "San Ysidro - Cross Border Express") { additionalTitle = " CBX"; }
                    else if(title == "San Ysidro - PedWest") { additionalTitle = " PedWest"; }
                    else { additionalTitle = ""; }
                }

                var descriptionNodes = items[i].childNodes[1].childNodes;
                var laneType = "";
                var lanesOpenRegex = new RegExp("(\\w+) Lanes: At (\\d{1,2}:\\d{1,2} \\w{2}) P[S|D]T (\\d+) min delay (\\d+) lane\\(s\\) open");
                var lanesClosedRegex = new RegExp("(\w+) Lanes:\s+Lanes Closed");
                var laneTypeEmoji = "";

                for(j = 0; j < descriptionNodes.length; j++)
                {
                    var currentNodeType = descriptionNodes[j].nodeName;
                    var nodeText = descriptionNodes[j].textContent.trim();
                    if(currentNodeType == "h4") { laneType = nodeText; }
                    if(laneType == "Passenger Vehicles") { laneTypeEmoji = "🚗"; }
                    if(laneType == "Pedestrian") { laneTypeEmoji = "🚶"; }
                    if(currentNodeType == "#text")
                    {
                        if(lanesOpenRegex.test(nodeText)) 
                        {

                            var match = lanesOpenRegex.exec(nodeText);
                            var laneType = laneTypeEmoji + "-" + match[1] + additionalTitle;
                            var minutesWait = parseInt(match[3]);
                            var alertLevel;
                            if(minutesWait <= 30) { alertLevel = 0; }
                            if(minutesWait > 30 && minutesWait <= 60) { alertLevel = 1; }
                            if(minutesWait > 60) { alertLevel = 2; }
                            var hoursWait = Math.floor(minutesWait / 60);
                            minutesWait = minutesWait % 60;
                            var formattedWait = String(hoursWait) + ":" + String(minutesWait).padStart(2, '0') + " h";
                            var rowToInsert = tableRowTemplate.format(laneType, match[4], warningLevels[alertLevel], formattedWait);
                            tableElement.insertAdjacentHTML("beforeend", rowToInsert);
                        }
                        else if(lanesClosedRegex.test())
                        {
                            var match = lanesClosedRegex.exec(nodeText)
                            var laneType = laneTypeEmoji + "-" + match[1]
                            var rowToInsert = tableRowTemplate.format(laneType, "Closed", "", "Closed")
                            tableElement.insertAdjacentHTML("beforeend", rowToInsert);
                        }
                        else { continue; }
                    }

                }
            }
        }
      };

    xhttp.open("GET", "https://bwt.cbp.gov/api/bwtRss/HTML/-1/57,55/57,55,119,106", true);
    xhttp.send();
}

getWaitTimes();