let treasure = 100;

function rollDice() {
    const betAmount = parseInt(document.getElementById("bet").value);
    const resultElement = document.getElementById("result");

    if (betAmount > treasure || betAmount <= 0) {
        resultElement.innerText = "Invalid bet amount!";
        return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    let outcome = "";

    if (roll === 6) {
        treasure += betAmount * 2;
        outcome = `Arrr! Ye rolled a 6 and won ${betAmount * 2} gold!`;
    } else if (roll === 1) {
        treasure -= betAmount;
        outcome = `Oh no! Ye rolled a 1 and lost ${betAmount} gold!`;
    } else {
        outcome = `Ye rolled a ${roll}. Nothing gained, nothing lost.`;
    }

    document.getElementById("treasure").innerText = `${treasure} gold`;
    resultElement.innerText = outcome;

    if (treasure <= 0) {
        resultElement.innerText = "You've lost all your treasure! Game over!";
        treasure = 100; // reset
        document.getElementById("treasure").innerText = `${treasure} gold`;
    }
}
