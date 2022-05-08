/* returns an object containing fuctions used in wordle.html.erb */
var wordleFunc = (function() {

  // all the relavant user info sent from home_controller.rb: def wordle
  // gets set in setUp
  var jsonData;

  // keep track of current row and word inside the row
  var wordSoFar = "";
  var row = 0;

  // the answer and set of valid guesses
  var randomWord = "";
  var wordSet = new Set();

  // helper strings
  var invalidWordString = "That word is not in our dictionary :(";
  var correctGuessString = "🏆✨ Well Done! ✨🏆"
  var qwerty = "QWERTYUIOPASDFGHJKL*ZXCVBNM<";
  var buttonHTML = '<button class="btn btn-dark btn-outline-success new-game-button" onclick="wordleFunc.handleNewGame()" id="new-game-button"><b>New Game</b></button>';
  var green = "#6aaa64;"
  var yellow = "#c9b458;"
  var grey = "grey;"

  // track what is shown on the screen
  var gameOver = false;
  var showingNotice = false;
  var keyboardColors = new Array(28);

  // track the users stats for the current game
  // if user signed in, these all get set on page load 
  var gamesPlayed = 0;
  var gamesWon = 0;
  var streak = 0;
  var maxStreak = 0;

  // index 0 holds the max guess total
  // index 1-6 hold the number of times the user took index-guesses to answer
  var guessDist = new Array(6);

  /* Update the stats displayed to the user based on the last game */
  function getStats(won) {
    

    if(won == false) row = -1;

    // update the stats in the database if user signed in
    if(jsonData["signedIn"])
      wordleFunc.updateUserStats(jsonData, row+1);

    var statNums = document.querySelectorAll(".game-stat-row-number");
    maxStreak = Math.max(streak, maxStreak);
    gamesPlayed++;
    statNums[0].innerHTML = gamesPlayed;
    statNums[1].innerHTML = ((gamesWon/gamesPlayed) * 100).toFixed(1);
    statNums[2].innerHTML = streak;
    statNums[3].innerHTML = maxStreak;
    
    // get the users stats, keep track of the max
    guessDist[0] = 1;
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
      var percent = 10 + (guessDist[i]/guessDist[0] * 90); // 0 should have a width-10% bar
     
      // color current guess bar green, the rest are grey
      if(i == row+1)
        bar.setAttribute("style", "width: " +  percent + "%; background-color: "+ green + ";");
      else
         bar.setAttribute("style", "width: " +  percent + "%; background-color: grey;");

      barNumber.innerHTML = guessDist[i];
    }

    animate.toastAnimation(document.getElementById("game-over-toast"), document.querySelectorAll(".guess-bar"));
  }

  /* Upon a user getting the correct answer, dispaly a new game button
   * and a message telling them they won. */
  function handleCorrectGuess() {
    
    animate.gameOverAnimation(document.querySelectorAll(".square"), true);

    setTimeout(function() {
    gamesWon++;
    streak++;
    // tell the user they won and show stats
    document.getElementById("game-over-toast").classList += " show";
    document.getElementById("overlay").setAttribute("style", "z-index: 100");
    var gameOverHeader = document.getElementById("game-over-header");
    document.getElementById("game-over-header-message").innerHTML = correctGuessString;
    document.getElementById("game-over-header").setAttribute("style", "color: #0f5132; background-color: #d1e7dd;");
    

    // make keyboard green
    var keys = document.querySelectorAll('.keyboard');
    for(var i=0; i < 28; i++)
      keys[i].setAttribute("style", "background-color: #d1e7dd; color: #0f5132;");
    
    // replace the bottom row with a new game button
    document.getElementById("bottom-row").innerHTML = buttonHTML;
    gameOver = true;
    
    getStats(true);
    }, 1000);
  }


  /* Upon a user using all 6 guesses without a correct answer, dispaly a new game button
   * and a message telling them they lost and what the correct word was. */
  function handleGameOverWrong() {

    animate.gameOverAnimation(document.querySelectorAll(".square"), false);
    setTimeout(function() {
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
    }, 1250);
  }

  /* When the user deletes a character: 
   * Remove the invalid word notice if it is showing.
   * Change the square value back to blank.
   * Change the border of the input square back to defualt. */
  function handleDelete(len) {
    
    // if the invalid word alert is still showing, remove it
    if(showingNotice)
    {
        var classList = String(document.getElementById("wordle-alert").classList);
        classList = classList.substring(0, classList.length - 4);
        document.getElementById("wordle-alert").classList = classList;
        showingNotice = false;
    }

    // remove last char from word
    wordSoFar = wordSoFar.slice(0, -1);

    // get the textarea that is being changed and manipulate it
    var curSquare = document.getElementById(String(row*5 + len - 1));
    curSquare.value = ""; 
    curSquare.setAttribute("style", "border: solid lightgrey var(--square-border);");
    
    // animate
    animate.rotate(curSquare);

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
      var notice = document.getElementById("wordle-alert");
      notice.classList += !showingNotice ? "show" : "";
      notice.innerHTML = invalidWordString;
      showingNotice = true;
      animate.bounce(notice);

      curRow = document.querySelectorAll(".row-div")[row];
      animate.bounce(curRow);
      return;
    }

    var rowColors = new Array(5);
    var keyBoardFunctions = new Array(5);
    var wordSoFarHold = wordSoFar;
    var wonGame = false;

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
        // replace char with '_' (this helps with correct yellow count)
        wordSoFar = wordSoFar.substring(0, i) + "_" + wordSoFar.substring(i+1);
        randomWord = randomWord.substring(0, i) + "_" + randomWord.substring(i+1);

        // used to update style of the squares and keyboard in animate.reval
        rowColors[i] = "background-color: #6aaa64; " + styleStr;
        keyBoardFunctions[i] = green;
      }

      // this reperesents all greens (correct guess)
      if(wordSoFar == "_____")
        wonGame = true;
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
        // replace char in random word, handles duplicate yellows
        var yelInd = randomWord.indexOf(inputChar);
        randomWord = randomWord.substring(0, yelInd) + "_" + randomWord.substring(yelInd+1);
        
        // used to update style of the squares and keyboard in animate.reval
        rowColors[i] = "background-color: #c9b458; " + styleStr;
        keyBoardFunctions[i] = yellow;
      }

      // grey
      else if(!randomWord.includes(inputChar))
      {
        // used to update style of the squares and keyboard in animate.reval
        rowColors[i] = "background-color: grey; " + styleStr;
        keyBoardFunctions[i] = grey;
      }
    }

    randomWord = holdRand;
    
    // animate all squares in the row
    animate.reveal(document.querySelectorAll(".square"), rowColors, keyBoardFunctions, row, 0, wordSoFarHold);
    
    if(wonGame || row == 5)
      gameOver = true;

    // wait until reveal animation done
    setTimeout(function() {
      if(wonGame) return handleCorrectGuess();
      if(row == 5) return handleGameOverWrong();
      
      wordSoFar = "";
      row++;
    }, .35 * 1000 * 7);
  }

  /* Return this object of functions used in wordle.html.erb */
  return {

    /* set-up/reset the game board upon a new game. */
    setUp: function(json) {

        // set ids for squares
        var squares = document.querySelectorAll('textarea');
        for(var i=0; i<squares.length; i++)
        {
          squares[i].setAttribute("id", i);
          squares[i].value = "";
          squares[i].setAttribute("style", "background-color: white; color: black; border:  solid lightgrey var(--square-border);")
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
        
        // the wordList, wordAnswerList, and user info grapped via ajax from the home_controller.rb file
        jsonData = json;

        if(jsonData["signedIn"])
          document.getElementById("sign-up-message").classList = "hidden-element";
        
        // get user stats if signed in and first game played...
        if(gamesPlayed == 0 && jsonData["signedIn"])
        {

          // guessString is a series of numbers each reprenting their own game.
          // 1-6 mean the number of guesses that game took, 0 means they couldnt guess.
          var guessString = jsonData["userStats"].guess_dist;
          for(var i = 0; i < guessString.length; i++)
          {

            // incrent index guess by one each time guess is encountered in the string
            var guess = parseInt(guessString.charAt(i));
            guessDist[guess] = guessDist[guess] == null ? 1 : guessDist[guess]+1;
            
            // guess == 0 -> loss. This ends the current streak they were on. 
            gamesPlayed++;
            gamesWon += guess == 0 ? 0 : 1;
            streak = guess == 0 ? 0 : streak+1;
            maxStreak = Math.max(streak, maxStreak);
          }
        }
        
        // words list (app/public/wordList.txt)
        wordSet = new Set(jsonData["wordList"].split(", ")); // allows for faster .contains()*/

        // possible answer list (app/public/wordAnswerList.txt)
        answerArray = jsonData["wordAnswerList"].split(" ");
        
        // get a random word from answer list
        var randIndex = Math.floor(Math.random() * (answerArray.length - 1));
        randomWord = answerArray[randIndex].toUpperCase();
        // randomWord = "AUDIO";
    },

    /* Whenever the user enters a key, use one of our helpers to handle it. */
    handleInput: function(key)
    {
        if(gameOver) return;

        if(animate.currentlyAnimating()) return;

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
          curSquare.setAttribute("style", "border: solid grey var(--square-border);");
          wordSoFar += String.fromCharCode(key);
          animate.bounce(curSquare);
        }

        return;
    },

    /* Upon the user clicking the new-game button, reset the game.*/
    handleNewGame: function() {
      
      // remove notice
      if(showingNotice)
      {
          var classList = String(document.getElementById("wordle-alert").classList);
          classList = classList.substring(0, classList.length - 4);
          document.getElementById("wordle-alert").classList = classList;
          document.getElementById("wordle-alert").setAttribute("style", "");
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
      wordleFunc.setUp(jsonData);
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

    },

    /* Given a char and a color, update the keyboard to show the user
   * which letters have been used and their color. */
  updateKeyboard: function(char, color)
  {
    // used to track the color of keys
    var colorInt = color == green ? 3 : color == yellow ? 2 : 1;

    // Q is at id=30, quwerty[0] = Q
    var id = qwerty.indexOf(char) + 30;

    var curKey = document.getElementById(String(id));
    
    // 0 = white, 1 = grey, 2 = yellow, 3 = green
    var curKeyColor = keyboardColors[id-30];
    
    // dont change yellow to grey or green to yellow.
    if(colorInt <= curKeyColor) return;

    curKey.setAttribute("style", "color: white; background-color: " + color);
    keyboardColors[id-30] = colorInt;
  },

    /* The application entry point, gets the users info from home_controller: def wordle.
       Passes that info setUp to start the game */
    getUserInfo: function() {
      $.ajax({
        type: 'GET',
        url: "/home/wordle",
        dataType: "json",
        success: function(result) {
          wordleFunc.setUp(result);
        }
      })
    },

    /* Upon game over, update the users stats in the database. Called in method getStats() */
    updateUserStats: function(jsonData, guess) {
      var prevDist = jsonData["userStats"].guess_dist;
      var statID = jsonData["userStats"].id;
      var userID = jsonData["userID"];
      $.ajax({
        type: 'PATCH',
        url: "/stats/"+statID,
        dataType: "json",
        data: {stat: { guess_dist: prevDist + guess}, commit: "Update Stat"},
        success: function(result) {
          jsonData["userStats"] = result;
        }
      })
    }
  }
})();

