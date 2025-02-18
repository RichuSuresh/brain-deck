import math
from datetime import datetime, timedelta, timezone

w = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621]

def FSRS(card, grade):
    gradeDict = {
        "forgot": 1,
        "hard": 2,
        "good": 3,
        "easy": 4
    }
    DECAY = -0.5
    FACTOR = 19/81
    REQUESTED_RETENTION = 0.9
    grade = gradeDict[grade]
    today = datetime.now(timezone.utc)
    if "lastReview" not in card:
        card["lastReview"] = today

    lastReview = card["lastReview"]
    

    daysSinceLastReview = (today - lastReview).days

    if "difficulty" not in card:
        card["difficulty"] = w[4] - math.exp(w[5] * (grade - 1)) + 1
    else:
        changeInDifficulty = -w[6] * (grade - 3)
        originalDifficulty = card["difficulty"]
        linearDamping = originalDifficulty + changeInDifficulty * ((10 - originalDifficulty)/9)
        card["difficulty"] = w[7] * (w[4] - math.exp(w[5] * (4 - 1)) + 1) + (1 - w[7]) * linearDamping
    
    if "retrievability" not in card:
        card["retrievability"] = 1
    else:
        card["retrievability"] = (1 + FACTOR * (daysSinceLastReview/card['stability']))**DECAY
    
    if "stability" not in card:
        card["stability"] = w[grade - 1]
    elif "stability" in card and daysSinceLastReview <= 0:
        originalStability = card["stability"]
        card['stability'] = originalStability * math.exp(w[17] * (grade - 3 + w[18]))
    elif grade == 2 or grade == 3 or grade == 4:
        originalStability = card["stability"]
        card['stability'] = originalStability * (
            math.exp(w[8]) *
            (11 - card['difficulty']) *
            originalStability**-w[9] *
            (math.exp(w[10] * (1 - card['retrievability'])) - 1) *
            (w[15] if (grade == 2) else 1) *
            (w[16] if (grade == 4) else 1) +
            1
        )
    else:
        originalStability = card["stability"]
        card['stability'] = w[11] * (card['difficulty']**-w[12]) * (((originalStability + 1)**w[13]) - 1) * math.exp(w[14] * (1 - card['retrievability']))
    

    nextInterval = (card['stability'] / FACTOR) * ((REQUESTED_RETENTION**(1/DECAY))-1)
    print(nextInterval)
    nextInterval = today + timedelta(days=nextInterval)
    card['nextInterval'] = nextInterval
    card['lastReview'] = today

    return card