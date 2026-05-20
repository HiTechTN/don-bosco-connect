def compute_adaptive_score(
    quiz_score: float, response_time: float, max_time: float, historical_score: float
) -> float:
    speed_score = max(0.0, 1.0 - (response_time / max_time))
    session_score = (quiz_score * 0.70) + (speed_score * 0.30)
    smoothed = (session_score * 0.40) + (historical_score * 0.60)
    return round(min(max(smoothed, 0.0), 1.0), 3)


def get_adaptive_level(score: float) -> str:
    if score < 0.40:
        return "remediation"
    elif score < 0.75:
        return "normal"
    else:
        return "advanced"
