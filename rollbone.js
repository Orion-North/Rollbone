let treasure = 100;

function rollDice() {
    const betInput = document.getElementById("bet");
    const betAmount = parseInt(betInput.value);
    const resultElement = document.getElementById("result");
    const treasureElement = document.getElementById("treasure");

    // Clear previous result classes
    resultElement.classList.remove('fade-in');
    
    // Validation
    if (isNaN(betAmount) || betAmount > treasure || betAmount <= 0) {
        resultElement.innerText = "⚠️ Invalid bet amount!";
        resultElement.style.color = "#ff4d4d";
        triggerFadeIn(resultElement);
        return;
    }

    // Dice Roll
    const roll = Math.floor(Math.random() * 6) + 1;
    let outcome = "";

    if (roll === 6) {
        treasure += betAmount * 2;
        outcome = `🎉 Arrr! You rolled a 6 and won ${betAmount * 2} gold!`;
        resultElement.style.color = "#4CAF50";
    } else if (roll === 1) {
        treasure -= betAmount;
        outcome = `💔 Oh no! You rolled a 1 and lost ${betAmount} gold!`;
        resultElement.style.color = "#f44336";
    } else {
        outcome = `🎲 You rolled a ${roll}. Nothing gained, nothing lost.`;
        resultElement.style.color = "#ffeb3b";
    }

    treasureElement.innerText = `${treasure} gold`;
    resultElement.innerText = outcome;

    triggerFadeIn(resultElement);

    // Check for game over
    if (treasure <= 0) {
        resultElement.innerText = "⚰️ You've lost all your treasure! Game over!";
        resultElement.style.color = "#e91e63";
        triggerFadeIn(resultElement);
        setTimeout(resetGame, 3000);
    }
}

function triggerFadeIn(element) {
    element.classList.remove('fade-in');
    // Trigger reflow to restart the animation
    void element.offsetWidth;
    element.classList.add('fade-in');
}

function resetGame() {
    treasure = 100;
    document.getElementById("treasure").innerText = `${treasure} gold`;
    document.getElementById("result").innerText = "🆕 New Game Started! Place your bet.";
    document.getElementById("result").style.color = "#ffeb3b";
    triggerFadeIn(document.getElementById("result"));
    document.getElementById("bet").value = '';
}
