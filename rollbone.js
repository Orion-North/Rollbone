// rollbone.js

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAh1kunHYjP-g2y74RE3OyjVD2VFvJuVog",
    authDomain: "rollbone.firebaseapp.com",
    projectId: "rollbone",
    storageBucket: "rollbone.firebasestorage.app",
    messagingSenderId: "312397860197",
    appId: "1:312397860197:web:76b5a1ad1a4273bc7ca58c",
    measurementId: "G-2D3PXH6C0K"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const googleSignInBtn = document.getElementById('google-signin');
const signOutBtn = document.getElementById('signout');
const welcomeMessage = document.getElementById('welcome-message');
const userNameSpan = document.getElementById('user-name');

const betTypeSelect = document.getElementById('bet-type');
const betDetailsDiv = document.getElementById('bet-details');
const rollDiceBtn = document.getElementById('roll-dice');
const betAmountInput = document.getElementById('bet-amount');
const treasureElement = document.getElementById('treasure');
const resultElement = document.getElementById('result');
const achievementList = document.getElementById('achievement-list');
const leaderboardBody = document.querySelector('#leaderboard tbody');

// Game Variables
let treasure = 100;
let currentUser = null;
const achievements = [
    { gold: 200, title: "Novice Pirate" },
    { gold: 500, title: "Captain" },
    { gold: 1000, title: "Admiral" },
    { gold: 2000, title: "Legendary Pirate" }
];

// Authentication Handlers
googleSignInBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            // Signed in
            currentUser = result.user;
            welcomeMessage.style.display = 'block';
            userNameSpan.textContent = currentUser.displayName;
            googleSignInBtn.style.display = 'none';
            signOutBtn.style.display = 'inline-block';
            loadUserData();
            loadLeaderboard();
        })
        .catch((error) => {
            console.error("Error during sign-in:", error);
        });
});

signOutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        // Signed out
        currentUser = null;
        welcomeMessage.style.display = 'none';
        googleSignInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
        resetGame();
    }).catch((error) => {
        console.error("Error during sign-out:", error);
    });
});

// Listen to Auth State Changes
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        welcomeMessage.style.display = 'block';
        userNameSpan.textContent = user.displayName;
        googleSignInBtn.style.display = 'none';
        signOutBtn.style.display = 'inline-block';
        loadUserData();
        loadLeaderboard();
    } else {
        currentUser = null;
        welcomeMessage.style.display = 'none';
        googleSignInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
    }
});

// Load User Data from Firestore
function loadUserData() {
    if (currentUser) {
        const userDoc = db.collection('users').doc(currentUser.uid);
        userDoc.get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                treasure = data.gold;
                treasureElement.innerText = `${treasure} gold`;
                displayAchievements(data.achievements);
            } else {
                // New user, set initial data
                userDoc.set({
                    gold: treasure,
                    achievements: []
                });
            }
        }).catch(error => {
            console.error("Error loading user data:", error);
        });
    }
}

// Save User Data to Firestore
function saveUserData() {
    if (currentUser) {
        const userDoc = db.collection('users').doc(currentUser.uid);
        userDoc.set({
            gold: treasure,
            achievements: getAchievedTitles()
        }, { merge: true });
    }
}

// Display Achievements
function displayAchievements(userAchievements) {
    achievementList.innerHTML = '';
    userAchievements.forEach(title => {
        const li = document.createElement('li');
        li.textContent = title;
        achievementList.appendChild(li);
    });
}

// Get Achieved Titles
function getAchievedTitles() {
    return achievements
        .filter(ach => treasure >= ach.gold)
        .map(ach => ach.title);
}

