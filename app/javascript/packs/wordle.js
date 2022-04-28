var wordSoFar = "";
var row = 0;
var randomWord = "";
var wordSet = new Set();
var showingNotice = false;
var invalidWordString = "That word is not in our dictionary :(";
var correctGuessString = "🔥 Well Done! 🔥"
var qwerty;

function handleCorrectGuess() {

  document.getElementById("warning-alert").classList += "show";
  document.getElementById("warning-alert").innerHTML = correctGuessString;
  document.getElementById("warning-alert").setAttribute("style", "color: #0f5132; background-color: #d1e7dd;");
  showingNotice = true;
  return;
}

function handleGameOver() {
  document.getElementById("warning-alert").classList += "show";
  document.getElementById("warning-alert").innerHTML = "The correct word was: " + randomWord;
  document.getElementById("warning-alert").setAttribute("style", "color: #842029; background-color: #f8d7da;");
  showingNotice = true;
  return;
}

/*
 * Given a char and a color, update the keyboard to show the user
 * which letters have been used and their color.
 */
function updateKeyboard(char, color)
{
  // Q is at id=30, quwerty[0] = Q
  var id = qwerty.indexOf(char) + 30;

  var curKey = document.getElementById(String(id));
  curKey.setAttribute("style", "color: white; background-color: " + color);
}
/* 
 * When the user deletes a character: 
 * Remove the invalid word notice if it is showing.
 * Change the square value back to blank.
 * Change the border of the input square back to defualt.
 */
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

/* 
 * When the user completes a row (5 letters) and hits enter:
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
      updateKeyboard(inputChar, "#6aaa64;");
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
      updateKeyboard(inputChar, "#c9b458;");
    }

    // grey
    else if(!randomWord.includes(inputChar))
    {
      curSquare.setAttribute("style", "background-color: grey; " + styleStr); 

      // update keyboard
      updateKeyboard(inputChar, "grey;");
    }
  }

  randomWord = holdRand;

  // game is over and user got it wrong
  if(row == 5)
    return handleGameOver();

  row++;
  wordSoFar = "";
  return;
}

/*
 * Whenever the user enters a key, use one of our helpers to handle it. 
 */
function handleInput(key)
{
    var wordLen = wordSoFar.length;

    // 8 = backspace, 46 = delete
    if(key == 8 || key == 46)
    {
      if(wordLen == 0)
        return;

      return handleDelete(wordLen);
    }

    // if user wants to enter the word
    if(key == 13 && wordLen == 5)
    {
      return handleEnter();
    }

    // input was a-z
    if(key >= 65 && key <= 122)
    {

      if(wordLen == 5)
        return;

      // get the textarea that is being changed and manipulate it
      var curSquare = document.getElementById(String(row*5 + wordLen));
      curSquare.value = String.fromCharCode(key);
      curSquare.setAttribute("style", "border-color: grey;");
      wordSoFar += String.fromCharCode(key);
    }

    return;
}

window.handleInput = handleInput;

function setUp() {

    // set ids for squares (0-29: user input, 30-56: keyboard)
    var els = document.querySelectorAll('textarea');
    for(var i=0; i<els.length; i++)
      els[i].setAttribute("id", i);
    
    
    // add letters to keyboard
    qwerty = "QWERTYUIOPASDFGHJKLZXCVBNM";
    for(var i=0; i < 26; i++)
      els[i+30].value = qwerty.charAt(i);
    
    // get our words list (app/public/wordList.txt)
    var words = document.getElementById('wordList').getAttribute('data-words');
    wordSet = new Set(words.split(", ")); // allows for faster .contains()*/

    // get possible answer list (app/public/wordAnswerList.txt)
    answerArray = document.getElementById('wordAnswerList').getAttribute('data-words');
    answerArray = answerArray.split(", ");
    
    // get a random word from answer list
    var randIndex = Math.floor(Math.random() * (answerArray.length - 1));
    randomWord = answerArray[randIndex];
    randomWord = randomWord.toUpperCase();
}

window.setUp = setUp;

