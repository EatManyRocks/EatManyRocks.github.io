const SUITS = Object.freeze({
  HEART: "Heart",
  SPADE: "Spade",
  DIAMOND: "Diamond",
  CLUB: "Club"
});

const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];

const HAND_TYPES = Object.freeze({
  HIGH_CARD: "High Card",
  PAIR: "Pair",
  TWO_PAIR: "Two Pair",
  THREE_OF_A_KIND: "Three of a Kind",
  STRAIGHT: "Straight",
  FLUSH: "Flush",
  FULL_HOUSE: "Full House",
  FOUR_OF_A_KIND: "Four of a Kind",
  STRAIGHT_FLUSH: "Straight Flush",
  ROYAL_FLUSH: "Royal Flush"
});

const RANK_VALUE = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  "Jack": 10,
  "Queen": 10,
  "King": 10,
  "Ace": 11
};

const HAND_BASE_VALUES = {
  [HAND_TYPES.HIGH_CARD]: { chips: 5, mult: 1 },
  [HAND_TYPES.PAIR]: { chips: 10, mult: 2 },
  [HAND_TYPES.TWO_PAIR]: { chips: 20, mult: 2 },
  [HAND_TYPES.THREE_OF_A_KIND]: { chips: 30, mult: 3 },
  [HAND_TYPES.STRAIGHT]: { chips: 30, mult: 4 },
  [HAND_TYPES.FLUSH]: { chips: 35, mult: 4 },
  [HAND_TYPES.FULL_HOUSE]: { chips: 40, mult: 4 },
  [HAND_TYPES.FOUR_OF_A_KIND]: { chips: 60, mult: 7 },
  [HAND_TYPES.STRAIGHT_FLUSH]: { chips: 100, mult: 8 },
  [HAND_TYPES.ROYAL_FLUSH]: { chips: 100, mult: 8 }
};

const ANTE_BASE_SCORE = [100, 300, 800, 2000, 5000, 11000, 20000, 35000, 50000]

/*****************************************************************************************/
//CLASSES

class Card {
  static idCounter = 0;

  constructor(suit, rank, enhancement = null, edition = null, seal = null) {
    this.id = Card.idCounter++;
    this.suit = suit;
    this.rank = rank;
    this.enhancement = enhancement;
    this.edition = edition;
    this.seal = seal;
  }

  getValue() {
    return RANK_VALUE[this.rank];
  }
};

/*****************************************************************************************/

class Deck {
  constructor() {
    this.cards = [];
    this.discardPile = [];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (let suit of Object.values(SUITS)) {
      for (let rank of RANKS) {
        var newCard = new Card(suit, rank);
        this.cards.push(newCard);
        console.log("Added new card to deck: " + newCard.rank + " of " + newCard.suit + "s.");
      }
    }

    updateDeckVisual(this.size());
    console.log("Finished resetting deck! (deck size: " + this.cards.length + ")");
  }

  shuffle() {
    for (let discardedCard of this.discardPile) {
      this.cards.push(discardedCard);
    }
    let currIndex = this.cards.length;
    while (currIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currIndex);
      currIndex--;
      [this.cards[currIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currIndex]];
    }
  }

  draw() {
    if (this.isEmpty()) {
      return null;
    }

    let drawnCard = this.cards.pop();
    this.discardPile.push(drawnCard);
    updateDeckVisual(this.size());
    return drawnCard;
  }

  resetForNextBlind() {
    this.shuffle();
  }

  size() {
    return this.cards.length;
  }

  isEmpty() {
    return this.cards.length == 0;
  }

  displayDeck() {
    let count = 0;
    console.log(`
|******************************************
|Displaying all cards currently in deck:        
|------------------------------------------`);
    for (let card of this.cards) {
      count++;
      console.log("| " + count + ". " + card.rank + " of " + card.suit + "s.");
    }

    console.log(`|******************************************`);
  }
};

/*****************************************************************************************/

class Hand {
  constructor(deck, handSize = 8, numHands = 5, numDiscards = 3) {
    this.deck = deck;
    this.cards = [];
    this.handSize = handSize;
    this.selectedIndexes = [];
    this.selectedCards = [];
    this.maxSelectedCards = 5;
    this.currHandType = null;
    this.numHands = numHands;
    this.baseNumHands = numHands;
    this.numDiscards = numDiscards;
    this.baseNumDiscards = numDiscards;
  }

  draw() {
    let drawnCard = null;
    if (this.deck && !this.deck.isEmpty()) {
      drawnCard = this.deck.draw();
      if (drawnCard) {
        this.cards.push(drawnCard);
      }
    }

    renderHand(this);
    return drawnCard;
  }

