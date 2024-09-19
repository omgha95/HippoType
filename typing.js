const words =
  "The day had begun on a bright note. The sun finally peeked through the rain for the first time in a week, and the birds were singing in its warmth. There was no way to anticipate what was about to happen. It was a worst-case scenario and there was no way out of it.".split(
    " "
  );
const wordsCount = words.length;
const gameTime = 30 * 1000;
window.timer = null;
window.gameStart = null;

const getWPM = function () {
  const words = [...document.querySelectorAll(".word")];
  const lastTypedWord = document.querySelector(".word.current");
  const lastTypedWordIndex = words.indexOf(lastTypedWord);
  const typedWords = words.slice(0, lastTypedWordIndex);
  const correctWords = typedWords.filter((word) => {
    const letters = [...word.children];
    const incorrectLetters = letters.filter((letter) =>
      letter.classList.contains("incorrect")
    );
    const correctLetters = letters.filter((letter) =>
      letter.classList.contains("correct")
    );

    return (
      incorrectLetters.length === 0 && correctLetters.length === letters.length
    );
  });
  return (correctWords.length / gameTime) * 60000;
};

const addClass = function (el, name) {
  el.classList.add(name);
};

const removeClass = function (el, name) {
  el.classList.remove(name);
};

const randomWord = function () {
  const randomIndex = Math.ceil(Math.random() * wordsCount);
  return words[randomIndex - 1];
};

const formatWord = function (word) {
  return `<div class="word"><span class="letter">${word
    .split("")
    .join('</span><span class="letter">')}</span></div>`;
};

const newGame = function () {
  document.getElementById("words").innerHTML = "";
  for (let i = 0; i < 200; i++) {
    document.getElementById("words").innerHTML += formatWord(randomWord());
  }
  addClass(document.querySelector(".word"), "current");
  addClass(document.querySelector(".letter"), "current");
  document.getElementById("info").innerHTML = gameTime / 1000 + "";
  window.timer = null;
};

const gameOver = function () {
  clearInterval(window.timer);
  addClass(game, "over");
  const result = getWPM();
  document.getElementById("info").innerHTML = `WPM: ${result}`;
};

const game = document.getElementById("game");
game.addEventListener("keyup", (ev) => {
  const key = ev.key;

  const currentWord = document.querySelector(".word.current");
  const currentLetter = document.querySelector(".letter.current");
  const expected = currentLetter?.innerHTML || " ";
  const isLetter = key.length === 1 && key !== " ";
  const isSpace = key === " ";
  const isBackscapce = key === "Backspace";
  const isFirstLetter = currentLetter === currentWord.firstChild;
  const isLastLetter = currentLetter === " ";

  if (game.classList.contains("over")) {
    return;
  }

  // console.log({ key, expected });

  if (!window.timer && isLetter) {
    window.timer = setInterval(() => {
      if (!window.gameStart) {
        window.gameStart = new Date().getTime();
      }
      const currentTime = new Date().getTime();
      const msPassed = currentTime - window.gameStart;
      const secondsPassed = Math.round(msPassed / 1000);
      const secondsLeft = gameTime / 1000 - secondsPassed;

      if (secondsLeft <= 0) {
        gameOver();
        return;
      }

      document.getElementById("info").innerHTML = secondsLeft + "";
    }, 1000);
  }

  if (isLetter) {
    if (currentLetter) {
      addClass(currentLetter, key === expected ? "correct" : "incorrect");
      removeClass(currentLetter, "current");
      if (currentLetter.nextSibling)
        addClass(currentLetter.nextSibling, "current");
    } else {
      const incorrectLetter = document.createElement("sapn");
      incorrectLetter.innerHTML = key;
      incorrectLetter.classList.add("letter", "incorrect", "extra");
      currentWord.appendChild(incorrectLetter);
    }
  }

  if (isSpace) {
    if (expected !== " ") {
      const lettersToInvalidate = [
        ...document.querySelectorAll(".word.current .letter:not(.correct)"),
      ];
      lettersToInvalidate.forEach((letter) => {
        addClass(letter, "incorrect");
      });
    }
    removeClass(currentWord, "current");
    addClass(currentWord.nextSibling, "current");

    if (currentLetter) {
      removeClass(currentLetter, "current");
    }
    addClass(currentWord.nextSibling.firstChild, "current");
  }

  if (isBackscapce) {
    // console.log(currentLetter, currentLetter.previousSibling);
    if (currentLetter && isFirstLetter) {
      removeClass(currentWord, "current");
      addClass(currentWord.previousSibling, "current");
      removeClass(currentLetter, "current");
      addClass(currentWord.previousSibling.lastChild, "current");
      removeClass(currentWord.previousSibling.lastChild, "incorrect");
      removeClass(currentWord.previousSibling.lastChild, "correct");
    } else if (isLastLetter) {
      // last letter
      console.log(isLastLetter, "last letter clause");

      // removeClass(currentLetter, "current");
      removeClass(currentLetter.previousSibling, "incorrect");
      addClass(currentLetter.previousSibling, "current");
    } else {
      // middle letters
      removeClass(currentLetter.previousSibling, "incorrect");
      removeClass(currentLetter.previousSibling, "correct");
      addClass(currentLetter.previousSibling, "current");
    }
  }

  // scroll lines up
  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById("words");
    const margin = parseInt(words.style.marginTop || "0px");
    words.style.marginTop = margin - 35 + "px";
  }

  // move cursor
  const nextLetter = document.querySelector(".letter.current");
  const nextWord = document.querySelector(".word.current");
  const cursor = document.getElementById("cursor");

  cursor.style.top =
    (nextLetter || nextWord).getBoundingClientRect().top + 2 + "px";
  cursor.style.left =
    (nextLetter || nextWord).getBoundingClientRect()[
      nextLetter ? "left" : "right"
    ] + "px";
});

const newGameBtn = document.getElementById("newGameBtn");
newGameBtn.addEventListener("click", () => {
  window.location.reload();
});

newGame();
