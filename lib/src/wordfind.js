/**
 * Wordfind.js 0.0.1
 * (c) 2012 Bill, BunKat LLC.
 * Wordfind is freely distributable under the MIT license.
 * For all details and documentation:
 *     http://github.com/bunkat/wordfind
 */

(function() {

    'use strict';

    /**
     * Generates a new word find (word search) puzzle provided a set of words.
     * Can automatically determine the smallest puzzle size in which all words
     * fit, or the puzzle size can be manually configured.  Will automatically
     * increase puzzle size until a valid puzzle is found.
     *
     * WordFind has no dependencies.
     */

    /**
     * Initializes the WordFind object.
     *
     * @api private
     */
    var WordFind = function() {

        // Letters used to fill blank spots in the puzzle
        // var letters = 'abcdefghijklmnoprstuvwy';
        var wordsearchPlugin_letters = [];

        // var letters = ['क','व','खौ','ड़ाा','र','का','ना'];
        // var wordsearchPlugin_letters = [];
        // alert(letters.length);
        /**
         * Definitions for all the different orientations in which words can be
         * placed within a puzzle. New orientation definitions can be added and they
         * will be automatically available.
         */

        // The list of all the possible orientations
        var allOrientations = ['horizontal', 'horizontalBack', 'vertical', 'verticalUp',
            'diagonal', 'diagonalUp', 'diagonalBack', 'diagonalUpBack'
        ];

        // The definition of the orientation, calculates the next square given a
        // starting square (x,y) and distance (i) from that square.
        var orientations = {
            horizontal: function(x, y, i) {
                return {
                    x: x + i,
                    y: y
                };
            },
            horizontalBack: function(x, y, i) {
                return {
                    x: x - i,
                    y: y
                };
            },
            vertical: function(x, y, i) {
                return {
                    x: x,
                    y: y + i
                };
            },
            verticalUp: function(x, y, i) {
                return {
                    x: x,
                    y: y - i
                };
            },
            diagonal: function(x, y, i) {
                return {
                    x: x + i,
                    y: y + i
                };
            },
            diagonalBack: function(x, y, i) {
                return {
                    x: x - i,
                    y: y + i
                };
            },
            diagonalUp: function(x, y, i) {
                return {
                    x: x + i,
                    y: y - i
                };
            },
            diagonalUpBack: function(x, y, i) {
                return {
                    x: x - i,
                    y: y - i
                };
            }
        };

        // Determines if an orientation is possible given the starting square (x,y),
        // the tableRow (h) and tableColumn (w) of the puzzle, and the length of the word (l).
        // Returns true if the word will fit starting at the square provided using
        // the specified orientation.
        var checkOrientations = {
            horizontal: function(x, y, h, w, l) {
                return w >= x + l;
            },
            horizontalBack: function(x, y, h, w, l) {
                return x + 1 >= l;
            },
            vertical: function(x, y, h, w, l) {
                return h >= y + l;
            },
            verticalUp: function(x, y, h, w, l) {
                return y + 1 >= l;
            },
            diagonal: function(x, y, h, w, l) {
                return (w >= x + l) && (h >= y + l);
            },
            diagonalBack: function(x, y, h, w, l) {
                return (x + 1 >= l) && (h >= y + l);
            },
            diagonalUp: function(x, y, h, w, l) {
                return (w >= x + l) && (y + 1 >= l);
            },
            diagonalUpBack: function(x, y, h, w, l) {
                return (x + 1 >= l) && (y + 1 >= l);
            }
        };

        // Determines the next possible valid square given the square (x,y) was ]
        // invalid and a word lenght of (l).  This greatly reduces the number of
        // squares that must be checked. Returning {x: x+1, y: y} will always work
        // but will not be optimal.
        var skipOrientations = {
            horizontal: function(x, y, l) {
                return {
                    x: 0,
                    y: y + 1
                };
            },
            horizontalBack: function(x, y, l) {
                return {
                    x: l - 1,
                    y: y
                };
            },
            vertical: function(x, y, l) {
                return {
                    x: 0,
                    y: y + 100
                };
            },
            verticalUp: function(x, y, l) {
                return {
                    x: 0,
                    y: l - 1
                };
            },
            diagonal: function(x, y, l) {
                return {
                    x: 0,
                    y: y + 1
                };
            },
            diagonalBack: function(x, y, l) {
                return {
                    x: l - 1,
                    y: x >= l - 1 ? y + 1 : y
                };
            },
            diagonalUp: function(x, y, l) {
                return {
                    x: 0,
                    y: y < l - 1 ? l - 1 : y + 1
                };
            },
            diagonalUpBack: function(x, y, l) {
                return {
                    x: l - 1,
                    y: x >= l - 1 ? y + 1 : y
                };
            }
        };

        /**
         * Initializes the puzzle and places words in the puzzle one at a time.
         *
         * Returns either a valid puzzle with all of the words or null if a valid
         * puzzle was not found.
         *
         * @param {[String]} words: The list of words to fit into the puzzle
         * @param {[Options]} options: The options to use when filling the puzzle
         */

        var fillPuzzle = function(wordsearchPlugin_words, options) {


            var puzzle = [],
                i, j, len;

            // initialize the puzzle with blanks
            for (i = 0; i < options.tableRow; i++) {
                puzzle.push([]);
                for (j = 0; j < options.tableColumn; j++) {
                    puzzle[i].push('');
                }
            }

            // add each word into the puzzle one at a time
            for (i = 0, len = wordsearchPlugin_words.length; i < len; i++) {
                if (!placeWordInPuzzle(puzzle, options, wordsearchPlugin_words[i], wordsearchPlugin_splittedWords[i])) {
                    // if a word didn't fit in the puzzle, give up
                    return null;
                }
            }

            // return the puzzle
            return puzzle;
        };

        /**
         * Adds the specified word to the puzzle by finding all of the possible
         * locations where the word will fit and then randomly selecting one. Options
         * controls whether or not word overlap should be maximized.
         *
         * Returns true if the word was successfully placed, false otherwise.
         *
         * @param {[[String]]} puzzle: The current state of the puzzle
         * @param {[Options]} options: The options to use when filling the puzzle
         * @param {String} word: The word to fit into the puzzle.
         */
        var placeWordInPuzzle = function(puzzle, options, word, splittedWord) {
            // find all of the best locations where this word would fit
            var locations = findBestLocations(puzzle, options, splittedWord);

            if (locations.length === 0) {
                return false;
            }

            // select a location at random and place the word there
            var sel = locations[Math.floor(Math.random() * locations.length)];
            placeWord(puzzle, word, splittedWord, sel.x, sel.y, orientations[sel.orientation]);

            return true;
        };

        /**
         * Iterates through the puzzle and determines all of the locations where
         * the word will fit. Options determines if overlap should be maximized or
         * not.
         *
         * Returns a list of location objects which contain an x,y cooridinate
         * indicating the start of the word, the orientation of the word, and the
         * number of letters that overlapped with existing letter.
         *
         * @param {[[String]]} puzzle: The current state of the puzzle
         * @param {[Options]} options: The options to use when filling the puzzle
         * @param {String} word: The word to fit into the puzzle.
         */
        var findBestLocations = function(puzzle, options, splittedWord) {

            var locations = [],
                tableRow = options.tableRow,
                tableColumn = options.tableColumn,
                wordLength = splittedWord.length,
                maxOverlap = 0; // we'll start looking at overlap = 0

            // loop through all of the possible orientations at this position
            for (var k = 0, len = options.orientations.length; k < len; k++) {

                var orientation = options.orientations[k],
                    check = checkOrientations[orientation],
                    next = orientations[orientation],
                    skipTo = skipOrientations[orientation],
                    x = 0,
                    y = 0;

                // loop through every position on the board
                while (y < tableRow) {

                    // see if this orientation is even possible at this location
                    if (check(x, y, tableRow, tableColumn, wordLength)) {

                        // determine if the word fits at the current position
                        var overlap = calcOverlap(splittedWord, puzzle, x, y, next);

                        // if the overlap was bigger than previous overlaps that we've seen
                        if (overlap >= maxOverlap || (!options.preferOverlap && overlap > -1)) {
                            maxOverlap = overlap;
                            locations.push({
                                x: x,
                                y: y,
                                orientation: orientation,
                                overlap: overlap
                            });
                        }

                        x++;
                        if (x >= tableColumn) {
                            x = 0;
                            y++;
                        }
                    } else {
                        // if current cell is invalid, then skip to the next cell where
                        // this orientation is possible. this greatly reduces the number
                        // of checks that we have to do overall
                        var nextPossible = skipTo(x, y, wordLength);
                        x = nextPossible.x;
                        y = nextPossible.y;
                    }

                }
            }

            // finally prune down all of the possible locations we found by
            // only using the ones with the maximum overlap that we calculated
            return options.preferOverlap ?
                pruneLocations(locations, maxOverlap) :
                locations;
        };

        /**
         * Determines whether or not a particular word fits in a particular
         * orientation within the puzzle.
         *
         * Returns the number of letters overlapped with existing words if the word
         * fits in the specified position, -1 if the word does not fit.
         *
         * @param {String} word: The word to fit into the puzzle.
         * @param {[[String]]} puzzle: The current state of the puzzle
         * @param {int} x: The x position to check
         * @param {int} y: The y position to check
         * @param {function} fnGetSquare: Function that returns the next square
         */
        var calcOverlap = function(splittedWord, puzzle, x, y, fnGetSquare) {
            var overlap = 0;

            // traverse the squares to determine if the word fits
            for (var i = 0, len = splittedWord.length; i < len; i++) {

                var next = fnGetSquare(x, y, i),
                    square = puzzle[next.y][next.x];

                // if the puzzle square already contains the letter we
                // are looking for, then count it as an overlap square
                if (square === splittedWord[i]) {
                    overlap++;
                }
                // if it contains a different letter, than our word doesn't fit
                // here, return -1
                else if (square !== '') {
                    return -1;
                }
            }

            // if the entire word is overlapping, skip it to ensure words aren't
            // hidden in other words
            return overlap;
        };

        /**
         * If overlap maximization was indicated, this function is used to prune the
         * list of valid locations down to the ones that contain the maximum overlap
         * that was previously calculated.
         *
         * Returns the pruned set of locations.
         *
         * @param {[Location]} locations: The set of locations to prune
         * @param {int} overlap: The required level of overlap
         */
        var pruneLocations = function(locations, overlap) {

            var pruned = [];
            for (var i = 0, len = locations.length; i < len; i++) {
                if (locations[i].overlap >= overlap) {
                    pruned.push(locations[i]);
                }
            }

            return pruned;
        };

        /**
         * Places a word in the puzzle given a starting position and orientation.
         *
         * @param {[[String]]} puzzle: The current state of the puzzle
         * @param {String} word: The word to fit into the puzzle.
         * @param {int} x: The x position to check
         * @param {int} y: The y position to check
         * @param {function} fnGetSquare: Function that returns the next square
         */
        var placeWord = function(puzzle, word, splittedWord, x, y, fnGetSquare) {

            for (var i = 0, len = splittedWord.length; i < len; i++) {
                var next = fnGetSquare(x, y, i);
                puzzle[next.y][next.x] = splittedWord[i];
            }
        };

        return {

            /**
             * Returns the list of all of the possible orientations.
             * @api public
             */
            validOrientations: allOrientations,

            /**
             * Returns the orientation functions for traversing words.
             * @api public
             */
            orientations: orientations,

            /**
             * Generates a new word find (word search) puzzle.
             *
             * Settings:
             *
             * tableRow: desired tableRow of the puzzle, default: smallest possible
             * tableColumn:  desired tableColumn of the puzzle, default: smallest possible
             * orientations: list of orientations to use, default: all orientations
             * fillBlanks: true to fill in the blanks, default: true
             * maxAttempts: number of tries before increasing puzzle size, default:3
             * preferOverlap: maximize word overlap or not, default: true
             *
             * Returns the puzzle that was created.
             *
             * @param {[String]} words: List of words to include in the puzzle
             * @param {options} settings: The options to use for this puzzle
             * @api public
             */
            newPuzzle: function(wordsearchPlugin_words, settings, distractors) {
                var wordList, puzzle, attempts = 0,
                    opts = settings || {};
                wordsearchPlugin_letters = distractors;

                // copy and sort the words by length, inserting words into the puzzle
                // from longest to shortest works out the best
                wordList = wordsearchPlugin_words.slice(0).sort(function(a, b) {
                    return (a.length < b.length) ? 1 : 0;
                });
                // initialize the options
                var options = {
                    tableRow: opts.tableRow || wordList[0].length,
                    tableColumn: opts.tableColumn || wordList[0].length,
                    orientations: opts.orientations || allOrientations,
                    fillBlanks: opts.fillBlanks !== undefined ? opts.fillBlanks : true,
                    maxAttempts: opts.maxAttempts || 3,
                    preferOverlap: opts.preferOverlap !== undefined ? opts.preferOverlap : true
                };

                // add the words to the puzzle
                // since puzzles are random, attempt to create a valid one up to
                // maxAttempts and then increase the puzzle size and try again
                while (!puzzle) {
                    while (!puzzle && attempts++ < options.maxAttempts) {
                        puzzle = fillPuzzle(wordList, options);
                    }

                    if (!puzzle) {
                        options.tableRow++;
                        options.tableColumn++;
                        attempts = 0;
                    }
                }

                // fill in empty spaces with random letters
                if (options.fillBlanks) {
                    this.fillBlanks(puzzle, options);
                }

                return puzzle;
            },

            /**
             * Fills in any empty spaces in the puzzle with random letters.
             *
             * @param {[[String]]} puzzle: The current state of the puzzle
             * @api public
             */
            fillBlanks: function(puzzle) {
                for (var i = 0, tableRow = puzzle.length; i < tableRow; i++) {
                    var row = puzzle[i];
                    for (var j = 0, tableColumn = row.length; j < tableColumn; j++) {

                        if (!puzzle[i][j]) {
                            var randomLetter = Math.floor(Math.random() * wordsearchPlugin_letters.length);
                            puzzle[i][j] = wordsearchPlugin_letters[randomLetter];
                        }
                    }
                }
            },

            /**
             * Returns the starting location and orientation of the specified words
             * within the puzzle. Any words that are not found are returned in the
             * notFound array.
             *
             * Returns
             *   x position of start of word
             *   y position of start of word
             *   orientation of word
             *   word
             *   overlap (always equal to word.length)
             *
             * @param {[[String]]} puzzle: The current state of the puzzle
             * @param {[String]} words: The list of words to find
             * @api public
             */
            solve: function(puzzle, wordsearchPlugin_words, wordsearchPlugin_splittedWords) {
                var options = {
                        tableRow: puzzle.length,
                        tableColumn: puzzle[0].length,
                        orientations: allOrientations,
                        preferOverlap: true
                    },
                    found = [],
                    notFound = [];
                for (var i = 0, len = wordsearchPlugin_splittedWords.length; i < len; i++) {
                    var splittedWord = wordsearchPlugin_splittedWords[i],
                        locations = findBestLocations(puzzle, options, splittedWord);

                    if (locations.length > 0 && locations[0].overlap === splittedWord.length) {
                        locations[0].splittedWord = splittedWord;
                        found.push(locations[0]);
                    } else {
                        notFound.push(splittedWord);
                    }
                }

                return {
                    found: found,
                    notFound: notFound
                };
            },

            /**
             * Outputs a puzzle to the console, useful for debugging.
             * Returns a formatted string representing the puzzle.
             *
             * @param {[[String]]} puzzle: The current state of the puzzle
             * @api public
             */
            print: function(puzzle) {
                var puzzleString = '';
                for (var i = 0, tableRow = puzzle.length; i < tableRow; i++) {
                    var row = puzzle[i];
                    for (var j = 0, tableColumn = row.length; j < tableColumn; j++) {
                        puzzleString += (row[j] === '' ? ' ' : row[j]) + ' ';
                    }
                    puzzleString += '\n';
                }

                console.log(puzzleString);
                return puzzleString;
            }
        };
    };

    /**
     * Allow library to be used within both the browser and node.js
     */
    var root = typeof exports !== "undefined" && exports !== null ? exports : window;
    root.wordfind = WordFind();

}).call(this);
