(function() {
    var app = {
        isLoading: true,
        visibleCards: {},
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main')
    };

    var api = null;

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

    var _padWithZero = function(input)
    {
        return input < 10 ? "0" + input : input;
    };

    var _formatDate = function(dateAsInt)
    {
        var tempDate    =   new Date((dateAsInt ? dateAsInt : new Date().getTime()));
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


    app.bootstrap = function()
    {
        if(!api)
        {
            $   .get    ('/data/api.json')
                .then   (   function(data)
                            {
                                api = data;
                                api.url_for = function(line_id, stop_id){ return api.baseUri + "?keyapp=" + api.key + "&cmd=getNextStopsRealtime&stopArea=" + stop_id + "&line=" + line_id  };
                            }
                        )
                .then   (   function()
                            {
                                app.loadDataForAll();
                            }
                        );

            // var request = new XMLHttpRequest();
            // request.onreadystatechange = function() {
            //     if (request.readyState === XMLHttpRequest.DONE) {
            //         if (request.status === 200) {
            //             api = JSON.parse(request.response);
            //             api.url_for = function(line_id, stop_id){ return api.baseUri + "?keyapp=" + api.key + "&cmd=getNextStopsRealtime&stopArea=" + stop_id + "&line=" + line_id  };
            //             app.loadDataForAll();
            //         }
            //     }
            // };
            // request.open('GET', '/data/api.json');
            // request.send();
        }
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
        if (api!=null)
        {
            app.updateMetroCard(data);

            $   .ajax   (   {
                                url : api.url_for(data.line_id, data.stop_id),
                                crossDomain: true
                            }
                        )
                .then   (   function(data)
                            {
                                console.log(data);
                            }
                        );
        }
    };

    app.updateMetroCard = function(data) {

        var card = app.visibleCards[data.id];

        if (!card) {
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[data.key] = card;
        }

        card.querySelector('.stop-name').textContent = data.stop_name;
        card.querySelector('.date').textContent = _formatDate(data.update_time);
        card.querySelector('.line-number').classList.add("icon-"+data.line_number);

        var directions = card.querySelector(".directions").children;
        var stops = card.querySelectorAll(".stop");

        data.directions.forEach (   function(element, index)
                                    {
                                        directions[index].textContent = element.value;
                                        if(element.next_stops)
                                        {
                                            element.next_stops.forEach( function(data, i) { stops[i].children[index].textContent = data; });
                                        }
                                    }
                                );


        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    };

    app.bootstrap();

})();
