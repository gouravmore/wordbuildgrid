Plugin.extend({
    _type: 'org.ekstep.wordbuildgrid',
    _isContainer: false,
    _render: true,
    initPlugin: function(data) {
		this.id = _.uniqueId('org.ekstep.wordbuildgrid');
        var instance = this;
        var fontsize = data.fontsize || 20;
        var dims = this.relativeDims();
        // var solve = true;

        if (div) {
            jQuery("#" + data.id).remove();
        }
        var div = document.getElementById(data.id);
        div = document.createElement('div');
        div.style.width = "100%";
        div.innerHTML = '<div id="puzzle-wrap"><div id="puzzle"></div><div id="words"></div><div><button id="solve">Solve Puzzle</button></div></div>';

        var parentDiv = document.getElementById(Renderer.divIds.gameArea);
        parentDiv.insertBefore(div, parentDiv.childNodes[0]);

        this._self = new createjs.DOMElement(div);
        var wordsearch_model = instance._stage.getModelValue(data.item);

        var mappedArray = _.map(wordsearch_model.answer, function(val, key) {
            return (val.value)
        });
        var completeWordsArray = [];
        for (i = 0; i < mappedArray.length; i++) {
            var individualWordArray = [];
            individualWordArray = mappedArray[i].split(",");
            completeWordsArray.push(individualWordArray);
        }
        console.log("completeWordsArray: ", completeWordsArray);
        var modDistractors = wordsearch_model.model.distractors || "क,व,खौ,ड़ाा,र,का,ना";
        var objDistractors = modDistractors.split(",");
        console.log("objDistractors: ", objDistractors);

        var wordsearch_config = wordsearch_model.model.options || {};
        var wordsearchPlugin_words = [];


        //splitted words goes here
        wordsearchPlugin_splittedWords = completeWordsArray;
        //distractors goes Here
        wordsearchPlugin_distractors = objDistractors;

        for (i = 0; i < wordsearchPlugin_splittedWords.length; i++) {
            wordsearchPlugin_words.push(wordsearchPlugin_splittedWords[i].join(""));
        }

        // start a word find game
        var gamePuzzle = wordfindgame.create(wordsearchPlugin_words, wordsearchPlugin_splittedWords, '#puzzle', '#words', wordsearch_config, wordsearchPlugin_distractors);

        $('#solve').click(function() {
            wordfindgame.solve(gamePuzzle, wordsearchPlugin_words, wordsearchPlugin_splittedWords);
        });

        // Here width and height of individual cells is calculated
        var wordsearch_height = Math.floor((dims.h / wordsearch_config.tableRow) - 3); // "-3" to cancel extra padding of the table
        var wordsearch_width = Math.floor((dims.w - (dims.w / 12) - (dims.w / 12) - 250) / wordsearch_config.tableColumn); // 250px for words and (dims.w/12) for next and previous buttons

        if (!isNaN(wordsearch_height))
            $('#puzzle .puzzleSquare').css({
                "height": wordsearch_height
            });

        if (!isNaN(wordsearch_width))
            $('#puzzle .puzzleSquare').css({
                "width": wordsearch_width
            });

        // Hide or show solve button
        var solve = data.solve;
        if (solve === 'undefined' || solve === '')
            solve = true;

        if (!solve)
            $('#solve').css({
                "visibility": "hidden"
            });


        //Here x and y position is being calculated
        var wordsearch_xPos = dims.w / data.x;
        var wordsearch_yPos = dims.h / data.y;
        $('#puzzle-wrap').css({
            "margin-left": wordsearch_xPos
        });
        $('#puzzle-wrap').css({
            "margin-top": wordsearch_yPos
        });

        // create just a puzzle, without filling in the blanks and print to console
        var puzzle = wordfind.newPuzzle(
            wordsearchPlugin_words, {
                tableRow: 18,
                tableColumn: 18,
                fillBlanks: false
            }
        );
        wordfind.print(puzzle);



    },
    customEvent: function(data) {

    }
});
