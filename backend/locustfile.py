from locust import HttpUser, task, between

class StudentUser(HttpUser):
    wait_time = between(2, 5)

    def on_start(self):
        response = self.client.post("/api/v1/auth/login", json={
            "email": "eleve1@donbosco.local",
            "password": "Eleve123!"
        })
        if response.status_code == 200:
            self.token = response.json()["access_token"]
        else:
            self.token = None

    @task(3)
    def view_courses(self):
        if self.token:
            self.client.get("/api/v1/courses", headers={"Authorization": f"Bearer {self.token}"})

    @task(1)
    def view_leaderboard(self):
        self.client.get("/api/v1/gamification/leaderboard")

    @task(1)
    def health_check(self):
        self.client.get("/api/v1/health/health")
