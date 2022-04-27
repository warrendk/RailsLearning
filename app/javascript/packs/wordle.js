// move to the next textarea upon a insertion
// go back upon a backspace
function move(field){
  var nextId = parseInt(field.id) + 1;
  var lastId = (nextId % 5) == 1 ? field.id : (nextId - 2);
  console.log(window.event.keyCode);
  if(window.event.keyCode == 9)
  {
    console.log(window.event.keycode);
    field.focus();
    return;
  }

  // if backspace
  if(field.value == "")
  {
    // if empty before backspace
    if(field.getAttribute("val") == "")
    {
      var last = document.getElementById(String(lastId));
      last.focus();
      last.value = "";
      last.setAttribute("val", field.value); 
      last.setAttribute("style", "border-color: lightgrey;");
    }
    
    else
      field.setAttribute("style", "border-color: lightgrey;");

  }

  // if not the last letter
  else if(parseInt(field.id) % 5 != 4)
  {
    var nextElement = document.getElementById(String(nextId));
    nextElement.focus();
    field.setAttribute("style", "border-color: grey;");
  }

  else if(parseInt(field.id) % 5 == 4)
  {
    field.setAttribute("style", "border-color: grey;");
    
    // if the last letter, move to next row if enter (keycode: 13)
    // color the squares based on standard wordle rules:
    // green if letter in correct pos
    // yellow if letter in word but not right pos
    // grey if not in word
    if(window.event.keyCode == 13)
    {
      document.getElementById(String(nextId)).focus();
      var word = ""
      for(var i = nextId-5; i<nextId; i++)
        word+= String(document.getElementById(String(i)).value);
      
      for(var i = 0; i < 5; i++)
      {
        inputChar = word.charAt(i);
        actualChar = "audio".charAt(i);
        var curSquare = document.getElementById(String(field.id - 4 + i));
        curSquare.setAttribute("readonly", "readonly");
        var styleStr = "color: white; border: 0";
        if(inputChar == actualChar)
          curSquare.setAttribute("style", "background-color:#6aaa64; " + styleStr); // green
        else if("audio".includes(inputChar))
          curSquare.setAttribute("style", "background-color:#c9b458; " + styleStr); // yellow
        else if(!"audio".includes(inputChar))
          curSquare.setAttribute("style", "background-color:grey; " + styleStr); // grey
      }

    }
  }

  field.setAttribute("val", field.value); 
}

window.move = move;

// set max chars per text area to 1
// set the id's to their index in els
function setUp() {
    var els = document.querySelectorAll('textarea');
    const val = document.createAttribute("val");
    for(var i=0; i<els.length; i++)
    {
      els[i].setAttribute("maxlength", 1);
      els[i].setAttribute("id", i);
      els[i].setAttribute("val", "");
      els[i].setAttribute("tabindex", -1);
    }
}

window.setUp = setUp;
