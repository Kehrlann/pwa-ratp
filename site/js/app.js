(function() {
    var app = {
        isLoading: true,
        visibleCards: {},
        spinner: $('.loader'),
        cardTemplate: $('.cardTemplate'),
        container: $('.main')
    };

    var sampleData =
    {
        id:             "12-208",
        stop_id:        208,
        line_id:        12,
        priority:       0,
        stop_name:      "Glacière",
        line_number:    "6",
        timetable:      [
                            {
                                direction:  "Saint-Denis-Universite / Asnieres-Gennevilliers Les Courtilles",
                                next_stops: ["0 mn", "5mn", "12mn"]
                            },
                            {
                                direction:  "Mairie d'Ivry / Villejuif-Louis Aragon",
                                next_stops: ["0 mn", "3mn", "6mn"]
                            }
                        ],
        update_time:    new Date().getTime()
    };

    var _makeUrl = function(line_id, stop_id){ return "/api?cmd=getNextStopsRealtime&stopArea=" + stop_id + "&line=" + line_id  };

    var _padWithZero = function(input)
    {
        return input < 10 ? "0" + input : input;
    };

    var _formatDate = function(dateAsString)
    {
        var tempDate    =   dateAsString ? new Date(dateAsString) : new Date();
        var day         =   _padWithZero(tempDate.getDay());
        var month       =   _padWithZero(tempDate.getMonth());
        var year        =   tempDate.getFullYear();
        var hours       =   _padWithZero(tempDate.getHours());
        var minutes     =   _padWithZero(tempDate.getMinutes());

        return day + " / " + month + " / " + year + " " + hours + ":" + minutes;
    };

    // forEach method, could be shipped as part of an Object Literal/Module
    var forEach = function(array, callback, scope) {
        for (var i = 0; i < array.length; i++) {
            callback.call(scope, i, array[i]); // passes back stuff we need
        }
    };

    app.getDatabase = function()
    {
        return  [
                    {
                        stop_name:      "Glacière",
                        line_number:    "6",
                        id:             "12-208",
                        stop_id:        208,
                        line_id:        12,
                        priority:       0,
                        directions:     [
                                            {
                                                value:  "Charles de Gaulle-Etoile",
                                                id:     23
                                            },
                                            {
                                                value:  "Nation",
                                                id:     24
                                            }
                                        ]
                    },
                    {
                        stop_name:      "Charles de Gaulle - Étoile",
                        line_number:    "6",
                        id:             "12-19",
                        stop_id:        19,
                        line_id:        12,
                        priority:       1,
                        directions:     [
                                            {
                                                value:  "Charles de Gaulle-Etoile",
                                                id:     23
                                            },
                                            {
                                                value:  "Nation",
                                                id:     24
                                            }
                                        ]
                    },
                    {
                        stop_name:      "Charles de Gaulle - Étoile",
                        line_number:    "A",
                        id:             "19-19",
                        stop_id:        19,
                        line_id:        19,
                        priority:       2,
                        directions:     [
                                            {
                                                value:  "Marne-la-Vallee Chessy / Boissy-Saint-Leger",
                                                id:     37
                                            },
                                            {
                                                value:  "Cergy-Le-Haut / Poissy / Saint-Germain-en-Laye",
                                                id:     38
                                            }
                                        ]
                    },
                    {
                        stop_name:      "Nanterre-Préfecture",
                        line_number:    "A",
                        id:             "19-319",
                        stop_id:        319,
                        line_id:        19,
                        priority:       3,
                        directions:     [
                                            {
                                                value:  "Marne-la-Vallee Chessy / Boissy-Saint-Leger",
                                                id:     37
                                            },
                                            {
                                                value:  "Cergy-Le-Haut / Poissy / Saint-Germain-en-Laye",
                                                id:     38
                                            }
                                        ]
                    }
                ];
    };

    app.loadDataForAll = function()
    {
        app .getDatabase()
            .forEach    (   function(element)
                            {
                                app.getDataFor(element);
                            }
                        );

    };

    app.getDataFor =    function(data)
    {

        app.updateMetroCard(data);

        $   .get    (   _makeUrl(data.line_id, data.stop_id) )
            .then   (   function(resp)
                        {
                            var time    =   $(resp) .find("nextStopsRealtimeResultat")
                                                    .find("currentTime");

                            var stops   =   $(resp) .find("nextStopsRealtimeResultat")
                                                    .find("nextStopsOnLines")
                                                    .find("nextStopsOnLine")
                                                    .find("nextStops")
                                                    .find("nextStop")
                                                    .map    (   function(idx, element)
                                                                {
                                                                    var el = $(element);
                                                                    var direction   = el.find("directionId").text();
                                                                    var waiting     = el.find("waitingTimeRaw").text();
                                                                    var seconds     = el.find("waitingTime").text();
                                                                    return { direction : direction, time : waiting, seconds : seconds };
                                                                }
                                                            )
                                                    .toArray();

                            data.directions.forEach    (   function(element)
                                                            {
                                                                element.next_stops =    stops   .filter (function(s)    { return s.direction == element.id; })
                                                                                                .sort   (function(a, b) {return a.seconds - b.seconds;})
                                                                                                .map    (function(s)    { return s.time; });
                                                            }
                                                        );

                            app.updateMetroCard(data);

                        }
                    );
    };

    app.updateMetroCard = function(data) {

        var card = app.visibleCards[data.id];

        if (!card) {
            card = app.cardTemplate.clone();
            card.removeClass('cardTemplate');
            card.removeAttr('hidden');
            app.container.append(card);
            app.visibleCards[data.id] = card;
        }

        card.find('.stop-name').text(data.stop_name);
        card.find('.date').text(_formatDate(data.update_time));
        card.find('.line-number').addClass("icon-"+data.line_number);

        var directions = card.find(".directions").children();
        var stops = card.find(".stop");

        data.directions.forEach (   function(element, index)
                                    {
                                        directions.eq(index).text(element.value);
                                        if(element.next_stops)
                                        {
                                            element.next_stops.forEach( function(data, i) { stops.eq(i).children().eq(index).text(data); });
                                        }
                                    }
                                );


        if (app.isLoading) {
            app.spinner.attr('hidden', true);
            app.container.removeAttr('hidden');
            app.isLoading = false;
        }
    };

    app.loadDataForAll();

})();
