class HomeController < ApplicationController
  def index
  end

  def about
    @about_me = "My Name is Warren Kidman"
  end

  # GET
  def wordle

    # Wordle word lists
    wordListFile = File.open("public/wordList.txt");
    answerListFile = File.open("public/wordAnswerList.txt");
    @wordList = wordListFile.read;
    @wordAnswerList = answerListFile.read;

    # user information
    @signed_in = user_signed_in?;
    @userStats = "";
    @userID = -1;
    
    # if signed in, get user ID and their wordle stats
    if @signed_in
      @userID = current_user.id;
      Stat.all.each do |curStat|
        if curStat.user_id == current_user.id
          @userStats = curStat;
        end
      end
    end

    # send all relavent infromation to wordle.html.erb
    respond_to do |format|
      format.html
      format.json { render json: {
        "wordList" => @wordList, 
        "wordAnswerList" => @wordAnswerList, 
        "signedIn" => user_signed_in?, 
        "userStats" => @userStats,
        "userID" => @userID }
        }
    end
  end
end
