class HomeController < ApplicationController
  def index
  end

  def about
    @about_me = "My Name is Warren Kidman"
  end

  def wordle
    file = File.open("public/wordList.txt");
    file_data = file.read;
    
    file2 = File.open("public/wordAnswerList.txt");
    file_data2 = file2.read;

    @wordList = file_data;
    @wordAnswerList = file_data2;
  end
end