  drawFullHand() {
    let drawnCards = [];
    for (let i = this.cards.length; i < this.handSize; i++) {
      let drawnCard = this.draw(this.deck);
      drawnCards.push(drawnCard);
    }

    return drawnCards;
  }

  selectCard(index) {
    let i = this.selectedIndexes.indexOf(index);
    if (i !== -1) {
      this.selectedIndexes.splice(i, 1);
    } else if (this.selectedIndexes.length < this.maxSelectedCards) {
      this.selectedIndexes.push(index);
    }

    this.evaluateHandType();
  }

  evaluateHandType() {
    const selectedCards = this.selectedIndexes.map(i => this.cards[i]);
    this.selectedCards = selectedCards;
    const suits = selectedCards.map(card => card.suit);
    const ranks = selectedCards.map(card => card.rank);
    const handSize = this.selectedIndexes.length;
    if (handSize == 0) {
      this.updateHandType(null);
      return null;
    }
    if (handSize == 1) {
      this.updateHandType(HAND_TYPES.HIGH_CARD);
      return HAND_TYPES.HIGH_CARD;
    }

    let rankOccurrences = Object.values(this.countAllOccurrences(ranks));
    rankOccurrences = rankOccurrences.sort((a, b) => b - a);
    let flush = false;
    let straight = false;
    if (handSize === 5) {
      const suitOccurrences = Object.values(this.countAllOccurrences(suits));
      flush = suitOccurrences.length === 1;
      straight = this.isStraight(ranks);
    }

    console.log(rankOccurrences);

    let handType = HAND_TYPES.HIGH_CARD;

    if (straight && flush) {
      handType = HAND_TYPES.STRAIGHT_FLUSH;
    } else if (rankOccurrences[0] === 4) {
      handType = HAND_TYPES.FOUR_OF_A_KIND;
    } else if (rankOccurrences[0] === 3 && rankOccurrences[1] === 2) {
      handType = HAND_TYPES.FULL_HOUSE;
    } else if (flush) {
      handType = HAND_TYPES.FLUSH;
    } else if (straight) {
      handType = HAND_TYPES.STRAIGHT;
    } else if (rankOccurrences[0] === 3) {
      handType = HAND_TYPES.THREE_OF_A_KIND;
    } else if (rankOccurrences[0] === 2 && rankOccurrences[1] === 2) {
      handType = HAND_TYPES.TWO_PAIR;
    } else if (rankOccurrences[0] === 2) {
      handType = HAND_TYPES.PAIR;
    }

    this.updateHandType(handType);
    return handType;
  }

  updateHandType(handType) {
    this.handType = handType;
    displayHandType(handType);
  }

  playCards() {
    if (this.selectedCards.length == 0) {
      return;
    }

    let handScore = 0;
    this.numHands--;

    for (let card of this.selectedCards) {
      handScore += card.getValue();
      // let index = this.cards.indexOf(item);
      // if (index !== -1 && this.cards[index].id === card.id) {
      //   this.cards.splice(index, 1);
      // }
      this.cards = this.cards.filter(c => c.id !== card.id); //should only remove card with matching id
      //apply effects/bonuses here
      //play visuals
    }

    this.selectedCards = [];
    this.selectedIndexes = [];
    this.updateHandType(null);
    this.drawFullHand();

    //do scoring and remove cards

    //win if score passes goal

    if (this.numHands <= 0) {
      //lose round
    }
  }

  discardCards() {
    if (this.selectedCards.length == 0) {
      return;
    }

    this.numDiscards--;

    for (let card of this.selectedCards) {
      this.cards = this.cards.filter(c => c.id !== card.id);
    }

    this.selectedCards = [];
    this.selectedIndexes = [];
    this.updateHandType(null);
    this.drawFullHand();
  }

  resetForNextBlind() {
    this.cards = [];
    this.selectedCards = [];
    this.selectedIndexes = [];
    this.numHands = this.baseNumHands;
    this.numDiscards = this.baseNumDiscards;
    this.updateHandType(null);
  }

  countAllOccurrences(array) {
    const occurrences = {};
    for (let value of array) {
      if (occurrences[value]) {
        occurrences[value] += 1;
      } else {
        occurrences[value] = 1;
      }
    }

    return occurrences;
  }