window.wordleFunc = wordleFunc;

var animate = (function() {

  // if a long animation is in progress, ignore all user input.
  var animating = false;

  return {

    // called upon input
    bounce: function(element) {
      gsap.fromTo(element, {duration: .3, scale: 1.125}, {scale: 1.0, ease: "bounce.out"});
    },

    // called upon delete
    rotate: function(element) {
      gsap.fromTo(element, {duration: .3, rotation: '-35deg'}, {rotation: '0deg', ease: "elastic.out"});
    },

    /* Flip tiles over and color them and their corresponding key on the virtual keyboard */
    reveal: function(elementArr, rowColors, keyboardColors, row, i, letters) { 
      animating = true;
      
      const dur = .35; 
      const rowStart = row*5;
      if(i >= 5) 
      { 
        setTimeout(function()
        {
          animating = false;
        }, dur * 1000);

        return;
      }

      // flip down
      gsap.to(elementArr[i+rowStart], {transform: "rotateX(90deg)", duration: dur, ease:"circ.in"});

      // wait until animation above is done
      setTimeout(function() {

        // flip back up
        gsap.to(elementArr[i+rowStart], {transform: "rotateX(0deg)", duration: dur, ease:"circ.out"});

        // update the color the square and its corresponding key on the keyboard
        elementArr[i+rowStart].setAttribute("style", rowColors[i]);
        wordleFunc.updateKeyboard(letters.charAt(i), keyboardColors[i]);

        // start next square animation at the same time as this square starts flipping back up
        animate.reveal(elementArr, rowColors, keyboardColors, row, i+1, letters);
      }, dur * 1000);

    },

    // after a win or loss
    gameOverAnimation: function(elements, won) {

      // spin the tiles
      if(won)
        for(var i = 0; i < elements.length; i++)
          gsap.fromTo(elements[i], {duration: 1, rotation: '360deg'}, {rotation: '0deg'});   

      // shake the tiles
      else
      {
        var tl = gsap.timeline({defaults: {duration: 0.2}});
        tl.repeat(3);
        
        for(var i = 0; i < elements.length; i++)
          tl.fromTo(elements[i], {scale: 1.25}, {scale: 1.0}, "<+=0");
      }
      
    },

    // when displaying stats after game
    toastAnimation: function(toastElement, barElements) {
      
      // reveal the toast container
      gsap.from(toastElement, {duration: 1, opacity: 0});
      gsap.from(toastElement, {duration: 1, scale: 0, ease: "bounce.out"});

      // animate the bars 
      var tl = gsap.timeline({defaults: {duration: 2}});
      for(var i = 0; i < barElements.length; i++)
        tl.from(barElements[i], {width: "0%"}, "<+=0");
    },

    currentlyAnimating: function() {
      return animating;
    }
  }
})();

window.animate = animate;