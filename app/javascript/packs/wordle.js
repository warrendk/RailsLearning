/* Because this program depends on 'global variables', all the code
 * has been defined inside this function which returns an object
 * containing the functions needed in wordle.html.erb
 * This includes setUp, handleInput, and handleNewGame.
 * This is done so there are no variable name conflicts in other .js files 
 * throughout this projcet. */
var wordleFunc = (function() {

  // keep track of current row and word inside the row
  var wordSoFar = "";
  var row = 0;

  // the answer and set of valid guesses
  var randomWord = "";
  var wordSet = new Set();

  var gameOver = false;
  var showingNotice = false;
  var invalidWordString = "That word is not in our dictionary :(";
  var correctGuessString = "🏆✨ Well Done! ✨🏆"
  var qwerty = "QWERTYUIOPASDFGHJKL*ZXCVBNM<";
  var buttonHTML = '<button class="btn btn-dark btn-outline-success new-game-button" onclick="wordleFunc.handleNewGame()" id="new-game-button"><b>New Game</b></button>';
  var keyboardColors = new Array(28);
  var green = "#6aaa64;"
  var yellow = "#c9b458;"
  var grey = "grey;"
  var gamesPlayed = 0;
  var gamesWon = 0;
  var streak = 0;
  var maxStreak = 0;

  // index 0 holds the max, rest hold number of tries user took to guess word
  var guessDist = new Array(6);

  
  /* Update the stats displayed to the user based on the last game*/
  function getStats(won) {
    
    var statNums = document.querySelectorAll(".game-stat-row-number");
    maxStreak = Math.max(streak, maxStreak);
    gamesPlayed++;
    statNums[0].innerHTML = gamesPlayed;
    statNums[1].innerHTML = ((gamesWon/gamesPlayed) * 100).toFixed(1);
    statNums[2].innerHTML = streak;
    statNums[3].innerHTML = maxStreak;
    
    if(won == false) row=100;

    // get the users stats, keep track of the max
    guessDist[0] = -1;
    for(var i = 1; i <= 6; i++)
    {
      guessDist[i] = guessDist[i] == null ? 0 : guessDist[i];
      guessDist[i] += i==row+1? 1 : 0;
      guessDist[0] = Math.max(guessDist[i], guessDist[0]);
    }
    
    // translates those stats into a bar graph where max.width = 100%
    for(var i = 1; i <= 6; i++)
    {
      var bar = document.getElementById("guess-bar-"+i);
      var barNumber = document.getElementById("guess-total-"+i);
      var percent = guessDist[i]/guessDist[0] * 100;
     
      // color current guess bar green, the rest are grey
      if(i == row+1)
        bar.setAttribute("style", "width: " +  percent + "%; background-color: "+ green + ";");
      else
         bar.setAttribute("style", "width: " +  percent + "%; background-color: grey;");

      barNumber.innerHTML = guessDist[i];
    }

  }

  /* Upon a user getting the correct answer, dispaly a new game button
   * and a message telling them they won. */
  function handleCorrectGuess() {
    
    gamesWon++;
    streak++;
    // tell the user they won and show stats
    document.getElementById("game-over-toast").classList += " show";
    document.getElementById("overlay").setAttribute("style", "z-index: 100");
    var gameOverHeader = document.getElementById("game-over-header");
    document.getElementById("game-over-header-message").innerHTML = correctGuessString;
    document.getElementById("game-over-header").setAttribute("style", "color: #0f5132; background-color: #d1e7dd;");
    getStats(true);

    // make keyboard green
    var keys = document.querySelectorAll('.keyboard');
    for(var i=0; i < 28; i++)
      keys[i].setAttribute("style", "background-color: #d1e7dd; color: #0f5132;");
    
    // replace the bottom row with a new game button
    document.getElementById("bottom-row").innerHTML = buttonHTML;
    gameOver = true;
  }


  /* Upon a user using all 6 guesses without a correct answer, dispaly a new game button
   * and a message telling them they lost and what the correct word was. */
  function handleGameOverWrong() {

    streak = 0;

    // tell the user they lost and show stats
    document.getElementById("game-over-toast").classList += " show";
    document.getElementById("overlay").setAttribute("style", "z-index: 100");
    document.getElementById("game-over-header-message").innerHTML = "The correct word was: " + randomWord;
    document.getElementById("game-over-header").setAttribute("style", "color: #842029; background-color: #f8d7da;");
    getStats(false);

    // make keyboard red
    var keys = document.querySelectorAll('.keyboard');
    for(var i=0; i < 28; i++)
      keys[i].setAttribute("style", "background-color: #f8d7da; color: #842029;");

    // replace the bottom row with a new game button
    document.getElementById("bottom-row").innerHTML = buttonHTML;
    gameOver = true;
  }


  /* Given a char and a color, update the keyboard to show the user
   * which letters have been used and their color. */
  function updateKeyboard(char, color, colorInt)
  {
    // Q is at id=30, quwerty[0] = Q
    var id = qwerty.indexOf(char) + 30;

    var curKey = document.getElementById(String(id));
    
    // 0 = white, 1 = grey, 2 = yellow, 3 = green
    var curKeyColor = keyboardColors[id-30];
    
    // dont change yellow to grey or green to yellow.
    if(colorInt <= curKeyColor) return;

    curKey.setAttribute("style", "color: white; background-color: " + color);
    keyboardColors[id-30] = colorInt;
  }

  /* When the user deletes a character: 
   * Remove the invalid word notice if it is showing.
   * Change the square value back to blank.
   * Change the border of the input square back to defualt. */
  function handleDelete(len) {
    
    
    // if the invalid word alert is still showing, remove it
    if(showingNotice)
    {
        var classList = String(document.getElementById("warning-alert").classList);
        classList = classList.substring(0, classList.length - 4);
        document.getElementById("warning-alert").classList = classList;
        showingNotice = false;
    }

    // remove last char from word
    wordSoFar = wordSoFar.slice(0, -1);

    // get the textarea that is being changed and manipulate it
    var curSquare = document.getElementById(String(row*5 + len - 1));
    curSquare.value = ""; 
    curSquare.setAttribute("style", "border-color: lightgrey;");

    return;
  }

  /* When the user completes a row (5 letters) and hits enter:
   * If the entered word is invalid, notify user and return.
   * Else, color the squares accordingly based on letter positions.
   * Increment row variable and reset wordSoFar
   * If correct guess, return handleCorrectGuess().
   */
  function handleEnter() {
    
    // make sure word is in the dictionary
    if(!wordSet.has(wordSoFar.toLowerCase()))
    {
      document.getElementById("warning-alert").classList += !showingNotice ? "show" : "";
      document.getElementById("warning-alert").innerHTML = invalidWordString;
      showingNotice = true;
      return;
    }

    // find greens
    var holdRand = randomWord;
    for(var i = 0; i < 5; i++)
    {
      
      inputChar = wordSoFar.charAt(i);
      actualChar = randomWord.charAt(i); 
      var curSquare = document.getElementById(String(row*5 + i));
      var styleStr = "color: white; border: 0";

      // if green...
      if(inputChar == actualChar)
      {
        // change style
        curSquare.setAttribute("style", "background-color: #6aaa64; " + styleStr); // green
        
        // replace char with '_' (this helps with correct yellow count)
        wordSoFar = wordSoFar.substring(0, i) + "_" + wordSoFar.substring(i+1);
        randomWord = randomWord.substring(0, i) + "_" + randomWord.substring(i+1);

        // update keyboard
        updateKeyboard(inputChar, green, 3);
      }

      // this reperesents all greens (correct guess)
      if(wordSoFar == "_____")
        return handleCorrectGuess(); 
    }


    // find yellows and greys
    for(var i = 0; i < 5; i++)
    {
      inputChar = wordSoFar.charAt(i);

      if(inputChar == '_')
        continue;

      actualChar = randomWord.charAt(i); // (TODO) get random word
      var curSquare = document.getElementById(String(row*5 + i));
      var styleStr = "color: white; border: 0";

      // yellow
      if(randomWord.includes(inputChar))
      {
        // change style
        curSquare.setAttribute("style", "background-color: #c9b458; " + styleStr);
        
        // replace char in random word, handles duplicate yellows
        var yelInd = randomWord.indexOf(inputChar);
        randomWord = randomWord.substring(0, yelInd) + "_" + randomWord.substring(yelInd+1);
        // update keyboard
        updateKeyboard(inputChar, yellow, 2);
      }

      // grey
      else if(!randomWord.includes(inputChar))
      {
        curSquare.setAttribute("style", "background-color: grey; " + styleStr); 

        // update keyboard
        updateKeyboard(inputChar, grey, 1);
      }
    }

    randomWord = holdRand;

    // game is over and user got it wrong
    if(row == 5)
      return handleGameOverWrong();

    row++;
    wordSoFar = "";
    return;
  }



  /* Return this object of functions used in wordle.html.erb */
  return {

    /* set-up/reset the game board upon a new game. */
    setUp: function() {

        // set ids for squares (0-29: user input, 30-56: keyboard)
        var squares = document.querySelectorAll('textarea');
        for(var i=0; i<squares.length; i++)
        {
          squares[i].setAttribute("id", i);
          squares[i].value = "";
          squares[i].setAttribute("style", "background-color: white; color: black; border:  solid lightgrey .3vmin;")
        }
        
        squares = document.querySelectorAll('.keyboard');
        // add letters to keyboard
        for(var i=0; i < 28; i++)
        {
          squares[i].setAttribute("id", i+30);
          squares[i].innerHTML = qwerty.charAt(i);
          squares[i].setAttribute("style", "background-color: lightgrey; color: black;")

          // 0 = white, 1 = grey, 2 = yellow, 3 = green
          keyboardColors[i] = 0;
        }

        squares[19].innerHTML = "ENTER";
        squares[19].setAttribute("style", "background-color: lightgrey; color: black; font-size: calc(var(--square-size)/5);")
        squares[27].innerHTML = "⌫";
        squares[27].setAttribute("style", "background-color: lightgrey; color: black; font-size: calc(var(--square-size)/3);")
        
        // get our words list (app/public/wordList.txt)
        var words = document.getElementById('wordList').getAttribute('data-words');
        wordSet = new Set(words.split(", ")); // allows for faster .contains()*/

        // get possible answer list (app/public/wordAnswerList.txt)
        answerArray = document.getElementById('wordAnswerList').getAttribute('data-words');
        answerArray = answerArray.split(", ");
        
        // get a random word from answer list
        var randIndex = Math.floor(Math.random() * (answerArray.length - 1));
        randomWord = answerArray[randIndex].toUpperCase();
    },

    /* Whenever the user enters a key, use one of our helpers to handle it. */
    handleInput: function(key)
    {
        if(gameOver) return;

        var wordLen = wordSoFar.length;

        // convert key to uppercase
        key = String.fromCharCode(key).toUpperCase().charCodeAt(0);

        // 8 = backspace, 46 = delete
        if(key == 8 || key == 46)
        {
          if(wordLen == 0)
            return;

          return handleDelete(wordLen);
        }

        // if user wants to enter the word
        if(key == 13 && wordLen == 5)
          return handleEnter();
        
        // input was letter and row not filled
        if(key >= 65 && key <= 90 && wordLen < 5)
        {
          // get the textarea that is being changed and manipulate it
          var curSquare = document.getElementById(String(row*5 + wordLen));
          curSquare.value = String.fromCharCode(key);
          curSquare.setAttribute("style", "border-color: grey;");
          wordSoFar += String.fromCharCode(key);
        }

        return;
    },

    /* Upon the user clicking the new-game button, reset the game.*/
    handleNewGame: function() {
      
      // remove notice
      if(showingNotice)
      {
          var classList = String(document.getElementById("warning-alert").classList);
          classList = classList.substring(0, classList.length - 4);
          document.getElementById("warning-alert").classList = classList;
          document.getElementById("warning-alert").setAttribute("style", "");
          showingNotice = false;
      }

      // reset bottom row of keyboard
      var bottomRowStr = "";
      bottomRowStr = '<div class="row-div-bottom">\n';
      bottomRowStr += '<button class="keyboard keyboard-symbol keyboard-letters" onclick="keyPress(this)"></button>\n';

      for(var i = 0; i < 7; i++)
        bottomRowStr += '<button class="keyboard keyboard-letters" onclick="keyPress(this)"></button>\n';

      bottomRowStr += '<button class="keyboard keyboard-symbol keyboard-letters" onclick="keyPress(this)"></button>\n';
      bottomRowStr += '</div>';
      document.getElementById("bottom-row").innerHTML = bottomRowStr;

      // reset overlay
      document.getElementById("overlay").setAttribute("style", "z-index: -100");
      document.getElementById("game-over-toast").classList = "toast";
      
      // reset everything else
      wordleFunc.setUp();
      wordSoFar = "";
      row = 0;

      gameOver = false;
    },

    /* Virtual keyboard */
    keyPress: function(element) {
      // enter and backspace / delete
      if(element.id == "49") return wordleFunc.handleInput("13");
      if(element.id == "57") return wordleFunc.handleInput("8");

      // the rest of the characters
      return wordleFunc.handleInput(element.innerHTML.charCodeAt(0));

    }

  };})();

window.wordleFunc = wordleFunc;