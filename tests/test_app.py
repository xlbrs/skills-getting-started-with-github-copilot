from fastapi.testclient import TestClient

from src.app import app, activities


client = TestClient(app)


def test_duplicate_signup_is_rejected():
    response = client.post(
        "/activities/Chess Club/signup?email=michael@mergington.edu"
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Student is already signed up"


def test_additional_sample_activities_exist():
    expected = {
        "Basketball Team",
        "Swimming Club",
        "Art Studio",
        "Drama Club",
        "Debate Team",
        "Science Club",
    }

    assert expected.issubset(set(activities))