  isStraight(ranks) {
    const uniqueRanks = [...new Set(ranks)];
    const sortedRanks = uniqueRanks.sort((a, b) => RANKS.indexOf(a) - RANKS.indexOf(b));

    if (sortedRanks.length < 5) {
      return false;
    }
    //checks that each rank follows the last
    for (let i = 0; i < sortedRanks.length - 1; i++) {
      let currIndex = RANKS.indexOf(sortedRanks[i]);
      let nextIndex = RANKS.indexOf(sortedRanks[i + 1]);
      if (nextIndex !== currIndex + 1) {
        return false;
      }
    }

    return true;
  }

  sortByRank() {
    this.cards.sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));
  }

  sortBySuit() {
    this.sortByRank();
    this.cards.sort((a, b) => Object.values(SUITS).indexOf(a.suit) - Object.values(SUITS).indexOf(b.suit));
  }

  getCardByIndex(index = 0) {
    return this.cards[index];
  }

  getAllCards() {
    return this.cards;
  }

  size() {
    return this.cards.length;
  }

  display() {
    let count = 0;
    console.log(`
|=================
|Current Hand:        
|-----------------`);
    for (let card of this.cards) {
      count++;
      console.log("| " + count + ". " + card.rank + " of " + card.suit + "s.");
    }

    console.log(`|******************************************`);
  }
}

class GameHandler {
  constructor(playerDeck, playerHand) {
    this.ante = 0;
    this.blind = 0;
    this.totalBlindScore = 0;
    this.currentTargetBlindScore = 0;
    this.playerDeck = playerDeck;
    this.playerHand = playerHand;
  }

  startNextAnte() {
    this.ante++;
  }

  startNextBlind() {
    this.blind++;
    if (blind > 3 || blind < 1) {
      this.startNextAnte();
      this.currentTargetBlindScore = ANTE_BASE_SCORE[this.ante];
      blind = 1;
    } else if (blind == 2) {
      this.currentTargetBlindScore = ANTE_BASE_SCORE[this.ante] * 1.5;
    } else {
      this.currentTargetBlindScore = ANTE_BASE_SCORE[this.ante] * 2;
    }

    playerHand.resetForNextBlind();
  }

  checkScore(handScore, numHandsRemaining) {
    this.totalBlindScore += handScore
    if (this.totalBlindScore >= this.currentTargetBlindScore) {
      this.startNextBlind();
      return;
    }
    if (numHandsRemaining <= 0) {
      gameOver();
    }
  }

  gameOver() {
    return;
  }
}

/*****************************************************************************************/
//FUNCTIONS (mostly visuals)

function renderHand(hand) {
  const container = document.getElementById("handContainer");
  container.innerHTML = "";

  for (let i = 0; i < hand.size(); i++) {
    const cardDiv = document.createElement("div");
    cardDiv.id = "cardInHand" + i;
    cardDiv.className = "card";
    cardDiv.appendChild(document.createTextNode(hand.getCardByIndex(i).rank + " of " + hand.getCardByIndex(i).suit + "s"));
    cardDiv.dataset.index = i;
    container.appendChild(cardDiv);
  }
}

function updateDeckVisual(amount) {
  document.getElementById("deck").innerHTML = "Deck: " + amount;
}

function displayHandType(handType) {
  if (handType == null) {
    handType = "---"
  }
  document.getElementById("currentHandType").innerHTML = handType;
}

/*****************************************************************************************/
//GAME PROCESS

function init() {
  playerDeck.shuffle();
  playerHand.drawFullHand(playerDeck);
  playerHand.sortBySuit();
  renderHand(playerHand);
}

let playerDeck = new Deck();
let playerHand = new Hand(playerDeck);
let gameProcess = new GameHandler(playerDeck, playerHand);

init();

/*****************************************************************************************/
//EVENT LISTENERS

//card selection
const handContainer = document.getElementById("handContainer");
handContainer.addEventListener("click", (event) => {
  const cardDiv = event.target.closest(".card");
  if (!cardDiv) {
    return;
  }

  let index = cardDiv.dataset.index;
  playerHand.selectCard(index);
  cardDiv.classList.toggle("selected", playerHand.selectedIndexes.includes(index))
});
//

const buttonPlayHand = document.getElementById("buttonPlayHand");
buttonPlayHand.addEventListener("click", function () {
  playerHand.playCards();
});
const buttonDiscard = document.getElementById("buttonDiscard");
buttonDiscard.addEventListener("click", function () {
  playerHand.discardCards();
});
const buttonSortHandBySuit = document.getElementById("buttonSortHandBySuit");
buttonSortHandBySuit.addEventListener("click", function () {
  playerHand.sortBySuit();
  renderHand(playerHand);
});
const buttonSortHandByRank = document.getElementById("buttonSortHandByRank");
buttonSortHandByRank.addEventListener("click", function () {
  playerHand.sortByRank();
  renderHand(playerHand);
});