// Load Leaderboard
function loadLeaderboard() {
    db.collection('users').orderBy('gold', 'desc').limit(10).get()
        .then(snapshot => {
            leaderboardBody.innerHTML = '';
            let rank = 1;
            snapshot.forEach(doc => {
                const data = doc.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${rank}</td>
                    <td>${data.displayName || 'Anonymous'}</td>
                    <td>${data.gold} gold</td>
                `;
                leaderboardBody.appendChild(tr);
                rank++;
            });
        })
        .catch(error => {
            console.error("Error loading leaderboard:", error);
        });
}

// Advanced Betting Options Handlers
betTypeSelect.addEventListener('change', () => {
    const betType = betTypeSelect.value;
    betDetailsDiv.innerHTML = ''; // Clear previous inputs

    if (betType === 'single-number') {
        betDetailsDiv.innerHTML = `
            <label for="single-number">Choose a Number (1-6):</label>
            <input type="number" id="single-number" min="1" max="6" placeholder="1-6">
        `;
    } else if (betType === 'sum-range') {
        betDetailsDiv.innerHTML = `
            <label for="sum-min">Minimum Sum:</label>
            <input type="number" id="sum-min" min="1" placeholder="Min">
            <label for="sum-max">Maximum Sum:</label>
            <input type="number" id="sum-max" min="1" placeholder="Max">
        `;
    } else if (betType === 'odd-even') {
        betDetailsDiv.innerHTML = `
            <label for="odd-even">Choose:</label>
            <select id="odd-even">
                <option value="odd">Odd</option>
                <option value="even">Even</option>
            </select>
        `;
    }
});

// Roll Dice Handler
rollDiceBtn.addEventListener('click', () => {
    if (!currentUser) {
        alert("Please sign in with Google to play!");
        return;
    }

    const betAmount = parseInt(betAmountInput.value);
    const betType = betTypeSelect.value;

    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    if (betAmount > treasure) {
        alert("You cannot bet more gold than you currently have.");
        return;
    }

    // Retrieve Bet Details
    let betDetail;
    if (betType === 'single-number') {
        const singleNumber = parseInt(document.getElementById('single-number').value);
        if (isNaN(singleNumber) || singleNumber < 1 || singleNumber > 6) {
            alert("Please enter a valid number between 1 and 6.");
            return;
        }
        betDetail = singleNumber;
    } else if (betType === 'sum-range') {
        const sumMin = parseInt(document.getElementById('sum-min').value);
        const sumMax = parseInt(document.getElementById('sum-max').value);
        if (isNaN(sumMin) || isNaN(sumMax) || sumMin > sumMax) {
            alert("Please enter a valid sum range.");
            return;
        }
        betDetail = { min: sumMin, max: sumMax };
    } else if (betType === 'odd-even') {
        const oddEven = document.getElementById('odd-even').value;
        betDetail = oddEven;
    }

    // Determine Number of Dice (e.g., 2 dice)
    const numberOfDice = 2;
    const rolls = [];
    for (let i = 0; i < numberOfDice; i++) {
        rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    const totalSum = rolls.reduce((a, b) => a + b, 0);

    // Determine Outcome
    let outcome = "";
    let goldChange = 0;

    if (betType === 'single-number') {
        if (rolls.includes(betDetail)) {
            goldChange = betAmount * 2;
            outcome = `🎉 You rolled ${rolls.join(', ')}. Number ${betDetail} appeared! You win ${goldChange} gold!`;
        } else {
            goldChange = -betAmount;
            outcome = `💔 You rolled ${rolls.join(', ')}. Number ${betDetail} did not appear. You lose ${betAmount} gold.`;
        }
    } else if (betType === 'sum-range') {
        if (totalSum >= betDetail.min && totalSum <= betDetail.max) {
            goldChange = betAmount * 2;
            outcome = `🎉 You rolled ${rolls.join(', ')}. Sum ${totalSum} is within ${betDetail.min}-${betDetail.max}! You win ${goldChange} gold!`;
        } else {
            goldChange = -betAmount;
            outcome = `💔 You rolled ${rolls.join(', ')}. Sum ${totalSum} is outside ${betDetail.min}-${betDetail.max}. You lose ${betAmount} gold.`;
        }
    } else if (betType === 'odd-even') {
        const isEven = totalSum % 2 === 0;
        if ((betDetail === 'even' && isEven) || (betDetail === 'odd' && !isEven)) {
            goldChange = betAmount * 2;
            outcome = `🎉 You rolled ${rolls.join(', ')}. Sum ${totalSum} is ${betDetail}! You win ${goldChange} gold!`;
        } else {
            goldChange = -betAmount;
            outcome = `💔 You rolled ${rolls.join(', ')}. Sum ${totalSum} is not ${betDetail}. You lose ${betAmount} gold.`;
        }
    }

    treasure += goldChange;
    treasureElement.innerText = `${treasure} gold`;
    resultElement.innerText = outcome;

    // Save User Data
    saveUserData();

    // Check for Achievements
    checkAchievements();

    // Update Leaderboard
    updateLeaderboard();

    // Update Fade-in Animation
    triggerFadeIn(resultElement);
});

// Check and Award Achievements
function checkAchievements() {
    const userDoc = db.collection('users').doc(currentUser.uid);
    userDoc.get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const userAchievements = data.achievements || [];
            achievements.forEach(ach => {
                if (treasure >= ach.gold && !userAchievements.includes(ach.title)) {
                    // Award Achievement
                    userAchievements.push(ach.title);
                    const li = document.createElement('li');
                    li.textContent = ach.title;
                    achievementList.appendChild(li);
                    // Update Firestore
                    userDoc.update({
                        achievements: userAchievements
                    });
                    alert(`🏆 Achievement Unlocked: ${ach.title}`);
                }
            });
        }
    }).catch(error => {
        console.error("Error checking achievements:", error);
    });
}

// Get Achieved Titles (Used for Saving)
function getAchievedTitles() {
    return achievements
        .filter(ach => treasure >= ach.gold)
        .map(ach => ach.title);
}

// Update Leaderboard
function updateLeaderboard() {
    const userDoc = db.collection('users').doc(currentUser.uid);
    userDoc.set({
        gold: treasure,
        displayName: currentUser.displayName
    }, { merge: true }).then(() => {
        loadLeaderboard();
    }).catch(error => {
        console.error("Error updating leaderboard:", error);
    });
}

// Trigger Fade-In Animation
function triggerFadeIn(element) {
    element.classList.remove('fade-in');
    // Trigger reflow to restart the animation
    void element.offsetWidth;
    element.classList.add('fade-in');
}

// Reset Game
function resetGame() {
    treasure = 100;
    treasureElement.innerText = `${treasure} gold`;
    resultElement.innerText = "🆕 Place your first bet!";
    achievementList.innerHTML = '';
    if (currentUser) {
        const userDoc = db.collection('users').doc(currentUser.uid);
        userDoc.set({
            gold: treasure,
            achievements: []
        }, { merge: true });
    }
}

// Initial Load
window.onload = () => {
    if (currentUser) {
        loadUserData();
        loadLeaderboard();
    }
};
